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
npm install or yarn install

# 启动之后，会在9080端口监听
# 需要重新运行一次此命令
npm run dev

# build命令在不同系统环境中，需要的的不一样，需要自己根据自身环境进行配置
npm run build

# 启动单元测试模块,但是需要注意的是,我没有更新依赖,所以很可能会导致失败
npm test
# 如若实在不行无法安装electron依赖，请使用
npm config edit
# 该命令会打开npm的配置文件，请在registry=https://registry.npm.taobao.org/这行代码后的下一行添加
# electron_mirror=https://cdn.npm.taobao.org/dist/electron/  和  sass_binary_site=https://npm.taobao.org/mirrors/node-sass/
# 然后关闭该窗口，重启命令行，删除node_modules文件夹，并重新安装依赖即可

```

---

这个项目使用了 [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[8fae476](https://github.com/SimulatedGREG/electron-vue/tree/8fae4763e9d225d3691b627e83b9e09b56f6c935) using [vue-cli](https://github.com/vuejs/vue-cli). 文档你们可以在这里看到: [这里](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
这是花裤衩大大原本的[地址](https://github.com/PanJiaChen/electron-vue-admin)

# 更新日志
- 2020年02月06日更新：提升electron版本至7.1.11
- 2019年12月18日更新：例行更新了依赖，以及，我在build文件夹中加入了windows打包时候可能会用到的依赖，具体使用方法在压缩包内。
- 2019年11月11日更新：祝大家光棍节钱包快乐~~，今天的更新没有什么亮点，都是针对依赖的升级，新功能的添加可能会进入一个冷淡期，我现在也没有了好点子，也要步入学习了，可能master分支以后就是稳定的更新依赖，而另一个分支的话，则是我的一些觉得大家都会遇到的一些小问题，我尽量都实现出来。
- 2019年10月18日更新：不知不觉中倒也过去了一个月，啊哈哈这次更新给大家带来的是updater的示例，这依旧是个实验特性，所以在新分支中才可以使用，使用方式则是，安装依赖，
运行 `npm run update:serve` 来启动这个node服务器，然后您如果想在dev的时候就看到效果需要先运行build拿到 `latest.yml`文件，然后将其更名为 `dev-app-update.yml` 放入`dist/electron`中，和`main.js`同级，然后你需要关闭或者排除webpack的自动清除插件(我已经屏蔽了，所以无需大家自己动手)，然后点击软件中的检查更新即可，记住当软件正在运行的时候，是无法应用安装的，所以您需要关闭之后方可安装。这并不是一个错误！

- 2019年9月18日更新：修正生产环境时，没有正确去除控制台输出的问题，双分支例行更新依赖，修正ui部分颜色问题，日后准备使用element主题功能
- 2019年9月16日更新：去除easymock，直接粗暴更改登陆验证，如有需要请自行修改，例行更新新分支依赖，修正当自定义头部和系统头部互换时，布局不会做出相应变化的问题。
- 2019年9月3日更新：修正了当nodejs >= 12时，出现process未定义的问题，新分支加入自定义头部，现在我们可以做出更cooool~~的效果了。
- 2019年8月20日更新：添加登录拦击，实现登录功能，在dev中加入关闭ELECTRON无用控制台输出，新分支例行更新依赖，加入生产环境屏蔽f12按键。
- 2019年8月13日更新：将新分支的所有依赖均更新至最新（但是我觉得，babel似乎有些东西不需要，还是保留着吧，日后测试后移除）依赖更新之后通过打包和dev测试
- 2019年8月12日更新：添加一个新分支，该新分支后续将会持续保持ELECTRON（包括其对应的辅助组件）的版本处于最新状态，去除了单元测试和一些无用的文件。master分支中则是为路由添加新参数具体
用途，详看路由中的注释
- 2019年8月10日更新：添加各个平台的build脚本，当您直接使用build时，则会打包您当前操作系统对应的安装包，mac需要在macos上才能进行打包，而linux打包win的话，需要wine的支持，否则会失败
- 2019年8月4日更新：修正原webpack配置中没有将config注入的小问题，添加了拦截实例，修改了侧栏，侧栏需要底色的请勿更新，此更新可能会导致侧栏底色无法完全覆盖（待修正），添加axios接口示例，待测。
- 2019年8月1日更新：将node-sass版本更新至最新版本，尝试修正由于nodejs环境是12版导致失败（注意！此次更新可能会导致32位系统或者nodejs版本低于10的用户安装依赖报错）去除路由表中重复路由，解决控制台无端报错问题。




This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[8fae476](https://github.com/SimulatedGREG/electron-vue/tree/8fae4763e9d225d3691b627e83b9e09b56f6c935) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
