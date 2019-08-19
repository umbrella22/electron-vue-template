import { globalShortcut, dialog } from 'electron'
import config from '@config'

if (process.env.NODE_ENV === 'production' && config.bulid.DisableF12) {
  globalShortcut.register('f12', () => {
    dialog.showErrorBox({})
  })
}
