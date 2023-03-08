function save() {

	clearErrorMessage()

	const container = readFromHtml()

	if (!container.bookTitle) {
		setErrorMessage("Cannot save without a series title.")
		return
	}

	const bookList = document.getElementById('bookList')
	const selectedBookTitle = document.getElementById('bookList').value

	// TODO: When loading from a list, change the selection to empty.  When saving, if the current selection is empty, but there is a title match, alert user.  "There is already an entry for this title.  Overwrite?"
	// TODO: Add to book list if not already in list.

	let storageKey = storagePrefix + container.bookTitle
	localStorage.setItem(storageKey, JSON.stringify(container))

	// Add a new entry to the dropdown list.
	const isNewSeries = (0 == bookList.selectedIndex)
	if (isNewSeries) {

		// TODO: When loading from a list, change the selection to empty.  When saving, if the current selection is empty, but there is a title match, alert user.  "There is already an entry for this title.  Overwrite?"
		// TODO: Add to book list if not already in list.
		// TODO: Use a for each loop.
		let listAlreadyContainsBook = false
		for (i = 0; i < bookList.length; ++i){
			if (bookList[i].value == container.bookTitle) {
				listAlreadyContainsBook = true
				break
			}
		}
		if (listAlreadyContainsBook) {
			const response = confirm('There is already an entry for this book/series stored in the browser.  This entry will be replaced by the displayed book/series.')
			if (response) {
				bookList.value = container.bookTitle
			}
			else {
				setErrorMessage('Save to browser cancelled.')
				return
			}

		}

	}

	const titleChanged = (0 != bookList.selectedIndex && bookList.value != container.bookTitle)

	// If the title changed, delete the old entry and update the book list.
	if (titleChanged) {
		deleteFromStorage(false)
	}
	if (titleChanged || isNewSeries) {
		// Add and select new book list entry
		const bookEntry = document.createElement('option')
		bookEntry.textContent = container.bookTitle
		bookList.appendChild(bookEntry)
		bookList.value = container.bookTitle
	}

}

function deleteFromStorage(clearValues) {

	clearErrorMessage()

	const bookList = document.getElementById('bookList')

	const response = confirm(`The entry ${bookList.value} will be deleted from the browser.`)
	if (!response) {
		setErrorMessage('Delete from browser cancelled.')
		return
	}

	localStorage.removeItem(`${storagePrefix}${bookList.value}`)

	bookList.remove(bookList.selectedIndex)
	bookList.selectedIndex = 0
	if (clearValues) {
		loadFromFileText('{}')
		refreshButtons()
	}

}

/**
 * Saves book club information in JSON format.
 */
function download() {

	clearErrorMessage()

	const container = readFromHtml()

	let filename = container.bookTitle
	if (!filename) {
		setErrorMessage("Cannot save without a series title.")
		return
	}

	let text = JSON.stringify(container)

	let element = document.createElement('a')
	element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text))
	element.setAttribute('download', filename + ".json")

	element.style.display = 'none'
	document.body.appendChild(element)

	element.click()

	document.body.removeChild(element)

}
