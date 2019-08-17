import { BrowserWindow, Menu } from 'electron'
import menuconfig from '../config/menu'
import config from '@config'

const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`

function createMainWindow () {
  let mainWindow
  /**
       * Initial window options
       */
  mainWindow = new BrowserWindow({
    height: 600,
    useContentSize: true,
    width: 1000,
    show: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true
    }
  })

  const menu = Menu.buildFromTemplate(menuconfig)
  Menu.setApplicationMenu(menu)
  mainWindow.loadURL(winURL)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function loadindWindow (loadingURL) {
  const loadWindow = new BrowserWindow({
    width: 400,
    height: 600,
    frame: false,
    backgroundColor: '#222428',
    transparent: true,
    webPreferences: { experimentalFeatures: true }
  })

  loadWindow.loadURL(loadingURL)

  loadWindow.show()

  // setTimeout(() => {
  //   createMainWindow()
  //   loadWindow.destroy()
  // }, 2000)
}

function initWindow (loadingURL) {
  if (config.UseStartupChart) {
    return loadindWindow(loadingURL)
  } else {
    return createMainWindow()
  }
}
export default initWindow
