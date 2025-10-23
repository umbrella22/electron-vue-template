import { WebContents, app, dialog } from 'electron'
import type {
  Details,
  RenderProcessGoneDetails,
  Event,
  BrowserWindow,
} from 'electron'

export interface UseProcessExceptionRetrun {
  /**
   * Emitted when the renderer process unexpectedly disappears. This is normally because it was crashed or killed.
   * If a listener is not passed in, it will default to following the crash prompt
   *
   * @see https://www.electronjs.org/docs/latest/api/app#event-render-process-gone
   */
  renderProcessGone: (
    listener?: (
      event: Event,
      webContents: WebContents,
      details: RenderProcessGoneDetails,
    ) => void,
  ) => void
  /**
   * Emitted when the child process unexpectedly disappears. This is normally because it was crashed or killed. It does not include renderer processes.
   * If a listener is not passed in, it will default to following the crash prompt
   *
   * @see https://www.electronjs.org/docs/latest/api/app#event-child-process-gone
   */
  childProcessGone: (
    window: BrowserWindow,
    listener?: (event: Event, details: Details) => void,
  ) => void

  mainWindowGone: (window: BrowserWindow, listener?: () => void) => void
}
interface Message {
  title: string
  buttons: string[]
  message: string
}

export const useProcessException = (): UseProcessExceptionRetrun => {
  const renderProcessGone = (
    listener?: (
      event: Event,
      webContents: WebContents,
      details: RenderProcessGoneDetails,
    ) => void,
  ) => {
    app.on('render-process-gone', (event, webContents, details) => {
      if (listener) {
        listener(event, webContents, details)
        return
      }
      const message: Message = {
        title: '',
        buttons: [],
        message: '',
      }
      switch (details.reason) {
        case 'crashed':
          message.title = '警告'
          message.buttons = ['确定', '退出']
          message.message = '图形化进程崩溃，是否进行软重启操作？'
          break
        case 'killed':
          message.title = '警告'
          message.buttons = ['确定', '退出']
          message.message =
            '由于未知原因导致图形化进程被终止，是否进行软重启操作？'
          break
        case 'oom':
          message.title = '警告'
          message.buttons = ['确定', '退出']
          message.message = '内存不足，是否软重启释放内存？'
          break

        default:
          break
      }
      dialog
        .showMessageBox({
          type: 'warning',
          title: message.title,
          buttons: message.buttons,
          message: message.message,
          noLink: true,
        })
        .then((res) => {
          if (res.response === 0) webContents.reload()
          else webContents.close()
        })
    })
  }
  const childProcessGone = (
    window: BrowserWindow,
    listener?: (event: Event, details: Details) => void,
  ) => {
    app.on('child-process-gone', (event, details) => {
      if (listener) {
        listener(event, details)
        return
      }
      const message: Message = {
        title: '',
        buttons: [],
        message: '',
      }
      switch (details.type) {
        case 'GPU':
          switch (details.reason) {
            case 'crashed':
              message.title = '警告'
              message.buttons = ['确定', '退出']
              message.message = '硬件加速进程已崩溃，是否关闭硬件加速并重启？'
              break
            case 'killed':
              message.title = '警告'
              message.buttons = ['确定', '退出']
              message.message =
                '硬件加速进程被意外终止，是否关闭硬件加速并重启？'
              break
            default:
              break
          }
          break

        default:
          break
      }
      dialog
        .showMessageBox(window, {
          type: 'warning',
          title: message.title,
          buttons: message.buttons,
          message: message.message,
          noLink: true,
        })
        .then((res) => {
          // 当显卡出现崩溃现象时使用该设置禁用显卡加速模式。
          if (res.response === 0) {
            if (details.type === 'GPU') app.disableHardwareAcceleration()
            window.reload()
          } else {
            window.close()
          }
        })
    })
  }

  const mainWindowGone = (window: BrowserWindow, listener?: () => void) => {
    window.on('unresponsive', () => {
      if (listener) {
        listener()
        return
      }
      dialog
        .showMessageBox(window, {
          type: 'warning',
          title: '警告',
          buttons: ['重载', '退出'],
          message: '图形化进程失去响应，是否等待其恢复？',
          noLink: true,
        })
        .then((res) => {
          if (res.response === 0) window!.reload()
          else window!.close()
        })
    })
  }
  return {
    renderProcessGone,
    childProcessGone,
    mainWindowGone,
  }
}
