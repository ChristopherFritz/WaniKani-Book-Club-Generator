/* eslint-disable no-unused-vars */

/* globals
  ErrorMessage,
  isDate,
  series
*/

// TODO: Implement syncValue().
class Template {
  // TODO: If current week value is blank, auto-detect it.

  static copyVolumeThread () {
    navigator.clipboard.writeText('')
    ErrorMessage.clear()

    const currentVolume = series.nextVolume()
    if (currentVolume == null) {
      ErrorMessage.set("Add the next volume and its first week's start date to copy template.")
      return
    }

    let template = series.templates[currentVolume.volumeTemplate]
    if (undefined === template) {
      ErrorMessage.set('A volume template needs to be selected first.')
      return
    }

    template = template.replaceAll('{Book Title}', series.bookTitle)
    template = template.replace('{Book Image}', currentVolume.coverImage)
    template = template.replace('{Volume Number}', currentVolume.volumeNumber)
    const startDate = currentVolume.startDate
    if (isDate(startDate)) {
      template = template.replace('{Volume Start Date}', startDate)
      template = template.replace('{Volume Start Timestamp}', `[date=${(new Date(startDate)).toISOString().split('T')[0]} timezone="Japan"]`)
    }
    template = Template.formatVolumeThreadJoin(template, series)
    template = Template.formatVolumeThreadWhereToBuy(template)
    template = Template.formatVolumeThreadReadingSchedule(template, currentVolume.weeks, currentVolume.chapters, series.shortDateFormat)
    template = Template.formatVolumeThreadVocabularyList(template, currentVolume)
    template = Template.formatVolumeThreadDiscussionRules(template)
    template = template.replaceAll('{Series Home Link}', `https://community.wanikani.com/t/${series.seriesHomeThread}`)

    navigator.clipboard.writeText(template)
    console.log(template)
  }

  static copyWeekThread () {
    navigator.clipboard.writeText('')
    ErrorMessage.clear()

    let currentVolume = series.currentVolume()

    // Determine the current week based on the date.  The week's start date should be between "today - 6 days" and "today + 6 days".
    let currentWeek = currentVolume.currentWeek()

    if (currentWeek == null) {
    // It's possible this is the first week of a new volume.
      currentVolume = series.nextVolume()
      currentWeek = currentVolume.currentWeek()
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

    let template = series.templates[currentVolume.weeklyTemplate]
    if (undefined === template) {
      ErrorMessage.set('A weekly template needs to be selected first.')
      return
    }

    let chaptersText = ''

    // TODO: Is this necessary?
    if (series.chapterNumberPrefix == null) {
      series.chapterNumberPrefix = ''
    }
    if (series.chapterNumberSuffix == null) {
      series.chapterNumberSuffix = ''
    }

    switch (weekChapters.length) {
      case 0:
        break
      case 1:
        chaptersText = ((series.chapterNumberPrefix === '') ? 'Chapter ' : series.chapterNumberPrefix) + weekChapters[0] + series.chapterNumberSuffix
        // TODO: Handle this properly.
        const showTitle = weekChapters.length > 0 && Object.keys(currentVolume.chapters).length > 0 && currentVolume.chapters[weekChapters[0]].title !== ''
        if (showTitle) {
          chaptersText += '　' + currentVolume.chapters[weekChapters[0]].title
        }

        break
      case 2:
        chaptersText = ((series.chapterNumberPrefix === '') ? 'Chapters ' : series.chapterNumberPrefix) + weekChapters.join(' and ') + series.chapterNumberSuffix
        break
      default:
        chaptersText = ((series.chapterNumberPrefix === '') ? 'Chapter ' : series.chapterNumberPrefix) + weekChapters[0] + '–' + weekChapters[weekChapters.length - 1] + series.chapterNumberSuffix
    }
    template = template.replaceAll('{Chapters}', chaptersText.trim())

    template = template.replace('{Week Number}', currentWeek.number)
    template = template.replace('{Week Start Page}', currentWeek.startPage)
    template = template.replace('{Week End Page}', currentWeek.endPage)
    template = template.replace('{Week Start Date}', Template.formatDate(currentWeek.startDate, series.shortDateFormat))
    template = template.replace('{Week Start Timestamp}', `[date=${(new Date(currentWeek.startDate)).toISOString().split('T')[0]} timezone="Japan"]`)

    navigator.clipboard.writeText(template)
    console.log(template)
  }

  static formatDate (unparsedDate, format) {
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

  static formatVolumeThreadJoin (template, series) {
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
      .replace('{Club Link}', `https://community.wanikani.com/t/${clubID}`)
  }

  static formatVolumeThreadWhereToBuy (template) {
    return template
  }

  static formatVolumeThreadReadingSchedule (template, weeks, chapters, shortDateFormat) {
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
        weekChapters.push((`Ch ${chapterKey} ${chapters[chapterKey].title}`).trim())
      }
      // TODO: If chapters are not set up, get chapters from the week.

      // TODO: If there are no chapter titles, should the delimiter be ", " instead?
      // TODO: Support Start Page and End Page.

      weekMarkdown += weekTemplate[1]
        .replace('{Week Number}', weekKey)
        .replace('{Week Start Date}', Template.formatDate(currentWeek.startDate, shortDateFormat))
        .replace('{Start Page}', currentWeek.startPage)
        .replace('{End Page}', currentWeek.endPage)
        .replace('{Week Chapters}', weekChapters.join('<br/>'))
        .replace('{Page Count}', (currentWeek.endPage - currentWeek.startPage + 1)) +
      '\n'
      // TODO: Separate {Chapters} (volume) and {Chapters} (weekly).
    }

    return template.replace(weekTemplate[0], weekMarkdown.trim())
  }

  static formatVolumeThreadVocabularyList (template, currentVolume) {
    return template.replace('{Vocabulary List}', currentVolume.vocabularyList)
  }

  static formatVolumeThreadDiscussionRules (template) {
    return template
  }
}
