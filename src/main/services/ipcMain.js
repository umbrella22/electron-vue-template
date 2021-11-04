import { ipcMain, dialog, BrowserWindow } from 'electron'
import Server from '../server/index'
import { winURL } from '../config/StaticPath'
import downloadFile from './downloadFile'

export default {
  Mainfunc(IsUseSysTitle) {
    ipcMain.handle('IsUseSysTitle', async () => {
      return IsUseSysTitle
    })
    ipcMain.handle('windows-mini', (event, args) => {
      BrowserWindow.fromWebContents(event.sender)?.minimize()
    })
    ipcMain.handle('window-max', async (event, args) => {
      if (BrowserWindow.fromWebContents(event.sender)?.isMaximized()) {
        BrowserWindow.fromWebContents(event.sender)?.unmaximize()
        return { status: false }
      } else {
        BrowserWindow.fromWebContents(event.sender)?.maximize()
        return { status: true }
      }
    })
    ipcMain.handle('window-close', (event, args) => {
      BrowserWindow.fromWebContents(event.sender)?.close()
    })
    ipcMain.handle('start-download', (event, msg) => {
      downloadFile.download(BrowserWindow.fromWebContents(event.sender), msg.downloadUrL)
    })
    ipcMain.handle('open-messagebox', async (event, arg) => {
      const res = await dialog.showMessageBox(BrowserWindow.fromWebContents(event.sender), {
        type: arg.type || 'info',
        title: arg.title || '',
        buttons: arg.buttons || [],
        message: arg.message || '',
        noLink: arg.noLink || true
      })
      return res
    })
    ipcMain.handle('open-errorbox', (event, arg) => {
      dialog.showErrorBox(
        arg.title,
        arg.message
      )
    })
    ipcMain.handle('statr-server', async () => {
      try {
        const serveStatus = await Server.StatrServer()
        console.log(serveStatus)
        return serveStatus
      } catch (error) {
        dialog.showErrorBox(
          '错误',
          error
        )
      }
    })
    ipcMain.handle('stop-server', async (event, arg) => {
      try {
        const serveStatus = await Server.StopServer()
        return serveStatus
      } catch (error) {
        dialog.showErrorBox(
          '错误',
          error
        )
      }
    })
    let childWin = null;
    let cidArray = [];
    ipcMain.handle('open-win', (event, arg) => {
      let cidJson = {id:null,url:''}
      let data = cidArray.filter((r)=>{
              if(r.url === arg.url){
                return r
              }
          })
      if(data.length > 0){
        //获取当前窗口
        let w =  BrowserWindow.fromId(data[0].id)
        //聚焦窗口
            w.focus();
      }else{
        //获取主窗口ID
        let parentID = event.sender.id
        //创建窗口
        childWin = new BrowserWindow({
            height: arg?.height || 595,
            useContentSize: true,
            width: arg?.width || 842,
            autoHideMenuBar: true,
            resizable: arg?.resizable ?? false, //窗口大小是否可调整
            minWidth: arg?.minWidth || 842,
            show: arg?.show ?? false,
            opacity: arg?.opacity || 1.0,  //窗口透明度
            parent:parentID,
            frame: IsUseSysTitle,
            webPreferences: {
              nodeIntegration: true,
              webSecurity: false,
              webviewTag:arg?.webview ?? false,
              // 如果是开发模式可以使用devTools
              devTools: process.env.NODE_ENV === 'development',
               // 在macos中启用橡皮动画
              scrollBounce: process.platform === 'darwin',
              // 临时修复打开新窗口报错
              contextIsolation: false
            }
        })
        childWin.loadURL(winURL + `#${arg.url}`)
        cidJson.id = childWin?.id
        cidJson.url = arg.url
        cidArray.push(cidJson)
        childWin.webContents.once('dom-ready', () => {
          childWin.show()
          childWin.webContents.send('send-data', arg.sendData)
          if (arg.IsPay) {
            // 检查支付时候自动关闭小窗口
            const testUrl = setInterval(() => {
              const Url = childWin.webContents.getURL()
              if (Url.includes(arg.PayUrl)) {
                childWin.close()
              }
            }, 1200)
            childWin.on('close', () => {
              clearInterval(testUrl)
            })
          }
        })
        childWin.on('closed',() => {
          childWin = null
          let index = cidArray.indexOf(cidJson)
          if (index > -1) {
            cidArray.splice(index, 1);
          } 
        })
      }
    })
  }
}
