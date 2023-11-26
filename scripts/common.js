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

// Ideas:
// Have a UserScript where book clubs are defined directly within the WaniKani
// forums.
// When a thread is populated, include a hidden div with information for the
// UserScript to recognize the series, volume, and post type.  This can be
// used to auto-populate values that are missing from the stored data, such
// as thread ID.
// However, we don't want to look book info for every thread.  Instead, if
// the thread was created by the user and has the div, it can load the book
// JSON to see if there are missing fields to auto-populate.

// TODO: The add chapter and add week buttons don't work for a "new" Series
// because there is no table.
