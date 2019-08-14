# Electron-Vue-template

> 这是一个基于electron的vue最基本的模板，其中前端技术栈则用到vue全家桶，axios作为http请求，而本地数据库则是nedb。现在合并了花裤衩的vue-admin中的东西,由于我司需求方面,所以侧栏的渲染比较新奇,侧栏样式是在` src/renderer/layout/components/sidebar `文件夹中,大家可以根据需求进行个性化更改,鄙人后续会将这个和花裤衩大大的同步.

- 因为花裤衩大大的ELECTRON版本已经一年没有更新了,而且ELECTRON,vue,elementui,都已经迭代太多,刚好我司有这方面的需求,我就在vue-electron脚手架生成的项目基础上,将花裤衩大大的项目核心组件提取出来合并到这个项目中，在我简单的封装了axios和db．以及electron常用的信息弹窗，错误弹窗，稍后的日子中我会慢慢完善这个文档，暂时如果有人需要使用这个项目，还请多多包含，因为文档不够完善，只能用过直接看代码，在路由页面我有注释．

#### 如何安装

``` bash
# 首先全局安装nrm
npm i -g nrm
# 然后使用nrm切换为淘宝源，或者你已经切换了npm的源也是可以的，强烈不建议使用cnpm如果你不想看到什么奇奇怪怪的爆红问题
nrm ls
nrm use taobao
# 安装依赖，这里有个问题，可能ELECTRON或者postcss会由于玄学原因安装失败，此时我推荐使用cnpm安装依赖然后！删除那个node_modules包，重新npm i，这样做的原因是
# ELECTRON只要下载了一次您自己没有清除缓存的话，就可以直接使用上次的安装包，这样通过cnpm安装完成之后，一定！要删除一次依赖包！一定哦！
# 再使用npm安装就会使用缓存了，免去那个魔法的过程～～
# 或者可以使用更加优秀的yarn。
npm install

# 启动之后，会在9080端口监听
# 需要重新运行一次此命令
npm run dev

# build命令在不同系统环境中，需要的的不一样，需要自己根据自身环境进行配置
npm run build


```


---

这个项目使用了 [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[8fae476](https://github.com/SimulatedGREG/electron-vue/tree/8fae4763e9d225d3691b627e83b9e09b56f6c935) using [vue-cli](https://github.com/vuejs/vue-cli). 文档你们可以在这里看到: [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
这是花裤衩大大原本的[地址](https://github.com/PanJiaChen/electron-vue-admin)