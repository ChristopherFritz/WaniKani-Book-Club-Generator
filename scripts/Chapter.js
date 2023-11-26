/* eslint-disable no-unused-vars */

/* globals
  Interface,
  series
*/

class Chapter {
  constructor (chapterNumber) {
    this.chapterNumber = chapterNumber.toString()
    this.number = chapterNumber.toString()
    this.title = ''
  }

  static fromJson (json) {
    let chapter = new Chapter(json.chapterNumber)
    chapter.title = json.title

    return chapter
  }

  syncValue (object) {
    return function () {
      object[this.name] = this.value
    }
  }

  toHtml () {
    const tableRow = document.createElement('tr')
    tableRow.dataset.number = this.number

    const numberCell = document.createElement('td')
    numberCell.appendChild(Interface.createInput('number', this.number, this.syncValue(this)))
    tableRow.appendChild(numberCell)

    const titleCell = document.createElement('td')
    titleCell.appendChild(Interface.createInput('title', this.title, this.syncValue(this)))
    tableRow.appendChild(titleCell)

    const removeCell = document.createElement('td')
    removeCell.textContent = '➖'
    removeCell.classList.add('clickable')
    removeCell.addEventListener('click', this.removeChapter)
    tableRow.appendChild(removeCell)

    return tableRow
  }

  removeChapter (e) {
    const selectedVolume = series.selectedVolume()
    const chapterNumber = e.target.parentElement.dataset.number
    if (chapterNumber in selectedVolume.chapters) {
      delete selectedVolume.chapters[chapterNumber]
    }
    e.target.parentElement.remove()
  }
}

