import { ipcMain } from 'electron'
import { IpcMainHandleClass } from './ipc-main-handle'
import { BrowserHandleClass } from './browser-handle'
import { PrintHandleClass } from './print-handle'
import { HotUpdaterClass } from './hot-updater-class'
import { IpcChannel } from '@ipcManager/index'

/**
 * 将驼峰命名转换为 kebab-case
 * 例如: GetPrinters -> get-printers
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * 创建方法名到 IPC 通道名的映射
 */
function createMethodToChannelMap(): Record<string, string> {
  const map: Record<string, string> = {}

  // 遍历 IpcChannel 对象，建立映射关系
  for (const [methodName, channelName] of Object.entries(IpcChannel)) {
    map[methodName] = channelName
  }

  return map
}

export const useMainDefaultIpc = () => {
  return {
    defaultIpc: () => {
      const ipcMainHandle = new IpcMainHandleClass()
      const browserHandle = new BrowserHandleClass()
      const printHandle = new PrintHandleClass()
      const hotUpdater = new HotUpdaterClass()

      const methodToChannelMap = createMethodToChannelMap()

      // 注册主处理类
      Object.entries(ipcMainHandle).forEach(([methodName, ipcListener]) => {
        if (typeof ipcListener === 'function') {
          const channelName =
            methodToChannelMap[methodName] || camelToKebab(methodName)
          console.log(`已挂载 Main IPC: ${methodName} -> ${channelName}`)
          ipcMain.handle(channelName, ipcListener)
        }
      })

      // 注册浏览器处理类
      Object.entries(browserHandle).forEach(([methodName, ipcListener]) => {
        if (typeof ipcListener === 'function') {
          const channelName =
            methodToChannelMap[methodName] || camelToKebab(methodName)
          console.log(`已挂载 Browser IPC: ${methodName} -> ${channelName}`)
          ipcMain.handle(channelName, ipcListener)
        }
      })

      // 注册打印处理类
      Object.entries(printHandle).forEach(([methodName, ipcListener]) => {
        if (typeof ipcListener === 'function') {
          const channelName =
            methodToChannelMap[methodName] || camelToKebab(methodName)
          console.log(`已挂载 Print IPC: ${methodName} -> ${channelName}`)
          ipcMain.handle(channelName, ipcListener)
        }
      })

      // 注册热更新处理类（跳过已在主处理类中注册的方法）
      Object.entries(hotUpdater).forEach(([methodName, ipcListener]) => {
        if (typeof ipcListener === 'function') {
          const channelName =
            methodToChannelMap[methodName] || camelToKebab(methodName)
          // 检查是否已经注册过该通道
          if (!ipcMain.listenerCount(channelName)) {
            console.log(
              `已挂载 HotUpdater IPC: ${methodName} -> ${channelName}`,
            )
            ipcMain.handle(channelName, ipcListener)
          } else {
            console.log(`跳过重复注册: ${methodName} -> ${channelName}`)
          }
        }
      })
    },
  }
}
