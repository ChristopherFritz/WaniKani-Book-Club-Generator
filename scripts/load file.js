// TODO: In the select boxes, select the appropriate item on load so it is highlighted.

function setErrorMessage(message) {

	if (message != "") {
		message = "Error: " + message;
	}

	document.getElementById('errors').innerText = message;

}

// Ensure there is file API support.
if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
	setErrorMessage('File APIs are not fully supported.');
}

let dropZone = document.getElementById('target');

// Show copy icon when dragging over.
dropZone.addEventListener('dragover', function(e) {
	e.stopPropagation();
	e.preventDefault();
	e.dataTransfer.dropEffect = 'copy';
});

// Get the file data on drop.
dropZone.addEventListener('drop', function(e) {

	setErrorMessage("");

	e.stopPropagation();
	e.preventDefault();

	if (e.dataTransfer.files.length !== 1) {
		setErrorMessage('Please drag only one file.');
		return;
	}

	// Get first dragged file.
	let file = e.dataTransfer.files[0];

	if (!file.type.match('application/json')) {
		setErrorMessage('Please drag a JSON file.');
		return;
	}

	let reader = new FileReader();

	reader.onload = function(e2) {

		const data = JSON.parse(e2.target.result);

		document.getElementById('content').style.removeProperty('display');

		loadSeries(data);
		loadVolumes(data.volumes, data.currentVolume);
		loadTemplates(data.templates);

		showSeriesSection("series");

		document.getElementById('save').disabled = false;
		document.getElementById('copyVolumeThread').disabled = false;
		document.getElementById('copyWeekThread').disabled = false;
	}

	reader.readAsText(file);

});

function loadTemplates(templates) {

	// First, set the list of templates to select which template is visible.
	const templatesList = document.getElementById('templatesList');
	templatesList.replaceChildren();

	let templateItems = [];
	const templateToShow =  Object.keys(templates)[0]
	Object.keys(templates).forEach(function(key, index) {
		const templateListItem = document.createElement('option');

		if (key == templateToShow) {
			templateListItem.selected = true;
		}

		templateListItem.innerText = key;
		templateListItem.value = key.replaceAll(' ', '');
		templatesList.appendChild(templateListItem);
	}, templates);

	const templateTables = document.getElementById("templateTables");
	templateTables.replaceChildren();

	let templateTemplate =
		'<table class="templateTable">\n' +
		'<colgroup>\n' +
		'<col style="width: 10em;">\n' +
		'<col style="width: 50em;">\n' +
		'</colgroup>\n' +
		'<tbody>\n' +
		'<tr><td><label>Template&nbsp;name:</label></td><td><input name="templateName" type="text"/></td></tr>\n' +
		'<tr><td>Template&nbsp;markdown:</td><td><textarea name="templateMarkdown"rows="20" cols="100"></textarea></td></tr>\n' +
		'</tbody>\n' +
		'</table>\n';

	// Next, create a separate container each template.
	let isFirstTemplate = true;
	Object.keys(templates).forEach(function(key, index) {
		const table = htmlToElement(templateTemplate);
		table.id = "template" + key.replaceAll(' ','');
		// Hide templates after the first.  This causes the first to show by default.
		if (isFirstTemplate) {
			isFirstTemplate = false
		}
		else {
			table.style.display = 'none';
		}
		table.querySelector('input[name="templateName"]').value = key;
		table.querySelector('textarea[name="templateMarkdown"]').value = this[key];
		templateTables.appendChild(table);
	}, templates);

}

// Hide all templates except for the one to show.
function displayTemplate(templateList) {

	const templates = document.getElementsByClassName("templateTable");
	Array.from(templates).forEach(function(element) {
		if ('template' + templateList.value == element.id) {
			element.style.removeProperty('display');
		}
		else {
			element.style.display = 'none';
		}
	});

}

function loadSeries(series) {

	const seriesTableBody = document.getElementById("seriesTable").getElementsByTagName("tbody")[0];
	seriesTableBody.replaceChildren();
	for (const seriesKey in seriesKeys) {
		const tableRow = htmlToElement('<tr><td>' + seriesKeys[seriesKey] + ':</td><td><input name="' + seriesKey + '" type="text"/></td></tr>\n');
		tableRow.querySelector('input[name="' + seriesKey + '"]').value = series[seriesKey];
		seriesTableBody.appendChild(tableRow);
	}

}

function loadVolumes(volumes, currentVolume) {

	// First, set the list of volumes to select which volume is visible.
	const volumesList = document.getElementById('volumesList');
	volumesList.replaceChildren();

	Object.keys(volumes).forEach(function(key, index) {
		const volumeListItem = document.createElement('option');

		if (currentVolume == key) {
			volumeListItem.selected = true;
		}

		volumeListItem.innerText = "Volume " + key;
		volumeListItem.value = "volume" + key;
		//volumeListItem.addEventListener('mouseup', function() {displayVolume(key);}, false);
		volumesList.appendChild(volumeListItem);
	}, volumes);

	let volumeTemplate = '<div class="volumeContainer">' +
		'<div name="volume">\n' +
		'<table name="volume">\n' +
		'<colgroup>\n' +
		'<col style="width: 10em;">\n' +
		'<col style="width: 50em;">\n' +
		'</colgroup>\n' +
		'<tbody>\n' +
		'<tr><td>Volume&nbsp;number:</td><td><input name="volumeNumber" type="text"/></td></tr>\n';
	for (const volumeKey in volumeKeys) {
		volumeTemplate += '<tr><td>' + volumeKeys[volumeKey] + ':</td><td><input name="' + volumeKey + '" type="text"/></td></tr>\n';
	}
	volumeTemplate += '</tbody>\n' +
		'</table>\n' +
		'</div>\n';

	const volumesElement = document.getElementById('volumeTables');
	volumesElement.replaceChildren();
	// Next, create a separate container for each volume.
	Object.keys(volumes).forEach(function(key, index) {
		const volumeContainer = htmlToElement(volumeTemplate);
		volumeContainer.id = "volume" + key;

		// Hide if this isn't the current volume.
		if (key != currentVolume) {
			volumeContainer.style.display = 'none';
		}

		volumeContainer.querySelector('input[name="volumeNumber"]').value = key;
		for (const volumeKey in volumeKeys) {
			volumeContainer.querySelector('input[name="' + volumeKey + '"]').value = this[key][volumeKey];
		}
		loadChapters(this[key].chapters, volumeContainer);
		loadWeeks(this[key].weeks, volumeContainer);
		volumesElement.appendChild(volumeContainer);
	}, volumes);

}

// Hide all volumes except for the one to show.
function displayVolume(volumeList) {

	const volumes = allVolumes();
	Array.from(volumes).forEach(function(element) {
		if (volumeList.value == element.id) {
			element.style.removeProperty('display');
		}
		else {
			element.style.display = 'none';
		}
	});

}

function loadChapters(chapters, element) {

	const chaptersContainer = htmlToElement('<div name="chapters" style="display: none">\n</div>\n')

	const chaptersTemplate =
		'<table name="chapters">\n' +
		'<colgroup>\n' +
		'<col style="width: 1em;">\n' +
		'<col style="width: 25em;">\n' +
		'</colgroup>\n' +
		'<thead>\n' +
		'<tr>\n' +
		'<th>Number</th>\n' +
		'<th>Title</th>\n' +
		'</tr>\n' +
		'</thead>\n' +
		'<tbody>\n' +
		'</tbody>\n' +
		'</table>\n';

	const chaptersTable = htmlToElement(chaptersTemplate);
	const chaptersBody = chaptersTable.getElementsByTagName('tbody')[0];
	Object.keys(chapters).forEach(function(key, index) {
		const singleChapterElement = createEmptyChapter();
		singleChapterElement.querySelector('input[name="number"]').value = key;
		for (const chapterKey in chapterKeys) {
			if (this[key][chapterKey] == undefined) {
				continue;
			}
			singleChapterElement.querySelector('input[name="' + chapterKey + '"]').value = this[key][chapterKey];
		}
		chaptersBody.appendChild(singleChapterElement);
	}, chapters);

	chaptersContainer.appendChild(chaptersTable);
	element.appendChild(chaptersContainer)

}

function loadWeeks(weeks, element) {

	const weeksContainer = htmlToElement('<div name="weeks" style="display: none">\n</div>\n')

	const weeksTemplate =
		'<table name="weeks">\n' +
		'<colgroup>\n' +
		'<col style="width: 2em;">\n' +
		'<col style="width: 4em;">\n' +
		'<col style="width: 4em;">\n' +
		'<col style="width: 4em;">\n' +
		'<col style="width: 4em;">\n' +
		'<col style="width: 4em;">\n' +
		'</colgroup>\n' +
		'<thead>\n' +
		'<tr>\n' +
		'<th>Week</th>\n' +
		'<th>Thread</th>\n' +
		'<th>Start&nbsp;Date</th>\n' +
		'<th>Chapters</th>\n' +
		'<th>Start&nbsp;Page</th>\n' +
		'<th>End&nbsp;Page</th>\n' +
		'</tr>\n' +
		'</thead>\n' +
		'<tbody>\n' +
		'</tbody>\n' +
		'</table>\n';

	const weeksTable = htmlToElement(weeksTemplate);
	const weeksBody = weeksTable.getElementsByTagName('tbody')[0];
	Object.keys(weeks).forEach(function(key, index) {
		const singleWeekElement = createEmptyWeek();
		singleWeekElement.querySelector('input[name="number"]').value = key;
		for (const weekKey in weekKeys) {
			if (this[key][weekKey] == undefined) {
				continue;
			}
			singleWeekElement.querySelector('input[name="' + weekKey + '"]').value = this[key][weekKey];
		}
		weeksBody.appendChild(singleWeekElement);
	}, weeks);

	weeksContainer.appendChild(weeksTable);
	element.appendChild(weeksContainer);

}

// https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518

/**
 * @param {String} HTML representing a single element
 * @return {Element}
 */
function htmlToElement(html) {
    let template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}
