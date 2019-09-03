import $electron from 'electron'

export default {
  send (data, cb) {
    $electron.ipcRenderer.send(data, (event, arg) => cb(event, arg))
  },
  on (data, cb) {
    $electron.ipcRenderer.on(data, (event, arg) => cb(event, arg))
  }
}
