// TODO: Support different templates for the guidelines sheet.
// TODO: Lock the guidelines sheet.
// TODO: Support an option for whether or not to include the title row.

function copySheetsMacro() {

	navigator.clipboard.writeText('')
	clearErrorMessage();

	// Create a new Google Sheet document.
	// Select the "Extentions" menu, then the "Apps Scripts" submenu.
	// This should open a new tab, showing an untitled project in Apps Scripts.
	// There should be a function named myFunction() already created.
	// Paste the copied text into this function.
	// Click on "Run" button.  You will need to give the Apps Script access to the Sheets document.

	const container = readFromHtml();

	const currentVolume = getNextVolume(container);

	let macroCode = ''

	macroCode += `
var workbook = SpreadsheetApp.getActive();

// Delete existing sheets except for the first sheet.  This normally isn't needed, but can be useful when rerunning the script on the same Sheets document after modifying book club values.
var sheets = workbook.getSheets();
for (i = 1; i < sheets.length; i++) {
  workbook.deleteSheet(sheets[i]);
}
sheets[0].setName('Remove Me');
`

	// For now, assume we're going with one spreadsheet per chapter.  Missing support: Weekly where multiple chapters are on one sheet, and weekly where split chapters put one chapter across multiple sheets.

	for (const chapterKey in currentVolume.chapters) {
		const chapter = currentVolume.chapters[chapterKey];
		const chapterNumber = ((null == container.chapterNumberPrefix) ? 'Chapter ' : container.chapterNumberPrefix) + chapterKey + container.chapterNumberSuffix;
		macroCode += insertChapterSheet(chapter, chapterNumber)
	}

	macroCode += insertGuidelinesSheet();

	macroCode += `
// Remove the initial sheet.
workbook.deleteSheet(SpreadsheetApp.getActive().getSheetByName('Remove Me'));
`

	navigator.clipboard.writeText(macroCode);
	console.log(macroCode);

}

function insertChapterSheet(chapter, chapterNumber) {

	chapterSheetMacroCode = '';

	// TODO: Allow user to set this value..
	showTitleRow = true;

	chapterSheetMacroCode += `
chapterSheet = workbook.insertSheet('` + chapterNumber + `');

// Remove excess colums.
chapterSheet.deleteColumns(6, 21);

// Set the widths of columns.
chapterSheet.setColumnWidth(1, 120);
chapterSheet.setColumnWidth(2, 150);
chapterSheet.setColumnWidth(3, 350);
chapterSheet.setColumnWidth(4, 50);
chapterSheet.setColumnWidth(5, 570);

var currentRow = 1;
`

		if (showTitleRow) {
			chapterSheetMacroCode += `
// This format uses a header row with the chapter's number and title.
chapterSheet.getRange('A1:E1').mergeAcross();
chapterSheet.setRowHeight(1, 40);
// TODO: Test if this is working when there is an apostrophe in the title.
chapterSheet.getRange(1, 1)
  .setValue('　` + chapterNumber + `　` + chapter.title.replaceAll("'", "\\\'") + `')
  .setFontSize(18)
  .setFontWeight("bold")
  .setVerticalAlignment('middle');
currentRow++;
`
		}

		chapterSheetMacroCode += `
// Freeze header.
chapterSheet.setFrozenRows(currentRow);

// Populate header row values.
chapterSheet.getRange(currentRow, 1).setValue('Vocab (Kanji)');
chapterSheet.getRange(currentRow, 2).setValue('Vocab (Kana)');
chapterSheet.getRange(currentRow, 3).setValue('Meaning');
chapterSheet.getRange(currentRow, 4).setValue('Page #');
chapterSheet.getRange(currentRow, 5).setValue('Notes');

// Format header row.
chapterSheet.getRange(currentRow, 1, 1, 5)
  .setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID)
  .setFontWeight("bold")
  .setHorizontalAlignment('center');

// Set font defaults.
chapterSheet.getRange(currentRow, 1, chapterSheet.getMaxRows() - currentRow, 2)
  .setFontSize(12)
  .setFontFamily('Zen Kaku Gothic New');
`

// TODO: Support zebra stripes.
	firstRow = showTitleRow ? 3 : 2;
	lastRow = 1000;
	if (false) {
		chapterSheetMacroCode += insertBanding(firstRow - 1, lastRow);
	}
	chapterSheetMacroCode += insertConditionalFormatting(firstRow, lastRow);

	return chapterSheetMacroCode;
}


function insertBanding(firstRow, lastRow) {

	banding = '';
	// TODO: Properly handle column letters.
	banding += `

chapterSheet.getRange('A` + firstRow + `:E` + lastRow + `')
  .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY)
  .setHeaderRowColor('#4dd0e1')
  .setFirstRowColor('#ffffff')
  .setSecondRowColor('#e0f7fa')
  .setFooterRowColor(null);
`

	return banding;

}

function insertConditionalFormatting(firstRow, lastRow) {

	conditionalFormatting = '';
	conditionalFormatting += `
var conditionalFormatRules = chapterSheet.getConditionalFormatRules();
`
	// TODO: Allow selecting which conditional formatting to use.
	if (false) { // use unknown and unsure row colors
		conditionalFormatting += insertUnsureAndUnknownConditionalFormatting(firstRow, lastRow);
	}
	if (true) { // use pastel page numbers
		conditionalFormatting += insertPastelPageNumbersConditionalFormatting(firstRow, lastRow);
	}
	conditionalFormatting += `
chapterSheet.setConditionalFormatRules(conditionalFormatRules);
`

	return conditionalFormatting;

}

function insertUnsureAndUnknownConditionalFormatting(firstRow, lastRow) {

	// TODO: Find a better way to handle column letters.
	let kanjiColumn = 'A';
	let kanaColumn = 'B';
	let englishColumn = 'C';
	let pageColumn = 'D';
	let notesColumn = 'E';

	return `
conditionalFormatRules.push(SpreadsheetApp.newConditionalFormatRule()
  .setRanges([chapterSheet.getRange('` + kanjiColumn + firstRow + `:` + notesColumn + lastRow + `')])
  .whenFormulaSatisfied('=AND(ISTEXT($` + kanaColumn + firstRow + `),ISBLANK($` + englishColumn + firstRow + `),ISNUMBER($` + pageColumn + firstRow + `))')
  .setBackground('#E06666')
  .build());
conditionalFormatRules.push(SpreadsheetApp.newConditionalFormatRule()
  .setRanges([chapterSheet.getRange('` + kanjiColumn + firstRow + `:` + notesColumn + lastRow + `')])
  .whenFormulaSatisfied('=SEARCH("unsure",$` + notesColumn + firstRow + `,1)')
  .setBackground('#FFD966')
  .build());
conditionalFormatRules.push(SpreadsheetApp.newConditionalFormatRule()
  .setRanges([chapterSheet.getRange('` + kanjiColumn + firstRow + `:` + notesColumn + lastRow + `')])
  .whenFormulaSatisfied('=AND(ISTEXT($` + kanjiColumn + firstRow + `),ISBLANK($` + kanaColumn + firstRow + `),ISNUMBER($` + pageColumn + firstRow + `))')
  .setBackground('#E06666')
  .build());
`

}

function insertPastelPageNumbersConditionalFormatting(firstRow, lastRow) {

	return `
conditionalFormatRules.push(SpreadsheetApp.newConditionalFormatRule()
  .setRanges([chapterSheet.getRange('D` + firstRow + `:D` + lastRow + `')])
  .whenCellEmpty()
  .build());

conditionalFormatRules.push(SpreadsheetApp.newConditionalFormatRule()
  .setRanges([chapterSheet.getRange('D` + firstRow + `:D` + lastRow + `')])
  .whenFormulaSatisfied('=MOD(count(unique($D$` + firstRow + `:D` + firstRow + `)),6)=1')
  .setBackground('#F4CCCC')
  .build());

conditionalFormatRules.push(SpreadsheetApp.newConditionalFormatRule()
  .setRanges([chapterSheet.getRange('D` + firstRow + `:D` + lastRow + `')])
  .whenFormulaSatisfied('=MOD(count(unique($D$` + firstRow + `:D` + firstRow + `)),6)=2')
  .setBackground('#FCE5CD')
  .build());

conditionalFormatRules.push(SpreadsheetApp.newConditionalFormatRule()
  .setRanges([chapterSheet.getRange('D` + firstRow + `:D` + lastRow + `')])
  .whenFormulaSatisfied('=MOD(count(unique($D$` + firstRow + `:D` + firstRow + `)),6)=3')
  .setBackground('#FFF2CC')
  .build());

conditionalFormatRules.push(SpreadsheetApp.newConditionalFormatRule()
  .setRanges([chapterSheet.getRange('D` + firstRow + `:D` + lastRow + `')])
  .whenFormulaSatisfied('=MOD(count(unique($D$` + firstRow + `:D` + firstRow + `)),6)=4')
  .setBackground('#D9EAD3')
  .build());

conditionalFormatRules.push(SpreadsheetApp.newConditionalFormatRule()
  .setRanges([chapterSheet.getRange('D` + firstRow + `:D` + lastRow + `')])
  .whenFormulaSatisfied('=MOD(count(unique($D$` + firstRow + `:D` + firstRow + `)),6)=5')
  .setBackground('#D0E0E3')
  .build());

conditionalFormatRules.push(SpreadsheetApp.newConditionalFormatRule()
  .setRanges([chapterSheet.getRange('D` + firstRow + `:D` + lastRow + `')])
  .whenFormulaSatisfied('=MOD(count(unique($D$` + firstRow + `:D` + firstRow + `)),6)=0')
  .setBackground('#D9D2E9')
  .build());
`

}

function insertGuidelinesSheet() {

guidelinesSheetMacroCode = `
// Create the guidelines sheet.
guidelinesSheet = workbook.insertSheet('Guidelines', 1);

// Remove excess colums and rows.
guidelinesSheet.deleteColumns(2, 25);
guidelinesSheet.deleteRows(12, 989);

guidelinesSheet.setColumnWidth(1, 1212);
guidelinesSheet.getRange(1, 1, 9, 1).setFontSize(11);
guidelinesSheet.getRange(1, 1, 11, 1).setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);

// Populate guidelines.

guidelinesSheet.getRange(1, 1).setRichTextValue(SpreadsheetApp.newRichTextValue()
  .setText('How to contribute to this vocab sheet\\n\\nThe more people contribute to the vocab sheet, the more helpful it is for everyone, so please don’t feel shy about adding to it!\\n\\nPlease read these guidelines carefully before you start adding words so that the vocab sheet remains easy for everyone to read and use.')
  .setTextStyle(0, 37, SpreadsheetApp.newTextStyle().setBold(true).setUnderline(true).build())
  .setTextStyle(169, 208, SpreadsheetApp.newTextStyle().setBold(true).build())
  .setTextStyle(208, 214, SpreadsheetApp.newTextStyle().setBold(true).setUnderline(true).build())
  .build());

guidelinesSheet.getRange(3, 1).setRichTextValue(SpreadsheetApp.newRichTextValue()
  .setText('When to add an entry\\nIf you are reasonably confident of the word itself and the appropriate meanings or translation within the context, go for it!\\n\\nIf you are unsure of a word’s meaning, feel free to add it to the vocab sheet, but type "Unsure" into the Notes column. This will automatically highlight the row in yellow to alert folks that the word may require attention. Similarly, if you’ve tried hard but still cannot find the meaning or the reading of a word, feel free to add it without a definition/reading, and put in the page number where the word was found. This will automatically highlight the word in red to alert folks that this word requires extra attention.*\\n\\nTry not to add the same word more than once in a given week’s reading.')
  .setTextStyle(0, 20, SpreadsheetApp.newTextStyle().setBold(true).setUnderline(true).build())
  .setTextStyle(148, 185, SpreadsheetApp.newTextStyle().setBold(true).build())
  .setTextStyle(313, 319, SpreadsheetApp.newTextStyle().setBold(true).setForegroundColor('#fbbc04').build())
  .setTextStyle(612, 616, SpreadsheetApp.newTextStyle().setBold(true).setForegroundColor('#ea4335').build())
  .build());

guidelinesSheet.getRange(5, 1).setRichTextValue(SpreadsheetApp.newRichTextValue()
  .setText('What to add\\n\\nPlease add all words in dictionary form.\\nFor example, if the book uses 行きます, please enter 行く. If the book uses 寒かった, please enter 寒い.\\n\\nIn the \\'kana\\' column, please enter the kana used in the book.\\n\\nIn General: Grammar is not vocabulary and should NOT be included in this list.  Please use the forums to ask/post grammar related questions.')
  .setTextStyle(0, 11, SpreadsheetApp.newTextStyle().setBold(true).setUnderline(true).build())
  .setTextStyle(37, 52, SpreadsheetApp.newTextStyle().setBold(true).build())
  .setTextStyle(211, 351, SpreadsheetApp.newTextStyle().setBold(true).setItalic(true).build())
  .build());

guidelinesSheet.getRange(7, 1).setRichTextValue(SpreadsheetApp.newRichTextValue()
  .setText('How to define words\\n\\nTo keep things consistent, please use definitions from Jisho or a similar JP > EN dictionary.\\n\\nPlease only include the relevant meanings for the context, and remove alternative spellings (e.g. keep only "colour" or "color", not both).\\n\\nFor clarity\\'s sake, there should never be enough meanings that it wraps onto a second line; remove meanings to keep the length to one column-width maximum. If there is no way around a longer definition wrapping onto a second line, that is acceptable. Just keep it reasonable.')
  .setTextStyle(0, 19, SpreadsheetApp.newTextStyle().setBold(true).setUnderline(true).build())
  .setTextStyle(123, 157, SpreadsheetApp.newTextStyle().setBold(true).build())
  .setTextStyle(179, 207, SpreadsheetApp.newTextStyle().setBold(true).build())
  .setTextStyle(368, 411, SpreadsheetApp.newTextStyle().setBold(true).build())
  .build());

guidelinesSheet.getRange(9, 1).setRichTextValue(SpreadsheetApp.newRichTextValue()
  .setText('General Tips\\n\\nUse the notes column to add helpful or interesting information, such as if the word used in the book is colloquial, or from a particular dialect.\\n\\nDouble-click into a cell before pasting to enter unformatted text.')
  .setTextStyle(0, 14, SpreadsheetApp.newTextStyle().setBold(true).setUnderline(true).build())
  .setTextStyle(161, 173, SpreadsheetApp.newTextStyle().setBold(true).build())
  .build());

guidelinesSheet.getRange(11, 1).setRichTextValue(SpreadsheetApp.newRichTextValue()
  .setText('*Note: If you are having problems with this function, or you simply don\\'t want this kind of formatting in the sheet, you can duplicate the unformatted sheet instead! This will mean that any cell highlights for entries requiring extra attention will have to be highlighted manually.\\n\\nIf the function is not working as intended, please make a post describing the issue in the Tips for Running a WaniKani Book Club on the forums!')
  .setTextStyle(1, 5, SpreadsheetApp.newTextStyle().setBold(true).setUnderline(true).build())
  .setTextStyle(244, 283, SpreadsheetApp.newTextStyle().setBold(true).build())
  .setTextStyle(374, 411, SpreadsheetApp.newTextStyle().setForegroundColor('#1155cc').setUnderline(true).build())
  .build());

var protection = guidelinesSheet
  .protect()
  .setDescription('Guidelines');
`

	return guidelinesSheetMacroCode;

}
