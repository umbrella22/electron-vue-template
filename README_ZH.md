# Electron-Vue-template

> 这是一个基于 electron 的 vue 最基本的模板，其中前端技术栈则用到 vue 全家桶，axios 作为 http 请求，而本地数据库则是 nedb。现在合并了花裤衩的 vue-admin 中的东西侧栏样式是在`src/renderer/layout/components/sidebar`文件夹中,大家可以根据需求进行个性化更改.

- 因为花裤衩大大的 ELECTRON 版本已经一年没有更新了,而且 ELECTRON,vue,elementui,都已经迭代太多,刚好我司有这方面的需求,我就在 vue-electron 脚手架生成的项目基础上,将花裤衩大大的项目核心组件提取出来合并到这个项目中，在我简单的封装了 axios 和 db．以及 electron 常用的信息弹窗，错误弹窗，具体文档地址：[中文在线文档](https://umbrella22.github.io/electron-vue-template-doc/)，[国内访问地址](https://zh-sky.gitee.io/electron-vue-template-doc/)。

> **请注意，在 2021 年 4 月 13 日的更新之后，将使用 esbuild 替换 babel，如对 babel 有强需求的小伙伴请勿更新。**

- vite 版本 [electron-vite-template](https://github.com/umbrella22/electron-vite-template)

- [electron-vite-template（码云）](https://gitee.com/Zh-Sky/electron-vite-template)

- react 版 [Electron-react-template](https://github.com/umbrella22/electron-react-template)

<div align="center" >
  <span>测试打包状态：</span>
  <a href="https://github.com/umbrella22/electron-vue-template">
    <img src="https://github.com/umbrella22/electron-vue-template/actions/workflows/build-test.yml/badge.svg">
  </a>
</div>

> ### **请确保您的 node 环境是大于或等于 16**

#### 如何安装

```bash
npm config edit
# 该命令会打开npm的配置文件，请在空白处添加，此操作是配置淘宝镜像。
# ELECTRON_BUILDER_BINARIES_MIRROR=http://npm.taobao.org/mirrors/electron-builder-binaries/
# electron_mirror=https://cdn.npm.taobao.org/dist/electron/
# registry=https://registry.npm.taobao.org/
#### 当上面的配置在控制台输出404时，请手动替换成下面的配置。
# registry=https://registry.npmmirror.com
# ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
# ELECTRON_CUSTOM_DIR="{{ version }}"
# ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/
# 然后关闭该窗口，重启命令行.
# 使用yarn安装
yarn or yarn install

# 启动之后，会在9080端口监听
yarn dev

# build命令在不同系统环境中，需要的的不一样，需要自己根据自身环境进行配置
yarn build

```

---

## 启动逻辑图

<img src="启动逻辑图.jpg">

# [更新日志](CHANGELOG.md)
