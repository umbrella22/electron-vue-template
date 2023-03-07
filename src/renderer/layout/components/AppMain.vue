<template>
  <section class="app-main">
    <transition name="fade" mode="out-in">
      <router-view />
    </transition>
  </section>
</template>

<script setup>
import { defineComponent } from "vue";
defineComponent({
  name: "AppMain"
});
</script>
