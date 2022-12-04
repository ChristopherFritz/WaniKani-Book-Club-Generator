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
		loadVocabularySheet(data);
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
		addTemplateListItem(key, key == templateToShow)
	}, templates);

	const templateTables = document.getElementById("templateTables");
	templateTables.replaceChildren();

	// Next, create a separate container each template.
	let isFirstTemplate = true;
	Object.keys(templates).forEach(function(key, index) {
		addTemplateTable(key, this[key], isFirstTemplate);
		if (isFirstTemplate) {
			isFirstTemplate = false
		}
	}, templates);

}

function addTemplateListItem(templateName, selectItem) {

	const templatesList = document.getElementById('templatesList');

	const templateListItem = document.createElement('option');

	if (selectItem) {
		templateListItem.selected = true;
	}

	templateListItem.innerText = templateName;
	templateListItem.value = templateName.replaceAll(' ', '');
	templatesList.appendChild(templateListItem);

}

function addTemplateTable(templateName, templateText, isFirstTemplate) {

	const templateTables = document.getElementById("templateTables");

	const templateTemplate =
		'<table class="templateTable">\n' +
		'<colgroup>\n' +
		'<col style="width: 10em;">\n' +
		'<col style="width: 50em;">\n' +
		'</colgroup>\n' +
		'<tbody>\n' +
		'<tr><td><label>Template&nbsp;name</label></td><td><input name="templateName" type="text"/></td></tr>\n' +
		'<tr><td><label>Template&nbsp;markdown</label></td><td><textarea name="templateMarkdown"rows="30" cols="100"></textarea></td></tr>\n' +
		'</tbody>\n' +
		'</table>\n';

	const table = htmlToElement(templateTemplate);
	table.id = "template" + templateName.replaceAll(' ','');
	// Hide templates after the first.  This causes the first to show by default.
	if (!isFirstTemplate) {
		table.style.display = 'none';
	}
	table.querySelector('input[name="templateName"]').value = templateName;
	table.querySelector('textarea[name="templateMarkdown"]').value = templateText;
	templateTables.appendChild(table);

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

	const seriesContainer = document.getElementById("series");
	seriesContainer.replaceChildren();
	for (const seriesKey in seriesKeys) {
		const label = htmlToElement('<label for="' + seriesKey + '">' + seriesKeys[seriesKey] + '</label>\n');

		let value = null
		if ('bookClub' == seriesKey) {
			value = htmlToElement(
				'<select name="' + seriesKey + '" id="' + seriesKey + '" >' +
				'<option></option>' +
				'<option value="abbc">Absolute Beginner</option>' +
				'<option value="bbc">Beginner</option>' +
				'<option value="ibc">Intermediate</option>' +
				'<option value="abc">Advanced</option>' +
				'</select>')
		}
		else {
			value = htmlToElement('<input name="' + seriesKey + '" id="' + seriesKey + '" type="text"/>\n');
		}

		if (undefined != series[seriesKey]) {
			value.value = series[seriesKey];
		}

		seriesContainer.appendChild(label);
		seriesContainer.appendChild(value);
	}

}

function loadVocabularySheet(series) {

	const vocabularyContainer = document.getElementById("vocabulary");
	vocabularyContainer.replaceChildren();
	for (const vocabularyKey in vocabularyKeys) {
		const label = htmlToElement('<label for="' + vocabularyKey + '"><input name="' + vocabularyKey + '" id="' + vocabularyKey + '" type="checkbox" /> ' + vocabularyKeys[vocabularyKey] + '</label>');
		if (undefined != series['vocabularySheet'] && undefined != series['vocabularySheet'][vocabularyKey] && series['vocabularySheet'][vocabularyKey]) {
			label.querySelector('input').checked = true;
		}

		vocabularyContainer.appendChild(label);
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

function addVolumeFields(volumesElement, volumeNumber) {

	let volumeTemplate = '<div class="volumeContainer">\n' +
		'<div name="volume">\n' +
		'<label for="volumeNumber">Volume&nbsp;number</label>\n<input name="volumeNumber" type="text"/>\n';

	for (const volumeKey in volumeKeys) {
		volumeTemplate += '<label for="' + volumeKey + '">' + volumeKeys[volumeKey] + '</label><input name="' + volumeKey + '" id="' + volumeKey + '" type="text"/>\n';
	}
	volumeTemplate += '</div>\n' +
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

	const volumesElement = document.getElementById('volumesContainer');
	volumesElement.replaceChildren();
	// Next, create a separate container for each volume.
	Object.keys(volumes).forEach(function(key, index) {

		const volumeContainer = addVolumeFields(volumesElement, key);
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
		'<th>Remove</th>\n' +
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
		'<th>Remove</th>\n' +
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
