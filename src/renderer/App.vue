<template>
  <div id="app">
    <c-header></c-header>
    <router-view></router-view>
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
