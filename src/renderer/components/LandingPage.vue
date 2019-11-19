<template>
  <div id="wrapper">
    <img id="logo" src="~@/assets/logo.png" alt="electron-vue" />
    <main>
      <div class="left-side">
        <span class="title">欢迎进入本框架</span>
        <system-information></system-information>
        <div v-if="textarray.length === 0">
          <span>{{text}}</span>
        </div>
        <div v-for="(itme,index) in textarray" :key="index" v-else>
          <span>{{itme._id}}</span>
          <span>{{itme.name}}</span>
          <span>{{itme.age}}</span>
        </div>
      </div>

      <div class="right-side">
        <div class="doc">
          <div class="title alt">您可以点击的按钮</div>
          <el-button type="primary" round @click="open()">控制台打印</el-button>
          <el-button type="primary" round @click="setdata">写入数据</el-button>
          <el-button type="primary" round @click="getdata">读取数据</el-button>
          <el-button type="primary" round @click="deledata">清除所有数据</el-button>
          <el-button type="primary" round @click="CheckUpdate('one')">检查更新</el-button>
          <el-button type="primary" round @click="CheckUpdate('two')">检查更新（第二种方法）</el-button>
        </div>
      </div>
    </main>
    <el-dialog
      title="进度"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      center
      width="14%"
      top="45vh"
    >
      <div class="conten">
        <el-progress
          type="dashboard"
          :percentage="percentage"
          :color="colors"
          :status="progressStaus"
        ></el-progress>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import SystemInformation from "./LandingPage/SystemInformation";
import api from "../tools/dialog";
import ipcApi from "../utils/ipcRenderer";
export default {
  name: "landing-page",
  components: { SystemInformation },
  data: () => ({
    text: "等待数据读取",
    newdata: {
      name: "yyy",
      age: "12"
    },
    textarray: [],
    percentage: 0,
    colors: [
      { color: "#f56c6c", percentage: 20 },
      { color: "#e6a23c", percentage: 40 },
      { color: "#6f7ad3", percentage: 60 },
      { color: "#1989fa", percentage: 80 },
      { color: "#5cb87a", percentage: 100 }
    ],
    dialogVisible: false,
    progressStaus: null,
    filePath: ""
  }),
  created() {},
  methods: {
    // 获取electron方法
    open() {
      console.log(this.$electron);
    },
    // 设置数据库的数据
    setdata() {
      this.$db
        .adddata(this.newdata)
        .then(res => this.getdata())
        .catch(err => console.log(err));
    },
    // 获取数据库的数据
    getdata() {
      this.$db
        .finddata()
        .then(res => {
          console.log(res);
          this.textarray = res;
          console.log(this.textarray);
        })
        .catch(err => console.log(err));
    },
    // 清空数据库的数据
    deledata() {
      // dialog为electron实例，data则是显示需要的参数，fun是需要执行的函数，此选项不是为必选的
      const dialog = this.$electron.remote.dialog;
      const data = {
        title: "清除数据",
        buttons: ["确定了！", "才不要，我手滑了"],
        noLink: true,
        message: "此操作会清空本地数据库中的所有数据，是否继续？"
      };
      const fun = this.$db.deleall({ name: "yyy" });
      api.MessageBox(dialog, data, fun).then(res => {
        this.getdata();
        this.$message({
          showClose: true,
          message: "成功删除" + res + "条",
          type: "success"
        });
      });
      // const data = {
      //   title:'发生致命错误',
      //   message:'?'
      // }
      // api.ErrorMessageBox(dialog,data)
    },
    CheckUpdate(data) {
      switch (data) {
        case "one":
          const dialog = this.$electron.remote.dialog;
          ipcApi.send("check-update");
          console.log("启动检查");
          ipcApi.on("UpdateMsg", (event, data) => {
            console.log(data);
            switch (data.state) {
              case -1:
                const msgdata = {
                  title: data.msg
                };
                api.MessageBox(dialog, msgdata);
                break;
              case 0:
                this.$message("正在检查更新");
                break;
              case 1:
                this.$message({
                  type: "success",
                  message: "已检查到新版本，开始下载"
                });
                this.dialogVisible = true;
                break;
              case 2:
                this.$message({ type: "success", message: "无新版本" });
                break;
              case 3:
                this.percentage = data.msg.percent.toFixed(1);
                break;
              case 4:
                this.progressStaus = "success";
                this.$alert("更新下载完成！", "提示", {
                  confirmButtonText: "确定",
                  callback: action => {
                    ipcApi.send("confirm-update");
                  }
                });
                break;

              default:
                break;
            }
          });
          break;
        case "two":
          console.log(111);
          ipcApi.send("satrt-download");
          ipcApi.on("confirm-download", (event, arg) => {
            if (arg) {
              this.dialogVisible = true;
            }
          });
          ipcApi.on("download-progress", (event, arg) => {
            this.percentage = Number(arg);
          });
          ipcApi.on("download-error", (event, arg) => {
            if (arg) {
              this.progressStaus = "exception";
              this.percentage = 40;
              this.colors = "#d81e06";
            }
          });
          ipcApi.on("download-done", (event, age) => {
            this.filePath = age.filePath;
            this.progressStaus = "success";
            this.$alert("更新下载完成！", "提示", {
              confirmButtonText: "确定",
              callback: action => {
                this.$electron.shell.openItem(this.filePath);
              }
            });
          });
          break;

        default:
          break;
      }
    },
    handleClose() {
      this.dialogVisible = false;
    }
  }
};
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Source Sans Pro", sans-serif;
}

#wrapper {
  background-color: #d1d1d1ab;
  padding: 60px 80px;
}

#logo {
  height: auto;
  margin-bottom: 20px;
  width: 420px;
}

main {
  display: flex;
  justify-content: space-between;
}

main > div {
  flex-basis: 50%;
}

.left-side {
  display: flex;
  flex-direction: column;
}

.welcome {
  color: #555;
  font-size: 23px;
  margin-bottom: 10px;
}

.title {
  color: #2c3e50;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 6px;
}

.title.alt {
  font-size: 18px;
  margin-bottom: 10px;
}

.doc p {
  color: black;
  margin-bottom: 10px;
}
.conten {
  text-align: center;
}
</style>