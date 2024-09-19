import { config } from 'dotenv'
import { join } from 'path'
import minimist from 'minimist'
import chalk from 'chalk'
import {
  rspack,
  type LightningcssLoaderOptions,
  type RspackPluginInstance,
  type RuleSetRule,
} from '@rspack/core'

const argv = minimist(process.argv.slice(2))
const rootResolve = (...pathSegments) => join(__dirname, '..', ...pathSegments)

export const getEnv = () => argv['m']
export const getArgv = () => argv

const getEnvPath = () => {
  if (
    String(typeof getEnv()) === 'boolean' ||
    String(typeof getEnv()) === 'undefined'
  ) {
    return rootResolve('env/.env')
  }
  return rootResolve(`env/.${getEnv()}.env`)
}

export const getConfig = () => config({ path: getEnvPath() }).parsed

export const logStats = (proc: string, data: any) => {
  let log = ''

  log += chalk.yellow.bold(
    `┏ ${proc} "编译过程" ${new Array(19 - proc.length + 1).join('-')}`,
  )
  log += '\n\n'

  if (typeof data === 'object') {
    data
      .toString({
        colors: true,
        chunks: false,
      })
      .split(/\r?\n/)
      .forEach((line) => {
        log += '  ' + line + '\n'
      })
  } else {
    log += `  ${data}\n`
  }

  log += '\n' + chalk.yellow.bold(`┗ ${new Array(28 + 1).join('-')}`) + '\n'
  console.log(log)
}

export const removeJunk = (chunk: string) => {
  // Example: 2018-08-10 22:48:42.866 Electron[90311:4883863] *** WARNING: Textured window <AtomNSWindow: 0x7fb75f68a770>
  if (
    /\d+-\d+-\d+ \d+:\d+:\d+\.\d+ Electron(?: Helper)?\[\d+:\d+] /.test(chunk)
  ) {
    return false
  }

  // Example: [90789:0810/225804.894349:ERROR:CONSOLE(105)] "Uncaught (in promise) Error: Could not instantiate: ProductRegistryImpl.Registry", source: chrome-devtools://devtools/bundled/inspector.js (105)
  if (/\[\d+:\d+\/|\d+\.\d+:ERROR:CONSOLE\(\d+\)\]/.test(chunk)) {
    return false
  }

  // Example: ALSA lib confmisc.c:767:(parse_card) cannot find card '0'
  if (/ALSA lib [a-z]+\.c:\d+:\([a-z_]+\)/.test(chunk)) {
    return false
  }

  return chunk
}

export const electronLog = (data: any, color: string) => {
  if (data) {
    let log = ''
    data = data.toString().split(/\r?\n/)
    data.forEach((line: string) => {
      log += `  ${line}\n`
    })
    console.log(
      chalk[color].bold(`┏ ------- 主进程日志 -----------`) +
        '\n\n' +
        log +
        chalk[color].bold('┗ -------------------------------') +
        '\n',
    )
  }
}

export interface CssLoaderOptions {
  lightningcssOptions: LightningcssLoaderOptions
  sourceMap: boolean
}

const cssLoaders = (options?: CssLoaderOptions) => {
  const { lightningcssOptions, sourceMap } = options ?? {}
  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap,
      esModule: false,
    },
  }

  const lightningcssLoader = {
    loader: 'builtin:lightningcss-loader',
    options: {
      ...lightningcssOptions,
    },
  }
  // 这里就是生成loader和其对应的配置
  const generateLoaders = (loader: string, loaderOptions?: any) => {
    const loaders = ['vue-style-loader', cssLoader, lightningcssLoader]

    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap,
        }),
      })
    }

    return loaders
  }
  return {
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus'),
  }
}

export const buildCssLoaders = (options?: CssLoaderOptions) => {
  const output: RuleSetRule[] = []
  const loaders = cssLoaders(options)

  for (const extension in loaders) {
    const loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader,
      type: 'javascript/auto',
    })
  }

  return output
}

export const createEnvPlugin = (
  otherEnv: Record<string, string> = {},
): RspackPluginInstance => {
  const baseEnv = Object.assign({}, getConfig())
  const clientEnvs = Object.fromEntries(
    Object.entries(baseEnv).map(([key, val]) => {
      return [`import.meta.env.${key}`, val]
    }),
  )
  const envs = Object.fromEntries(
    Object.entries({ ...clientEnvs, ...otherEnv }).map(([key, val]) => {
      return [key, JSON.stringify(val)]
    }),
  )
  return new rspack.DefinePlugin(envs)
}

export const workPath = join(__dirname, '..')
export const extensions = ['.mjs', '.ts', '.js', '.json', '.node']
export const tsConfig = join(workPath, 'tsconfig.json')

export interface DetailedError extends Error {
  details?: string
}
