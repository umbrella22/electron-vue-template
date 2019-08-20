import { globalShortcut } from 'electron'
import config from '@config'

function DisableButton () {
  if (process.env.NODE_ENV === 'production' && config.bulid.DisableF12) {
    globalShortcut.register('f12', () => {
      console.log('用户试图启动控制台')
    })
  }
}

export default DisableButton
