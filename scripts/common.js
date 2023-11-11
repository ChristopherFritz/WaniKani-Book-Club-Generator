const storagePrefix = 'wkbcm_'

/**
 * Checks to see if an object is a date.
 * @param {*} date The object to check.
 * @returns True if the object is a date.
 */
function isDate (date) {
  return (new Date(date) !== 'Invalid Date') && !isNaN(new Date(date))
}

// https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
/**
 * Converts an HTML string to a DOM object.
 * @param {String} HTML representing a single element
 * @return {Element}
 */
function htmlToElement (html) {
  let template = document.createElement('template')
  // Trim html to avoid returning a text node of whitespace as the result.
  template.innerHTML = html.trim()
  return template.content.firstChild
}
