import { IIpcPrintHandle } from '@ipcManager/index'

export class PrintHandleClass implements IIpcPrintHandle {
  GetPrinters: (
    event: Electron.IpcMainInvokeEvent,
  ) => Electron.PrinterInfo[] | Promise<Electron.PrinterInfo[]> = async () => {
    console.log('GetPrinters - Not implemented yet')
    return []
  }

  PrintHandlePrint: (
    event: Electron.IpcMainInvokeEvent,
    args: Electron.WebContentsPrintOptions,
  ) =>
    | { success: boolean; failureReason: string }
    | Promise<{ success: boolean; failureReason: string }> = async (
    _event,
    args,
  ) => {
    console.log('PrintHandlePrint - Not implemented yet', args)
    return { success: false, failureReason: 'Not implemented' }
  }

  OpenPrintDemoWindow: (
    event: Electron.IpcMainInvokeEvent,
  ) => void | Promise<void> = () => {
    console.log('OpenPrintDemoWindow - Not implemented yet')
  }
}
