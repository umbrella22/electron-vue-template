import { IIpcBrowserHandle } from '@ipcManager/index'

export class BrowserHandleClass implements IIpcBrowserHandle {
  OpenBrowserDemoWindow: (
    event: Electron.IpcMainInvokeEvent,
  ) => void | Promise<void> = () => {
    console.log('OpenBrowserDemoWindow - Not implemented yet')
  }

  GetLastBrowserDemoTabData: (event: Electron.IpcMainInvokeEvent) =>
    | {
        positionX: number
        bvWebContentsId: number
        title: string
        url: string
      }
    | Promise<{
        positionX: number
        bvWebContentsId: number
        title: string
        url: string
      }> = async () => {
    console.log('GetLastBrowserDemoTabData - Not implemented yet')
    return {
      positionX: 0,
      bvWebContentsId: 0,
      title: '',
      url: '',
    }
  }

  AddDefaultBrowserView: (
    event: Electron.IpcMainInvokeEvent,
  ) => { bvWebContentsId: number } | Promise<{ bvWebContentsId: number }> =
    async () => {
      console.log('AddDefaultBrowserView - Not implemented yet')
      return { bvWebContentsId: 0 }
    }

  SelectBrowserDemoTab: (
    event: Electron.IpcMainInvokeEvent,
    bvWebContentsId: number,
  ) => boolean | Promise<boolean> = async (_event, bvWebContentsId) => {
    console.log('SelectBrowserDemoTab - Not implemented yet', bvWebContentsId)
    return false
  }

  DestroyBrowserDemoTab: (
    event: Electron.IpcMainInvokeEvent,
    bvWebContentsId: number,
  ) => void | Promise<void> = (_event, bvWebContentsId) => {
    console.log('DestroyBrowserDemoTab - Not implemented yet', bvWebContentsId)
  }

  BrowserDemoTabJumpToUrl: (
    event: Electron.IpcMainInvokeEvent,
    args: { bvWebContentsId: number; url: string },
  ) => void | Promise<void> = (_event, args) => {
    console.log('BrowserDemoTabJumpToUrl - Not implemented yet', args)
  }

  BrowserTabMousedown: (
    event: Electron.IpcMainInvokeEvent,
    args: { offsetX: number },
  ) => void | Promise<void> = (_event, args) => {
    console.log('BrowserTabMousedown - Not implemented yet', args)
  }

  BrowserTabMousemove: (
    event: Electron.IpcMainInvokeEvent,
    args: {
      screenX: number
      screenY: number
      startX: number
      startY: number
      bvWebContentsId: number
    },
  ) => void | Promise<void> = (_event, args) => {
    console.log('BrowserTabMousemove - Not implemented yet', args)
  }

  BrowserTabMouseup: (
    event: Electron.IpcMainInvokeEvent,
  ) => void | Promise<void> = () => {
    console.log('BrowserTabMouseup - Not implemented yet')
  }
}
