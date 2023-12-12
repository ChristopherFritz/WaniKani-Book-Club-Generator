/* eslint-disable no-unused-vars */

class ErrorMessage {
  static set (message) {
    if (message !== '') {
      message = `Error: ${message}`
    }

    document.getElementById('kfbc-errors').textContent = message
  }
  static clear () {
    document.getElementById('kfbc-errors').textContent = ''
  }
}
