var series = new Series('')

document.getElementById('kfbc-save-storage').onclick = function() { series.save() }
document.getElementById('kfbc-delete-storage').onclick = function() { series.deleteFromStorage(true) }
document.getElementById('kfbc-download-file').onclick = function() { series.download() }
document.getElementById('kfbc-copy-volume-thread').onclick = function() { Template.copyVolumeThread(series) }
document.getElementById('kfbc-copy-sheets-macro').onclick = function() { Macro.copySheetsMacro(series) }
document.getElementById('kfbc-copy-week-thread').onclick = function() { Template.copyWeekThread(series) }

document.getElementById('kfbc-book-list').onchange = function() { loadFromStorage(this.value) }

Interface.showBookList()

// Load an empty book club.
loadFromFileText('{}')
