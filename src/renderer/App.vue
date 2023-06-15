<template>
  <div>
    <c-header></c-header>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import CHeader from "./components/title";

</script>

<style>
/* CSS */
</style>
