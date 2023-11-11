/* globals
  addChaptersTable,
  addLink,
  addLinksList,
  addTemplateListItem,
  addTemplateTable,
  addVolumeFields,
  addVolumeToList,
  addWeeksTable,
  displayTemplate,
  displayVolume,
  htmlToElement,
  localStorage,
  prompt,
  storagePrefix,
  templatesList
*/

function setErrorMessage (message) {
  if (message !== '') {
    message = 'Error: ' + message
  }

  document.getElementById('errors').textContent = message
}

function clearErrorMessage () {
  document.getElementById('errors').textContent = ''
}

function showBookList () {
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

function refreshButtons () {
  document.getElementById('deleteStorage').disabled = document.getElementById('bookList').selectedIndex === 0
}

/* Series buttons */

function showSeries () {
  showSeriesSection('series')
}

function showVolumes () {
  showSeriesSection('volumes')
}

function showTemplates () {
  showSeriesSection('templates')
}

function showVocabulary () {
  showSeriesSection('vocabulary')
}

function showSeriesSection (sectionToShow) {
  const volumes = document.getElementById('content')
  volumes.querySelector('div[id="series"]').style.display = 'none'
  volumes.querySelector('div[id="volumes"]').style.display = 'none'
  volumes.querySelector('div[id="templates"]').style.display = 'none'
  volumes.querySelector('div[id="vocabulary"]').style.display = 'none'

  volumes.querySelector('button[id="showSeries"]').style.removeProperty('color')
  volumes.querySelector('button[id="showVolumes"]').style.removeProperty('color')
  volumes.querySelector('button[id="showTemplates"]').style.removeProperty('color')
  volumes.querySelector('button[id="showVocabulary"]').style.removeProperty('color')

  volumes.querySelector('div[id="' + sectionToShow + '"]').style.display = 'grid'

  const clickedButtonId = 'show' + sectionToShow.charAt(0).toUpperCase() + sectionToShow.slice(1)
  volumes.querySelector('button[id="' + clickedButtonId + '"]').style.color = 'blue'
}

/* Volume buttons */

function showVolume () {
  showVolumeSection('volume')
}

function showChapters () {
  showVolumeSection('chapters')
}

function showVolumeLinks () {
  showVolumeSection('links')
}

function showWeeks () {
  showVolumeSection('weeks')
}

function showVolumeSection (sectionToShow) {
  const volume = currentVolume()

  Array.from(['volume', 'links', 'chapters', 'weeks']).forEach(function (name) {
    const elementByName = volume.querySelector('div[name="' + name + '"]')
    if (elementByName == null) {
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

  volume.querySelector('div[name="' + sectionToShow + '"]').style.display = display
}

function allVolumes () {
  return document.getElementsByClassName('volumeContainer')
}

// Returns the current volume's container element.
function currentVolume () {
  const volumeElements = allVolumes()
  let currentElement = null

  Array.from(volumeElements).forEach(function (element) {
    if (element.style.display === 'none') {
      return
    }
    currentElement = element
  })

  return currentElement
}

function addNewVolume () {
  // Add a new volume to the volumes list.
  const volumesList = document.getElementById('volumesList')
  const volumesListItems = volumesList.getElementsByTagName('option')
  let lastVolumeNumber = 0
  if (volumesListItems.length > 0) {
    lastVolumeNumber = volumesListItems[volumesListItems.length - 1].value.replace('volume', '')
  }
  const newVolumeNumber = Number(lastVolumeNumber) + 1

  const volumesElement = document.getElementById('volumesContainer')

  const volumeContainer = addVolumeFields(volumesElement, newVolumeNumber)
  addLinksList(volumeContainer)
  addChaptersTable(volumeContainer)
  addWeeksTable(volumeContainer)

  addVolumeToList(volumesList, newVolumeNumber, true)
  displayVolume(volumesList)
}

function createEmptyChapter () {
  const emptyRow =
    '<tr>\n' +
    '<td><input name="number"></td>\n' +
    '<td><input name="title"></td>\n' +
    '<td class="clickable" onclick="removeChapter(this)">➖</td>\n' +
    '</tr>'
  return htmlToElement(emptyRow)
}

function addNewChapter () {
  // TODO: Get the last numeric chapter from the prior volume if available.

  const volumeContainer = currentVolume()
  const chaptersContainer = volumeContainer.querySelector('table[name="chapters"]')
  const tableBody = chaptersContainer.getElementsByTagName('tbody')[0]
  const chapterRowElement = createEmptyChapter()

  const chapterRowElements = chaptersContainer.querySelector('tbody').querySelectorAll('tr')
  let lastChapterRow = chapterRowElements[chapterRowElements.length - 1]
  if (undefined !== lastChapterRow) {
    let lastChapterNumber = lastChapterRow.querySelector('input[name="number"]').value
    console.log(lastChapterNumber)
    console.log(!isNaN(lastChapterNumber))
    if (!isNaN(lastChapterNumber)) {
      chapterRowElement.querySelector('input[name="number"]').value = Number(lastChapterNumber) + 1
    }
  }

  tableBody.appendChild(chapterRowElement)
}

function removeChapter (element) {
  element.parentNode.remove()
}

function addNewVolumeLink () {
  // TODO: Use a modal for this.
  let linkAddress = prompt('Enter address to add:')

  if (linkAddress === null) {
    return
  }

  addLink(linkAddress)
  // const volumeContainer = currentVolume()
  // const chaptersContainer = volumeContainer.querySelector('table[name="chapters"]')
  // const tableBody = chaptersContainer.getElementsByTagName("tbody")[0]
  // const chapterRowElement = createEmptyChapter()
  // tableBody.appendChild(chapterRowElement)
}

function createEmptyWeek () {
  const emptyRow =
    '<tr>\n' +
    '<td><input name="number"></td>\n' +
    '<td><input name="weekThread"></td>\n' +
    '<td><input name="startDate" type="date"></td>\n' +
    '<td><input name="chapters"></td>\n' +
    '<td><input name="startPage"></td>\n' +
    '<td><input name="endPage"></td>\n' +
    '<td class="clickable" onclick="removeWeek(this)">➖</td>\n' +
    '</tr>'
  return htmlToElement(emptyRow)
}

function addNewWeek () {
  const volumeContainer = currentVolume()
  const weeksContainer = volumeContainer.querySelector('table[name="weeks"]')
  const tableBody = weeksContainer.getElementsByTagName('tbody')[0]
  const weekRowElement = createEmptyWeek()

  const weekRowElements = weeksContainer.querySelector('tbody').querySelectorAll('tr')
  let lastWeekRow = weekRowElements[weekRowElements.length - 1]
  if (undefined === lastWeekRow) {
    // This is the first week of the volume.
    weekRowElement.querySelector('input[name="number"]').value = 1
  } else {
    // Set this week number based on the prior week's number.
    let lastWeekNumber = lastWeekRow.querySelector('input[name="number"]').value
    if (!isNaN(lastWeekNumber)) {
      weekRowElement.querySelector('input[name="number"]').value = Number(lastWeekNumber) + 1
    }
    let lastWeekStartDateElement = lastWeekRow.querySelector('input[name="startDate"]')
    // Add a week to the date.
    let thisWeekStartDate = new Date(lastWeekStartDateElement + 7 * 24 * 60 * 60 * 1000)
    weekRowElement.querySelector('input[name="startDate"]').valueAsDate = thisWeekStartDate
  }

  tableBody.appendChild(weekRowElement)
}

function removeWeek (element) {
  element.parentNode.remove()
}

function removeVolumeLink (element) {
  element.parentNode.parentNode.remove()
}

function addNewTemplate () {
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

function removeSelectedTemplate () {
  // TODO: Remove selected template.
  // TODO: Disable remove button.
  // TODO: Enable remove button when a template has been selected.

  const templatesList = document.getElementById('templatesList')

  // Remove the template table.
  const templateTableId = 'template' + templatesList.value
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
