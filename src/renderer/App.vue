<template>
  <div id="app">
    <c-header></c-header>
    <transition name="fade" mode="out-in">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script setup>
import CHeader from "./components/title";

</script>

<style>
/* CSS */
</style>
