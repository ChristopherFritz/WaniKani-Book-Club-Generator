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

		loadSeries(data);
		loadTemplates(data.templates);

		document.getElementById('save').disabled = false;
		document.getElementById('copyVolumeThread').disabled = false;
		document.getElementById('copyWeekThread').disabled = false;
	}

	reader.readAsText(file);

});

function loadTemplates(templates) {

	const templatesElement = document.getElementById("templates");
	templatesElement.innerHTML = "";

	// First, set the list of templates to select which template is visible.
	const templatesList = document.createElement('ol');
	templatesList.id = "templatesList";
	Object.keys(templates).forEach(function(key, index) {
		const templateListItem = document.createElement('li');
		templateListItem.innerText = key.replaceAll(' ', '\u00a0');
		templateListItem.addEventListener('click', function() {displayTemplate(key);}, false);
		templatesList.appendChild(templateListItem);
	}, templates);
	templatesElement.appendChild(templatesList);

	let templateTemplate = '<div class="templateContainer">' +
		'<table name="template">\n' +
		'<colgroup>\n' +
		'<col style="width: 10em;">\n' +
		'<col style="width: 50em;">\n' +
		'</colgroup>\n' +
		'<tbody>\n' +
		'<tr><td>Template&nbsp;name:</td><td><input name="templateName" type="text"/></td></tr>\n' +
		'<tr><td>Template&nbsp;markdown:</td><td><textarea name="templateMarkdown"rows="20" cols="100"></textarea></td></tr>\n' +
		'</tbody>\n' +
		'</table>\n';

	// Next, create a separate container each template.
	Object.keys(templates).forEach(function(key, index) {
		const templateContainer = htmlToElement(templateTemplate);
		templateContainer.id = "template" + key;
		templateContainer.style.display = 'none';
		templateContainer.querySelector('input[name="templateName"]').value = key;
		templateContainer.querySelector('textarea[name="templateMarkdown"]').value = this[key];
		templatesElement.appendChild(templateContainer);
	}, templates);

	return templatesElement;

}

// Hide all templates except for the one to show.
function displayTemplate(templateNumber) {

	const templates = document.getElementsByClassName("templateContainer");

	Array.from(templates).forEach(function(element) {
		if ("template" + templateNumber == element.id) {
			element.style.display = 'block';
		}
		else {
			element.style.display = 'none';
		}
	});

}

function loadSeries(series) {

	const seriesElement = document.getElementById("series");
	seriesElement.innerHTML = "";
	let seriesTemplate = '<div class="seriesContainer">' +
		'<details name="series" open>\n' +
		'<summary>Series</summary>\n' +
		'<table name="series">\n' +
		'<colgroup>\n' +
		'<col style="width: 10em;">\n' +
		'<col style="width: 50em;">\n' +
		'</colgroup>\n' +
		'<tbody>\n';
	for (const seriesKey in seriesKeys) {
		seriesTemplate += '<tr><td>' + seriesKeys[seriesKey] + ':</td><td><input name="' + seriesKey + '" type="text"/></td></tr>\n';
	}
	seriesTemplate += '</tbody>\n' +
		'</table>\n' +
		'</details>';

	const seriesContainer = htmlToElement(seriesTemplate);
	const seriesBody = seriesContainer.getElementsByTagName('tbody')[0];
	for (const seriesKey in seriesKeys) {
		seriesContainer.querySelector('input[name="' + seriesKey + '"]').value = series[seriesKey];
	}

	seriesContainer.firstChild.appendChild(loadVolumes(series.volumes, series.currentVolume));

	seriesElement.appendChild(seriesContainer);

}

function loadVolumes(volumes, currentVolume) {

	const volumesElement = document.createElement("div");
	volumesElement.id = "volumes"

	// First, set the list of volumes to select which volume is visible.
	const volumesList = document.createElement('ol');
	volumesList.id = "volumesList";
	Object.keys(volumes).forEach(function(key, index) {
		const volumeListItem = document.createElement('li');
		volumeListItem.innerText = "Volume\u00a0" + key;
		volumeListItem.addEventListener('click', function() {displayVolume(key);}, false);
		volumesList.appendChild(volumeListItem);
	}, volumes);
	volumesElement.appendChild(volumesList);

	let volumeTemplate = '<div class="volumeContainer">' +
		'<details name="volume" open>\n' +
		'<summary>Volume</summary>\n' +
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
		'</details>';

	// Next, create a separate container each volume.
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
		loadWeeks(this[key].weeks, volumeContainer, key);
		volumesElement.appendChild(volumeContainer);
	}, volumes);

	return volumesElement;

}

// Hide all volumes except for the one to show.
function displayVolume(volumeNumber) {

	const volumes = document.getElementsByClassName("volumeContainer");

	Array.from(volumes).forEach(function(element) {
		if ("volume" + volumeNumber == element.id) {
			element.style.display = 'block';
		}
		else {
			element.style.display = 'none';
		}
	});

}

function loadChapters(chapters, element) {

	const chaptersTemplate = '<details name="chapters">' +
		'<summary>Chapters</summary>\n' +
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
		'</table>\n' +
		'</details>';
	const chapterTemplate = '<tr>\n' +
		'<td><input name="number"/></td>\n' +
		'<td><input name="title"/></td>\n' +
		'</tr>';

	const chaptersContainer = htmlToElement(chaptersTemplate);
	const chaptersBody = chaptersContainer.getElementsByTagName('tbody')[0];
	Object.keys(chapters).forEach(function(key, index) {
		const chapterContainer = htmlToElement(chapterTemplate);

		chapterContainer.querySelector('input[name="number"]').value = key;
		for (const chapterKey in chapterKeys) {
			if (this[key][chapterKey] == undefined) {
				continue;
			}
			chapterContainer.querySelector('input[name="' + chapterKey + '"]').value = this[key][chapterKey];
		}

		chaptersBody.appendChild(chapterContainer);
	}, chapters);

	element.appendChild(chaptersContainer)

}

function loadWeeks(weeks, element, volumeNumber) {

	const weeksTemplate = '<details name="weeks">' +
		'<summary>Weeks</summary>\n' +
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
		'</table>\n' +
		'</details>';

	const weeksContainer = htmlToElement(weeksTemplate);
	const weeksBody = weeksContainer.getElementsByTagName('tbody')[0];
	Object.keys(weeks).forEach(function(key, index) {
		const weekContainer = createEmptyWeek();
		weekContainer.querySelector('input[name="number"]').value = key;
		for (const weekKey in weekKeys) {
			if (this[key][weekKey] == undefined) {
				continue;
			}
			weekContainer.querySelector('input[name="' + weekKey + '"]').value = this[key][weekKey];
		}
		weeksBody.appendChild(weekContainer);
	}, weeks);

	const addWeek = document.createElement('div');
	addWeek.addEventListener('click', function() {addNewWeek(volumeNumber);}, false);
	addWeek.innerHTML = '<p class="clickable">➕ Add a week</p>';
	weeksContainer.appendChild(addWeek)

	element.appendChild(weeksContainer)

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

function addNewWeek(volumeNumber) {

	const volumeContainer = document.getElementById("volume" + volumeNumber);
	const weeksContainer = volumeContainer.querySelector('table[name="weeks"]');
	const tableBody = weeksContainer.getElementsByTagName("tbody")[0];
	const weekRowElement = createEmptyWeek();
	tableBody.appendChild(weekRowElement);

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
