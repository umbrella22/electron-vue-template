import $electron from 'electron'

export default {
  send (data, arg, cb) {
    $electron.ipcRenderer.send(data, arg, (event, arg) => cb(event, arg))
  },
  on (data, arg, cb) {
    $electron.ipcRenderer.on(data, arg, (event, arg) => cb(event, arg))
  },
  remove (data) {
    $electron.ipcRenderer.removeAllListeners(data)
  }
}
