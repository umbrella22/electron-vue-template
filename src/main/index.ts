'use strict'

import { useMainDefaultIpc } from './services/ipc/ipc-main'
import { app } from 'electron'
import { windowLogger } from './services/logger/log-service'
import InitWindow from './services/window/window-manager'
import { useDisableButton } from './hooks/disable-button-hook'
import { useProcessException } from '@main/hooks/exception-hook'
import { useMenu } from '@main/hooks/menu-hook'

async function onAppReady() {
  const { disableF12 } = useDisableButton()
  const { renderProcessGone } = useProcessException()
  const { defaultIpc } = useMainDefaultIpc()
  const { creactMenu } = useMenu()
  disableF12()
  renderProcessGone()
  defaultIpc()
  creactMenu()
  new InitWindow().initWindow()
  if (process.env.NODE_ENV === 'development') {
    const {
      installExtension,
      VUEJS_DEVTOOLS,
    } = require('electron-devtools-installer')
    installExtension(VUEJS_DEVTOOLS)
      .then((pluginInfo: Electron.Extension) =>
        windowLogger.info('devtools-installed', pluginInfo.name),
      )
      .catch((err: Error) => windowLogger.warn('devtools-install-error', err))
    windowLogger.info('devtools-installed', 'vue-devtools')
  }
}

app.whenReady().then(onAppReady)
// 由于9.x版本问题，需要加入该配置关闭跨域问题
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors')

app.on('window-all-closed', () => {
  // 所有平台均为所有窗口关闭就退出软件
  app.quit()
})
app.on('browser-window-created', () => {
  windowLogger.info('window-created')
})

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.removeAsDefaultProtocolClient('electron-vue-template')
    windowLogger.warn('protocol-client-dev-mode-disabled')
  }
} else {
  app.setAsDefaultProtocolClient('electron-vue-template')
}
