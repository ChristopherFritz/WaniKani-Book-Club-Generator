var series = new Series('')

document.getElementById('saveStorage').onclick = function() { series.save() }
document.getElementById('deleteStorage').onclick = function() { series.deleteFromStorage(true) }
document.getElementById('downloadFile').onclick = function() { series.download() }
document.getElementById('copyVolumeThread').onclick = function() { Template.copyVolumeThread(series) }
document.getElementById('copySheetsMacro').onclick = function() { Macro.copySheetsMacro(series) }
document.getElementById('copyWeekThread').onclick = function() { Template.copyWeekThread(series) }

document.getElementById('bookList').onchange = function() { loadFromStorage(this.value) }

Interface.showBookList()

// Load an empty book club.
loadFromFileText('{}')
