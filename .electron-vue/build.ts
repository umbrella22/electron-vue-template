process.env.NODE_ENV = 'production'

import { say } from 'cfonts'
import { deleteAsync } from 'del'
import chalk from 'chalk'
import { Configuration, rspack } from '@rspack/core'
import { createReporter } from './log'
import { DetailedError, getArgv } from './utils'
import {
  createMainConfig,
  createPreloadConfig,
  createRendererConfig,
} from './rspack.config'

const { clean = false, target = 'client', plain = false } = getArgv()
const reporter = createReporter({ plain: Boolean(plain), interactive: false })
const isCI = reporter.capabilities.isCI
if (target === 'web') web()
else unionBuild()

async function cleanBuid() {
  await deleteAsync([
    'dist/electron/main/*',
    'dist/electron/renderer/*',
    'dist/web/*',
    'build/*',
    '!build/icons',
  ])
  reporter.log({ source: 'build', level: 'success', message: '清理构建目录成功' })
  if (clean) process.exit()
}

async function unionBuild() {
  greeting()
  const startedAt = Date.now()
  await cleanBuid()
  reporter.log({ source: 'build', level: 'info', message: '开始构建资源文件' })

  try {
    await pack([
      createMainConfig({ env: 'production' }),
      createPreloadConfig({
        env: 'production',
        filename: 'index.ts',
        outputFilename: 'main-preload.js',
      }),
      createPreloadConfig({
        env: 'production',
        filename: 'loader-preload.ts',
      }),
      createRendererConfig({ env: 'production', target }),
    ])
    reporter.log({
      source: 'build',
      level: 'success',
      message: `资源文件构建完成，构建交付 ${chalk.yellow('electron-builder')} 请稍等...`,
    })
    reporter.log({
      source: 'build',
      level: 'success',
      message: `构建耗时 ${formatDuration(Date.now() - startedAt)}`,
    })
  } catch (error) {
    reporter.log({ source: 'build', level: 'error', message: '资源文件构建失败' })
    reporter.log({ source: 'build', level: 'error', message: error as Error })
    return Promise.reject(error)
  }
}

async function web() {
  const startedAt = Date.now()
  await deleteAsync(['dist/web/*', '!.gitkeep'])
  await pack(createRendererConfig({ env: 'production', target }))
  reporter.log({ source: 'build', level: 'success', message: `web build success，耗时 ${formatDuration(Date.now() - startedAt)}` })
  process.exit()
}
function pack(
  config: Configuration | Configuration[],
): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    rspack(config, (err: DetailedError | null, stats) => {
      if (err) reject(err.stack || err)
      else if (stats?.hasErrors()) {
        let err = ''

        stats
          .toString({
            chunks: false,
            colors: reporter.capabilities.supportsAnsi,
          })
          .split(/\r?\n/)
          .forEach((line) => {
            err += `    ${line}\n`
          })

        reject(err)
      } else {
        resolve(
          stats?.toString({
            chunks: false,
            colors: reporter.capabilities.supportsAnsi,
          }),
        )
      }
    })
  })
}

function greeting() {
  const cols = process.stdout.columns
  let text: boolean | string = ''

  if (cols > 85) text = `let's-build`
  else if (cols > 60) text = `let's-|build`
  else text = false

  if (text && !isCI) {
    say(text, {
      colors: ['yellow'],
      font: 'simple3d',
      space: false,
    })
  } else console.log(chalk.yellow.bold(`\n  let's-build`))
  console.log()
}

function formatDuration(duration: number) {
  return `${(duration / 1000).toFixed(2)}s`
}
