import { createApp } from "vue";
import { ipcRenderer } from "electron";

import App from "./App.vue";
import router from "./router";
import SvgIcon from "@renderer/components/SvgIcon/index.vue"; // svg组件
// 引用element
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./permission";
// 日志
import { errorHandler } from "./error";
import "./icons";
import "@renderer/styles/index.scss";

if (!process.env.IS_WEB) {
  ipcRenderer.invoke("IsUseSysTitle").then((res) => {
    if (!res) {
      require("@renderer/styles/custom-title.scss");
    }
  });
}
const app = createApp(App);

app.use(router);
app.use(ElementPlus);

errorHandler(app);

app.component("svg-icon", SvgIcon);
app.mount("#app");
