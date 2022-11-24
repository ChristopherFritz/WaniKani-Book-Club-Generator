/**
 * Reads book club information from HTML and converts to an object.
 * @return {array} An associative array of book club values.
 */
function readFromHtml() {

	var container = {};

	const seriesElements = document.querySelector('div[id="series"]');
	for (const seriesKey in seriesKeys) {
		container[seriesKey] = seriesElements.querySelector('input[name="' + seriesKey + '"]').value
	}

	container["volumes"] = {};
	const volumeContainerElements = allVolumes();
	console.log(volumeContainerElements);
	for (const containerElement of volumeContainerElements) {
		const volumeElements = containerElement.querySelector('table[name="volume"]');
		volumeNumber = volumeElements.querySelector('input[name="volumeNumber"]').value
		container["volumes"][volumeNumber] = {};
		for (const volumeKey in volumeKeys) {
			container["volumes"][volumeNumber][volumeKey] = volumeElements.querySelector('input[name="' + volumeKey + '"]').value
		}

		const chapterElements = containerElement.querySelector('table[name="chapters"]');
		container["volumes"][volumeNumber]['chapters'] = {};
		const chapterRowElements = chapterElements.querySelector('tbody').querySelectorAll('tr');
		for (const chapterRowElement of chapterRowElements) {
			chapterNumber = chapterRowElement.querySelector('input[name="number"]').value
			container["volumes"][volumeNumber]['chapters'][chapterNumber] = {};
			for (const chapterKey in chapterKeys) {
				container["volumes"][volumeNumber]['chapters'][chapterNumber][chapterKey] = chapterRowElement.querySelector('input[name="' + chapterKey + '"]').value
			}
		}

		const weekElements = containerElement.querySelector('table[name="weeks"]');
		container["volumes"][volumeNumber]['weeks'] = {};
		const weekRowElements = weekElements.querySelector('tbody').querySelectorAll('tr');
		for (const weekRowElement of weekRowElements) {
			weekNumber = weekRowElement.querySelector('input[name="number"]').value
			container["volumes"][volumeNumber]['weeks'][weekNumber] = {};
			for (const weekKey in weekKeys) {
				container["volumes"][volumeNumber]['weeks'][weekNumber][weekKey] = weekRowElement.querySelector('input[name="' + weekKey + '"]').value
			}
		}

	}

	container["templates"] = {};
	const templateContainerElements = document.getElementsByClassName('templateTable');
	for (const containerElement of templateContainerElements) {
		templateName = containerElement.querySelector('input[name="templateName"]').value;
		templateMarkdown = containerElement.querySelector('textarea[name="templateMarkdown"]').value;
		container["templates"][templateName] = templateMarkdown;
	}

	return container;

}
