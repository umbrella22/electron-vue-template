import readline from 'node:readline'
import chalk from 'chalk'

export type LogSource = 'renderer' | 'main' | 'electron' | 'system' | 'build'
export type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'debug'
export type ReporterMode = 'linear' | 'dashboard'

export interface LogEvent {
  source: LogSource
  level: LogLevel
  message: string | Error | null
  timestamp?: Date
}

export interface DevStatus {
  renderer?: string
  main?: string
  electron?: string
  port?: number
  target?: string
  message?: string
}

export interface TerminalCapabilities {
  isTTY: boolean
  isStdinTTY: boolean
  isCI: boolean
  isPlain: boolean
  width: number
  height: number
  supportsAnsi: boolean
  supportsInteractive: boolean
}

export interface ShortcutHint {
  key: string
  description: string
}

export interface Reporter {
  mode: ReporterMode
  capabilities: TerminalCapabilities
  start(): void
  stop(): void
  log(event: LogEvent): void
  updateStatus(status: Partial<DevStatus>): void
  setShortcuts(shortcuts: ShortcutHint[]): void
  focus?(source: 'renderer' | 'main'): void
  scroll?(direction: 'up' | 'down'): void
}

export interface ReporterOptions {
  plain?: boolean
  interactive?: boolean
  bufferSize?: number
  dashboard?: boolean
}

interface BufferedLine {
  text: string
  level: LogLevel
  timestamp: Date
}

interface AnsiToken {
  value: string
  width: number
}

const sourceLabels: Record<LogSource, string> = {
  renderer: 'renderer',
  main: 'main',
  electron: 'electron',
  system: 'system',
  build: 'build',
}

const levelLabels: Record<LogLevel, string> = {
  info: 'INFO',
  success: 'DONE',
  warning: 'WARN',
  error: 'ERROR',
  debug: 'DEBUG',
}

export function detectTerminalCapabilities(
  options: ReporterOptions = {},
): TerminalCapabilities {
  const isTTY = Boolean(process.stdout.isTTY)
  const isStdinTTY = Boolean(process.stdin.isTTY)
  const isCI = Boolean(process.env.CI)
  const isPlain = Boolean(options.plain || process.env.PLAIN_OUTPUT)
  const width = process.stdout.columns || 80
  const height = process.stdout.rows || 24
  const supportsAnsi = isTTY && !isCI && !isPlain
  const supportsInteractive = Boolean(
    supportsAnsi && isStdinTTY && options.interactive !== false,
  )

  return {
    isTTY,
    isStdinTTY,
    isCI,
    isPlain,
    width,
    height,
    supportsAnsi,
    supportsInteractive,
  }
}

export function createReporter(options: ReporterOptions = {}): Reporter {
  const capabilities = detectTerminalCapabilities(options)

  if (capabilities.supportsInteractive && options.dashboard) {
    return new AnsiDashboardReporter(capabilities, options)
  }

  return new LinearReporter(capabilities)
}

export class LinearReporter implements Reporter {
  mode: ReporterMode = 'linear'
  capabilities: TerminalCapabilities
  private status: DevStatus = {}

  constructor(
    capabilities = detectTerminalCapabilities({ interactive: false }),
  ) {
    this.capabilities = capabilities
  }

  start() {}

  stop() {}

  log(event: LogEvent) {
    const timestamp = formatTime(event.timestamp ?? new Date())
    const level = colorLevel(
      levelLabels[event.level],
      event.level,
      this.capabilities.supportsAnsi,
    )
    const source = sourceLabels[event.source]
    const message = normalizeMessage(event.message)

    if (!message) return

    message.split(/\r?\n/).forEach((line) => {
      if (line) console.log(`${timestamp} ${level} [${source}] ${line}`)
    })
  }

  updateStatus(status: Partial<DevStatus>) {
    this.status = { ...this.status, ...status }
    const entries = formatStatusEntries(this.status)

    if (entries.length) {
      this.log({
        source: 'system',
        level: 'info',
        message: entries.join(' | '),
      })
    }
  }

  setShortcuts(shortcuts: ShortcutHint[]) {
    if (shortcuts.length) {
      this.log({
        source: 'system',
        level: 'info',
        message: shortcuts
          .map((shortcut) => `${shortcut.key}: ${shortcut.description}`)
          .join('  '),
      })
    }
  }
}

export class AnsiDashboardReporter implements Reporter {
  mode: ReporterMode = 'dashboard'
  capabilities: TerminalCapabilities
  private status: DevStatus = {}
  private shortcuts: ShortcutHint[] = []
  private rendererBuffer: BufferedLine[] = []
  private mainBuffer: BufferedLine[] = []
  private bufferSize: number
  private activePanel: 'renderer' | 'main' = 'renderer'
  private scrollOffsets = { renderer: 0, main: 0 }
  private started = false
  private renderTimer: NodeJS.Timeout | null = null
  private resizeHandler = () => {
    this.capabilities = detectTerminalCapabilities()
    this.render()
  }

  constructor(
    capabilities = detectTerminalCapabilities(),
    options: ReporterOptions = {},
  ) {
    this.capabilities = capabilities
    this.bufferSize = options.bufferSize ?? 300
  }

  start() {
    if (this.started) return
    this.started = true
    process.stdout.write('\x1b[?1049h\x1b[?25l\x1b[2J\x1b[H')
    process.stdout.on('resize', this.resizeHandler)
    this.render()
  }

  stop() {
    if (!this.started) return
    this.started = false
    if (this.renderTimer) clearTimeout(this.renderTimer)
    this.renderTimer = null
    process.stdout.off('resize', this.resizeHandler)
    process.stdout.write('\x1b[?25h\x1b[?1049l')
  }

  log(event: LogEvent) {
    const message = normalizeMessage(event.message)
    if (!message) return

    const target =
      event.source === 'renderer' ? this.rendererBuffer : this.mainBuffer
    const timestamp = event.timestamp ?? new Date()
    const maxWidth = Math.max(
      12,
      Math.floor((this.capabilities.width - 3) / 2) - 9,
    )

    message.split(/\r?\n/).forEach((line) => {
      if (!line) return
      wrapAnsiLine(`[${sourceLabels[event.source]}] ${line}`, maxWidth).forEach(
        (text) => {
          target.push({
            text,
            level: event.level,
            timestamp,
          })
        },
      )
    })
    trimBuffer(target, this.bufferSize)
    this.scheduleRender()
  }

  updateStatus(status: Partial<DevStatus>) {
    this.status = { ...this.status, ...status }
    this.scheduleRender()
  }

  setShortcuts(shortcuts: ShortcutHint[]) {
    this.shortcuts = shortcuts
    this.scheduleRender()
  }

  focus(source: 'renderer' | 'main') {
    this.activePanel = source
    this.scheduleRender()
  }

  toggleFocus() {
    this.focus(this.activePanel === 'renderer' ? 'main' : 'renderer')
  }

  scroll(direction: 'up' | 'down') {
    const buffer =
      this.activePanel === 'renderer' ? this.rendererBuffer : this.mainBuffer
    const maxOffset = Math.max(0, buffer.length - this.panelHeight())
    const currentOffset = this.scrollOffsets[this.activePanel]
    this.scrollOffsets[this.activePanel] =
      direction === 'up'
        ? Math.min(maxOffset, currentOffset + 1)
        : Math.max(0, currentOffset - 1)
    this.scheduleRender()
  }

  private scheduleRender() {
    if (!this.started || this.renderTimer) return
    this.renderTimer = setTimeout(() => {
      this.renderTimer = null
      this.render()
    }, 16)
  }

  private render() {
    if (!this.started) return

    const width = Math.max(40, this.capabilities.width)
    const height = Math.max(12, this.capabilities.height)
    const panelHeight = this.panelHeight()
    const leftWidth = Math.max(20, Math.floor((width - 3) / 2))
    const rightWidth = Math.max(20, width - leftWidth - 3)
    const output: string[] = []

    output.push(
      chalk.bgBlue.white(
        padLine(
          ` ${formatStatusEntries(this.status).join(' | ') || 'dev dashboard'} `,
          width,
        ),
      ),
    )
    output.push(
      `${panelTitle('renderer', leftWidth, this.activePanel === 'renderer')} │ ${panelTitle('main / electron', rightWidth, this.activePanel === 'main')}`,
    )

    const rendererLines = visibleLines(
      this.rendererBuffer,
      panelHeight,
      this.scrollOffsets.renderer,
    )
    const mainLines = visibleLines(
      this.mainBuffer,
      panelHeight,
      this.scrollOffsets.main,
    )

    for (let index = 0; index < panelHeight; index += 1) {
      output.push(
        `${this.formatBufferedLine(rendererLines[index], leftWidth)} │ ${this.formatBufferedLine(mainLines[index], rightWidth)}`,
      )
    }

    const footer = this.shortcuts.length
      ? this.shortcuts
          .map((shortcut) => `${shortcut.key}: ${shortcut.description}`)
          .join('  ')
      : 'tab: 切换焦点  ↑/↓: 滚动'

    output.push(chalk.bgBlack.white(padLine(` ${footer} `, width)))

    while (output.length < height) output.push('')

    process.stdout.write('\x1b[H\x1b[2J')
    process.stdout.write(
      output
        .slice(0, height)
        .map(
          (line) => `${padLine(truncateAnsi(line, width), width)}\x1b[0m\x1b[K`,
        )
        .join('\n'),
    )
  }

  private panelHeight() {
    return Math.max(6, this.capabilities.height - 4)
  }

  private formatBufferedLine(line: BufferedLine | undefined, width: number) {
    if (!line) return ''.padEnd(width)
    const text = `${formatTime(line.timestamp)} ${line.text}`
    return padLine(
      truncateAnsi(
        colorLevel(text, line.level, this.capabilities.supportsAnsi),
        width,
      ),
      width,
    )
  }
}

export function bindDashboardInput(
  reporter: Reporter,
  onInputAction: (input: string) => void,
) {
  if (reporter.mode !== 'dashboard') return () => {}

  readline.emitKeypressEvents(process.stdin)
  if (process.stdin.isTTY) process.stdin.setRawMode(true)

  const handler = (_: string, key: readline.Key) => {
    if (key.name === 'tab') {
      const dashboard = reporter as AnsiDashboardReporter
      dashboard.toggleFocus()
      return
    }
    if (key.name === 'up') {
      reporter.scroll?.('up')
      return
    }
    if (key.name === 'down') {
      reporter.scroll?.('down')
      return
    }
    if (key.name) onInputAction(key.name)
  }

  process.stdin.on('keypress', handler)

  return () => {
    process.stdin.off('keypress', handler)
    if (process.stdin.isTTY) process.stdin.setRawMode(false)
  }
}

function normalizeMessage(message: string | Error | null) {
  if (!message) return ''
  if (message instanceof Error) return message.stack || message.message
  return String(message)
}

function colorLevel(label: string, level: LogLevel, enabled: boolean) {
  if (!enabled) return label
  if (level === 'success') return chalk.green(label)
  if (level === 'warning') return chalk.yellow(label)
  if (level === 'error') return chalk.red(label)
  if (level === 'debug') return chalk.gray(label)
  return chalk.cyan(label)
}

function formatTime(date: Date) {
  return date.toTimeString().slice(0, 8)
}

function formatStatusEntries(status: DevStatus) {
  return [
    status.target ? `target ${status.target}` : '',
    status.port ? `port ${status.port}` : '',
    status.renderer ? `renderer ${status.renderer}` : '',
    status.main ? `main ${status.main}` : '',
    status.electron ? `electron ${status.electron}` : '',
    status.message || '',
  ].filter(Boolean)
}

function trimBuffer(buffer: BufferedLine[], size: number) {
  if (buffer.length > size) buffer.splice(0, buffer.length - size)
}

function visibleLines(buffer: BufferedLine[], height: number, offset: number) {
  const start = Math.max(0, buffer.length - height - offset)
  return buffer.slice(start, start + height)
}

function panelTitle(title: string, width: number, active: boolean) {
  const label = active ? ` ${title} * ` : ` ${title} `
  return chalk.bold(padLine(label, width, active ? '=' : '-'))
}

function padLine(line: string, width: number, fill = ' ') {
  const visibleLength = stringWidth(line)
  if (visibleLength >= width) return line
  return line + fill.repeat(width - visibleLength)
}

function truncateAnsi(line: string, width: number) {
  let visible = 0
  let output = ''

  for (const token of tokenizeAnsi(line)) {
    if (token.width === 0) {
      output += token.value
      continue
    }
    if (visible + token.width > width) break
    output += token.value
    visible += token.width
  }

  return output
}

function wrapAnsiLine(line: string, width: number) {
  const lines: string[] = []
  let current = ''
  let currentWidth = 0

  tokenizeAnsi(line).forEach((token) => {
    if (token.width === 0) {
      current += token.value
      return
    }

    if (currentWidth + token.width > width && currentWidth > 0) {
      lines.push(current)
      current = ''
      currentWidth = 0
    }

    current += token.value
    currentWidth += token.width
  })

  if (current || !lines.length) lines.push(current)
  return lines
}

function tokenizeAnsi(value: string) {
  const tokens: AnsiToken[] = []
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === '\x1b') {
      const match = value.slice(index).match(/^\x1B\[[0-?]*[ -/]*[@-~]/)
      if (match) {
        tokens.push({ value: match[0], width: 0 })
        index += match[0].length - 1
        continue
      }
    }

    const codePoint = value.codePointAt(index)
    if (!codePoint) continue
    const char = String.fromCodePoint(codePoint)
    tokens.push({ value: char, width: charWidth(codePoint) })
    if (codePoint > 0xffff) index += 1
  }
  return tokens
}

function stringWidth(value: string) {
  return tokenizeAnsi(value).reduce((width, token) => width + token.width, 0)
}

function charWidth(codePoint: number) {
  if (codePoint === 0) return 0
  if (codePoint < 32 || (codePoint >= 0x7f && codePoint < 0xa0)) return 0
  if (
    codePoint >= 0x1100 &&
    (codePoint <= 0x115f ||
      codePoint === 0x2329 ||
      codePoint === 0x232a ||
      (codePoint >= 0x2e80 && codePoint <= 0xa4cf && codePoint !== 0x303f) ||
      (codePoint >= 0xac00 && codePoint <= 0xd7a3) ||
      (codePoint >= 0xf900 && codePoint <= 0xfaff) ||
      (codePoint >= 0xfe10 && codePoint <= 0xfe19) ||
      (codePoint >= 0xfe30 && codePoint <= 0xfe6f) ||
      (codePoint >= 0xff00 && codePoint <= 0xff60) ||
      (codePoint >= 0xffe0 && codePoint <= 0xffe6))
  ) {
    return 2
  }
  return 1
}
