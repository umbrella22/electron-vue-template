import type {
  RspackPluginFunction,
  RspackPluginInstance,
  RuleSetRule,
  DefinePluginOptions,
  WebpackPluginInstance,
  WebpackPluginFunction,
} from '@rspack/core'
import { buildCssLoaders, createEnvPlugin, CssLoaderOptions } from './utils'

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
