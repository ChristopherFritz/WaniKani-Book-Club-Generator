/* eslint-disable no-unused-vars */

/* globals
  Interface
*/

class Week {
  constructor (weekNumber) {
    this.weekNumber = weekNumber.toString()
    this.number = weekNumber.toString()
    this.weekThread = ''
    this.startDate = ''
    this.chapters = ''
    this.startPage = ''
    this.endPage = ''
  }

  static fromJson (json) {
    let week = new Week(json.number)
    week.number = json.number
    week.weekThread = json.weekThread
    week.startDate = json.startDate
    week.chapters = json.chapters
    week.startPage = json.startPage
    week.endPage = json.endPage

    return week
  }

  syncValue (object) {
    return function () {
      object[this.name] = this.value
    }
  }

  toHtml (series) {
    const tableRow = document.createElement('tr')
    tableRow.dataset.number = this.number

    const numberCell = document.createElement('td')
    numberCell.appendChild(Interface.createInput('number', 'number', this.number, this.syncValue(this)))
    tableRow.appendChild(numberCell)

    const threadCell = document.createElement('td')
    threadCell.appendChild(Interface.createInput('week-thread', 'weekThread', this.weekThread, this.syncValue(this)))
    tableRow.appendChild(threadCell)

    const startDateCell = document.createElement('td')
    startDateCell.appendChild(Interface.createInput('start-date', 'startDate', this.startDate.substring(0, 10), this.syncValue(this), 'date'))
    tableRow.appendChild(startDateCell)

    const chaptersCell = document.createElement('td')
    chaptersCell.appendChild(Interface.createInput('chapters', 'chapters', this.chapters, this.syncValue(this)))
    tableRow.appendChild(chaptersCell)

    const startPageCell = document.createElement('td')
    startPageCell.appendChild(Interface.createInput('start-page', 'startPage', this.startPage, this.syncValue(this)))
    tableRow.appendChild(startPageCell)

    const endPageCell = document.createElement('td')
    endPageCell.appendChild(Interface.createInput('end-page', 'endPage', this.endPage, this.syncValue(this)))
    tableRow.appendChild(endPageCell)

    const removeCell = document.createElement('td')
    removeCell.textContent = '➖'
    removeCell.classList.add('kfbc-clickable')
    removeCell.addEventListener('click', () => { this.removeWeek(removeCell, series) })
    tableRow.appendChild(removeCell)

    return tableRow
  }

  removeWeek (element, series) {
    const selectedVolume = series.selectedVolume()
    const weekNumber = element.parentElement.dataset.number
    if (weekNumber in selectedVolume.weeks) {
      delete selectedVolume.weeks[weekNumber]
    }
    element.parentElement.remove()
  }
}

