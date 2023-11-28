/* eslint-disable no-unused-vars */

/* globals
  ErrorMessage,
  FileReader,
  Interface,
  localStorage,
  Series,
  series,
  showVolumes,
  storagePrefix,
  Template
*/

// Ensure there is file API support.
if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
  ErrorMessage.set('File APIs are not fully supported.')
}

let dropZone = document.getElementsByTagName('body')[0]

// Show copy icon when dragging over.
dropZone.addEventListener('dragover', (e) => {
  e.stopPropagation()
  e.preventDefault()
  e.dataTransfer.dropEffect = 'copy'
})

// Get the file data on drop.
dropZone.addEventListener('drop', (e) => {
  ErrorMessage.clear()

  e.stopPropagation()
  e.preventDefault()

  if (e.dataTransfer.files.length !== 1) {
    ErrorMessage.set('Please drag only one file.')
    return
  }

  // Get first dragged file.
  let file = e.dataTransfer.files[0]

  if (!file.type.match('application/json')) {
    ErrorMessage.set('Please drag a JSON file.')
    return
  }

  let reader = new FileReader()

  reader.onload = function (e2) {
    loadFromFileText(e2.target.result)
    const bookList = document.getElementById('bookList')
    bookList.selectedIndex = 0
  }

  reader.readAsText(file)
})

function loadFromStorage (title) {
  const fileText = localStorage.getItem(`${storagePrefix}${title}`)

  if (fileText == null) {
    loadFromFileText('{}')
    return
  }

  // eslint-disable-next-line no-global-assign, no-native-reassign
  series = Series.load(title)
  const currentVolume = series.currentVolume()
  // eslint-disable-next-line no-global-assign, no-native-reassign
  if (currentVolume !== null) {
    series.selectedVolumeNumber = currentVolume.volumeNumber
  }

  const targetDiv = document.getElementById('content')
  targetDiv.replaceWith(series.toHtml(series))

  Interface.refreshButtons()
}

function loadFromFileText (text) {
  // eslint-disable-next-line no-global-assign, no-native-reassign
  series = Series.fromJson(JSON.parse(text))

  const targetDiv = document.getElementById('content')
  targetDiv.replaceWith(series.toHtml(series))

  document.getElementById('content').style.removeProperty('display')

  Interface.showSeriesSection('series')
  Interface.refreshButtons()
}

function addTemplateListItem (templateName, selectItem) {
  const templatesList = document.getElementById('templatesList')

  const templateListItem = document.createElement('option')

  if (selectItem) {
    templateListItem.selected = true
  }

  templateListItem.textContent = templateName
  templateListItem.value = templateName.replaceAll(' ', '')
  templatesList.appendChild(templateListItem)
}

function addTemplateTable (templateName, templateText, isFirstTemplate) {
  series.templates[templateName] = templateText
  const templateTables = document.getElementById('templateTables')
  templateTables.appendChild(Template.toHtml(templateName, templateText, true, series))
}

// Hide all templates except for the one to show.
function displayTemplate (templateList) {
  const templates = document.getElementsByClassName('templateTable')
  Array.from(templates).forEach(function (element) {
    if (`template${templateList.value}` === element.id) {
      element.style.removeProperty('display')
    } else {
      element.style.display = 'none'
    }
  })
}

function addVolumeToList (volumesList, volumeNumber, selectVolume) {
  const volumeListItem = document.createElement('option')

  if (selectVolume) {
    volumeListItem.selected = true
  }

  volumeListItem.textContent = `Volume ${volumeNumber}`
  volumeListItem.value = `volume${volumeNumber}`
  volumesList.appendChild(volumeListItem)
}

function addLink (address, volumeContainer) {
  if (undefined === volumeContainer) {
    volumeContainer = Interface.currentVolume()
  }

  const tableBodyElement = volumeContainer.querySelector('div[name="links"]>table[name="links"]>tbody')

  const url = new URL(address)

  let sitename = `Unknown (${url.hostname})`
  let tokens = {}
  // TODO: Move these to a JSON file?  This can allow for multiple token checks, such as for Amazon physical versus digital.
  switch (url.hostname) {
    case 'www.amazon.co.jp':
      sitename = 'Amazon'
      tokens = {
        'Purchase Physical': /\/dp\/([0-9][^/]*)/,
        'Purchase Digital': /\/dp\/([A-z][^/]*)/
      }
      // TODO: Determine if physical or digital.
      break
    case 'bookwalker.jp':
      sitename = 'Book Walker'
      tokens = {'Purchase Digital': /\/([^/]*)/}
      break
    case 'www.cdjapan.co.jp':
      sitename = 'CD Japan'
      tokens = {'Purchase Physical': /\/product\/([^/]*)/}
      break
    case 'www.kobo.com':
      sitename = 'Kobo'
      tokens = {'Purchase Digital': /\/ebook\/([^/]*)/}
      break
    case 'books.rakuten.co.jp':
      sitename = 'Rakuten'
      tokens = {
        'Purchase Physical': /\/rb\/([^/]*)/,
        'Purchase Digital': /\/rk\/([^/]*)/
      }
      break
    case 'comic.pixiv.net':
      sitename = 'Pixiv'
      tokens = {'Purchase Digital': /\/store\/variants\/([^/]*)/}
      break
    case 'ebookjapan.yahoo.co.jp':
      sitename = 'Yahoo'
      tokens = {'Purchase Physical': /\/books\/([^/]*\/[^/]*)/}
      break
    case 'learnnatively.com':
      sitename = 'Natively'
      tokens = {
        'Book': /\/book\/([^/]*)/,
        'Series': /\/series\/([^/]*)/
      }
      break
  }

  const rowElement = document.createElement('tr')

  const linkCellElement = document.createElement('td')
  linkCellElement.classList.add('favicon')
  linkCellElement.classList.add(sitename.toLowerCase().replace(' ', '-'))

  const linkElement = document.createElement('a')
  linkElement.href = address
  linkElement.textContent = `${sitename}`
  linkCellElement.appendChild(linkElement)
  rowElement.appendChild(linkCellElement)

  // Seek a matching token.
  let tokenType = 'Unknown'
  if (undefined !== tokens) {
    for (let token in tokens) {
      const match = url.pathname.match(tokens[token])

      if (match === null || match.length === 0) {
        continue
      }

      // A match was found.
      tokenType = token
      break
    }
  }

  const typeCellElement = document.createElement('td')
  typeCellElement.textContent = tokenType
  rowElement.appendChild(typeCellElement)

  // TODO: There should also be a field to enter in what text should be shown.  This is useful for when there are
  // multiple releases (such as b&w vs color).

  const removeItemCellElement = document.createElement('td')
  const removeItem = document.createElement('span')
  removeItem.classList.add('clickable')
  removeItem.textContent = '➖'
  removeItem.onclick = function () { Interface.removeVolumeLink(this) }
  removeItemCellElement.appendChild(removeItem)
  rowElement.appendChild(removeItemCellElement)

  tableBodyElement.appendChild(rowElement)
}

function loadLinks (links, volumeContainer) {
  // console.log(links)
  return

  // const linksList = addLinksList(volumeContainer).firstChild

  // for (let address of links) {
  // addLink(address, volumeContainer)
  // }
}

