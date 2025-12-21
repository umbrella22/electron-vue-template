import {
  IIpcRendererInvoke,
  IIpcRendererOn,
} from '@ipcManager/index'
import { onUnmounted } from 'vue'

/**
 * IPC 调用函数
 * @param channel - IPC 通道名
 * @param args - 传递给 IPC 处理器的参数
 */
export function invoke<T extends keyof IIpcRendererInvoke>(
  channel: T,
  ...args: Parameters<IIpcRendererInvoke[T]>
): ReturnType<IIpcRendererInvoke[T]> {
  return (window.ipcRendererChannel[channel].invoke as any)(...args)
}

/**
 * ipcRenderer.on 在 Vue setup 中使用
 * 会在组件卸载时自动清理监听器
 *
 * @export
 * @template T
 * @param {T} channel - kebab-case 格式的通道名，如 'download-progress', 'hot-update-status' 等
 * @param {IIpcRendererOn[T]} callback - 回调函数
 */
export function vueListen<T extends keyof IIpcRendererOn>(
  channel: T,
  callback: IIpcRendererOn[T],
) {
  window.ipcRendererChannel[channel].on(callback as (...args: any[]) => void)
  onUnmounted(() => {
    window.ipcRendererChannel[channel].removeAllListeners()
  })
}

/**
 * ipcRenderer.on 通用版本
 * 返回清理函数，需要手动调用以移除监听器
 *
 * @export
 * @template T
 * @param {T} channel - kebab-case 格式的通道名，如 'download-progress', 'hot-update-status' 等
 * @param {IIpcRendererOn[T]} callback - 回调函数
 * @return {() => void} 副作用清理函数
 */
export function listen<T extends keyof IIpcRendererOn>(
  channel: T,
  callback: IIpcRendererOn[T],
): () => void {
  window.ipcRendererChannel[channel].on(callback as (...args: any[]) => void)
  return () => {
    window.ipcRendererChannel[channel].removeAllListeners()
  }
}

// 重新导出 IpcChannel 以便在 Vue 组件中使用
export { IpcChannel } from '@ipcManager/index'
