/* eslint-disable no-unused-vars */

/* globals
  ErrorMessage,
  Interface,
  isDate
*/

// TODO: need template dropdowns to update when adding/deleting a template

class Template {

  static simulateButtonClick(buttonElement, title, body) {
    // Trigger the button click.
    buttonElement.click()

    // Set up a MutationObserver to watch for the created textarea.
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (!document.querySelector('textarea[id^="ember"].d-editor-input')) {
          return
        }

        // Disconnect the observer once the textarea is created.
        observer.disconnect()

        if (title !== null) {
          Template.copySubjectToReplyBox(title)
        }
        Template.copyTextToClipboardOrReplyBox(body)

      })
    })

    // Start observing changes in the body
    observer.observe(document.body, { childList: true, subtree: true })
  }

  static openButtonAndPopulate(title, body) {

    // If there is a textarea already, use it.
    if (Template.copyTextToClipboardOrReplyBox(body)) {
      Template.copySubjectToReplyBox(title)
      return
    }

    // Open a new thread if possible.
    const newThreadButton = document.querySelector('#create-topic')
    if (newThreadButton !== null) {
      Template.simulateButtonClick(
        newThreadButton,
        title,
        body)
      return
    }

    // Open a new reply if possible.
    const replyButton = document.querySelector('.reply-to-post')
    if (replyButton !== null) {
      Template.simulateButtonClick(
        replyButton,
        null,
        body)
      return
    }

  }

  static copySubjectToReplyBox (template) {
    // If this is on a Discourse forum and there is an open post textbox, replace the subject with the template text.  Otherwise, do nothing.

    const discourseTopicTitleTextbox = document.querySelector('#reply-title')
    if (discourseTopicTitleTextbox === null) {
      return
    }

    discourseTopicTitleTextbox.value = template
  }

  static copyTextToClipboardOrReplyBox (template) {
    // If this is on a Discourse forum and there is an open post textbox, replace its contents with the template text.  Otherwise, copy text to clipboard.

    const discourseTextArea = document.querySelector('textarea[id^="ember"].d-editor-input')
    if (discourseTextArea === null) {
      navigator.clipboard.writeText(template)
      return false
    }

    discourseTextArea.value = template
    discourseTextArea.dispatchEvent(new Event('input', { bubbles: true }))

    return true
  }

  static copyVolumeThread (series) {
    navigator.clipboard.writeText('')
    ErrorMessage.clear()

    const currentVolume = series.nextVolume()
    if (currentVolume === null) {
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
    const startDate = currentVolume.startDate()
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

    Template.openButtonAndPopulate(`${series.bookTitle} Volume ${currentVolume.volumeNumber}`, template)

  }

  static copyWeekThread (series) {
    navigator.clipboard.writeText('')
    ErrorMessage.clear()

    let currentVolume = series.currentVolume()
    if (currentVolume === null) {
      console.log('Could not find current volume.')
      return
    }

    // Determine the current week based on the date.  The week's start date should be between "today - 6 days" and "today + 6 days".
    let currentWeek = currentVolume.currentWeek()

    if (currentWeek === undefined) {
    // It's possible this is the first week of a new volume.
      currentVolume = series.nextVolume()
      currentWeek = currentVolume.currentWeek()
    }

    if (currentWeek === undefined) {
    // TODO: Show an error message about being unable to determine the week?  Or else ask for week number?
      console.log('Could not find current week.')
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
    if (series.chapterNumberPrefix === null) {
      series.chapterNumberPrefix = ''
    }
    if (series.chapterNumberSuffix === null) {
      series.chapterNumberSuffix = ''
    }

    switch (weekChapters.length) {
      case 0:
        break
      case 1:
        chaptersText = ((series.chapterNumberPrefix === '') ? 'Chapter ' : series.chapterNumberPrefix) + weekChapters[0] + series.chapterNumberSuffix
        // TODO: Handle this properly.
        const showTitle = 0 < weekChapters.length && 0 < Object.keys(currentVolume.chapters).length && currentVolume.chapters[weekChapters[0]].title !== ''
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

    Template.openButtonAndPopulate(null, template)
  }

  static formatDate (unparsedDate, format) {
  // Get local time offset and add it to the date to avoid a timezone date difference.
    const parsedLocalDate = new Date(unparsedDate)

    let output = ''
    let remainingFormat = format
    while (0 < remainingFormat.length) {
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

    if (weekTemplate === null) {
      return template
    }

    let weekMarkdown = ''

    for (const weekKey in weeks) {
      const currentWeek = weeks[weekKey]
      const weekChapters = []
      for (const chapterKey in chapters) {
        if (!currentWeek.chapters.replace(' ', '').split(',').includes(chapterKey)) {
          continue
        }

        let prefix = 'Ch '
        if (isNaN(chapterKey)) {
          prefix = ''
        }
        weekChapters.push((`${prefix}${chapterKey} ${chapters[chapterKey].title}`).trim())
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

  static toHtml (templateName, templateMarkdown, show, series) {
    const templateTableTable = document.createElement('table')
    templateTableTable.id = `kfbc-template-${templateName.replaceAll(' ', '')}`
    // Show the first template.
    if (!show) {
      templateTableTable.style.display = 'none'
    }

    templateTableTable.classList.add('kfbc-template-table')

    // TODO: Replace the column group with styling via CSS.
    const columnGroup = document.createElement('colgroup')
    const nameColumn = document.createElement('col')
    nameColumn.style.width = '10em'
    columnGroup.appendChild(nameColumn)
    const markdownColumn = document.createElement('col')
    markdownColumn.style.width = '50em'
    columnGroup.appendChild(markdownColumn)
    templateTableTable.appendChild(columnGroup)

    const nameRow = document.createElement('tr')
    const nameLabelCell = document.createElement('td')
    const nameLabel = Interface.createLabel('templateName', 'Template name')
    nameLabelCell.appendChild(nameLabel)
    nameRow.appendChild(nameLabelCell)
    const nameValueCell = document.createElement('td')
    // TODO: Allow editing the template name?
    const nameValue = document.createElement('span')
    nameValue.setAttribute('name', 'kfbc-template-name')
    nameValue.textContent = templateName
    nameValueCell.appendChild(nameValue)
    nameRow.appendChild(nameValueCell)
    templateTableTable.appendChild(nameRow)

    const markdownRow = document.createElement('tr')
    const markdownLabelCell = document.createElement('td')
    const markdownLabel = Interface.createLabel('template-markdown', 'Template markdown')
    markdownLabelCell.appendChild(markdownLabel)
    markdownRow.appendChild(markdownLabelCell)
    const markdownValueCell = document.createElement('td')
    const markdownTextArea = document.createElement('textarea')
    markdownTextArea.setAttribute('name', 'kfbc-template-markdown')
    markdownTextArea.setAttribute('rows', '10')
    markdownTextArea.setAttribute('cols', '100')
    markdownTextArea.textContent = templateMarkdown
    // Sync updates back to the series object.
    markdownTextArea.addEventListener('input', (e) => { series.templates[templateName] = e.target.value })
    markdownValueCell.appendChild(markdownTextArea)
    markdownRow.appendChild(markdownValueCell)
    templateTableTable.appendChild(markdownRow)
    return templateTableTable
  }
}
