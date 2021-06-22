# Electron-Vue-template

> 这是一个基于 electron 的 vue 最基本的模板，其中前端技术栈则用到 vue 全家桶，axios 作为 http 请求，而本地数据库则是 nedb。现在合并了花裤衩的 vue-admin 中的东西侧栏样式是在`src/renderer/layout/components/sidebar`文件夹中,大家可以根据需求进行个性化更改,鄙人后续会将这个和花裤衩大大的同步.

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

> **请确保您的 node 环境是大于或等于 12**

#### 如何安装

```bash
# 首先全局安装nrm
npm i -g nrm
# 然后使用nrm切换为淘宝源，或者你已经切换了npm的源也是可以的，强烈不建议使用cnpm如果你不想看到什么奇奇怪怪的爆红问题
nrm ls
nrm use taobao
# 如果网络非常顺畅的情况下
npm install
# 如果网络出现一定的情况
# 建议不要使用cnpm，会出现各种玄学bug。您可以通过如下操作加快安装速度
npm install --registry=https://registry.npm.taobao.org
# 但是需要注意的是electron的本体下载并不是走这里所以还是要去设置一下
npm config edit
# 该命令会打开npm的配置文件，请在registry=https://registry.npm.taobao.org/下一行添加
# electron_mirror=https://cdn.npm.taobao.org/dist/electron/
# ELECTRON_BUILDER_BINARIES_MIRROR=http://npm.taobao.org/mirrors/electron-builder-binaries/
# 然后关闭该窗口，重启命令行，删除node_modules文件夹，并重新安装依赖即可
# 本地开发 启动项目
npm run dev 或 yarn de

```

---

这个项目使用了 [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[8fae476](https://github.com/SimulatedGREG/electron-vue/tree/8fae4763e9d225d3691b627e83b9e09b56f6c935) using [vue-cli](https://github.com/vuejs/vue-cli). 文档你们可以在这里看到: [这里](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
这是花裤衩大大原本的[地址](https://github.com/PanJiaChen/electron-vue-admin)

# [更新日志](CHANGELOG.md)
