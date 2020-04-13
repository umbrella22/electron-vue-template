<template>
  <div id="app">
    <c-header></c-header>
    <transition name="fade" mode="out-in">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
import CHeader from "./components/title";
export default {
  components: { CHeader }
};
</script>

<style>
/* CSS */
</style>
