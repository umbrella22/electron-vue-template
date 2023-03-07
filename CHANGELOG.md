# 更新日志

# 2023 年 03 月 07 日

- 修复 pinia加载问题

# 2022 年 12 月 29 日

- 清理无用的 config 注入，现在环境变量将不再依赖于 `config` 文件，转而使用 env 文件夹中的 `.env` 在改文件内的所有内容均会注入到 `process.env.userConfig` 主进程和渲染进程同名

# 2022 年 06 月 10 日

- 当需要使用 jsx 时，关闭 esbuild

## 2021 年 08 月 26 日

- 添加对 jsx 的支持

## 2021 年 7 月 31 日

- 将 webpack 更新为 5，安装对应的 babel，在打包成 web 时，使用 babel 进行代码垫片设置。

## 2021 年 06 月 24 日

- `i18n` 新增对 `element-ui` 的支持

> 为保证 `element-ui` 正确国际化，请确保 `src/renderer/i18n/languages` 文件夹下的语言包名与 `element-ui` 的语言包名一致

## 2021 年 06 月 23 日

- 新增 [`i18n`](https://kazupon.github.io/vue-i18n/zh/) 支持

### 如何使用？

语言包存放在 `src/renderer/i18n/languages` 文件夹下，每种语言一个文件，新增语言包也无需手动引入

## 2021 年 06 月 22 日

- 尝试修复 mac 环境下窗口无法拖动问题

## 2021 年 09 月 01 日 （9 月？）

- 双分支添加 TERGET_ENV 标识，用于区分区分当前工作环境，如 test or alpha，beta，gamma；通过在`node .electron-vue/build.js`前添加`cross-env TERGET_ENV=test`，即可启用，相应的您应当在`config文件夹以及其index.js`文件中按照`development`对象写好相同的代码方可在主/渲染进程中使用`process.env.TERGET_ENV`来取得您的设置项。

## 2021 年 04 月 13 日

- **master 剔除了 babel 转使用 esbuild 对 js 和 css 进行压缩操作。**

## 2021 年 03 月 03 日

- 更新 electron 版本到 12（noLayOut 分支）

## 2021 年 02 月 26 日

- 添加 vite 版本，但并不合并到当前库中，请[前往对应库查看](https://gitee.com/Zh-Sky/electron-vite-template)

## 2021 年 02 月 08 日

- noLayOut 分支更新 webpack 版本到 5，并分别对所属依赖进行更新，在稍后的日子里，noLayOut 分支将跟进 vue3，感兴趣的小伙伴可以切换分支

## 2020 年 10 月 12 日

- 例行更新基础依赖，感谢 @jiumengs 贡献代码，修正删除数据库文件时，会发生多次监听。

## 2020 年 09 月 10 日

- 例行更新依赖，感谢 @BelinChung 贡献代码，修正 bug。

## 2020 年 04 月 30 日

- 添加内置服务端关闭方法，进一步简化登录流程；多窗口文档已就绪，服务端说明已补充。

## 2020 年 04 月 29 日

- 添加了路由多窗口示例，修复 web 打包，提升依赖；文档还未就绪

## 2020 年 02 月 09 日

- 添加[中文在线文档](https://umbrella22.github.io/electron-vue-template-doc/)，[国内访问地址](https://zh-sky.gitee.io/electron-vue-template-doc/)
- 剔除 win 打包依赖，因为太大了，将它放到码云的额外仓库中，[地址](https://gitee.com/Zh-Sky/HardToDownloadLib)

## 2020 年 02 月 06 日

- 激进分支更新至 8.0.0.

## 2020 年 01 月 09 日

- 例行更新依赖，在 dev 中加入了端口监听检测，如果 9080 端口被占用就会自动向后开启一个端口号并使用，同时在 config/index.js 的 dev 中加入了端口设置，可以快捷设置端口号而不用去更改 webpack 的配置了。

## 2019 年 12 月 18 日

- 我在 build 文件夹内添加了 windows 的打包依赖，在打包爆错的话，可以尝试使用/build/lib 内的压缩包，记得看使用说明哦~

## 2019 年 11 月 22 日

- 得益于群里老哥的提醒，通过修改系统环境变量得到了通过 yarn 下载 electron 失败的问题，具体操作如下：
  - 用户环境变量中新增两个个变量，一个是变量名为`ELECTRON_MIRROR`，变量值为`https://npm.taobao.org/mirrors/electron/`，另一个是变量名为`registry`，变量值为`https://registry.npm.taobao.org/`，然后系统变量中同样也加上这两个值，完成之后，删除 node_module 文件夹。然后执行 yarn install，如果还是提示未安装，那就去 electron 文件夹内执行一次 yarn install，就好了。这样的话，不仅仅只是 yarn 更快了，electron 的 rebuild 也会加速很多。所以推荐使用 yarn。
  - （优先尝试）使用 npm config edit 打开 npm 配置文件，添加上 electron_mirror=https://cdn.npm.taobao.org/dist/electron/ ，然后重启窗口删除 node_module 文件夹，重新安装依赖即可。

## 2019 年 11 月 19 日

- 更新了不使用 updater 进行全量更新的方法，但是该方法不会校验安装包 md5 值，也就是说，包如果被拦截了。。可能就会出问题，这一点我正在想办法处理。

## 2019 年 10 月 31 日

- 升级 electron 版本至 7，但是需要做一些修改，由于淘宝的问题，导致 electron 新的下载器出现故障，故我们需要对 electron 的下载器做一些更改，这非常容易，不用担心：
  - 首先我们在淘宝代理设置下，安装完成依赖，此时是报错的，现在进入项目的 node_modules 文件夹内找到 electron,点击进入，然后修改其中的 package.json 文件，修改 dependencies 对象中的依赖为：

```json
  "dependencies": {
    "@types/node": "^12.0.12",
    "extract-zip": "^1.0.3",
    "electron-download": "^4.1.0"
  },
```

- - 然后我们需要再修改 install.js 中的代码（实际就是 6 中的 install 代码）

```js
#!/usr/bin/env node

var version = require("./package").version;

var fs = require("fs");
var os = require("os");
var path = require("path");
var extract = require("extract-zip");
var download = require("electron-download");

var installedVersion = null;
try {
  installedVersion = fs
    .readFileSync(path.join(__dirname, "dist", "version"), "utf-8")
    .replace(/^v/, "");
} catch (ignored) {
  // do nothing
}

if (process.env.ELECTRON_SKIP_BINARY_DOWNLOAD) {
  process.exit(0);
}

var platformPath = getPlatformPath();

var electronPath =
  process.env.ELECTRON_OVERRIDE_DIST_PATH ||
  path.join(__dirname, "dist", platformPath);

if (installedVersion === version && fs.existsSync(electronPath)) {
  process.exit(0);
}

// downloads if not cached
download(
  {
    cache: process.env.electron_config_cache,
    version: version,
    platform: process.env.npm_config_platform,
    arch: process.env.npm_config_arch,
    strictSSL: process.env.npm_config_strict_ssl === "true",
    force: process.env.force_no_cache === "true",
    quiet: process.env.npm_config_loglevel === "silent" || process.env.CI,
  },
  extractFile
);

// unzips and makes path.txt point at the correct executable
function extractFile(err, zipPath) {
  if (err) return onerror(err);
  extract(zipPath, { dir: path.join(__dirname, "dist") }, function (err) {
    if (err) return onerror(err);
    fs.writeFile(
      path.join(__dirname, "path.txt"),
      platformPath,
      function (err) {
        if (err) return onerror(err);
      }
    );
  });
}

function onerror(err) {
  throw err;
}

function getPlatformPath() {
  var platform = process.env.npm_config_platform || os.platform();

  switch (platform) {
    case "darwin":
      return "Electron.app/Contents/MacOS/Electron";
    case "freebsd":
    case "linux":
      return "electron";
    case "win32":
      return "electron.exe";
    default:
      throw new Error(
        "Electron builds are not available on platform: " + platform
      );
  }
}
```

- - 然后执行 npm i 即可完成安装，至于打包的话，您可能需要去淘宝镜像手动下载并且放好位置，才能完成打包操作，不然依旧还是报下载错误的信息。

## 2019 年 10 月 18 日

- 不知不觉中倒也过去了一个月，啊哈哈这次更新给大家带来的是 updater 的示例，这依旧是个实验特性，所以在新分支中才可以使用，使用方式则是，安装依赖，
  - 运行 `npm run update:serve` 来启动这个 node 服务器，然后您如果想在 dev 的时候就看到效果需要先运行 build 拿到 `latest.yml`文件，然后将其更名为 `dev-app-update.yml` 放入`dist/electron`中，和`main.js`同级，然后你需要关闭或者排除 webpack 的自动清除插件(我已经屏蔽了，所以无需大家自己动手)，然后点击软件中的检查更新即可，记住当软件正在运行的时候，是无法应用安装的，所以您需要关闭之后方可安装。这并不是一个错误！

## 2019 年 09 月 18 日

- 修正生产环境时，没有正确去除控制台输出的问题，双分支例行更新依赖，修正 ui 部分颜色问题，日后准备使用 element 主题功能

## 2019 年 09 月 16 日

- 去除 easymock，直接粗暴更改登陆验证，如有需要请自行修改，例行更新新分支依赖，修正当自定义头部和系统头部互换时，布局不会做出相应变化的问题。

## 2019 年 09 月 03 日

- 修正了当 nodejs >= 12 时，出现 process 未定义的问题，新分支加入自定义头部，现在我们可以做出更 cooool~~的效果了。

## 2019 年 08 月 20 日

- 添加登录拦击，实现登录功能，在 dev 中加入关闭 ELECTRON 无用控制台输出，新分支例行更新依赖，加入生产环境屏蔽 f12 按键。

## 2019 年 08 月 13 日

- 将新分支的所有依赖均更新至最新（但是我觉得，babel 似乎有些东西不需要，还是保留着吧，日后测试后移除）依赖更新之后通过打包和 dev 测试

## 2019 年 08 月 12 日

- 添加一个新分支，该新分支后续将会持续保持 ELECTRON（包括其对应的辅助组件）的版本处于最新状态，去除了单元测试和一些无用的文件。master 分支中则是为路由添加新参数具体
  - 用途，详看路由中的注释

## 2019 年 08 月 10 日

- 添加各个平台的 build 脚本，当您直接使用 build 时，则会打包您当前操作系统对应的安装包，mac 需要在 macos 上才能进行打包，而 linux 打包 win 的话，需要 wine 的支持，否则会失败

## 2019 年 08 月 04 日

- 修正原 webpack 配置中没有将 config 注入的小问题，添加了拦截实例，修改了侧栏，侧栏需要底色的请勿更新，此更新可能会导致侧栏底色无法完全覆盖（待修正），添加 axios 接口示例，待测。

## 2019 年 08 月 01 日

- 将 node-sass 版本更新至最新版本，尝试修正由于 nodejs 环境是 12 版导致失败（注意！此次更新可能会导致 32 位系统或者 nodejs 版本低于 10 的用户安装依赖报错）去除路由表中重复路由，解决控制台无端报错问题。
