/* eslint-disable no-unused-vars */

/* globals
  addChaptersTable,
  addLink,
  addTemplateListItem,
  addTemplateTable,
  addVolumeToList,
  addWeeksTable,
  displayTemplate,
  Chapter,
  isDate,
  localStorage,
  prompt,
  series,
  storagePrefix,
  templatesList,
  Volume,
  Week
*/

class Interface {
  /** Streamlined creation of div elements. */
  static createDiv (id = '', display = 'block') {
    const div = document.createElement('div')
    // TODO: Are any of these DIV IDs required, or can this be removed?
    div.id = id
    div.style.display = display
    return div
  }

  /** Streamlined creation of input elements. */
  static createInput (name, value, inputHandler, type = 'text') {
    const input = document.createElement('input')
    input.setAttribute('name', name)
    input.setAttribute('type', type)
    if (type === 'checkbox') {
      input.checked = value
    } else {
      input.value = value
    }
    input.addEventListener('input', inputHandler)
    return input
  }

  /** Streamlined creation of label elements. */
  static createLabel (forId, text) {
    const label = document.createElement('label')
    label.setAttribute('for', forId)
    label.textContent = text
    return label
  }

  /** Streamlined creation of button elements. */
  static createButton (id, text, inputHandler, display = '') {
    const button = document.createElement('button')
    button.id = id
    button.textContent = text
    if (display !== '') {
      button.style.display = display
    }
    button.addEventListener('click', inputHandler)
    return button
  }

  static showBookList () {
    // TODO: Have a "new series" button that clears out current fields.  Need to request series name which cannot(?) be
    // changed after.  Or allow name change, but then the key changes, so the old entry needs to be removed at the time
    // of saving.
    const keys = Object.keys(localStorage)
    const bookList = document.getElementById('bookList')

    for (let key of keys) {
      if (!key.startsWith(storagePrefix)) {
        continue
      }
      if (localStorage.getItem(key) == null) {
        continue
      }
      const value = JSON.parse(localStorage.getItem(key))

      const bookEntry = document.createElement('option')
      bookEntry.textContent = value.bookTitle
      bookList.appendChild(bookEntry)
    }
  }

  static refreshButtons () {
    document.getElementById('deleteStorage').disabled = document.getElementById('bookList').selectedIndex === 0

    document.getElementById('saveStorage').disabled = false
    document.getElementById('save').disabled = false
    document.getElementById('copySheetsMacro').disabled = false
    document.getElementById('copyVolumeThread').disabled = false
    document.getElementById('copyWeekThread').disabled = false
  }

  static showSeriesSection (sectionToShow) {
    const volumes = document.getElementById('content')
    if (volumes.childElementCount === 0) {
      return
    }
    volumes.querySelector('div[id="series"]').style.display = 'none'
    volumes.querySelector('div[id="volumes"]').style.display = 'none'
    volumes.querySelector('div[id="templates"]').style.display = 'none'
    volumes.querySelector('div[id="vocabulary"]').style.display = 'none'

    volumes.querySelector('button[id="showSeries"]').style.removeProperty('color')
    volumes.querySelector('button[id="showVolumes"]').style.removeProperty('color')
    volumes.querySelector('button[id="showTemplates"]').style.removeProperty('color')
    volumes.querySelector('button[id="showVocabulary"]').style.removeProperty('color')

    volumes.querySelector(`div[id="${sectionToShow}"]`).style.display = 'grid'

    const clickedButtonId = `show${sectionToShow.charAt(0).toUpperCase()}${sectionToShow.slice(1)}`
    volumes.querySelector(`button[id="${clickedButtonId}"]`).style.color = 'blue'
  }

  static showVolumeSection (sectionToShow) {
    const volume = series.volumes[document.getElementById('volumesList').value.replace('volume', '')]

    Array.from(['volume', 'links', 'chapters', 'weeks']).forEach(function (name) {
      const elementByName = document.querySelector(`div[id="volume${volume.volumeNumber}"] div[name="${name}"]`)
      if (elementByName === null) {
        return
      }
      elementByName.style.display = 'none'
    })

    // Hide add buttons except for what's for the current section.
    document.getElementById('addNewVolumeLink').style.display = 'none'
    document.getElementById('addNewChapter').style.display = 'none'
    document.getElementById('addNewWeek').style.display = 'none'

    let display = 'grid'

    let sectionButtonName = null
    switch (sectionToShow) {
      case 'links':
        sectionButtonName = 'addNewVolumeLink'
        display = 'block'
        break
      case 'chapters':
        sectionButtonName = 'addNewChapter'
        display = 'block'
        break
      case 'weeks':
        sectionButtonName = 'addNewWeek'
        display = 'block'
        break
    }
    if (sectionButtonName != null) {
      document.getElementById(sectionButtonName).style.removeProperty('display')
    }

    document.querySelector(`div[id="volume${volume.volumeNumber}"] div[name="${sectionToShow}"]`).style.display = display
  }

  static allVolumes () {
    return document.getElementsByClassName('volumeContainer')
  }

  /** Returns the current volume's container element. */
  static currentVolume () {
    const volumeElements = Interface.allVolumes()
    let currentElement = null

    Array.from(volumeElements).forEach(function (element) {
      if (element.style.display === 'none') {
        return
      }
      currentElement = element
    })

    return currentElement
  }

  static addNewVolume () {
    // Add a new volume to the volumes list.
    const volumesList = document.getElementById('volumesList')
    const volumesListItems = volumesList.getElementsByTagName('option')
    let lastVolumeNumber = 0
    if (volumesListItems.length > 0) {
      lastVolumeNumber = volumesListItems[volumesListItems.length - 1].value.replace('volume', '')
    }
    const newVolumeNumber = Number(lastVolumeNumber) + 1

    series.volumes[newVolumeNumber] = new Volume(newVolumeNumber)

    const volumesElement = document.getElementById('volumesContainer')
    volumesElement.appendChild(series.volumes[newVolumeNumber].toHtml(series, newVolumeNumber))

    addVolumeToList(volumesList, newVolumeNumber, true)
    Interface.displayVolume(volumesList)
  }

  /** Hide all volumes except for the one to show. */
  static displayVolume (volumeList) {
    const volumes = Interface.allVolumes()
    Array.from(volumes).forEach(function (element) {
      if (volumeList.value === element.id) {
        element.style.removeProperty('display')
        // TODO: Add the volume number as a dataset value on the element.
        // eslint-disable-next-line no-global-assign, no-native-reassign
        series.selectedVolumeNumber = element.id.replace('volume', '')
      } else {
        element.style.display = 'none'
      }
    })

    // Switch view to volume.
    Interface.showVolumeSection('volume')
  }

  // TODO: When updating a chapter number, it needs to update in the dataset and the series object.
  static addNewChapter () {
    const selectedVolume = series.selectedVolume()
    const chaptersContainer = document.querySelector(`div[id="volume${selectedVolume.volumeNumber}"] table[name="chapters"]`)
    const tableBody = chaptersContainer.getElementsByTagName('tbody')[0]
    let lastChapterNumber = Object.keys(selectedVolume.chapters).pop()
    if (lastChapterNumber === undefined) {
      // Get the last numeric chapter from the prior volume if available.
      if ((selectedVolume.volumeNumber - 1) in series.volumes) {
        lastChapterNumber = Object.keys(series.volumes[selectedVolume.volumeNumber - 1].chapters).pop()
      }
    }
    let newChapterNumber = 1
    if (!isNaN(lastChapterNumber)) {
      newChapterNumber = Number(lastChapterNumber) + 1
    }
    selectedVolume.chapters[newChapterNumber] = new Chapter(newChapterNumber)
    tableBody.appendChild(selectedVolume.chapters[newChapterNumber].toHtml())
  }

  static addNewVolumeLink () {
    // TODO: Use a modal for this.
    let linkAddress = prompt('Enter address to add:')

    if (linkAddress === null) {
      return
    }

    // TODO: Add to series object.
    addLink(linkAddress)
  }

  static addNewWeek () {
    const selectedVolume = series.selectedVolume()
    const weeksContainer = document.querySelector(`div[id="volume${selectedVolume.volumeNumber}"] table[name="weeks"]`)
    const tableBody = weeksContainer.getElementsByTagName('tbody')[0]
    // TODO: Handle if there are no prior weeks.
    let lastWeekNumber = Object.keys(selectedVolume.weeks).pop()
    let newWeekNumber = 1
    if (lastWeekNumber !== undefined) {
      newWeekNumber = Number(lastWeekNumber) + 1
    }
    // Add a week to the date.
    selectedVolume.weeks[newWeekNumber] = new Week(newWeekNumber)
    if (lastWeekNumber !== undefined && isDate(selectedVolume.weeks[lastWeekNumber].startDate)) {
      let thisWeekStartDate = new Date(Date.parse(selectedVolume.weeks[lastWeekNumber].startDate) + 7 * 24 * 60 * 60 * 1000)
      selectedVolume.weeks[newWeekNumber].startDate = thisWeekStartDate.toISOString()
    }
    tableBody.appendChild(selectedVolume.weeks[newWeekNumber].toHtml())
  }

  static removeVolumeLink (element) {
    element.parentNode.parentNode.remove()
  }

  static addNewTemplate () {
    // Add a new template to the templates list.  Ask for template name.

    // Ask for the name of the template.
    // TODO: Disallow any characters that will cause an issue for templates.  Maybe allow only alphanumeric characters?
    let newTemplateName = prompt('Name of new template:')
    if (newTemplateName == null || newTemplateName.trim() === '') {
      return
    }

    // Remove leading and trailing whitespace to ensure it doesn't cause any issues.
    newTemplateName = newTemplateName.trim()

    addTemplateTable(newTemplateName, '', true)
    addTemplateListItem(newTemplateName, true)
    displayTemplate(templatesList)

    // TODO: Add a template to all selects with the name "volumeTemplate".
  }

  static removeSelectedTemplate () {
    // TODO: Remove selected template.
    // TODO: Disable remove button.
    // TODO: Enable remove button when a template has been selected.

    const templatesList = document.getElementById('templatesList')

    // Remove the template table.
    const templateTableId = `template${templatesList.value}`
    const table = document.getElementById(templateTableId)
    if (table != null) {
      table.remove()
    }

    // Remove from the template list.
    for (var i = 0; i < templatesList.length; i++) {
      if (templatesList.options[i].selected) {
        templatesList.remove(i)
        break
      }
    }

    // Select the first template from the list.
    if (templatesList.childElementCount > 0) {
      templatesList.firstChild.selected = true
      displayTemplate(templatesList)
    }

    // TODO: Remove the template from all selects with the name "volumeTemplate".
  }
}
