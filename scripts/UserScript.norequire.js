// ==UserScript==
// @name         Book Club Manager
// @version      0.5.0
// @description  Management tool for running a book club on a Discourse forum.
// @namespace    https://kurifuri.com/
// @license MIT
// @match        https://community.wanikani.com/*
// @match        https://forums.learnnatively.com/*
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

GM_addStyle(`^styles.css^`)
GM_addStyle(`^grid.css^`)

%Series.js%
let series = new Series('')
%common.js%
%Interface.js%
%Chapter.js%
%ErrorMessage.js%
%Macro.js%
%Template.js%
%Volume.js%
%Week.js%
%load file.js%

  const iconId = 'kf-bc-icon'
  const formId = 'kfbc-form'
  const closedIcon = '📓'
  const openIcon = '📖'

  // Also call event on page load
  addBookClubManagerIcon()

  // Add a button to the right of .title-wrapper > h1 to add a book club based on current page
  function addBookClubManagerIcon () {
    const iconList = document.querySelector('[id^="ember"] nav ul')

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
<p>Series: <select id="kfbc-book-list"><option hidden disabled selected value>Select Book/Series</option></select></p>

<div id="kfbc-errors"></div>

<div id="kfbc-layout">

  <div id="kfbc-target"></div>

  <div id="kfbc-buttons">
    <button class="btn btn-icon-text btn-primary create" id="kfbc-save-storage" disabled>💾&nbsp;Save&nbsp;to&nbsp;Browser</button>
    <button class="btn btn-icon-text btn-primary create" id="kfbc-download-file" disabled>💾&nbsp;Save&nbsp;to&nbsp;File</button>
    <button class="btn btn-icon-text btn-primary create" id="kfbc-delete-storage" disabled>❌&nbsp;Delete&nbsp;from&nbsp;Browser</button>
    <button class="btn btn-icon-text btn-primary create" id="kfbc-load-file">📁&nbsp;Load&nbsp;from&nbsp;File</button>
    <br/>
    <br/>
    <button class="btn btn-icon-text btn-primary create" id="kfbc-copy-sheets-macro" disabled style="height: 2em;">📋&nbsp;Copy&nbsp;Sheets&nbsp;Macro</button>
    <button class="btn btn-icon-text btn-primary create" id="kfbc-copy-volume-thread" disabled style="height: 2em;">📋&nbsp;Create&nbsp;Volume&nbsp;Thread</button>
    <button class="btn btn-icon-text btn-primary create" id="kfbc-copy-week-thread" disabled style="height: 2em;">📋&nbsp;Create&nbsp;Week&nbsp;Post</button>
  </div>

  <div id="kfbc-content" style="display: none;"></div>
   <!-- TODO: Support removing a volume. -->

</div>
`

    // Display book club manager.
    document.querySelector('#main-container').append(popup)

    // --- Begin copied from local file. -------------------- //
    series = new Series('')

    document.getElementById('kfbc-save-storage').onclick = function () { series.save() }
    document.getElementById('kfbc-delete-storage').onclick = function () { series.deleteFromStorage(true) }
    document.getElementById('kfbc-download-file').onclick = function () { series.download() }
    document.getElementById('kfbc-load-file').onclick = async () => {
        const fileHandle = await showOpenFilePicker.call(undefined, {
            types: [ { description: "JSON files", accept: {"json/*": [".json"]} } ],
            multiple: false
        })
        //const data = JSON.parse(await (await fileHandle[0].getFile()).text())
        const data = await (await fileHandle[0].getFile()).text()
        console.log(data)
        loadFromFileText(data)
    }

    document.getElementById('kfbc-copy-volume-thread').onclick = function () { Template.copyVolumeThread(series) }
    document.getElementById('kfbc-copy-sheets-macro').onclick = function () { Macro.copySheetsMacro(series) }
    document.getElementById('kfbc-copy-week-thread').onclick = function () { Template.copyWeekThread(series) }

    document.getElementById('kfbc-book-list').onchange = function () { loadFromStorage(this.value) }

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
