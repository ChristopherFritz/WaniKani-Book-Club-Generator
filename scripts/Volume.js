/* eslint-disable no-unused-vars */

/* globals
  Chapter,
  Interface,
  Week
*/

class Volume {
  constructor (volumeNumber) {
    this.volumeNumber = volumeNumber.toString()
    this.volumeHomeThread = ''
    this.coverImage = ''
    this.vocabularyList = ''
    this.volumeTemplate = ''
    this.weeklyTemplate = ''
    // this.links = []
    this.chapters = {}
    this.weeks = {}
  }

  static fromJson (json) {
    let volume = new Volume(json.volumeNumber)
    volume.volumeHomeThread = json.volumeHomeThread
    volume.coverImage = json.coverImage
    volume.vocabularyList = json.vocabularyList
    volume.volumeTemplate = json.volumeTemplate
    volume.weeklyTemplate = json.weeklyTemplate

    // TODO: Links

    for (const [chapterNumber, chapterJson] of Object.entries(json.chapters)) {
      let chapter = Chapter.fromJson(chapterJson)
      volume.chapters[chapter.chapterNumber] = chapter
    }

    for (const [weekNumber, weekJson] of Object.entries(json.weeks)) {
      let week = Week.fromJson(weekJson)
      volume.weeks[week.weekNumber] = week
    }

    return volume
  }

  currentWeek () {
    let today = new Date()
    let oldestDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6)
    let newestDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6)

    for (const weekKey in this.weeks) {
      if (oldestDate < new Date(Date.parse(this.weeks[weekKey].startDate)) && new Date(Date.parse(this.weeks[weekKey].startDate)) < newestDate) {
        return this.weeks[weekKey]
      }
    }
  }

  startDate () {
    if (Object.keys(this.weeks).length === 0) {
      return
    }

    return this.weeks[Object.keys(this.weeks).sort()[0]].startDate
  }

  syncValue (object) {
    return function () {
      object[this.name] = this.value
    }
  }

  toHtml (series, currentVolumeNumber) {
    const volumeDiv = Interface.createDiv(`volume${this.volumeNumber}`)
    volumeDiv.classList.add('volumeContainer')
    // Hide if not the current volume.
    if (this.volumeNumber !== currentVolumeNumber) {
      volumeDiv.style.display = 'none'
    }

    const volumeDetailsDiv = Interface.createDiv()
    volumeDetailsDiv.setAttribute('name', 'volume')
    volumeDetailsDiv.style.display = 'grid'

    volumeDetailsDiv.appendChild(Interface.createLabel('volumeNumber', 'Volume Number'))
    volumeDetailsDiv.appendChild(Interface.createInput('volumeNumber', this.volumeNumber, this.syncValue(this)))

    volumeDetailsDiv.appendChild(Interface.createLabel('volumeHomeThread', 'Thread'))
    volumeDetailsDiv.appendChild(Interface.createInput('volumeHomeThread', this.volumeHomeThread, this.syncValue(this)))

    volumeDetailsDiv.appendChild(Interface.createLabel('coverImage', 'Cover Image'))
    volumeDetailsDiv.appendChild(Interface.createInput('coverImage', this.coverImage, this.syncValue(this)))

    volumeDetailsDiv.appendChild(Interface.createLabel('vocabularyList', 'Vocabulary List'))
    volumeDetailsDiv.appendChild(Interface.createInput('vocabularyList', this.vocabularyList, this.syncValue(this)))

    volumeDetailsDiv.appendChild(Interface.createLabel('volumeTemplate', 'Volume Template'))
    const volumeTemplates = series.templatesToHtml('volumeTemplate', this.volumeTemplate)
    volumeTemplates.addEventListener('change', () => { this.syncValue(this) })
    volumeDetailsDiv.appendChild(volumeTemplates)

    volumeDetailsDiv.appendChild(Interface.createLabel('weeklyTemplate', 'Weekly Template'))
    const weeklyTemplates = series.templatesToHtml('weeklyTemplate', this.weeklyTemplate)
    weeklyTemplates.addEventListener('change', () => { this.syncValue(this) })
    volumeDetailsDiv.appendChild(weeklyTemplates)

    volumeDiv.appendChild(volumeDetailsDiv)

    // TODO: Add links section.

    // Chapters
    const chaptersDiv = Interface.createDiv()
    chaptersDiv.setAttribute('name', 'chapters')
    chaptersDiv.style.display = 'none'
    const chaptersTable = document.createElement('table')
    chaptersTable.setAttribute('name', 'chapters')

    const chaptersTableHead = document.createElement('thead')

    const chaptersHeaderRow = document.createElement('tr')
    const chapterHeaders = [
      'Number',
      'Title',
      'Remove']
    chapterHeaders.forEach(headerText => {
      const headerElement = document.createElement('th')
      headerElement.textContent = headerText
      chaptersHeaderRow.appendChild(headerElement)
    })
    chaptersTableHead.append(chaptersHeaderRow)
    chaptersTable.appendChild(chaptersTableHead)

    const chaptersTableBody = document.createElement('tbody')
    for (const [chapterNumber, chapter] of Object.entries(this.chapters)) {
      chaptersTableBody.appendChild(chapter.toHtml(series))
    }
    chaptersTable.appendChild(chaptersTableBody)
    chaptersDiv.appendChild(chaptersTable)
    volumeDiv.appendChild(chaptersDiv)

    // Weeks
    const weeksDiv = Interface.createDiv()
    weeksDiv.setAttribute('name', 'weeks')
    weeksDiv.style.display = 'none'
    const weeksTable = document.createElement('table')
    weeksTable.setAttribute('name', 'weeks')

    const weeksTableHead = document.createElement('thead')

    const weeksHeaderRow = document.createElement('tr')
    const weekHeaders = [
      'Week',
      'Thread',
      'Start Date',
      'Chapters',
      'Start Page',
      'End Page',
      'Remove']
    weekHeaders.forEach(headerText => {
      const headerElement = document.createElement('th')
      headerElement.textContent = headerText
      weeksHeaderRow.appendChild(headerElement)
    })
    weeksTableHead.appendChild(weeksHeaderRow)
    weeksTable.appendChild(weeksTableHead)

    const weeksTableBody = document.createElement('tbody')
    for (const [weekNumber, week] of Object.entries(this.weeks)) {
      weeksTableBody.appendChild(week.toHtml(series))
    }
    weeksTable.appendChild(weeksTableBody)
    weeksDiv.appendChild(weeksTable)
    volumeDiv.appendChild(weeksDiv)

    return volumeDiv
  }
}

