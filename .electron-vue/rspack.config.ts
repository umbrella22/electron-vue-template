import { resolve } from 'path'
import { Configuration, rspack } from '@rspack/core'
import { CreateLoader, CreatePlugins } from './tools'
import { VueLoaderPlugin } from 'vue-loader'

const workPath = resolve(__dirname, '..')
const extensions = ['.mjs', '.ts', '.js', '.json', '.node']

const tsConfig = resolve(workPath, 'tsconfig.json')
const alias = {
  '@main': resolve(workPath, 'src', 'main'),
  '@renderer': resolve(workPath, 'src', 'renderer'),
}

const getCommonConfig = (
  env: 'development' | 'none' | 'production',
): Configuration => {
  const loaderHelper = new CreateLoader()
  const pluginHelper = new CreatePlugins()

  const rules = loaderHelper.useDefaultScriptLoader().end()
  const plugins = pluginHelper.useDefaultEnvPlugin().end()

  return {
    mode: env,
    resolve: {
      extensions,
      tsConfig,
    },
    plugins,
    module: {
      rules,
    },
  }
}

export const createMainConfig = (
  env: 'development' | 'none' | 'production' = 'development',
): Configuration => {
  const commonConfig = getCommonConfig(env)
  return {
    ...commonConfig,
    entry: resolve(workPath, 'src', 'main', 'index.ts'),
    output: {
      path: resolve(workPath, 'dist', 'electron', 'main'),
      filename: '[name].js',
    },
    target: 'electron-main',
  }
}

export const createPreloadConfig = ({
  env = 'development',
  filename,
}: {
  env?: 'development' | 'none' | 'production'
  filename: string
}): Configuration => {
  const commonConfig = getCommonConfig(env)
  return {
    ...commonConfig,
    entry: resolve(workPath, 'src', 'preload', filename),
    output: {
      path: resolve(workPath, 'dist', 'electron', 'preload'),
      filename: '[name].js',
    },
    target: 'electron-preload',
  }
}

export const createRendererConfig = (
  env: 'development' | 'none' | 'production' = 'development',
): Configuration => {
  const loaderHelper = new CreateLoader()
  const pluginHelper = new CreatePlugins()

  const rules = loaderHelper
    .useDefaultResourceLoader()
    .useDefaultScriptLoader()
    .useDefaultCssLoader()
    .add({
      test: /\.vue$/,
      loader: 'vue-loader',
      options: {
        experimentalInlineMatchResource: true,
      },
    })
    .end()
  const plugins = pluginHelper
    .useDefaultEnvPlugin()
    .add(new VueLoaderPlugin())
    .add(
      new rspack.HtmlRspackPlugin({
        template: resolve(workPath, 'src', 'index.html'),
      }),
    )
    .end()
  const commonConfig = getCommonConfig(env)

  return {
    ...commonConfig,
    target: 'electron-renderer',
    entry: resolve(workPath, 'src', 'renderer', 'main.ts'),
    output: {
      path: resolve(workPath, 'dist', 'electron', 'renderer'),
      filename: '[name].js',
    },
    plugins,
    module: {
      rules,
    },
  }
}
