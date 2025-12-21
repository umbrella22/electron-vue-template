import log from 'electron-log'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

function ts() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const ms = String(d.getMilliseconds()).padStart(3, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${ms}`
}

function prefix(feature: string, level: LogLevel) {
  return `${feature} | ${ts()} | ${level.toUpperCase()}`
}

function write(level: LogLevel, feature: string, message: string, ...args: any[]) {
  const text = `[${prefix(feature, level)}] ${message}`
  ;(log as any)[level](text, ...args)
}

export function createLogger(feature: string) {
  return {
    debug: (message: string, ...args: any[]) => write('debug', feature, message, ...args),
    info: (message: string, ...args: any[]) => write('info', feature, message, ...args),
    warn: (message: string, ...args: any[]) => write('warn', feature, message, ...args),
    error: (message: string, ...args: any[]) => write('error', feature, message, ...args),
  }
}

export const ipcLogger = createLogger('IPC')
export const windowLogger = createLogger('Window')
export const crashLogger = createLogger('Crash')
