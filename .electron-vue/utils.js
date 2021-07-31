'use strict'
const MiniCssPlugin = require('mini-css-extract-plugin');

exports.cssLoaders = function (options) {
    options = options || {}
    const esbuildCss = {
        loader: 'esbuild-loader',
        options: {
            loader: 'css',
            minify: options.minifyCss
        }
    }

    const cssLoader = {
        loader: 'css-loader',
        options: {
            sourceMap: options.sourceMap,
            esModule: false
        }
    }

    const postcssLoader = {
        loader: 'postcss-loader',
        options: {
            sourceMap: options.sourceMap
        }
    }

    // 这里就是生成loader和其对应的配置
    function generateLoaders(loader, loaderOptions) {
        const loaders = [cssLoader, postcssLoader, esbuildCss]

        if (loader) {
            loaders.push({
                loader: loader + '-loader',
                options: Object.assign({}, loaderOptions, {
                    sourceMap: options.sourceMap
                })
            })
        }

        // 当配置信息中开启此项时，启用css分离压缩
        // 这一项在生产环境时，是默认开启的
        if (options.extract) {
            return [MiniCssPlugin.loader].concat(loaders)
        } else {
            // 如果不开启则让vue-style-loader来处理
            return ['vue-style-loader'].concat(loaders)
        }
    }

    // https://vue-loader.vuejs.org/en/configurations/extract-css.html
    return {
        css: generateLoaders(),
        postcss: generateLoaders(),
        less: generateLoaders('less'),
        sass: generateLoaders('sass', { indentedSyntax: true }),
        scss: generateLoaders('sass'),
        stylus: generateLoaders('stylus'),
        styl: generateLoaders('stylus')
    }
}

// 根据上面的函数遍历出来的各个css预处理器的loader进行最后的拼装
exports.styleLoaders = function (options) {
    const output = []
    const loaders = exports.cssLoaders(options)


    for (const extension in loaders) {
        const loader = loaders[extension]
        output.push({
            test: new RegExp('\\.' + extension + '$'),
            use: loader
        })
    }

    return output
}
