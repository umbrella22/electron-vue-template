<template>
  <div class="upload-container">
    <el-button
      :style="{background:color,borderColor:color}"
      icon="el-icon-upload"
      size="mini"
      type="primary"
      @click=" dialogVisible=true"
    >上传图片</el-button>
    <el-dialog :visible.sync="dialogVisible">
      <el-upload
        ref="upload"
        :multiple="true"
        :file-list="fileList"
        :show-file-list="true"
        :on-remove="handleRemove"
        :on-success="handleSuccess"
        :before-upload="beforeUpload"
        :data="picPostData"
        class="editor-slide-upload"
        action="https://up-z2.qiniup.com/"
        list-type="picture-card"
        :limit="5"
      >
        <el-button size="small" type="primary">点击上传</el-button>
      </el-upload>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </el-dialog>
  </div>
</template>

<script>
// import { getToken } from 'api/qiniu'
import { checkPic } from "@util/picUtil.js";

export default {
  name: "EditorSlideUpload",
  props: {
    color: {
      type: String,
      default: "#1890ff"
    }
  },
  data() {
    return {
      dialogVisible: false,
      listObj: {},
      fileList: [],
      picPostData: {}
    };
  },
  methods: {
    checkAllSuccess() {
      return Object.keys(this.listObj).every(
        item => this.listObj[item].hasSuccess
      );
    },
    handleSubmit() {
      const arr = Object.keys(this.listObj).map(v => this.listObj[v]);
      console.log(arr);
      if (!this.checkAllSuccess()) {
        this.$message(
          "请等待所有图片上传完成，如果存在网络问题请刷新当前页重新上传"
        );
        return;
      }
      this.$emit("successCBK", arr);
      this.listObj = {};
      this.fileList = [];
      this.dialogVisible = false;
    },
    handleSuccess(response, file) {
      console.log("file", file);
      console.log("handleSuccess", response);
      const uid = file.uid;
      const objKeyArr = Object.keys(this.listObj);
      for (let i = 0, len = objKeyArr.length; i < len; i++) {
        if (this.listObj[objKeyArr[i]].uid === uid) {
          this.listObj[objKeyArr[i]].url = this.config.qiniuHost + response.key;
          this.listObj[objKeyArr[i]].hasSuccess = true;
          return;
        }
      }
    },
    handleRemove(file) {
      const uid = file.uid;
      const objKeyArr = Object.keys(this.listObj);
      for (let i = 0, len = objKeyArr.length; i < len; i++) {
        if (this.listObj[objKeyArr[i]].uid === uid) {
          delete this.listObj[objKeyArr[i]];
          return;
        }
      }
    },
    beforeUpload(file) {
      const _self = this;
      const _URL = window.URL || window.webkitURL;
      const fileName = file.uid;
      this.listObj[fileName] = {};
      return new Promise((resolve, reject) => {
        let Sync = async () => {
          try {
            let picKey = await checkPic(file, this.fileList.length, 1);
            if (picKey) {
              let token = await this.getRequest(
                "/qiniu/serveGetQiniuUpToken?key=" + picKey
              );
              console.log("picKey---", picKey, token);
              this.picPostData = token;
              const img = new Image();
              img.src = _URL.createObjectURL(file);
              img.onload = function() {
                _self.listObj[fileName] = {
                  hasSuccess: false,
                  uid: file.uid,
                  width: this.width,
                  height: this.height
                };
              };
              resolve(true);
            } else {
              reject(false);
              this.listObj = {};
            }
          } catch (error) {
            reject(false);
          }
        };
        Sync();
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.editor-slide-upload {
  margin-bottom: 20px;
  /deep/ .el-upload--picture-card {
    width: 100%;
  }
}
</style>
