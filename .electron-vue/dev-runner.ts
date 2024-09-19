process.env.NODE_ENV = 'development'

import electron from 'electron'
import chalk from 'chalk'
import { join } from 'path'
import { rspack } from '@rspack/core'
import { RspackDevServer } from '@rspack/dev-server'
import Portfinder from 'portfinder'
import config from '../config'
import { say } from 'cfonts'
import { spawn } from 'child_process'
import type { ChildProcess } from 'child_process'
import { electronLog, getArgv, logStats, removeJunk } from './utils'
import {
  createMainConfig,
  createPreloadConfig,
  createRendererConfig,
} from './rspack.config'
import { errorLog } from './log'

interface DetailedError extends Error {
  details?: string
}

let electronProcess: ChildProcess | null = null
let manualRestart = false

async function startRenderer(): Promise<void> {
  Portfinder.basePort = config.dev.port || 9080
  const port = await Portfinder.getPortPromise()
  process.env.PORT = String(port)
  const server = new RspackDevServer(
    {
      port,
    },
    rspack(createRendererConfig()),
  )
  await server.start()
  console.log('\n\n' + chalk.blue(`  正在准备主进程，请等待...`) + '\n\n')
  return
}

function startMain(): Promise<void> {
  return new Promise((resolve, reject) => {
    const rsWatcher = rspack([
      createMainConfig(),
      createPreloadConfig({ filename: 'index.ts' }),
    ])
    rsWatcher.watch(
      {
        ignored: /node_modules/,
        aggregateTimeout: 300,
        poll: false,
      },
      (err: DetailedError | null, stats) => {
        if (err || stats?.hasErrors()) {
          errorLog(err?.stack ?? err)
          if (err?.details) {
            console.error(err.details)
          } else {
            console.error(stats?.toString({}))
          }
          throw new Error('Error occured in main process')
        }
        if (electronProcess) {
          manualRestart = true
          electronProcess.pid && process.kill(electronProcess.pid)
          electronProcess = null
          electronProcess = null
          startElectron()
          setTimeout(() => {
            manualRestart = false
          }, 5000)
          resolve()
        }
      },
    )
  })
}

function startElectron() {
  var args = [
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
    if (!manualRestart) process.exit()
  })
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
}

async function init() {
  greeting()
  try {
    await startRenderer()
    await startMain()
    startElectron()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

init()
