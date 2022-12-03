// TODO: Have default values for various fields.

// Ensure there is file API support.
if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
	setErrorMessage('File APIs are not fully supported.');
}

//let dropZone = document.getElementById('target');
let dropZone = document.getElementsByTagName('body')[0];

// Show copy icon when dragging over.
dropZone.addEventListener('dragover', function(e) {
	e.stopPropagation();
	e.preventDefault();
	e.dataTransfer.dropEffect = 'copy';
});

// Get the file data on drop.
dropZone.addEventListener('drop', function(e) {

	clearErrorMessage();

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
		loadVolumes(data.volumes, getCurrentVolume(data));
		loadTemplates(data.templates);

		showSeriesSection("series");

		document.getElementById('save').disabled = false;
		document.getElementById('copySheetsMacro').disabled = false;
		document.getElementById('copyVolumeThread').disabled = false;
		document.getElementById('copyWeekThread').disabled = false;
	}

	reader.readAsText(file);

});

function loadTemplates(templates) {

	// TODO: Test that this still allows adding a template (once an add template button has been implemented).
	if (null == templates) {
		return;
	}

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
		'<tr><td>Template&nbsp;markdown:</td><td><textarea name="templateMarkdown"rows="40" cols="100"></textarea></td></tr>\n' +
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

		if (undefined != series[seriesKey]) {
			tableRow.querySelector('input[name="' + seriesKey + '"]').value = series[seriesKey];
		}

		seriesTableBody.appendChild(tableRow);
	}

}

function addVolumeToList(volumesList, volumeNumber, selectVolume) {

	const volumeListItem = document.createElement('option');

	if (selectVolume) {
		volumeListItem.selected = true;
	}

	volumeListItem.innerText = "Volume " + volumeNumber;
	volumeListItem.value = "volume" + volumeNumber;
	volumesList.appendChild(volumeListItem);

}

function addVolumeTable(volumesElement, volumeNumber) {

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

	const volumeContainer = htmlToElement(volumeTemplate);
	volumeContainer.id = "volume" + volumeNumber;

	volumeContainer.querySelector('input[name="volumeNumber"]').value = volumeNumber;
	volumesElement.appendChild(volumeContainer);
	return volumeContainer;

}

function loadVolumes(volumes, currentVolume) {

	if (null == volumes) {
		return;
	}

	// First, set the list of volumes to select which volume is visible.
	const volumesList = document.getElementById('volumesList');
	volumesList.replaceChildren();

	Object.keys(volumes).forEach(function(key, index) {
		addVolumeToList(volumesList, key, currentVolume == volumes[key]);
	}, volumes);

	const volumesElement = document.getElementById('volumeTables');
	volumesElement.replaceChildren();
	// Next, create a separate container for each volume.
	Object.keys(volumes).forEach(function(key, index) {

		const volumeContainer = addVolumeTable(volumesElement, key);
		// Hide if this isn't the current volume.
		if (currentVolume != volumes[key]) {
			volumeContainer.style.display = 'none';
		}
		// Populate volume information.
		for (const volumeKey in volumeKeys) {
			if (undefined == this[key][volumeKey]) {
				continue;
			}
			volumeContainer.querySelector('input[name="' + volumeKey + '"]').value = this[key][volumeKey];
		}
		loadChapters(this[key].chapters, volumeContainer);
		loadWeeks(this[key].weeks, volumeContainer);

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

function addChaptersTable(volumeContainer) {

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
	chaptersContainer.appendChild(chaptersTable);
	volumeContainer.appendChild(chaptersContainer);

	return chaptersTable;

}

function loadChapters(chapters, volumeContainer) {

	const chaptersTable = addChaptersTable(volumeContainer)
	const chaptersBody = chaptersTable.getElementsByTagName('tbody')[0];

	if (null == chapters) {
		return;
	}

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

}

function addWeeksTable(volumeContainer) {

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
	weeksContainer.appendChild(weeksTable);
	volumeContainer.appendChild(weeksContainer);

	return weeksTable;

}

function loadWeeks(weeks, volumeContainer) {

	const weeksTable = addWeeksTable(volumeContainer);
	const weeksBody = weeksTable.getElementsByTagName('tbody')[0];

	if (null == weeks) {
		return;
	}

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
