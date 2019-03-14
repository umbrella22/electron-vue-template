// 这里是定义菜单的地方，详情请查看 https://electronjs.org/docs/api/menu
const menu = [{
  label: '文档操作',
  submenu: [{
    label: '撤销',
    accelerator: 'CmdOrCtrl+Z',
    role: 'undo'
  }, {
    label: '复制',
    accelerator: 'CmdOrCtrl+C',
    role: 'copy'
  }]
},
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
}]
export default menu
