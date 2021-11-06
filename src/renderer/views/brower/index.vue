<template>
  <div class="app-container">
      <div style="margin-top:5px; padding:2px;">
            <div>
                <webview  src="https://zh-sky.gitee.io/electron-vue-template-doc/Overview/#%E5%8A%9F%E8%83%BD"   ></webview>
            </div>
      </div>
  </div>
</template>
<script>
import { shell } from "electron";

export default {
  data(){
      return{
      }
  },
  components: {},

  mounted() {
    this.onload();
  },
  methods: {
      onload(){
          const webview = document.querySelector('webview');
                webview.addEventListener('dom-ready',(e)=>{
                    console.log(e)
                })
                webview.addEventListener("did-start-loading", ()=> {
                    console.log("did-start-loading...","开始加载事件监听");
                })
                webview.addEventListener("did-stop-loading", ()=> {
                    console.log("did-stop-loading...","停止加载事件监听");
                    //注入css
                    // webview.insertCSS(`
                    // body {
                    //     background: #fa0000 !important;
                    // }
                    // `)
                    //注入js脚本
                    // webview.executeJavaScript(`
                    //     setTimeout(()=>{
                    //         console.log("打印", document.querySelector(".cc-cd-cb-l") )
                    //         alert(document.querySelector(".cc-cd-cb-l").innerHTML)
                    //     }, 2000);
                    // `)
                        
                })
                webview.addEventListener("new-window",(e) => { 
                    const protocol = require('url').parse(e.url).protocol
                        if (protocol === 'http:' || protocol === 'https:') {
                            shell.openExternal(e.url)
                        }
                    
                    console.log('new-window',e)
                })
      }
  }
}
</script>
<style >
  webview {
    width:100%;
    height:800px;
  }
</style>
