/* globals
  allVolumes,
  isDate
*/

/**
 * Reads book club information from HTML and converts to an object.
 * @return {array} An associative array of book club values.
 */
function readFromHtml () {
  var container = {}

  const seriesElements = document.querySelector('div[id="series"]').querySelectorAll('[name]')
  for (const element of seriesElements) {
    container[element.name] = element.value
  }

  container['volumes'] = {}
  const volumeContainerElements = allVolumes()
  for (const containerElement of volumeContainerElements) {
    const volumeElement = containerElement.querySelector('div[name="volume"]')
    const volumeNumber = volumeElement.querySelector('input[name="volumeNumber"]').value
    const volumeNameElements = volumeElement.querySelectorAll('[name]')
    container['volumes'][volumeNumber] = {}
    for (const volumeNameElement of volumeNameElements) {
      container['volumes'][volumeNumber][volumeNameElement.name] = volumeNameElement.value
    }
    console.log(container['volumes'][volumeNumber])

    // const linkElements = containerElement.querySelector('table[name="links"]')
    // container["volumes"][volumeNumber]['links'] = []
    // const singleLinkElements = linkElements.querySelectorAll('tbody>tr>td>a')
    // for (const singleLinkElement of singleLinkElements) {
    //  container["volumes"][volumeNumber]['links'].push(singleLinkElement.href)
    // }

    const chapterElements = containerElement.querySelector('table[name="chapters"]')
    container['volumes'][volumeNumber]['chapters'] = {}
    const chapterRowElements = chapterElements.querySelector('tbody').querySelectorAll('tr')
    for (const chapterRowElement of chapterRowElements) {
      const chapterNumber = chapterRowElement.querySelector('input[name="number"]').value
      const chapterNameElements = chapterRowElement.querySelectorAll('[name]')
      container['volumes'][volumeNumber]['chapters'][chapterNumber] = {}
      container['volumes'][volumeNumber]['chapters'][chapterNumber]['chapterNumber'] = chapterNumber
      for (const chapterNameElement of chapterNameElements) {
        container['volumes'][volumeNumber]['chapters'][chapterNumber][chapterNameElement.name] = chapterNameElement.value
      }
    }

    const weekElements = containerElement.querySelector('table[name="weeks"]')
    container['volumes'][volumeNumber]['weeks'] = {}
    const weekRowElements = weekElements.querySelector('tbody').querySelectorAll('tr')
    for (const weekRowElement of weekRowElements) {
      const weekNumber = weekRowElement.querySelector('input[name="number"]').value
      container['volumes'][volumeNumber]['weeks'][weekNumber] = {}
      container['volumes'][volumeNumber]['weeks'][weekNumber]['weekNumber'] = weekNumber
      const weekNamedElements = weekRowElement.querySelectorAll('[name]')
      for (const weekNamedElement of weekNamedElements) {
        if (weekNamedElement.name.includes('Date')) {
          container['volumes'][volumeNumber]['weeks'][weekNumber][weekNamedElement.name] = new Date(weekNamedElement.value)
        } else {
          container['volumes'][volumeNumber]['weeks'][weekNumber][weekNamedElement.name] = weekNamedElement.value
        }
      }
    }
  }

  container['templates'] = {}
  const templateContainerElements = document.getElementsByClassName('templateTable')
  for (const containerElement of templateContainerElements) {
    const templateName = containerElement.querySelector('span[name="templateName"]').textContent
    const templateMarkdown = containerElement.querySelector('textarea[name="templateMarkdown"]').value
    container['templates'][templateName] = templateMarkdown
  }

  container['vocabularySheet'] = {}
  const vocabularyContainerElements = document.getElementById('vocabulary').getElementsByTagName('input')
  for (const containerElement of vocabularyContainerElements) {
    const templateName = containerElement.id
    const templateValue = containerElement.checked
    container['vocabularySheet'][templateName] = templateValue
  }

  return container
}

function volumeStartDate (volume) {
  // TODO: What if there are no weeks?
  if (Object.keys(volume.weeks).length === 0) {
    return
  }

  return volume.weeks[Object.keys(volume.weeks).sort()[0]].startDate
}

// Return the current volume.  This is needed to get the current week from the current volume.
function getCurrentVolume (container) {
  let today = new Date()
  let soonestVolume = null
  for (const volumeKey in container.volumes) {
    const startDate = volumeStartDate(container.volumes[volumeKey])

    // Skip if there isn't a date set.
    if (!isDate(startDate)) {
      continue
    }

    // Skip future volumes.
    if (today < Date.parse(startDate)) {
      continue
    }

    // This assumes the volumes are in order.  The last volume not skipped will be returned.
    soonestVolume = container.volumes[volumeKey]
  }

  return soonestVolume
}

// Get the next volume.  This is needed to create the next volume's thread.
function getNextVolume (container) {
  // Assume that a volume thread will be posted before the start date, but no later than one week after the start date.
  // By this logic, the next volume's thread should be gotten a thread with a date after "today - 7 days".
  let today = new Date()
  let oldestDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)
  let soonestVolume = null
  for (const volumeKey in container.volumes) {
    const startDate = volumeStartDate(container.volumes[volumeKey])

    if (!isDate(startDate)) {
      continue
    }

    // Skip much older dates.
    if (startDate < oldestDate) {
      continue
    }
    // Take the first avaialble date.
    if (soonestVolume == null) {
      soonestVolume = container.volumes[volumeKey]
      continue
    }
    // Take subsequent dates if they are older than the first available date.  This is unlikely, but could happen.
    if (startDate < soonestVolume.startDate) {
      soonestVolume = container.volumes[volumeKey]
      continue
    }
  }
  return soonestVolume
}
