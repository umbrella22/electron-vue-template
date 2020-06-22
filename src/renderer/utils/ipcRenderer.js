import { ipcRenderer } from 'electron'
export default {
  send (name, data = {}) {
    return new Promise((resolve, reject) => {
      ipcRenderer.invoke(name, data).then(res => {
        resolve(res)
      })
    })
  },
  on (name) {
    return new Promise((resolve, reject) => {
      ipcRenderer.on(name, (event, args) => {
        resolve(args)
      })
    })
  }
}
