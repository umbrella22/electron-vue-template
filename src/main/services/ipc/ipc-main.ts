import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { ipcLogger } from '../logger/log-service'
import { IpcMainHandleClass } from './ipc-main-handle'
import { BrowserHandleClass } from '../window/browser-handle'
import { PrintHandleClass } from '../window/print-handle'
import { HotUpdaterClass } from '../update/hot-updater-class'
import { IpcChannel, camelToKebab } from '@ipcManager/index'

function createMethodToChannelMap(): Record<string, string> {
  const map: Record<string, string> = {}
  for (const [methodName, channelName] of Object.entries(IpcChannel)) {
    map[methodName] = channelName
  }
  return map
}

type IpcListener = (event: IpcMainInvokeEvent, args?: any) => any

/**
 * 注册 IPC 处理器的辅助函数
 * @param instance IPC 处理器实例
 * @param methodToChannelMap 方法名到通道名的映射
 * @param skipDuplicate 是否跳过重复注册（用于热更新等特殊场景）
 */
function registerIpcHandlers(
  instance: any,
  methodToChannelMap: Record<string, string>,
  skipDuplicate: boolean = false,
) {
  Object.entries(instance).forEach(([methodName, ipcListener]) => {
    if (typeof ipcListener !== 'function') return

    const channelName =
      methodToChannelMap[methodName] || camelToKebab(methodName)

    // 检查重复注册（仅当 skipDuplicate 为 true 时）
    if (skipDuplicate && ipcMain.listenerCount(channelName) > 0) {
      ipcLogger.warn('跳过重复注册', methodName, channelName)
      return
    }

    ipcLogger.info('注册', methodName, channelName)

    ipcMain.handle(
      channelName,
      async (event: IpcMainInvokeEvent, args: any) => {
        ipcLogger.debug('调用开始', methodName, args)
        try {
          const res = await (ipcListener as IpcListener)(event, args)
          ipcLogger.info('调用成功', methodName)
          return res
        } catch (err) {
          ipcLogger.error('调用失败', methodName, err)
          throw err
        }
      },
    )
  })
}

export const useMainDefaultIpc = () => {
  return {
    defaultIpc: () => {
      const ipcMainHandle = new IpcMainHandleClass()
      const browserHandle = new BrowserHandleClass()
      const printHandle = new PrintHandleClass()
      const hotUpdater = new HotUpdaterClass()

      const methodToChannelMap = createMethodToChannelMap()

      // 注册所有 IPC 处理器，使用辅助函数减少重复代码
      registerIpcHandlers(ipcMainHandle, methodToChannelMap)
      registerIpcHandlers(browserHandle, methodToChannelMap)
      registerIpcHandlers(printHandle, methodToChannelMap)

      // 热更新处理器需要跳过重复注册
      registerIpcHandlers(hotUpdater, methodToChannelMap, true)
    },
  }
}
