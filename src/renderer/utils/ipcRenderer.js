import $Vm from '../main'

export default {
  send (data) {
    $Vm.$electron.ipcRenderer.send(data, (event, arg) => {

    })
  }
}
