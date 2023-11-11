/* globals
  clearErrorMessage,
  getCurrentVolume,
  getNextVolume,
  isDate,
  readFromHtml,
  setErrorMessage,
  volumeStartDate
*/

// TODO: If current week value is blank, auto-detect it.

function copyVolumeThread () {
  navigator.clipboard.writeText('')
  clearErrorMessage()

  const container = readFromHtml()

  const currentVolume = getNextVolume(container)
  if (currentVolume == null) {
    setErrorMessage("Add the next volume and its first week's start date to copy template.")
    return
  }

  let template = container.templates[currentVolume.volumeTemplate]
  if (undefined === template) {
    setErrorMessage('A volume template needs to be selected first.')
    return
  }

  template = template.replaceAll('{Book Title}', container.bookTitle)
  template = template.replace('{Book Image}', currentVolume.coverImage)
  template = template.replace('{Volume Number}', currentVolume.volumeNumber)
  const startDate = volumeStartDate(currentVolume)
  if (isDate(startDate)) {
    template = template.replace('{Volume Start Date}', startDate)
    template = template.replace('{Volume Start Timestamp}', '[date=' + startDate.toISOString().split('T')[0] + ' timezone="Japan"]')
  }
  template = formatVolumeThreadJoin(template, container)
  template = formatVolumeThreadWhereToBuy(template)
  template = formatVolumeThreadReadingSchedule(template, currentVolume.weeks, currentVolume.chapters, container.shortDateFormat)
  template = formatVolumeThreadVocabularyList(template, currentVolume)
  template = formatVolumeThreadDiscussionRules(template)
  template = template.replaceAll('{Series Home Link}', 'https://community.wanikani.com/t/' + container.seriesHomeThread)

  navigator.clipboard.writeText(template)
  console.log(template)
}

function getCurrentWeek (currentVolume) {
  let today = new Date()
  let oldestDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6)
  let newestDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6)

  for (const weekKey in currentVolume.weeks) {
    if (oldestDate < currentVolume.weeks[weekKey].startDate && currentVolume.weeks[weekKey].startDate < newestDate) {
      return currentVolume.weeks[weekKey]
    }
  }
}

function copyWeekThread () {
  navigator.clipboard.writeText('')
  clearErrorMessage()

  const container = readFromHtml()

  let currentVolume = getCurrentVolume(container)

  // Determine the current week based on the date.  The week's start date should be between "today - 6 days" and "today + 6 days".
  let currentWeek = getCurrentWeek(currentVolume)

  if (currentWeek == null) {
    // It's possible this is the first week of a new volume.
    currentVolume = getNextVolume(container)
    currentWeek = getCurrentWeek(currentVolume)
  }

  if (currentWeek == null) {
    // TODO: Show an error message about being unable to determine the week?  Or else ask for week number?
    return
  }

  const weekChapters = []
  for (const chapterKey in currentVolume.chapters) {
    if (!currentWeek.chapters.includes(chapterKey)) {
      continue
    }
    weekChapters.push(chapterKey)
  }
  // If there are no chapters defined, get the chapter numbers from the week definition.
  if (weekChapters.length === 0) {
    for (const weekKey in currentWeek.chapters) {
      weekChapters.push(currentWeek.chapters[weekKey])
    }
  }

  let template = container.templates[currentVolume.weeklyTemplate]
  if (undefined === template) {
    setErrorMessage('A weekly template needs to be selected first.')
    return
  }

  let chaptersText = ''

  // TODO: Is this necessary?
  if (container.chapterNumberPrefix == null) {
    container.chapterNumberPrefix = ''
  }
  if (container.chapterNumberSuffix == null) {
    container.chapterNumberSuffix = ''
  }

  switch (weekChapters.length) {
    case 0:
      break
    case 1:
      chaptersText = ((container.chapterNumberPrefix === '') ? 'Chapter ' : container.chapterNumberPrefix) + weekChapters[0] + container.chapterNumberSuffix
      // TODO: Handle this properly.
      const showTitle = weekChapters.length > 0 && Object.keys(currentVolume.chapters).length > 0 && currentVolume.chapters[weekChapters[0]].title !== ''
      if (showTitle) {
        chaptersText += '　' + currentVolume.chapters[weekChapters[0]].title
      }

      break
    case 2:
      chaptersText = ((container.chapterNumberPrefix === '') ? 'Chapters ' : container.chapterNumberPrefix) + weekChapters.join(' and ') + container.chapterNumberSuffix
      break
    default:
      chaptersText = ((container.chapterNumberPrefix === '') ? 'Chapter ' : container.chapterNumberPrefix) + weekChapters[0] + '–' + weekChapters[weekChapters.length - 1] + container.chapterNumberSuffix
  }
  template = template.replaceAll('{Chapters}', chaptersText.trim())

  console.log(currentWeek)
  template = template.replace('{Week Number}', currentWeek.number)
  template = template.replace('{Week Start Page}', currentWeek.startPage)
  template = template.replace('{Week End Page}', currentWeek.endPage)
  template = template.replace('{Week Start Date}', formatDate(currentWeek.startDate, container.shortDateFormat))
  template = template.replace('{Week Start Timestamp}', '[date=' + currentWeek.startDate.toISOString().split('T')[0] + ' timezone="Japan"]')

  navigator.clipboard.writeText(template)
  console.log(template)
}

function formatDate (unparsedDate, format) {
  // Get local time offset and add it to the date to avoid a timezone date difference.
  const parsedLocalDate = new Date(unparsedDate)

  let output = ''
  let remainingFormat = format
  while (remainingFormat.length > 0) {
    if (remainingFormat.startsWith('DD')) {
      output += ('0' + parsedLocalDate.getUTCDate()).slice(-2)
      remainingFormat = remainingFormat.substring(2)
    } else if (remainingFormat.startsWith('D')) {
      output += parsedLocalDate.getUTCDate()
      remainingFormat = remainingFormat.substring(1)
    } else if (remainingFormat.startsWith('YYYY')) {
      output += parsedLocalDate.getFullYear()
      remainingFormat = remainingFormat.substring(4)
    } else if (remainingFormat.startsWith('YY')) {
      output += ('' + parsedLocalDate.getFullYear()).slice(-2)
      remainingFormat = remainingFormat.substring(2)
    } else if (remainingFormat.startsWith('MMMM')) {
      output += parsedLocalDate.toLocaleString('default', { month: 'long' })
      remainingFormat = remainingFormat.substring(4)
    } else if (remainingFormat.startsWith('MMM')) {
      output += parsedLocalDate.toLocaleString('default', { month: 'short' })
      remainingFormat = remainingFormat.substring(3)
    } else if (remainingFormat.startsWith('MM')) {
      output += ('0' + parsedLocalDate.getUTCMonth()).slice(-2)
      remainingFormat = remainingFormat.substring(2)
    } else if (remainingFormat.startsWith('M')) {
      output += parsedLocalDate.getUTCMonth()
      remainingFormat = remainingFormat.substring(1)
    } else {
      output += remainingFormat.substring(0, 1)
      remainingFormat = remainingFormat.substring(1)
    }
  }

  return output
}

function formatVolumeThreadJoin (template, series) {
  let clubName = 'Unknown'
  let clubID = ''
  switch (series.bookClub) {
    case 'abbc':
      clubName = 'Absolute Beginner'
      clubID = '34698'
      break
    case 'bbc':
      clubName = 'Beginner'
      clubID = '19766'
      break
    case 'ibc':
      clubName = 'Intermediate'
      clubID = '18908'
      break
    case 'abc':
      clubName = 'Advanced'
      clubID = '44685'
      break
  }

  return template
    .replace('{Club Level}', clubName)
    .replace('{Club Link}', 'https://community.wanikani.com/t/' + clubID)
}

function formatVolumeThreadWhereToBuy (template) {
  return template
}

function formatVolumeThreadReadingSchedule (template, weeks, chapters, shortDateFormat) {
  const regex = /{Week}(.*){\/Week}/i
  const weekTemplate = template.match(regex)

  if (weekTemplate == null) {
    return template
  }

  let weekMarkdown = ''

  for (const weekKey in weeks) {
    const currentWeek = weeks[weekKey]
    const weekChapters = []
    for (const chapterKey in chapters) {
      if (!currentWeek.chapters.includes(chapterKey)) {
        continue
      }
      weekChapters.push(('Ch ' + chapterKey + ' ' + chapters[chapterKey].title).trim())
    }
    // TODO: If chapters are not set up, get chapters from the week.

    // TODO: If there are no chapter titles, should the delimiter be ", " instead?
    // TODO: Support Start Page and End Page.

    weekMarkdown += weekTemplate[1]
      .replace('{Week Number}', weekKey)
      .replace('{Week Start Date}', formatDate(currentWeek.startDate, shortDateFormat))
      .replace('{Start Page}', currentWeek.startPage)
      .replace('{End Page}', currentWeek.endPage)
      .replace('{Week Chapters}', weekChapters.join('<br/>'))
      .replace('{Page Count}', (currentWeek.endPage - currentWeek.startPage + 1)) +
      '\n'
      // TODO: Separate {Chapters} (volume) and {Chapters} (weekly).
  }

  return template.replace(weekTemplate[0], weekMarkdown.trim())
}

function formatVolumeThreadVocabularyList (template, currentVolume) {
  return template.replace('{Vocabulary List}', currentVolume.vocabularyList)
}

function formatVolumeThreadDiscussionRules (template) {
  return template
}

