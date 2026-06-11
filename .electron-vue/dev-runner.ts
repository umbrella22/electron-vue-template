process.env.NODE_ENV = 'development'

import readline from 'node:readline'
import electron from 'electron'
import chalk from 'chalk'
import { join } from 'path'
import { rspack } from '@rspack/core'
import { detect } from 'detect-port'
import config from '../config'
import { say } from 'cfonts'
import { spawn } from 'child_process'
import type { ChildProcess } from 'child_process'
import {
  DetailedError,
  getArgv,
  removeJunk,
  workPath,
} from './utils'
import {
  createMainConfig,
  createPreloadConfig,
  createRendererConfig,
} from './rspack.config'
import { bindDashboardInput, createReporter } from './log'
const {
  target = 'client',
  controlledRestart = false,
  plain = false,
  dashboard = true,
} = getArgv()
const reporter = createReporter({ plain: Boolean(plain), dashboard: Boolean(dashboard) })

let electronProcess: ChildProcess | null = null
let manualRestart = false
let readlineInterface: readline.Interface | null = null
let disposeDashboardInput: (() => void) | null = null

interface Shortcut {
  key: string
  description: string
  action: () => void
}

const shortcutList: Shortcut[] = [
  {
    key: 'r',
    description: '重启主进程',
    action() {
      restartElectron()
    },
  },
  {
    key: 'q',
    description: '退出',
    action() {
      electronProcess?.kill()
      shutdown()
    },
  },
  {
    key: 'h',
    description: '显示帮助',
    action() {
      showHelp()
    },
  },
]

async function startRenderer(port: number): Promise<void> {
  const compiler = rspack(createRendererConfig({ target }))
  const { RspackDevServer } = await import('@rspack/dev-server')

  compiler.hooks.done.tap('done', (stats) => {
    reporter.updateStatus({ renderer: stats.hasErrors() ? '失败' : '完成' })
    reporter.log({
      source: 'renderer',
      level: stats.hasErrors() ? 'error' : 'success',
      message: stats.toString({ colors: reporter.capabilities.supportsAnsi, chunks: false }),
    })
  })
  process.env.PORT = String(port)
  const server = new RspackDevServer(
    {
      port,
      static: {
        directory: join(workPath, 'src', 'renderer', 'public'),
        publicPath: '/public/',
      },
    },
    compiler,
  )
  await server.start()
  reporter.updateStatus({ port, renderer: '运行中', message: '正在准备主进程' })
}

function startMain(): Promise<void> {
  return new Promise((resolve, reject) => {
    const rsWatcher = rspack([
      createMainConfig({}),
      createPreloadConfig({
        filename: 'index.ts',
        outputFilename: 'main-preload.js',
      }),
      createPreloadConfig({ filename: 'loader-preload.ts' }),
    ])
    rsWatcher.hooks.watchRun.tapAsync('watch-run', (_, done) => {
      reporter.updateStatus({ main: '编译中' })
      reporter.log({ source: 'main', level: 'info', message: '正在处理资源文件...' })
      done()
    })
    rsWatcher.watch(
      {
        ignored: /node_modules/,
        aggregateTimeout: 300,
        poll: false,
      },
      (err: DetailedError | null, stats) => {
        reporter.updateStatus({ main: err || stats?.hasErrors() ? '失败' : '完成' })
        reporter.log({
          source: 'main',
          level: err || stats?.hasErrors() ? 'error' : 'success',
          message: stats?.toString({ colors: reporter.capabilities.supportsAnsi, chunks: false }) ?? err,
        })
        if (err || stats?.hasErrors()) {
          if (err?.details) {
            reporter.log({ source: 'main', level: 'error', message: err.details })
          } else {
            reporter.log({
              source: 'main',
              level: 'error',
              message: stats?.toString({ colors: reporter.capabilities.supportsAnsi }) ?? null,
            })
          }
          reject(new Error('Error occured in main process'))
          return
        }
        if (electronProcess && !controlledRestart) {
          restartElectron()
        }
        resolve()
      },
    )
  })
}

function startElectron() {
  let args = [
    '--inspect=5858',
    join(__dirname, '../dist/electron/main/main.js'),
  ]

  // detect yarn or npm and process commandline args accordingly
  if (process.env.npm_execpath?.endsWith('yarn.js')) {
    args = args.concat(process.argv.slice(3))
  } else if (process.env.npm_execpath?.endsWith('npm-cli.js')) {
    args = args.concat(process.argv.slice(2))
  }

  electronProcess = spawn(electron as any, args)
  reporter.updateStatus({ electron: '运行中' })

  electronProcess.stdout?.on('data', (data: string) => {
    reporter.log({ source: 'electron', level: 'info', message: removeJunk(data) || null })
  })
  electronProcess.stderr?.on('data', (data: string) => {
    reporter.log({ source: 'electron', level: 'error', message: removeJunk(data) || null })
  })

  electronProcess.on('close', () => {
    reporter.updateStatus({ electron: '已退出' })
    if (!manualRestart) {
      shutdown()
    }
  })
}

function restartElectron() {
  manualRestart = true
  electronProcess?.pid && process.kill(electronProcess.pid)
  electronProcess = null
  reporter.updateStatus({ electron: '重启中' })
  reporter.log({ source: 'system', level: 'warning', message: '正在重启主进程' })
  startElectron()
  setTimeout(() => {
    manualRestart = false
  }, 5000)
}

function onInputAction(input: string) {
  if (!controlledRestart && input === 'r') {
    reporter.log({
      source: 'system',
      level: 'warning',
      message: '受控重启被禁用，请在启动时使用 --controlledRestart 选项启用',
    })
    return
  }
  const shortcut = shortcutList.find((shortcut) => shortcut.key === input)
  if (shortcut) {
    shortcut.action()
  }
}

function initReadline() {
  if (reporter.mode === 'dashboard') {
    disposeDashboardInput = bindDashboardInput(reporter, onInputAction)
    return
  }

  readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  readlineInterface.on('line', onInputAction)
}

function showHelp() {
  reporter.setShortcuts(shortcutList)
}

function greeting() {
  const cols = process.stdout.columns
  let text: string | boolean = ''

  if (cols > 104) text = 'rspack-electron'
  else if (cols > 76) text = 'rspack-|electron'
  else text = false

  if (text && reporter.mode === 'linear') {
    say(text, {
      colors: ['yellow'],
      font: 'simple3d',
      space: false,
    })
  } else if (reporter.mode === 'linear') console.log(chalk.yellow.bold('\n  rspack-electron'))
  reporter.updateStatus({ target, message: '准备启动' })
  showHelp()
}

function shutdown(code = 0) {
  disposeDashboardInput?.()
  readlineInterface?.close()
  reporter.stop()
  process.exit(code)
}

async function init() {
  const port = await detect(config.dev.port || 9080)
  reporter.start()
  reporter.updateStatus({
    port,
    target,
  })
  if (target === 'web') {
    await startRenderer(port)
    return
  }

  greeting()
  try {
    await Promise.all([startRenderer(port), startMain()])
    startElectron()
    initReadline()
  } catch (error) {
    reporter.log({ source: 'system', level: 'error', message: error as Error })
    shutdown(1)
  }
}

process.on('SIGINT', () => shutdown())
process.on('uncaughtException', (error) => {
  reporter.log({ source: 'system', level: 'error', message: error })
  shutdown(1)
})

init()
