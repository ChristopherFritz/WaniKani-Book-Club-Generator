/* eslint-disable no-unused-vars */
class ErrorMessage {
  static set (message) {
    if (message !== '') {
      message = `Error: ${message}`
    }

    document.getElementById('errors').textContent = message
  }
  static clear () {
    document.getElementById('errors').textContent = ''
  }
}
