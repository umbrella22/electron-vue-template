'use strict'

import { app } from 'electron'
import initWindow from './services/windowManager'
import DisableButton from './config/DisableButton'

function onAppReady () {
  initWindow()
  DisableButton.Disablef12()
}

app.isReady() ? onAppReady() : app.on('ready', onAppReady)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('browser-window-created', () => {
  console.log('window-created')
})
