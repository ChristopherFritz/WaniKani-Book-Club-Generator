function setErrorMessage(message) {

	if ('' != message) {
		message = 'Error: ' + message;
	}

	document.getElementById('errors').innerText = message;

}

function clearErrorMessage() {

	document.getElementById('errors').innerText = '';

}

/* Series buttons */

function showSeries() {

	showSeriesSection('series');

}

function showVolumes() {

	showSeriesSection('volumes');

}

function showTemplates() {

	showSeriesSection('templates');

}

function showVocabulary() {

	showSeriesSection('vocabulary');

}

function showSeriesSection(sectionToShow) {

	const volumes = document.getElementById('content');
	volumes.querySelector('div[id="series"]').style.display = 'none';
	volumes.querySelector('div[id="volumes"]').style.display = 'none';
	volumes.querySelector('div[id="templates"]').style.display = 'none';
	volumes.querySelector('div[id="vocabulary"]').style.display = 'none';

	volumes.querySelector('div[id="' + sectionToShow + '"]').style.display = 'grid';

}

/* Volume buttons */

function showVolume() {

	showVolumeSection('volume');

}

function showChapters() {

	showVolumeSection('chapters');

}

function showWeeks() {

	showVolumeSection('weeks');

}

function showVolumeSection(sectionToShow) {

	const volume = currentVolume();

	Array.from(['volume', 'chapters', 'weeks']).forEach(function(name) {
		const elementByName = volume.querySelector('div[name="' + name + '"]');
		if (null == elementByName) {
			return;
		}
		elementByName.style.display = 'none';
	});

	// Hide add buttons except for what's for the current section.
	document.getElementById('addNewChapter').style.display = 'none';
	document.getElementById('addNewWeek').style.display = 'none';

	let sectionButtonName = null;
	switch(sectionToShow) {
		case 'chapters': sectionButtonName = 'addNewChapter'; break;
		case 'weeks':    sectionButtonName = 'addNewWeek';    break;
	}
	if (null != sectionButtonName) {
		document.getElementById(sectionButtonName).style.removeProperty('display');
	}

	volume.querySelector('div[name="' + sectionToShow + '"]').style.display = 'grid';

}


function allVolumes() {

	return document.getElementsByClassName('volumeContainer');

}

// Returns the current volume's container element.
function currentVolume() {

	const volumeElements = allVolumes();
	let currentElement = null;

	Array.from(volumeElements).forEach(function(element) {
		if ('none' == element.style.display) {
			return;
		}
		currentElement = element;
	});

	return currentElement;
}

function addNewVolume() {

	// Add a new volume to the volumes list.  Ask for volume number if it cannot be auto-determined.
	const volumesList = document.getElementById('volumesList');
	const volumesListItems = volumesList.getElementsByTagName('option');
	let lastVolumeNumber = 0
	console.log("Length:")
	console.log(volumesListItems.length)
	if (0 < volumesListItems.length) {
		lastVolumeNumber = volumesListItems[volumesListItems.length - 1].value.replace('volume', '');
	}
	const newVolumeNumber = Number(lastVolumeNumber) + 1

	const volumesElement = document.getElementById('volumesContainer');
	const volumeContainer = addVolumeTable(volumesElement, newVolumeNumber);
	addChaptersTable(volumeContainer);
	addWeeksTable(volumeContainer);

	addVolumeToList(volumesList, newVolumeNumber, true);
	displayVolume(volumesList);

}

function createEmptyChapter() {

	const emptyRow =
		'<tr>\n' +
		'<td><input name="number"></td>\n' +
		'<td><input name="title"></td>\n' +
		'</tr>'
	return htmlToElement(emptyRow);

}

function addNewChapter() {

	const volumeContainer = currentVolume();
	const chaptersContainer = volumeContainer.querySelector('table[name="chapters"]');
	const tableBody = chaptersContainer.getElementsByTagName("tbody")[0];
	const chapterRowElement = createEmptyChapter();
	tableBody.appendChild(chapterRowElement);

}

function createEmptyWeek() {

	const emptyRow =
		'<tr>\n' +
		'<td><input name="number"></td>\n' +
		'<td><input name="weekThread"></td>\n' +
		'<td><input name="startDate"></td>\n' +
		'<td><input name="chapters"></td>\n' +
		'<td><input name="startPage"></td>\n' +
		'<td><input name="endPage"></td>\n' +
		'</tr>'
	return htmlToElement(emptyRow);

}

function addNewWeek() {

	const volumeContainer = currentVolume();
	const weeksContainer = volumeContainer.querySelector('table[name="weeks"]');
	const tableBody = weeksContainer.getElementsByTagName("tbody")[0];
	const weekRowElement = createEmptyWeek();
	tableBody.appendChild(weekRowElement);

}
