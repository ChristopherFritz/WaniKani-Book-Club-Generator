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

	volumes.querySelector('div[name="' + sectionToShow + '"]').style.display = 'grid';

}
