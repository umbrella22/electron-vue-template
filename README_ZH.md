# Electron-vue-template

![GitHub Repo stars](https://img.shields.io/github/stars/umbrella22/electron-vue-template)
[![vue](https://img.shields.io/badge/vue-3.5.8-brightgreen.svg)](https://github.com/vuejs/vue-next)
[![rspack](https://img.shields.io/badge/rspack-1.0.5-brightgreen.svg)](https://rspack.dev/index)
[![electron](https://img.shields.io/badge/electron-32.1.2-brightgreen.svg)](https://github.com/electron/electron)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/umbrella22/electron-vue-template/blob/master/LICENSE)

[国内访问地址](https://gitee.com/Zh-Sky/electron-vue-template)

### 请确保您的 node 版本大于等于 20.

#### 如何安装

```bash
npm config edit
# 该命令会打开npm的配置文件，请在空白处添加
# registry=https://registry.npmmirror.com
# ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
# ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/
# 然后关闭该窗口，重启命令行.
npm ci

# 启动之后，会在9080端口监听
npm run dev

# build命令在不同系统环境中，需要的的不一样，需要自己根据自身环境进行配置
npm run build

```

---

# [更新日志](/CHANGELOG.md)
