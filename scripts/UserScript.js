// ==UserScript==
// @name         Book Club Manager
// @namespace    https://kurifuri.com/
// @match        https://community.wanikani.com/*
// @match        https://forums.learnnatively.com/*
// @require      https://kurifuri.com/files/book-club-manager/scripts/common.js
// @require      https://kurifuri.com/files/book-club-manager/scripts/Chapter.js
// @require      https://kurifuri.com/files/book-club-manager/scripts/ErrorMessage.js
// @require      https://kurifuri.com/files/book-club-manager/scripts/Interface.js
// @require      https://kurifuri.com/files/book-club-manager/scripts/Macro.js
// @require      https://kurifuri.com/files/book-club-manager/scripts/Series.js
// @require      https://kurifuri.com/files/book-club-manager/scripts/Template.js
// @require      https://kurifuri.com/files/book-club-manager/scripts/Volume.js
// @require      https://kurifuri.com/files/book-club-manager/scripts/Week.js
// @require      https://kurifuri.com/files/book-club-manager/scripts/load%20file.js
// @resource   IMPORTED_CSS_1 https://kurifuri.com/files/book-club-manager/styles/grid.css
// @resource   IMPORTED_CSS_2 https://kurifuri.com/files/book-club-manager/styles/styles.css
// @grant      GM_getResourceText
// @grant      GM_addStyle
// ==/UserScript==

/* globals
  Interface,
  loadFromFileText,
  loadFromStorage,
  Macro,
  series,
  Template
*/

(function () {
  'use strict'
  GM_addStyle(GM_getResourceText('IMPORTED_CSS_1'))
  GM_addStyle(GM_getResourceText('IMPORTED_CSS_2'))

  const iconId = 'kf_bc_icon'
  const formId = 'kf_bc_form'
  const closedIcon = '📓'
  const openIcon = '📖'

  // Also call event on page load
  addBookClubManagerIcon()

  // Add a button to the right of .title-wrapper > h1 to add a book club based on current page
  function addBookClubManagerIcon () {
    const iconList = document.querySelector('#ember8 nav ul')

    const listItem = document.createElement('li')
    listItem.id = iconId
    listItem.style.fontSize = '16px'
    listItem.style.cursor = 'pointer'
    listItem.textContent = closedIcon
    listItem.addEventListener('click', () => { showHideBookClubManager() })
    iconList.append(listItem)
  }

  function showHideBookClubManager () {
    const initialStatus = document.getElementById(iconId).textContent
    if (initialStatus === closedIcon) {
      showBookClubManager()
    } else {
      hideBookClubManager()
    }
  }

  function showBookClubManager () {
    document.getElementById(iconId).textContent = openIcon

    let popup = document.createElement('div')
    popup.id = formId
    popup.innerHTML = `
<p>Series: <select id="bookList"><option hidden disabled selected value>Select Book/Series</option></select></p>

<div id="errors"></div>

<div id="layout">

  <div id="target"></div>

  <div id="buttons">
    <button class="btn btn-icon-text btn-primary create" id="saveStorage" disabled>💾&nbsp;Save&nbsp;to&nbsp;Browser</button>
    <button class="btn btn-icon-text btn-primary create" id="downloadFile" disabled>💾&nbsp;Save&nbsp;to&nbsp;File</button>
    <button class="btn btn-icon-text btn-primary create" id="deleteStorage" disabled>❌&nbsp;Delete&nbsp;from&nbsp;Browser</button>
    <br/>
    <br/>
    <button class="btn btn-icon-text btn-primary create" id="copyVolumeThread" disabled style="height: 2em;">📋&nbsp;Copy&nbsp;Volume&nbsp;Thread</button>
    <button class="btn btn-icon-text btn-primary create" id="copySheetsMacro" disabled style="height: 2em;">📋&nbsp;Copy&nbsp;Sheets&nbsp;Macro</button>
    <button class="btn btn-icon-text btn-primary create" id="copyWeekThread" disabled style="height: 2em;">📋&nbsp;Copy Week&nbsp;Thread</button>
  </div>

  <div id="content" style="display: none;"></div>
   <!-- TODO: Support removing a volume. -->

</div>
`

    // Display book club manager.
    document.querySelector('#main-container').append(popup)

    // --- Begin copied from local file. -------------------- //

    document.getElementById('saveStorage').onclick = function () { series.save() }
    document.getElementById('deleteStorage').onclick = function () { series.deleteFromStorage(true) }
    document.getElementById('downloadFile').onclick = function () { series.download() }
    document.getElementById('copyVolumeThread').onclick = function () { Template.copyVolumeThread(series) }
    document.getElementById('copySheetsMacro').onclick = function () { Macro.copySheetsMacro(series) }
    document.getElementById('copyWeekThread').onclick = function () { Template.copyWeekThread(series) }

    document.getElementById('bookList').onchange = function () { loadFromStorage(this.value) }

    Interface.showBookList()

    // Load an empty book club.
    loadFromFileText('{}')
    // --- End copied from local file. ---------------------- //
  }

  function hideBookClubManager () {
    const popUp = document.getElementById(formId)
    popUp.parentElement.removeChild(popUp)
    document.getElementById(iconId).textContent = closedIcon
  }
})()
