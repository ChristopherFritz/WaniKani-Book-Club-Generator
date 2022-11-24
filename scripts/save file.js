/**
 * Saves book club information in JSON format.
 */
function download() {

	clearErrorMessage();

	const container = readFromHtml();

	var element = document.createElement('a')

	var filename = document.getElementsByName('bookTitle')[0].value
	if (!filename) {
		setErrorMessage("Cannot save without a series title.");
		return
	}

	var text = JSON.stringify(container);

	element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename + ".json")

	element.style.display = 'none'
	document.body.appendChild(element)

	element.click()

	document.body.removeChild(element)

}
