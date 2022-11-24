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

function showSeriesSection(sectionToShow) {

	const volumes = document.getElementById('content');
	console.log(volumes)

	volumes.querySelector('div[id="series"]').style.display = 'none';
	volumes.querySelector('div[id="volumes"]').style.display = 'none';
	volumes.querySelector('div[id="templates"]').style.display = 'none';

		if ('series' == sectionToShow) {
			volumes.querySelector('div[id="' + sectionToShow + '"]').style.display = 'block';
		}
		else {
			volumes.querySelector('div[id="' + sectionToShow + '"]').style.display = 'grid';
		}


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

	console.log(1)
	const volumes = document.getElementById("volumes");

	volumes.querySelector('div[name="volume"]').style.display = 'none';
	volumes.querySelector('div[name="chapters"]').style.display = 'none';
	volumes.querySelector('div[name="weeks"]').style.display = 'none';

	// Hide add buttons except for what's for the current section.
	document.getElementById('addNewVolume').style.display = 'none';
	document.getElementById('addNewChapter').style.display = 'none';
	document.getElementById('addNewWeek').style.display = 'none';

	let sectionButtonName = null;
	switch(sectionToShow) {
		case 'volume':   sectionButtonName = 'addNewVolume';  break;
		case 'chapters': sectionButtonName = 'addNewChapter'; break;
		case 'weeks':    sectionButtonName = 'addNewWeek';    break;
	}
	if (sectionButtonName != null) {
		document.getElementById(sectionButtonName).style.removeProperty('display');
	}

	volumes.querySelector('div[name="' + sectionToShow + '"]').style.display = 'grid';

}


function allVolumes() {

	return document.getElementsByClassName('volumeContainer');

}

function addNewVolume() {
	alert("Not yet implemented.");
}

// Returns the current volume's container element.
function currentVolume() {

	const volumeElements = allVolumes();
	console.log(volumeElements);

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
	alert("Not yet implemented.");
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
