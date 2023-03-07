<template>
  <div class="dashboard-container">
    <div class="dashboard-text">name:{{ name }}</div>
    <div class="dashboard-text">
      roles:<span v-for="role in roles" :key="role">{{ role }}</span>
    </div>
    <div v-if="roles[0] === 'admin'">
      <p>只有admin才可以看到这个</p>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "@/store/user";
const { name, roles } = useUserStore();
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }

  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
