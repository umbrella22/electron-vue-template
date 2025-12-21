<template>
  <div class="bg-body">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style scoped lang="scss">
.bg-body {
  padding-top: 30px; /* Account for custom title bar */
  width: 100vw;
}
</style>
