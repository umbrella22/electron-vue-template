// 这里是定义菜单的地方，详情请查看 https://electronjs.org/docs/api/menu
const { dialog } = require('electron')
const menu = [
  {
    label: '设置',
    submenu: [{
      label: '快速重启',
      accelerator: 'F5',
      role: 'reload'
    }, {
      label: '退出',
      accelerator: 'CmdOrCtrl+F4',
      role: 'close'
    }]
  }, {
    label: '帮助',
    submenu: [{
      label: '切换到开发者模式',
      accelerator: 'CmdOrCtrl+I',
      role: 'toggledevtools'
    }, {
      label: '关于',
      role: 'about',
      click: function () {
        info()
      }
    }]
  }]
function info () {
  dialog.showMessageBox({
    title: '关于',
    type: 'info',
    message: ''
  })
}
export default menu
