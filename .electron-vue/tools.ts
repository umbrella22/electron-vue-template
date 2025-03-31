import {
  type RspackPluginFunction,
  type RspackPluginInstance,
  type RuleSetRule,
  type DefinePluginOptions,
  type WebpackPluginInstance,
  type WebpackPluginFunction,
  type LightningcssLoaderOptions,
  rspack,
} from '@rspack/core'
import { getConfig } from './utils'

type ListItemType =
  | RspackPluginInstance
  | RspackPluginFunction
  | RuleSetRule
  | WebpackPluginInstance
  | WebpackPluginFunction

export class BaseCreate<T extends ListItemType> {
  protected list: T[] = []

  add(item: T | undefined): this {
    item && this.list.push(item)
    return this
  }

  end(): T[] {
    return this.list
  }
}

export class CreateLoader extends BaseCreate<RuleSetRule> {
  private defaultScriptLoader: RuleSetRule = {
    test: /\.m?[jt]s$/,
    exclude: [/node_modules/],
    loader: 'builtin:swc-loader',
    options: {
      jsc: {
        parser: {
          syntax: 'typescript',
        },
      },
    },
    type: 'javascript/auto',
  }
  private defaultResourceLoader: RuleSetRule[] = [
    {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      type: 'asset/resource',
    },
    {
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
      type: 'asset/resource',
    },
    {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      type: 'asset/resource',
    },
  ]

  useDefaultCssLoader(options?: CssLoaderOptions): this {
    const defaultCssLoader = buildCssLoaders(options)
    defaultCssLoader.forEach((item) => this.add(item))
    return this
  }

  useDefaultScriptLoader(): this {
    this.add(this.defaultScriptLoader)
    return this
  }
  useDefaultResourceLoader(): this {
    this.defaultResourceLoader.forEach((item) => this.add(item))
    return this
  }
}

export class CreatePlugins extends BaseCreate<
  | RspackPluginInstance
  | RspackPluginFunction
  | WebpackPluginInstance
  | WebpackPluginFunction
> {
  useDefaultEnvPlugin(otherEnv?: DefinePluginOptions): this {
    this.add(createEnvPlugin(otherEnv))
    return this
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
    sass: generateLoaders('sass', {
      indentedSyntax: true,
      api: 'modern-compiler',
    }),
    scss: generateLoaders('sass', { api: 'modern-compiler' }),
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
  otherEnv: DefinePluginOptions = {},
): RspackPluginInstance => {
  const baseEnv = Object.assign({}, getConfig())
  const clientEnvs = Object.fromEntries(
    Object.entries(baseEnv).map(([key, val]) => {
      return [`import.meta.env.${key}`, JSON.stringify(val)]
    }),
  )
  const envs = Object.fromEntries(
    Object.entries({ ...clientEnvs, ...otherEnv }).map(([key, val]) => {
      return [key, val]
    }),
  )
  return new rspack.DefinePlugin(envs)
}
