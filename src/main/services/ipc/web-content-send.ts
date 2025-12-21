import { IWebContentSend } from '@ipcManager/index'
import { ipcLogger } from '../logger/log-service'

export const webContentSend: IWebContentSend = new Proxy(
  {},
  {
    get(target, channel: keyof IWebContentSend) {
      return (webContents: Electron.WebContents, args: unknown) => {
        const name = String(channel)
        if (args !== undefined) {
          ipcLogger.debug('发送', name, args)
          webContents.send(name, args)
        } else {
          ipcLogger.debug('发送', name)
          webContents.send(name)
        }
      }
    },
  },
) as IWebContentSend
