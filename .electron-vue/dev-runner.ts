process.env.NODE_ENV = 'development'

import readline from 'node:readline'
import electron from 'electron'
import chalk from 'chalk'
import { join } from 'path'
import { rspack } from '@rspack/core'
import { RspackDevServer } from '@rspack/dev-server'
import { detect } from 'detect-port'
import config from '../config'
import { say } from 'cfonts'
import { spawn } from 'child_process'
import type { ChildProcess } from 'child_process'
import {
  DetailedError,
  electronLog,
  getArgv,
  logStats,
  removeJunk,
  workPath,
} from './utils'
import {
  createMainConfig,
  createPreloadConfig,
  createRendererConfig,
} from './rspack.config'
import { errorLog } from './log'
const { target = 'client', controlledRestart = false } = getArgv()

let electronProcess: ChildProcess | null = null
let manualRestart = false
let readlineInterface: readline.Interface | null = null

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
      readlineInterface?.close()
      process.exit()
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

async function startRenderer(): Promise<void> {
  const port = await detect(config.dev.port || 9080)
  const compiler = rspack(createRendererConfig({ target }))

  compiler.hooks.done.tap('done', (stats) => {
    logStats('渲染进程', stats)
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
  console.log('\n\n' + chalk.blue(`  正在准备主进程，请等待...`) + '\n\n')
}

function startMain(): Promise<void> {
  return new Promise((resolve, reject) => {
    const rsWatcher = rspack([
      createMainConfig({}),
      createPreloadConfig({ filename: 'index.ts' }),
    ])
    rsWatcher.hooks.watchRun.tapAsync('watch-run', (compilation, done) => {
      logStats(`主进程`, chalk.white.bold(`正在处理资源文件...`))
      done()
    })
    rsWatcher.watch(
      {
        ignored: /node_modules/,
        aggregateTimeout: 300,
        poll: false,
      },
      (err: DetailedError | null, stats) => {
        logStats(`主进程`, stats)
        if (err || stats?.hasErrors()) {
          errorLog(err?.stack ?? err)
          if (err?.details) {
            console.error(err.details)
          } else {
            console.error(stats?.toString({}))
          }
          throw new Error('Error occured in main process')
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

  electronProcess.stdout?.on('data', (data: string) => {
    electronLog(removeJunk(data), 'blue')
  })
  electronProcess.stderr?.on('data', (data: string) => {
    electronLog(removeJunk(data), 'red')
  })

  electronProcess.on('close', () => {
    if (!manualRestart) {
      readlineInterface?.close()
      process.exit()
    }
  })
}

function restartElectron() {
  manualRestart = true
  electronProcess?.pid && process.kill(electronProcess.pid)
  electronProcess = null
  electronProcess = null
  startElectron()
  setTimeout(() => {
    manualRestart = false
  }, 5000)
}

function onInputAction(input: string) {
  if (!controlledRestart && input === 'r') {
    console.log(
      chalk.yellow.bold(
        '受控重启被禁用，请在启动时使用 --controlledRestart 选项启用',
      ),
    )
    return
  }
  const shortcut = shortcutList.find((shortcut) => shortcut.key === input)
  if (shortcut) {
    shortcut.action()
  }
}

function initReadline() {
  readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  readlineInterface.on('line', onInputAction)
}

function showHelp() {
  console.log(chalk.green.bold('可用快捷键：\n'))
  shortcutList.forEach((shortcut) => {
    console.log(
      `输入 ${chalk.green.bold(shortcut.key)} + 回车 ${shortcut.description}`,
    )
  })
  console.log('\n')
}

function greeting() {
  const cols = process.stdout.columns
  let text: string | boolean = ''

  if (cols > 104) text = 'rspack-electron'
  else if (cols > 76) text = 'rspack-|electron'
  else text = false

  if (text) {
    say(text, {
      colors: ['yellow'],
      font: 'simple3d',
      space: false,
    })
  } else console.log(chalk.yellow.bold('\n  rspack-electron'))
  console.log(chalk.blue(`准备启动...`) + '\n')
  showHelp()
}

async function init() {
  if (target === 'web') {
    await startRenderer()
    return
  }
  greeting()
  try {
    await startRenderer()
    await startMain()
    startElectron()
    initReadline()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

init()
