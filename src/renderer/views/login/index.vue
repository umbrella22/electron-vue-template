<template>
  <div class="login-container">
    <div class="login-from-box">
      <el-form class="login-form" autocomplete="on" :model="loginForm" :rules="loginRules" ref="loginFormRef"
        label-position="left">
        <h3 class="title">后台管理框架</h3>
        <el-form-item prop="username">
          <span class="svg-container svg-container_login">
            <svg-icon icon-class="user" />
          </span>
          <el-input name="username" type="text" v-model="loginForm.username" autocomplete="on" placeholder="用户名" />
        </el-form-item>
        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon icon-class="password"></svg-icon>
          </span>
          <el-input name="password" :type="pwdType" @keyup.enter.native="handleLogin" v-model="loginForm.password"
            autocomplete="on" placeholder="密码"></el-input>
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="pwdType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>
        <div class="login-btn">
          <button type="button" class="btn" @click="handleLogin">登录</button>
        </div>
        <div class="tips">
          <span style="margin-right:20px;">用户名: admin或者editor</span>
          <span>密码：随便什么都行</span>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { isvalidUsername } from "@/utils/validate";
import { useUserStore } from "@/store/user";
import { ref } from "vue"
import { useRouter } from "@/hooks/use-router";

const { login } = useUserStore()

const validateUsername = (rule, value, callback) => {
  if (!isvalidUsername(value)) {
    callback(new Error("请输入正确的用户名"));
  } else {
    callback();
  }
};
const validatePass = (rule, value, callback) => {
  if (value.length < 5) {
    callback(new Error("密码不能小于5位"));
  } else {
    callback();
  }
};

const loginForm = ref({
  username: "",
  password: "",
});
const loginFormRef = ref()
const loginRules = ref({
  username: [
    { required: true, trigger: "blur", validator: validateUsername },
  ],
  password: [
    { required: true, trigger: "blur", validator: validatePass },
  ],
});
const loading = ref(false);
const pwdType = ref("password");

const showPwd = () => {
  if (pwdType.value === "password") {
    pwdType.value = "";
  } else {
    pwdType.value = "password";
  }
};
const router = useRouter()
const handleLogin = () => {
  loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true;
      login(loginForm.value).then(() => {
        loading.value = false;
        router.push({ path: "/" }).catch((err) => { });
      }).catch(() => {
        loading.value = false;
      })
    } else {
      console.log("error submit!!");
      return false;
    }
  });
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
$bg: #2d3a4b;
$light_gray: #eee;
$dark_gray: #889aa4;
$light_gray: #eee;

/* reset element-ui css */
.login-container {
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  background-image: url("https://i.loli.net/2019/10/18/buDT4YS6zUMfHst.jpg");
  background-position: center;

  ::v-deep .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;

      &:-webkit-autofill {
        -webkit-box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: #fff !important;
      }
    }
  }

  ::v-deep .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }

  .login-from-box {
    position: relative;

    .login-form {
      position: absolute;
      left: 0;
      right: 0;
      width: 520px;
      padding: 35px 35px 15px 35px;
      margin: 120px auto;
      align-items: center;
      color: white;
      backdrop-filter: saturate(180%) blur(20px);
      background: rgba(0, 0, 0, .65);
      border-radius: 10px;
      box-shadow: 0 0.4px 0.6px rgba(0, 0, 0, 0.141),
        0 1px 1.3px rgba(0, 0, 0, 0.202), 0 1.9px 2.5px rgba(0, 0, 0, 0.25),
        0 3.4px 4.5px rgba(0, 0, 0, 0.298), 0 6.3px 8.4px rgba(0, 0, 0, 0.359),
        0 15px 20px rgba(0, 0, 0, .26);

      .login-btn {
        .btn {
          position: relative;
          width: 100%;
          padding: 6px 0;
          margin: 10px 0 36px 0;
          font-size: 1.2em;
          color: white;
          background: transparent;
          border: 2px solid hsla(204, 70%, 53%, 1);
          outline: none;
          cursor: pointer;
          overflow: hidden;
          transition: 0.5s;

          &::before {
            position: absolute;
            content: "";
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(120deg,
                transparent,
                hsla(204, 70%, 53%, 0.5),
                transparent);
            transform: translateX(-100%);
            transition: 0.5s;
          }

          &:hover {
            box-shadow: 0 0 20px 10px hsla(204, 70%, 53%, 0.5);
          }

          &:hover::before {
            transform: translateX(100%);
          }
        }
      }
    }

    .tips {
      font-size: 14px;
      color: #fff;
      margin-bottom: 10px;

      span {
        &:first-of-type {
          margin-right: 16px;
        }
      }
    }

    .svg-container {
      padding: 6px 5px 6px 15px;
      color: $dark_gray;
      vertical-align: middle;
      width: 30px;
      display: inline-block;

      &_login {
        font-size: 20px;
      }
    }

    .title {
      font-size: 26px;
      font-weight: 400;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }

    .show-pwd {
      position: absolute;
      right: 10px;
      top: 7px;
      font-size: 16px;
      color: $dark_gray;
      cursor: pointer;
      user-select: none;
    }
  }
}
</style>
