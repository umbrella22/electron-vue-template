import { BrowserWindow } from 'electron'
import { EventEmitter } from 'events'

/**
 * 窗口生命周期阶段
 */
export enum LifecyclePhase {
  /** 初始化阶段 */
  INIT = 'init',
  /** 加载配置 */
  LOADING_CONFIG = 'loading_config',
  /** 检查更新 */
  CHECKING_UPDATES = 'checking_updates',
  /** 加载资源 */
  LOADING_ASSETS = 'loading_assets',
  /** 初始化模块 */
  INITIALIZING_MODULES = 'initializing_modules',
  /** 连接服务 */
  CONNECTING_SERVICES = 'connecting_services',
  /** 准备完成 */
  READY = 'ready',
  /** 错误状态 */
  ERROR = 'error',
}

/**
 * 生命周期日志项
 */
export interface LifecycleLogEntry {
  timestamp: Date
  message: string
  type: 'info' | 'highlight' | 'error'
}

/**
 * 生命周期状态
 */
export interface LifecycleState {
  phase: LifecyclePhase
  percent: number
  message: string
  subText: string
  logs: LifecycleLogEntry[]
}

/**
 * 生命周期事件类型
 */
export interface LifecycleEvents {
  'phase-change': (phase: LifecyclePhase) => void
  'progress-update': (percent: number) => void
  log: (entry: LifecycleLogEntry) => void
  ready: () => void
  error: (error: Error) => void
}

/**
 * 窗口生命周期管理器
 * 负责管理应用启动过程中的各个阶段，并与 loader 窗口通信
 */
export class WindowLifecycleManager extends EventEmitter {
  private state: LifecycleState
  private loadWindow: BrowserWindow | null = null
  private mainWindow: BrowserWindow | null = null
  private isMainWindowReady = false
  private isLoaderComplete = false
  private mainWindowShowResolver: (() => void) | null = null
  private loaderStartTime: number = 0

  constructor() {
    super()
    this.state = {
      phase: LifecyclePhase.INIT,
      percent: 0,
      message: 'SYSTEM INITIALIZING...',
      subText: 'WAITING FOR SYNC',
      logs: [],
    }
  }

  /**
   * 设置 loader 窗口引用
   */
  setLoadWindow(window: BrowserWindow | null) {
    this.loadWindow = window
    // 不在这里记录开始时间，改为在 startLoaderTimer 中记录
  }

  /**
   * 开始 loader 计时
   * 应该在 loader 窗口内容加载完成后调用
   */
  startLoaderTimer() {
    this.loaderStartTime = Date.now()
  }

  /**
   * 设置主窗口引用
   */
  setMainWindow(window: BrowserWindow | null) {
    this.mainWindow = window
  }

  /**
   * 获取当前状态
   */
  getState(): LifecycleState {
    return { ...this.state }
  }

  /**
   * 设置当前阶段
   */
  setPhase(phase: LifecyclePhase, message?: string) {
    this.state.phase = phase
    if (message) {
      this.state.message = message
    }
    this.emit('phase-change', phase)
    this.syncToLoader()
  }

  /**
   * 更新进度百分比
   */
  setProgress(percent: number, subText?: string) {
    this.state.percent = Math.min(100, Math.max(0, percent))
    if (subText) {
      this.state.subText = subText
    }
    this.emit('progress-update', this.state.percent)
    this.syncToLoader()

    // 检查是否达到 100%
    if (this.state.percent >= 100 && !this.isLoaderComplete) {
      this.isLoaderComplete = true
      this.checkAndShowMainWindow()
    }
  }

  /**
   * 设置显示文本
   */
  setText(message: string) {
    this.state.message = message
    this.syncToLoader()
  }

  /**
   * 设置副标题文本
   */
  setSubText(subText: string) {
    this.state.subText = subText
    this.syncToLoader()
  }

  /**
   * 添加日志条目
   */
  log(message: string, type: 'info' | 'highlight' | 'error' = 'info') {
    const entry: LifecycleLogEntry = {
      timestamp: new Date(),
      message,
      type,
    }
    this.state.logs.push(entry)
    // 保持日志数量在合理范围内
    if (this.state.logs.length > 100) {
      this.state.logs = this.state.logs.slice(-100)
    }
    this.emit('log', entry)
    this.sendLogToLoader(entry)
  }

  /**
   * 设置错误状态
   */
  setError(message: string, code?: string) {
    this.state.phase = LifecyclePhase.ERROR
    this.state.message = message
    this.state.subText = code || 'FATAL_ERROR'
    this.emit('error', new Error(message))
    this.sendErrorToLoader(message, code)
  }

  /**
   * 主窗口准备就绪
   * 执行阶段式动画后显示主窗口
   */
  async onMainWindowReady(): Promise<void> {
    this.isMainWindowReady = true
    this.log('Main window loaded', 'highlight')

    // 执行阶段式倒计时动画
    await this.runCountdownAnimation()

    // 标记 loader 完成
    this.isLoaderComplete = true

    // 显示主窗口
    this.showMainWindow()
  }

  /**
   * 运行阶段式倒计时动画
   * 每个阶段约 3 秒，总共约 15 秒
   */
  private async runCountdownAnimation(): Promise<void> {
    // 定义阶段信息，每个阶段约 3 秒
    const phases = [
      {
        startPercent: this.state.percent,
        endPercent: 85,
        message: 'FINALIZING SETUP...',
        subText: 'SYNC_DATA',
        log: 'Syncing data streams...',
      },
      {
        startPercent: 85,
        endPercent: 90,
        message: 'PREPARING INTERFACE...',
        subText: 'INIT_UI',
        log: 'Initializing user interface...',
      },
      {
        startPercent: 90,
        endPercent: 95,
        message: 'LOADING PREFERENCES...',
        subText: 'USER_CONFIG',
        log: 'Loading user preferences...',
      },
      {
        startPercent: 95,
        endPercent: 98,
        message: 'ALMOST READY...',
        subText: 'FINAL_CHECK',
        log: 'Performing final checks...',
      },
      {
        startPercent: 98,
        endPercent: 100,
        message: 'LAUNCHING...',
        subText: 'READY',
        log: 'System initialization complete',
      },
    ]

    const phaseDuration = 1500 // 每个阶段 3 秒
    const updateInterval = 50 // 每 50ms 更新一次进度条

    for (const phase of phases) {
      // 设置阶段信息
      this.state.message = phase.message
      this.state.subText = phase.subText
      this.log(phase.log)
      this.syncToLoader()

      // 计算该阶段的进度增量
      const percentRange = phase.endPercent - phase.startPercent
      const stepsInPhase = Math.floor(phaseDuration / updateInterval)
      const percentPerStep = percentRange / stepsInPhase

      // 平滑更新进度
      for (let step = 1; step <= stepsInPhase; step++) {
        await this.delay(updateInterval)
        const newPercent = Math.min(
          phase.endPercent,
          Math.round(phase.startPercent + percentPerStep * step),
        )
        this.state.percent = newPercent
        this.emit('progress-update', newPercent)
        this.syncToLoader()
      }
    }

    // 确保最终到达 100%
    this.setProgress(100, 'READY')
  }

  /**
   * 检查并显示主窗口
   */
  private checkAndShowMainWindow() {
    if (this.isMainWindowReady && this.isLoaderComplete) {
      this.showMainWindow()
      if (this.mainWindowShowResolver) {
        this.mainWindowShowResolver()
        this.mainWindowShowResolver = null
      }
    }
  }

  /**
   * 显示主窗口并关闭 loader
   */
  private showMainWindow() {
    this.log('System Ready', 'highlight')
    this.setText('LAUNCHING')
    this.emit('ready')

    // 延迟一小段时间让用户看到完成状态
    setTimeout(() => {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.show()
      }
      if (this.loadWindow && !this.loadWindow.isDestroyed()) {
        this.loadWindow.destroy()
        this.loadWindow = null
      }
    }, 300)
  }

  /**
   * 同步状态到 loader 窗口
   */
  private syncToLoader() {
    if (!this.loadWindow || this.loadWindow.isDestroyed()) return

    try {
      this.loadWindow.webContents.send('lifecycle-update', {
        percent: this.state.percent,
        message: this.state.message,
        subText: this.state.subText,
        phase: this.state.phase,
      })
    } catch {
      // loader 窗口可能已关闭
    }
  }

  /**
   * 发送日志到 loader 窗口
   */
  private sendLogToLoader(entry: LifecycleLogEntry) {
    if (!this.loadWindow || this.loadWindow.isDestroyed()) return

    try {
      this.loadWindow.webContents.send('lifecycle-log', {
        message: entry.message,
        type: entry.type,
      })
    } catch {
      // loader 窗口可能已关闭
    }
  }

  /**
   * 发送错误到 loader 窗口
   */
  private sendErrorToLoader(message: string, code?: string) {
    if (!this.loadWindow || this.loadWindow.isDestroyed()) return

    try {
      this.loadWindow.webContents.send('lifecycle-error', {
        message,
        code,
      })
    } catch {
      // loader 窗口可能已关闭
    }
  }

  /**
   * 模拟初始化流程（用于演示）
   */
  async simulateStartup(options?: { skipDemo?: boolean }) {
    if (options?.skipDemo) {
      this.setProgress(100)
      return
    }

    const phases = [
      {
        phase: LifecyclePhase.LOADING_CONFIG,
        message: 'LOADING CONFIGURATION...',
        percent: 15,
        log: 'Loading configuration files...',
      },
      {
        phase: LifecyclePhase.CHECKING_UPDATES,
        message: 'CHECKING UPDATES...',
        percent: 30,
        log: 'Checking for updates...',
      },
      {
        phase: LifecyclePhase.LOADING_ASSETS,
        message: 'LOADING ASSETS...',
        percent: 50,
        log: 'Loading application assets...',
      },
      {
        phase: LifecyclePhase.INITIALIZING_MODULES,
        message: 'INITIALIZING MODULES...',
        percent: 70,
        log: 'Initializing core modules...',
      },
      {
        phase: LifecyclePhase.CONNECTING_SERVICES,
        message: 'CONNECTING SERVICES...',
        percent: 85,
        log: 'Connecting to services...',
      },
      {
        phase: LifecyclePhase.READY,
        message: 'SYSTEM READY',
        percent: 100,
        log: 'System initialization complete',
      },
    ]

    for (const step of phases) {
      this.setPhase(step.phase, step.message)
      this.log(
        step.log,
        step.phase === LifecyclePhase.READY ? 'highlight' : 'info',
      )

      // 模拟进度增量
      const startPercent = this.state.percent
      const targetPercent = step.percent
      const steps = 5
      const delay = 200

      for (let i = 1; i <= steps; i++) {
        await this.delay(delay)
        const currentPercent =
          startPercent + ((targetPercent - startPercent) * i) / steps
        this.setProgress(
          Math.round(currentPercent),
          `PROCESS: ${step.phase.toUpperCase()}`,
        )
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * 重置状态
   */
  reset() {
    this.state = {
      phase: LifecyclePhase.INIT,
      percent: 0,
      message: 'SYSTEM INITIALIZING...',
      subText: 'WAITING FOR SYNC',
      logs: [],
    }
    this.isMainWindowReady = false
    this.isLoaderComplete = false
    this.mainWindowShowResolver = null
  }
}

// 单例实例
let lifecycleManagerInstance: WindowLifecycleManager | null = null

/**
 * 获取窗口生命周期管理器实例
 */
export function useWindowLifecycle(): WindowLifecycleManager {
  if (!lifecycleManagerInstance) {
    lifecycleManagerInstance = new WindowLifecycleManager()
  }
  return lifecycleManagerInstance
}
