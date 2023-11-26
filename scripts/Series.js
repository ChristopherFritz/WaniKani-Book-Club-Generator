/* eslint-disable no-unused-vars */

/* globals
  confirm,
  displayVolume,
  ErrorMessage,
  Interface,
  isDate,
  loadFromFileText,
  localStorage,
  storagePrefix,
  Volume
*/

/**
 * A series contains one or more volumes.
 */
class Series {
  constructor (bookTitle) {
    this.bookTitle = bookTitle
    this.bookEmoji = ''
    this.bookClub = ''
    this.seriesHomeThread = null
    this.shortDateFormat = ''
    this.longDateFormat = ''
    this.chapterNumberPrefix = ''
    this.chapterNumberSuffix = ''
    this.volumes = {}
    this.templates = {}
    this.vocabularySheet = {}
    this.selectedVolumeNumber = -1
  }

  static fromJson (json) {
    let s = new Series(json.bookTitle)

    s.bookEmoji = json.bookEmoji
    s.bookClub = json.bookClub
    s.seriesHomeThread = json.seriesHomeThread
    s.shortDateFormat = json.shortDateFormat
    s.longDateFormat = json.longDateFormat
    s.chapterNumberPrefix = json.chapterNumberPrefix
    s.chapterNumberSuffix = json.chapterNumberSuffix
    s.vocabularySheet = json.vocabularySheet

    if (json.volumes !== undefined) {
      for (const [volumeNumber, volumeJson] of Object.entries(json.volumes)) {
        let volume = Volume.fromJson(volumeJson)
        s.volumes[volume.volumeNumber] = volume
      }
    } else {
      s.volumes[1] = new Volume(1)
    }

    if (json.templates !== undefined) {
      for (const [templateName, templateMarkdown] of Object.entries(json.templates)) {
        s.templates[templateName] = templateMarkdown
      }
    }

    return s
  }

  static load (seriesTitle) {
    // Load a blank entry if there is no title.
    if (seriesTitle === '') {
      return this.fromJson({})
    }

    return this.fromJson(JSON.parse(localStorage.getItem(`${storagePrefix}${seriesTitle}`)))
  }

  selectedVolume () {
    // TODO: Handle selectedVolumeNumber better so it will always have the proper value.
    if (this.selectedVolumeNumber === -1) {
      this.selectedVolumeNumber = Object.keys(this.volumes).pop()
    }
    console.log('selectedVolume')
    console.log(this.selectedVolumeNumber)
    if (this.selectedVolumeNumber in this.volumes) {
      return this.volumes[this.selectedVolumeNumber]
    } else {
      return null
    }
  }

  /**
   * The current volume being read, based on today's date.
   * @returns The current volume or next volume if there is no current.
   */
  currentVolume () {
    let today = new Date()
    let soonestVolume = null
    for (const [volumeNumber, volume] of Object.entries(this.volumes)) {
      const startDate = volume.startDate()

      // Skip if there isn't a date set.
      if (!isDate(startDate)) {
        continue
      }

      // Skip future volumes.
      if (today < Date.parse(startDate)) {
        continue
      }

      // This assumes the volumes are in order.  The last volume not skipped will be returned.
      soonestVolume = volume
    }

    return soonestVolume
  }

  /**
   * The next volume to be read, based on today's date.
   * @returns The next volume to be read.
   */
  nextVolume () {
    // Assume that a volume thread will be posted before the start date, but no later than one week after the start date.
    // By this logic, the next volume's thread should be gotten a thread with a date after "today - 7 days".
    let today = new Date()
    let oldestDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)
    let soonestVolume = null
    for (const [volumeNumber, volume] of Object.entries(this.volumes)) {
      const startDate = volume.startDate()

      if (!isDate(startDate)) {
        continue
      }

      // Skip much older dates.
      if (startDate < oldestDate) {
        continue
      }
      // Take the first avaialble date.
      if (soonestVolume == null) {
        soonestVolume = volume
        continue
      }
      // Take subsequent dates if they are older than the first available date.  This is unlikely, but could happen.
      if (startDate < soonestVolume.startDate) {
        soonestVolume = volume
        continue
      }
    }
    return soonestVolume
  }

  /**
   * Creates an HTML <select> containing a list of available templates.
   * @param {*} templateTypeName The ID and name to assign the <select> element.
   * @param {*} selectedItemText The template to show as the selected value.
   * @returns HTML select element.
   */
  templatesToHtml (templateTypeName, selectedItemText) {
    const selectElement = document.createElement('select')
    selectElement.id = templateTypeName
    selectElement.name = templateTypeName
    const blankOption = document.createElement('option')
    selectElement.appendChild(blankOption)
    // TODO: Need to get these at the series level.
    for (const templateName in this.templates) {
      const templateOption = document.createElement('option')
      templateOption.textContent = templateName
      selectElement.appendChild(templateOption)
    }
    selectElement.value = selectedItemText

    return selectElement
  }

  /**
   * Synchronizes changes to the HTML page back to the Series object.
   * @param {*} object Object to update the value of.
   * @returns Function to update the Series object.
   */
  syncValue (object) {
    return function () {
      object[this.name] = this.value
    }
  }

  syncChecked (object) {
    return function () {
      object[this.name] = this.checked
    }
  }

  toHtml () {
    // When creating a new series, why all values undefined?
    if (this.vocabularySheet === undefined) {
      this.bookTitle = ''
      this.bookEmoji = ''
      this.bookClub = ''
      this.seriesHomeThread = null
      this.shortDateFormat = ''
      this.longDateFormat = ''
      this.chapterNumberPrefix = ''
      this.chapterNumberSuffix = ''
      this.volumes = {}
      this.templates = {}
      this.vocabularySheet = {}
      this.selectedVolumeNumber = -1
    }

    const contentElement = Interface.createDiv('content')

    // Add buttons.
    const seriesButtonsDiv = Interface.createDiv('seriesButtons')
    seriesButtonsDiv.appendChild(Interface.createButton('showSeries', 'Series', () => { Interface.showSeriesSection('series') }))
    const showVolumesButton = Interface.createButton('showVolumes', 'Volumes', () => { Interface.showSeriesSection('volumes') })
    showVolumesButton.style.color = 'blue'
    seriesButtonsDiv.appendChild(showVolumesButton)
    seriesButtonsDiv.appendChild(Interface.createButton('showTemplates', 'Templates', () => { Interface.showSeriesSection('templates') }))
    seriesButtonsDiv.appendChild(Interface.createButton('showVocabulary', 'Vocabulary', () => { Interface.showSeriesSection('vocabulary') }))

    contentElement.appendChild(seriesButtonsDiv)

    // Add series section.
    const seriesDiv = Interface.createDiv('series', 'none')
    seriesDiv.appendChild(Interface.createLabel('bookTitle', 'Title'))
    seriesDiv.appendChild(Interface.createInput('bookTitle', this.bookTitle, this.syncValue(this)))
    seriesDiv.appendChild(Interface.createLabel('bookEmoji', 'Emoji'))
    seriesDiv.appendChild(Interface.createInput('bookEmoji', this.bookEmoji, this.syncValue(this)))
    seriesDiv.appendChild(Interface.createLabel('bookClub', 'Club'))

    const bookClubSelect = document.createElement('select')
    bookClubSelect.id = 'bookClub'
    bookClubSelect.setAttribute('name', 'bookClub')
    const emptyOption = document.createElement('option')
    bookClubSelect.appendChild(emptyOption)
    const absoluteBeginnerOption = document.createElement('option')
    absoluteBeginnerOption.value = 'abbc'
    absoluteBeginnerOption.textContent = 'Absolute Beginner'
    bookClubSelect.appendChild(absoluteBeginnerOption)
    const beginnerOption = document.createElement('option')
    beginnerOption.value = 'bbc'
    beginnerOption.textContent = 'Beginner'
    bookClubSelect.appendChild(beginnerOption)
    const intermediateOption = document.createElement('option')
    intermediateOption.value = 'ibc'
    intermediateOption.textContent = 'Intermediate'
    bookClubSelect.appendChild(intermediateOption)
    const advancedOption = document.createElement('option')
    advancedOption.value = 'abc'
    advancedOption.textContent = 'Advanced'
    bookClubSelect.appendChild(advancedOption)
    bookClubSelect.value = this.bookClub
    bookClubSelect.addEventListener('input', this.syncValue(this))
    seriesDiv.appendChild(bookClubSelect)

    seriesDiv.appendChild(Interface.createLabel('seriesHomeThread', 'Home Thread'))
    seriesDiv.appendChild(Interface.createInput('seriesHomeThread', this.seriesHomeThread, this.syncValue(this)))
    seriesDiv.appendChild(Interface.createLabel('shortDateFormat', 'Short date format'))
    seriesDiv.appendChild(Interface.createInput('shortDateFormat', this.shortDateFormat, this.syncValue(this)))
    seriesDiv.appendChild(Interface.createLabel('longDateFormat', 'Long date format'))
    seriesDiv.appendChild(Interface.createInput('longDateFormat', this.longDateFormat, this.syncValue(this)))
    seriesDiv.appendChild(Interface.createLabel('chapterNumberPrefix', 'Chapter # prefix'))
    seriesDiv.appendChild(Interface.createInput('chapterNumberPrefix', this.chapterNumberPrefix, this.syncValue(this)))
    seriesDiv.appendChild(Interface.createLabel('chapterNumberSuffix', 'Chapter # suffix'))
    seriesDiv.appendChild(Interface.createInput('chapterNumberSuffix', this.chapterNumberSuffix, this.syncValue(this)))
    contentElement.appendChild(seriesDiv)

    // Add vocabulary section.
    const vocabularyDiv = Interface.createDiv('vocabulary')
    vocabularyDiv.style.display = 'none'

    const showTitleRowLabel = Interface.createLabel('showTitleRow')
    vocabularyDiv.appendChild(showTitleRowLabel)
    showTitleRowLabel.appendChild(Interface.createInput('showTitleRow', this.vocabularySheet.showTitleRow, this.syncValue(this.vocabularySheet), 'checkbox'))
    showTitleRowLabel.appendChild(document.createTextNode(' Show title row'))
    vocabularyDiv.appendChild(showTitleRowLabel)

    const useBandingLabel = Interface.createLabel('useBanding')
    vocabularyDiv.appendChild(useBandingLabel)
    useBandingLabel.appendChild(Interface.createInput('useBanding', this.vocabularySheet.useBanding, this.syncValue(this.vocabularySheet), 'checkbox'))
    useBandingLabel.appendChild(document.createTextNode(' Alternate row colors'))
    vocabularyDiv.appendChild(useBandingLabel)

    const colorUnsureUnknownLabel = Interface.createLabel('colorUnsureUnknown')
    vocabularyDiv.appendChild(colorUnsureUnknownLabel)
    colorUnsureUnknownLabel.appendChild(Interface.createInput('colorUnsureUnknown', this.vocabularySheet.colorUnsureUnknown, this.syncValue(this.vocabularySheet), 'checkbox'))
    colorUnsureUnknownLabel.appendChild(document.createTextNode(' Color unsure and unknown'))
    vocabularyDiv.appendChild(colorUnsureUnknownLabel)

    const colorPageNumbersLabel = Interface.createLabel('colorPageNumbers')
    colorPageNumbersLabel.setAttribute('for', 'colorPageNumbers')
    vocabularyDiv.appendChild(colorPageNumbersLabel)
    colorPageNumbersLabel.appendChild(Interface.createInput('colorPageNumbers', this.vocabularySheet.colorPageNumbers, this.syncValue(this.vocabularySheet), 'checkbox'))
    colorPageNumbersLabel.appendChild(document.createTextNode(' Color page numbers'))
    vocabularyDiv.appendChild(colorPageNumbersLabel)

    contentElement.appendChild(vocabularyDiv)

    // Add volumes section.
    const volumesDiv = Interface.createDiv('volumes')
    volumesDiv.style.display = 'grid' // none
    const volumeSelectionDiv = Interface.createDiv()
    volumeSelectionDiv.appendChild(document.createTextNode('Volume: '))
    const currentVolume = this.currentVolume()
    const volumeSelect = document.createElement('select')
    volumeSelect.id = 'volumesList'
    volumeSelect.onchange = () => { Interface.displayVolume(volumeSelect) } // TODO: Does this work?
    for (const [volumeNumber, volume] of Object.entries(this.volumes)) {
      const volumeOption = document.createElement('option')
      volumeOption.value = `volume${volumeNumber}`
      volumeOption.textContent = `Volume ${volumeNumber}`
      if (currentVolume !== null && volumeNumber === currentVolume.volumeNumber) {
        volumeOption.setAttribute('selected', 'selected')
      }
      volumeSelect.appendChild(volumeOption)
    }

    volumeSelectionDiv.appendChild(volumeSelect)

    volumeSelectionDiv.appendChild(Interface.createButton('addNewVolume', '➕ Add a volume', () => { Interface.addNewVolume() }))
    // TODO: Support removing a volume.

    volumesDiv.appendChild(volumeSelectionDiv)

    const volumeButtonsDiv = Interface.createDiv('volumeButtons')

    volumeButtonsDiv.appendChild(Interface.createButton('showVolume', 'Volume', () => { Interface.showVolumeSection('volume') }))
    volumeButtonsDiv.appendChild(Interface.createButton('showVolumeLinks', 'Links', () => { Interface.showVolumeSection('links') }))
    volumeButtonsDiv.appendChild(Interface.createButton('showChapters', 'Chapters', () => { Interface.showVolumeSection('chapters') }))
    volumeButtonsDiv.appendChild(Interface.createButton('showWeeks', 'Weeks', () => { Interface.showVolumeSection('weeks') }))

    // TODO: Need to add a new link to the current volume in the series object.
    volumeButtonsDiv.appendChild(Interface.createButton('addNewVolumeLink', '➕ Add a link', () => { Interface.addNewVolumeLink() }, 'none'))
    volumeButtonsDiv.appendChild(Interface.createButton('addNewChapter', '➕ Add a chapter', () => { Interface.addNewChapter() }, 'none'))
    volumeButtonsDiv.appendChild(Interface.createButton('addNewWeek', '➕ Add a week', () => { Interface.addNewWeek() }, 'none'))
    volumesDiv.appendChild(volumeButtonsDiv)

    const volumesContainer = Interface.createDiv('volumesContainer')
    const volumesInnerContainer = Interface.createDiv()

    for (const [volumeNumber, volume] of Object.entries(this.volumes)) {
      const currentVolumeNumber = (currentVolume !== null) ? currentVolume.volumeNumber : volumeNumber
      volumesInnerContainer.appendChild(volume.toHtml(this, currentVolumeNumber))
    }

    volumesContainer.appendChild(volumesInnerContainer)
    volumesDiv.appendChild(volumesContainer)

    contentElement.appendChild(volumesDiv)

    // Add templates section.
    const templatesDiv = Interface.createDiv('templates', 'none')

    const templateDiv = Interface.createDiv('addNewTemplateContainer')
    templateDiv.appendChild(document.createTextNode('Template: '))
    const templatesListSelect = document.createElement('select')
    templatesListSelect.id = 'templatesList'
    for (const [templateName, template] of Object.entries(this.templates)) {
      const templateOption = document.createElement('option')
      templateOption.value = templateName.replaceAll(' ', '')
      templateOption.textContent = templateName
      templatesListSelect.appendChild(templateOption)
    }
    templatesListSelect.addEventListener('input', () => {
      const templateKey = `template${templatesListSelect.value}`
      const templateName = templatesListSelect.options[templatesListSelect.selectedIndex].text
      const templateTables = document.getElementById('templateTables').getElementsByTagName('table')
      for (const templateTable of templateTables) {
        templateTable.style.display = (templateTable.id === templateKey) ? 'table' : 'none'
      }
    })
    templateDiv.appendChild(templatesListSelect)
    templateDiv.appendChild(Interface.createButton('addNewTemplate', '➕ Add a template', () => { Interface.addNewTemplate() }))
    templateDiv.appendChild(Interface.createButton('removeSelectedTemplate', '➖ Remove selected template', () => { Interface.removeSelectedTemplate() }))
    templatesDiv.appendChild(templateDiv)

    const templateTablesDiv = Interface.createDiv('templateTables')

    const firstTemplateName = Object.keys(this.templates)[0]
    for (const [templateName, templateMarkdown] of Object.entries(this.templates)) {
      templateTablesDiv.appendChild(Template.toHtml(templateName, templateMarkdown, templateName === firstTemplateName))
    }

    templatesDiv.appendChild(templateTablesDiv)

    contentElement.appendChild(templatesDiv)

    return contentElement
  }

  /**
 * Saves book club information in JSON format.
 */
  download () {
    ErrorMessage.clear()

    let filename = this.bookTitle
    if (!filename) {
      ErrorMessage.set('Cannot save without a series title.')
      return
    }

    let text = JSON.stringify(this)

    let element = document.createElement('a')
    element.setAttribute('href', `data:application/json;charset=utf-8,${encodeURIComponent(text)}`)
    element.setAttribute('download', `${filename}.json`)

    element.style.display = 'none'
    document.body.appendChild(element)

    element.click()

    document.body.removeChild(element)
  }

  save () {
    ErrorMessage.clear()

    if (!this.bookTitle) {
      ErrorMessage.set('Cannot save without a series title.')
      return
    }

    const bookList = document.getElementById('bookList')

    let storageKey = storagePrefix + this.bookTitle
    localStorage.setItem(storageKey, JSON.stringify(this))

    // Add a new entry to the dropdown list.
    const isNewSeries = (bookList.selectedIndex === 0)
    if (isNewSeries) {
      let listAlreadyContainsBook = false
      for (let i = 0; i < bookList.length; ++i) {
        if (bookList[i].value === this.bookTitle) {
          listAlreadyContainsBook = true
          break
        }
      }
      if (listAlreadyContainsBook) {
        const response = confirm('There is already an entry for this book/series stored in the browser.  This entry will be replaced by the displayed book/series.')
        if (response) {
          bookList.value = this.bookTitle
        } else {
          ErrorMessage.set('Save to browser cancelled.')
          return
        }
      }
    }

    const titleChanged = (bookList.selectedIndex !== 0 && bookList.value !== this.bookTitle)

    // If the title changed, delete the old entry and update the book list.
    if (titleChanged) {
      this.deleteFromStorage(false)
    }
    if (titleChanged || isNewSeries) {
      // Add and select new book list entry
      const bookEntry = document.createElement('option')
      bookEntry.textContent = this.bookTitle
      bookList.appendChild(bookEntry)
      bookList.value = this.bookTitle
    }
  }

  deleteFromStorage (clearValues) {
    ErrorMessage.clear()

    const bookList = document.getElementById('bookList')

    const response = confirm(`The entry ${bookList.value} will be deleted from the browser.`)
    if (!response) {
      ErrorMessage.set('Delete from browser cancelled.')
      return
    }

    localStorage.removeItem(`${storagePrefix}${bookList.value}`)

    bookList.remove(bookList.selectedIndex)
    bookList.selectedIndex = 0
    if (clearValues) {
      loadFromFileText('{}')
      Interface.refreshButtons()
    }
  }

  /*
  // TODO: Implement saving to browser and saving to file.
  save () {
    let output = JSON.stringify(this)
    console.log(output)
  }
  */
}

