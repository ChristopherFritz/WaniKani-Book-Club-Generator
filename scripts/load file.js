// TODO: Have default values for various fields.

// Ensure there is file API support.
if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
	setErrorMessage('File APIs are not fully supported.')
}

//let dropZone = document.getElementById('target')
let dropZone = document.getElementsByTagName('body')[0]

// Show copy icon when dragging over.
dropZone.addEventListener('dragover', function(e) {
	e.stopPropagation()
	e.preventDefault()
	e.dataTransfer.dropEffect = 'copy'
})

// Get the file data on drop.
dropZone.addEventListener('drop', function(e) {

	clearErrorMessage()

	e.stopPropagation()
	e.preventDefault()

	if (e.dataTransfer.files.length !== 1) {
		setErrorMessage('Please drag only one file.')
		return
	}

	// Get first dragged file.
	let file = e.dataTransfer.files[0]

	if (!file.type.match('application/json')) {
		setErrorMessage('Please drag a JSON file.')
		return
	}

	let reader = new FileReader()

	reader.onload = function(e2) {

		loadFromFileText(e2.target.result)
		const bookList = document.getElementById('bookList')
		bookList.selectedIndex = 0

	}

	reader.readAsText(file)

})

function loadFromStorage(title) {

	const fileText = localStorage.getItem(`${storagePrefix}${title}`)

	if (null == fileText) {
		loadFromFileText('{}')
		return
	}

	loadFromFileText(fileText)
	refreshButtons()

}

function loadFromFileText(text) {

	const data = JSON.parse(text)

	document.getElementById('content').style.removeProperty('display')

	loadSeries(data)
	loadVocabularySheet(data)
	loadTemplates(data.templates)
	loadVolumes(data.volumes, getCurrentVolume(data))

	showSeriesSection("series")

	document.getElementById('saveStorage').disabled = false
	document.getElementById('save').disabled = false
	document.getElementById('copySheetsMacro').disabled = false
	document.getElementById('copyVolumeThread').disabled = false
	document.getElementById('copyWeekThread').disabled = false

}

function loadTemplates(templates) {

	// TODO: Test that this still allows adding a template (once an add template button has been implemented).
	if (null == templates) {
		return
	}

	// First, set the list of templates to select which template is visible.
	const templatesList = document.getElementById('templatesList')
	templatesList.replaceChildren()

	let templateItems = []
	const templateToShow =  Object.keys(templates)[0]
	Object.keys(templates).forEach(function(key, index) {
		addTemplateListItem(key, key == templateToShow)
	}, templates)

	const templateTables = document.getElementById("templateTables")
	templateTables.replaceChildren()

	// Next, create a separate container each template.
	let isFirstTemplate = true
	Object.keys(templates).forEach(function(key, index) {
		addTemplateTable(key, this[key], isFirstTemplate)
		if (isFirstTemplate) {
			isFirstTemplate = false
		}
	}, templates)

}

function addTemplateListItem(templateName, selectItem) {

	const templatesList = document.getElementById('templatesList')

	const templateListItem = document.createElement('option')

	if (selectItem) {
		templateListItem.selected = true
	}

	templateListItem.textContent = templateName
	templateListItem.value = templateName.replaceAll(' ', '')
	templatesList.appendChild(templateListItem)

}

function addTemplateTable(templateName, templateText, isFirstTemplate) {

	const templateTable = document.getElementById('templates-template').content.cloneNode(true).querySelector('table')
	templateTable.id = "template" + templateName.replaceAll(' ','')

	// Hide templates after the first.  This causes the first to show by default.
	if (!isFirstTemplate) {
		templateTable.style.display = 'none'
	}
	templateTable.querySelector('span[name="templateName"]').textContent = templateName
	templateTable.querySelector('textarea[name="templateMarkdown"]').value = templateText

	const templateTables = document.getElementById("templateTables")
	templateTables.appendChild(templateTable)

}

// Hide all templates except for the one to show.
function displayTemplate(templateList) {

	const templates = document.getElementsByClassName("templateTable")
	Array.from(templates).forEach(function(element) {
		if ('template' + templateList.value == element.id) {
			element.style.removeProperty('display')
		}
		else {
			element.style.display = 'none'
		}
	})

}

function loadSeries(series) {

	// Replace the series element with a fresh template.
	document.getElementById("series").replaceWith(document.getElementById('series-template').content.cloneNode(true).querySelector('div'))

	// Populate the series values.
	const seriesContainer = document.getElementById("series")

	for (const seriesKey in seriesKeys) {
		if (undefined != series[seriesKey]) {
			const element = seriesContainer.querySelector(`#${seriesKey}`)
			element.value = series[seriesKey]
		}
	}

}

function loadVocabularySheet(series) {

	const vocabularyContainer = document.getElementById('vocabulary')
	const vocabularyButton = document.getElementById('copySheetsMacro')
	vocabularyContainer.replaceChildren()
	for (const vocabularyKey in vocabularyKeys) {
		const label = htmlToElement('<label for="' + vocabularyKey + '"><input name="' + vocabularyKey + '" id="' + vocabularyKey + '" type="checkbox" /> ' + vocabularyKeys[vocabularyKey] + '</label>')
		if (undefined != series['vocabularySheet'] && undefined != series['vocabularySheet'][vocabularyKey] && series['vocabularySheet'][vocabularyKey]) {
			label.querySelector('input').checked = true
		}

		vocabularyContainer.appendChild(label)
	}
	vocabularyContainer.appendChild(vocabularyButton)

}

function addVolumeToList(volumesList, volumeNumber, selectVolume) {

	const volumeListItem = document.createElement('option')

	if (selectVolume) {
		volumeListItem.selected = true
	}

	volumeListItem.textContent = "Volume " + volumeNumber
	volumeListItem.value = "volume" + volumeNumber
	volumesList.appendChild(volumeListItem)

}

function addVolumeFields(volumesElement, volumeNumber) {

	let templateNames = new Array()
	const templateContainerElements = document.getElementsByClassName('templateTable')
	for (const containerElement of templateContainerElements) {
		templateNames.push(containerElement.querySelector('span[name="templateName"]').textContent)
	}

	const volumeContainer = document.getElementById('volume-template').content.cloneNode(true).querySelector('div')

	for (const volumeKey in volumeKeys) {
		if (undefined == volumeKeys[volumeKey]) {
			continue
		}

		if (volumeKey.includes('Template')) {
			const templatesListElement = volumeContainer.querySelector(`#${volumeKey}`)
			for (const templateName of templateNames) {
				const optionElement = document.createElement('option')
				optionElement.name = templateName
				optionElement.innerText = templateName
				templatesListElement.appendChild(optionElement)
			}
		}
	}

	volumeContainer.id = "volume" + volumeNumber

	volumeContainer.querySelector('input[name="volumeNumber"]').value = volumeNumber
	volumesElement.appendChild(volumeContainer)
	return volumeContainer

}

function loadVolumes(volumes, currentVolume) {

	if (null == volumes) {
		return
	}

	// First, set the list of volumes to select which volume is visible.
	const volumesList = document.getElementById('volumesList')
	volumesList.replaceChildren()

	Object.keys(volumes).forEach(function(key, index) {
		addVolumeToList(volumesList, key, currentVolume == volumes[key])
	}, volumes)

	const volumesElement = document.getElementById('volumesContainer')
	volumesElement.replaceChildren()
	// Next, create a separate container for each volume.
	Object.keys(volumes).forEach(function(key, index) {

		const volumeContainer = addVolumeFields(volumesElement, key)
		// Hide if this isn't the current volume.
		if (currentVolume != volumes[key]) {
			volumeContainer.style.display = 'none'
		}
		// Populate volume information.
		for (const volumeKey in volumeKeys) {
			if (undefined == this[key][volumeKey]) {
				continue
			}
			if (volumeKey.includes('Template')) {
				volumeContainer.querySelector('select[name="' + volumeKey + '"]').value = this[key][volumeKey]
			}
			else {
				volumeContainer.querySelector('input[name="' + volumeKey + '"]').value = this[key][volumeKey]
			}
		}
		loadLinks(this[key].links, volumeContainer)
		loadChapters(this[key].chapters, volumeContainer)
		loadWeeks(this[key].weeks, volumeContainer)

	}, volumes)

}

// Hide all volumes except for the one to show.
function displayVolume(volumeList) {

	const volumes = allVolumes()
	Array.from(volumes).forEach(function(element) {
		if (volumeList.value == element.id) {
			element.style.removeProperty('display')
		}
		else {
			element.style.display = 'none'
		}
	})

	// Switch view to volume.
	showVolumes()
	showVolume()

}

function addLinksList(volumeContainer) {

	const linksContainer = htmlToElement('<div name="links" style="display: none"><table name="links">\n<tbody>\n</tbody>\n</table></div>\n')

	volumeContainer.appendChild(linksContainer)

	return linksContainer

}

function addLink(address, volumeContainer) {

	if (undefined === volumeContainer) {
		volumeContainer = currentVolume()
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
				'Purchase Physical': /\/dp\/([0-9][^\/]*)/,
				'Purchase Digital': /\/dp\/([A-z][^\/]*)/
			}
			// TODO: Determine if physical or digital.
			break
		case 'bookwalker.jp':
			sitename = 'Book Walker'
			tokens = {'Purchase Digital': /\/([^\/]*)/}
			break
		case 'www.cdjapan.co.jp':
			sitename = 'CD Japan'
			tokens = {'Purchase Physical': /\/product\/([^\/]*)/}
			break
		case 'www.kobo.com':
			sitename = 'Kobo'
			tokens = {'Purchase Digital': /\/ebook\/([^\/]*)/}
			break
		case 'books.rakuten.co.jp':
			sitename = 'Rakuten'
			tokens = {
				'Purchase Physical': /\/rb\/([^\/]*)/,
				'Purchase Digital': /\/rk\/([^\/]*)/
			}
			break
		case 'comic.pixiv.net':
			sitename = 'Pixiv'
			tokens = {'Purchase Digital': /\/store\/variants\/([^\/]*)/}
			break
		case 'ebookjapan.yahoo.co.jp':
			sitename = 'Yahoo'
			tokens = {'Purchase Physical': /\/books\/([^\/]*\/[^\/]*)/}
			break
		case 'learnnatively.com':
			sitename = 'Natively'
			tokens = {
				'Book': /\/book\/([^\/]*)/,
				'Series': /\/series\/([^\/]*)/
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
	let tokenType = "Unknown"
	if (undefined !== tokens) {
		for (let token in tokens) {

			const match = url.pathname.match(tokens[token])

			if (null === match || 0 === match.length) {
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

	// TODO: There should also be a field to key in what text should be shown.  This is useful for when there are multiple releases (such as b&w vs color).

	const removeItemCellElement = document.createElement('td')
	const removeItem = document.createElement('span')
	removeItem.classList.add('clickable')
	removeItem.textContent = '➖'
	removeItem.onclick = function() { removeVolumeLink(this) }
	removeItemCellElement.appendChild(removeItem)
	rowElement.appendChild(removeItemCellElement)

	tableBodyElement.appendChild(rowElement)

}

function loadLinks(links, volumeContainer) {

	console.log(links)
	console.log(undefined == links)
	console.log(null == links)
	console.log(null == links)

	return
	const linksList = addLinksList(volumeContainer).firstChild

	for (let address of links) {
		//addLink(address, volumeContainer)
	}

}

function addChaptersTable(volumeContainer) {

	const chaptersContainer = document.getElementById('chapters-template').content.cloneNode(true).querySelector('div')
	volumeContainer.appendChild(chaptersContainer)

	return chaptersContainer.getElementsByTagName('table')[0]

}

function loadChapters(chapters, volumeContainer) {

	const chaptersTable = addChaptersTable(volumeContainer)
	const chaptersBody = chaptersTable.getElementsByTagName('tbody')[0]

	if (null == chapters) {
		return
	}

	Object.keys(chapters).forEach(function(key, index) {
		const singleChapterElement = createEmptyChapter()
		singleChapterElement.querySelector('input[name="number"]').value = key
		for (const chapterKey in chapterKeys) {
			if (this[key][chapterKey] == undefined) {
				continue
			}
			singleChapterElement.querySelector('input[name="' + chapterKey + '"]').value = this[key][chapterKey]
		}
		chaptersBody.appendChild(singleChapterElement)
	}, chapters)

}

function addWeeksTable(volumeContainer) {

	const weeksContainer = document.getElementById('weeks-template').content.cloneNode(true).querySelector('div')
	volumeContainer.appendChild(weeksContainer)

	return weeksContainer.getElementsByTagName('table')[0]

}

function loadWeeks(weeks, volumeContainer) {

	const weeksTable = addWeeksTable(volumeContainer)
	const weeksBody = weeksTable.getElementsByTagName('tbody')[0]

	if (null == weeks) {
		return
	}

	Object.keys(weeks).forEach(function(key, index) {
		const singleWeekElement = createEmptyWeek()
		singleWeekElement.querySelector('input[name="number"]').value = key
		for (const weekKey in weekKeys) {
			if (this[key][weekKey] == undefined) {
				continue
			}


			if (weekKey.includes('Date')) {
				singleWeekElement.querySelector('input[name="' + weekKey + '"]').value = this[key][weekKey].substring(0, 10)
			}
			else {
				singleWeekElement.querySelector('input[name="' + weekKey + '"]').value = this[key][weekKey]
			}

		}
		weeksBody.appendChild(singleWeekElement)
	}, weeks)

}
