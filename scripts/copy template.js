function copyVolumeThread() {

	navigator.clipboard.writeText('')

	const container = readFromHtml();

	for (const volumeKey in container.volumes) {
		if (volumeKey != container.currentVolume) {
			continue;
		}

		const currentVolume = container.volumes[volumeKey];

		template = container.templates[container.volumes[volumeKey].volumeTemplate];

		template = template.replaceAll('{Book Title}', container.bookTitle);
		template = template.replace('{Book Image}', currentVolume.bookImage);
		template = template.replace('{Volume Number}', volumeKey);
		template = template.replace('{Volume Start Date}', currentVolume.startDate);
		template = template.replace('{Volume Start Timestamp}', '[date=' + formatDate(currentVolume.startDate, 'YYYY-MM-DD') + ' timezone="Japan"]');
		template = formatVolumeThreadJoin(template, container);
		template = formatVolumeThreadWhereToBuy(template);
		template = formatVolumeThreadReadingSchedule(template, currentVolume.weeks, currentVolume.chapters, container.shortDateFormat);
		template = formatVolumeThreadVocabularyList(template, currentVolume);
		template = formatVolumeThreadDiscussionRules(template);
		template = template.replaceAll('{Series Home Link}', 'https://community.wanikani.com/t/' + container.seriesHomeThread);

		navigator.clipboard.writeText(template);
		console.log(template);
		return;
	}

}

function copyWeekThread() {

	navigator.clipboard.writeText('')

	const container = readFromHtml();

	for (const volumeKey in container.volumes) {
		if (volumeKey != container.currentVolume) {
			continue;
		}

		const currentVolume = container.volumes[volumeKey];

		const currentWeek = currentVolume.weeks[container.currentWeek];
		weekChapters = []
		for (const chapterKey in currentVolume.chapters) {
			if (!currentWeek.chapters.includes(chapterKey)) {
				continue;
			}
			weekChapters.push(chapterKey);
		}

		template = container.templates[container.volumes[volumeKey].weeklyTemplate];

		switch (weekChapters.length) {
			case 0:
				break;
			case 1:
				template = template.replaceAll('{Chapters}', 'Chapter ' + weekChapters[0]);
				break;
			case 2:
				template = template.replaceAll('{Chapters}', 'Chapters ' + weekChapters.join(' and '));
				break;
			default:
				template = template.replaceAll('{Chapters}', 'Chapters ' + weekChapters[0] + '–' + weekChapters[weekChapters.length - 1]);
		}

		// TODO: Is this the correct start date?
		template = template.replace('{Week Start Date}', formatDate(currentWeek.startDate, container.shortDateFormat));
		template = template.replace('{Week Start Timestamp}', '[date=' + formatDate(currentWeek.startDate, 'YYYY-MM-DD') + ' timezone="Japan"]');

		navigator.clipboard.writeText(template);
		console.log(template);
		return;
	}

}

function formatDate(unparsedDate, format) {

	// Get local time offset and add it to the date to avoid a timezone date difference.
	let parsedLocalDate = new Date(unparsedDate);
	let userTimezoneOffset = parsedLocalDate.getTimezoneOffset() * 60000;
	let parsedUtcDate = new Date(parsedLocalDate.getTime() + userTimezoneOffset);
	return format.
		replace('DD', ('0' + parsedUtcDate.getDate()).slice(-2)).
		replace('D', parsedUtcDate.getDate()).
		replace('YYYY', parsedUtcDate.getFullYear()).
		replace('YY', ('' + parsedUtcDate.getFullYear()).slice(-2)).
		replace('MMMM', parsedUtcDate.toLocaleString('default', { month: 'long' })) .
		replace('MMM', parsedUtcDate.toLocaleString('default', { month: 'short' })) .
		replace('MM', ('0' + parsedUtcDate.getMonth()).slice(-2)).
		replace('M', parsedUtcDate.getMonth());
}

function formatVolumeThreadJoin(template, series) {

	let clubName = 'Unknown'
	let clubID = ''
	switch(series.bookClub) {
		case 'abbc':
			clubName = 'Absolute Beginner'
			clubID = '34698'
			break;
		case 'bbc':
			clubName = 'Beginner'
			clubID = '19766'
			break;
		case 'ibc':
			clubName = 'Intermediate'
			clubID = '18908'
			break;
		case 'abc':
			clubName = 'Advanced'
			clubID = '44685'
			break;
	}

	return template.
		replace('{Club Level}', clubName).
		replace('{Club Link}', 'https://community.wanikani.com/t/' + clubID);

}

function formatVolumeThreadWhereToBuy(template) {

	return template;
}

function formatVolumeThreadReadingSchedule(template, weeks, chapters, shortDateFormat) {

	const regex = /{Week}(.*){\/Week}/i;
	const weekTemplate = template.match(regex);

	if (null == weekTemplate) {
		return template;
	}

	let weekMarkdown = '';

	for (const weekKey in weeks) {
		const currentWeek = weeks[weekKey];
		weekChapters = []
		for (const chapterKey in chapters) {
			if (!currentWeek.chapters.includes(chapterKey)) {
				continue
			}
			weekChapters.push(('Ch ' + chapterKey + ' ' + chapters[chapterKey].title).trim());
		}
		// TODO: If there are no chapter titles, should the delimiter be ", " instead?
		// TODO: Support Start Page and End Page.

		weekMarkdown += weekTemplate[1].
			replace('{Week Number}', weekKey).
			replace('{Week Start Date}', formatDate(currentWeek.startDate, shortDateFormat)).
			replace('{Start Page}', currentWeek.startPage).
			replace('{End Page}', currentWeek.endPage).
			replace('{Chapters}', weekChapters.join('<br/>')).
			replace('{Page Count}', (currentWeek.endPage - currentWeek.startPage + 1)) +
			'\n';
	}

	return template.replace(weekTemplate[0], weekMarkdown.trim());
}

function formatVolumeThreadVocabularyList(template, currentVolume) {

	return template.replace('{Vocabulary List}', currentVolume.vocabularyList)

}

function formatVolumeThreadDiscussionRules(template) {

	return template
}

