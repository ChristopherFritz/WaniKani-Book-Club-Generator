/* eslint-disable no-unused-vars */

const storagePrefix = 'wkbcm_'

/**
 * Checks to see if an object is a date.
 * @param {*} date The object to check.
 * @returns True if the object is a date.
 */
function isDate (date) {
  return (new Date(date) !== 'Invalid Date') && !isNaN(new Date(date))
}
