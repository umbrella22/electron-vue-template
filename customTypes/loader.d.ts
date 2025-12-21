/**
 * Loader 窗口全局类型声明
 */

interface LifecycleUpdateData {
  percent: number
  message: string
  subText: string
  phase: string
}

interface LifecycleLogData {
  message: string
  type: 'info' | 'highlight' | 'error'
}

interface LifecycleErrorData {
  message: string
  code?: string
}

interface LifecycleAPI {
  onUpdate: (callback: (data: LifecycleUpdateData) => void) => void
  onLog: (callback: (data: LifecycleLogData) => void) => void
  onError: (callback: (data: LifecycleErrorData) => void) => void
  removeAllListeners: () => void
}

interface LauncherLoaderAPI {
  setPercent: (value: number) => void
  setText: (text: string) => void
  setSubText: (text: string) => void
  setError: (message: string, code?: string) => void
  log: (message: string, type?: 'info' | 'highlight' | 'error') => void
}

interface Window {
  lifecycle?: LifecycleAPI
  loader?: LauncherLoaderAPI
}
