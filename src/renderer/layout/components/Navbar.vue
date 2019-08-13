<template>
  <el-menu class="navbar-header-fixed" mode="horizontal">
    <div class="top-right">
      <div class="hb-bd">
        <hamburger
          class="hamburger-container"
          :toggleClick="toggleSideBar"
          :isActive="sidebar.opened"
        ></hamburger>
        <breadcrumb></breadcrumb>
      </div>

      <div class="top-select">
        <div class="go-index">{{time}}</div>
        <div class="select-right">
          <el-dropdown trigger="click">
            <div>
              <el-image src="" class="avatar">
                <div slot="error" class="image-slot">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </el-image>
              <div class="el-dropdown-link">
                这里是用户名
                <i class="el-icon-arrow-down el-icon--right"></i>
              </div>
            </div>
            <el-dropdown-menu slot="dropdown">
              <router-link to="/">
                <el-dropdown-item>返回首页</el-dropdown-item>
              </router-link>
              <el-dropdown-item @click.native="change_user">
                <span>切换账号</span>
              </el-dropdown-item>
              <el-dropdown-item @click.native="LogOut">
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </div>
  </el-menu>
</template>

<script>
import { format } from "date-fns";
import { mapGetters } from "vuex";
import Breadcrumb from "@/components/Breadcrumb";
import Hamburger from "@/components/Hamburger";
export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  data: () => ({
    time: "",
  }),
  mounted() {
    this.set_time();
    this.timer = setInterval(() => {
      this.set_time();
    }, 60000);
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch("ToggleSideBar");
    },
    logout() {
      this.$store.dispatch("LogOut").then(() => {
        location.reload(); // 为了重新实例化vue-router对象 避免bug
      });
    },
    change_user() {
      this.$store.dispatch("LogOut").then(() => {
        this.$message({
          message: "退出成功",
          type: "success"
        });
        this.$router.push({ path: "/new/login", query: { to: "server" } });
      });
    },
    LogOut() {
      this.$store.dispatch("LogOut").then(() => {
        this.$message({
          message: "退出成功",
          type: "success"
        });
        this.$router.push("/");
      });
    },
    set_time() {
      this.time = format(new Date(), "YYYY/MM/DD HH:mm");
    }
  },
  computed: {
    ...mapGetters(["user_data", "sidebar"])
  },
  beforeDestroy() {
    console.log("销毁计时器------------");
    clearInterval(this.timer);
    this.timer = null;
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.navbar-header-fixed {
  transition: width 0.28s;
  width: calc(100% - 256px);
  display: flex;
  align-items: center;
  position: fixed;
  right: 0;
  z-index: 1002;
  height: 62px;
  .hamburger-container {
    line-height: 58px;
    height: 50px;
    float: left;
    padding: 0 10px;
  }
  .logo {
    width: 199px;
    height: 62px;
  }
  .top-right {
    display: flex;
    width: 100%;
    height: 100%;
    background-color: #ffffff;
    justify-content: space-between;
    padding: 0 19px;
    .hb-bd {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .avatar {
      width: 30px;
      height: 30px;
      margin-right: 10px;
      /deep/ img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }
    .top-select {
      display: flex;
      align-items: center;
      .go-index {
        color: #333333;
        font-weight: 400;
        margin-right: 20px;
        padding-right: 20px;
        border-right: 1px solid #cccccc;
      }
      .select-right /deep/ .el-dropdown > span {
        font-size: 6px;
      }
      .select-right {
        /deep/ .el-dropdown-link {
          color: #333333;
          font-weight: 400;
        }
        /deep/ .el-dropdown-selfdefine {
          display: flex;
          align-items: center;
        }
      }
    }
  }
}
</style>

