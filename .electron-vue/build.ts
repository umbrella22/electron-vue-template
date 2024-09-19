process.env.NODE_ENV = 'production'

import { say } from 'cfonts'
import { deleteAsync } from 'del'
import chalk from 'chalk'
import { Listr } from 'listr2'
import { Configuration, rspack } from '@rspack/core'
import { errorLog, doneLog } from './log'
import { DetailedError, getArgv } from './utils'
import {
  createMainConfig,
  createPreloadConfig,
  createRendererConfig,
} from './rspack.config'

const { clean = false, target = 'client' } = getArgv()
const isCI = process.env.CI || false
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
  doneLog(`clear done`)
  if (clean) process.exit()
}

async function unionBuild() {
  greeting()
  await cleanBuid()

  const tasksLister = new Listr(
    [
      {
        title: '正在构建资源文件',
        task: async (_, tasks) => {
          try {
            await pack([
              createMainConfig(),
              createPreloadConfig({ filename: 'index.ts' }),
              createRendererConfig({ target }),
            ])
            tasks.output = `资源文件构建完成，等待 ${chalk.yellow(
              '`electron-builder`',
            )} 打包\n`
          } catch (error) {
            errorLog(`\n 资源文件构建失败 \n`)
            return Promise.reject(error)
          }
        },
      },
    ],
    {
      concurrent: true,
      exitOnError: true,
    },
  )
  await tasksLister.run()
}

async function web() {
  await deleteAsync(['dist/web/*', '!.gitkeep'])
  await pack(createRendererConfig({ target }))
  doneLog(`web build success`)
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
            colors: true,
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
            colors: true,
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
