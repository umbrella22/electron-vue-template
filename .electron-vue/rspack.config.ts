import { Configuration, rspack } from '@rspack/core'
import { CreateLoader, CreatePlugins } from './tools'
import { join } from 'path'
import { VueLoaderPlugin } from 'vue-loader'
import { extensions, tsConfig, workPath } from './utils'

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

export const createMainConfig = ({
  env = 'development',
}: {
  env?: 'development' | 'none' | 'production'
}): Configuration => {
  const commonConfig = getCommonConfig(env)
  return {
    ...commonConfig,
    entry: join(workPath, 'src', 'main', 'index.ts'),
    output: {
      path: join(workPath, 'dist', 'electron', 'main'),
      filename: 'main.js',
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
    entry: join(workPath, 'src', 'preload', filename),
    output: {
      path: join(workPath, 'dist', 'electron', 'main'),
      filename: 'main-preload.js',
    },
    target: 'electron-preload',
  }
}

export const createRendererConfig = ({
  env = 'development',
  target = 'client',
}: {
  env?: 'development' | 'none' | 'production'
  target: 'web' | 'client'
}): Configuration => {
  const copyPath =
    target === 'client'
      ? join(workPath, 'dist', 'electron', 'renderer', 'public')
      : join(workPath, 'dist', 'web', 'public')
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
    .useDefaultEnvPlugin({
      // 如果不是ui组件库使用，强烈建议关闭
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    })
    .add(new VueLoaderPlugin())
    .add(
      new rspack.HtmlRspackPlugin({
        template: join(workPath, 'src', 'index.html'),
      }),
    )
    .add(
      env === 'production'
        ? new rspack.CopyRspackPlugin({
            patterns: [
              {
                from: join(workPath, 'src', 'renderer', 'public'),
                to: copyPath,
                globOptions: {
                  ignore: ['.*'],
                },
              },
            ],
          })
        : undefined,
    )
    .end()
  const commonConfig = getCommonConfig(env)
  return {
    ...commonConfig,
    entry: join(workPath, 'src', 'renderer', 'main.ts'),
    output: {
      path: join(workPath, 'dist', 'electron', 'renderer'),
      filename: '[name].js',
    },
    plugins,
    module: {
      rules,
    },
    experiments: {
      css: true,
    },
  }
}
