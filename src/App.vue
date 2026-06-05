<template>
  <div class="app-wrap">
    <router-view class="page-content" />
    <nav class="tab-bar">
      <button class="tab-item" :class="{ active: route.path === '/' }" @click="router.push('/')">
        <span class="tab-icon">🔬</span>
        진단
      </button>
      <button class="tab-item" :class="{ active: route.path === '/history' }" @click="router.push('/history')">
        <span class="tab-icon">📋</span>
        이력
      </button>
    </nav>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
</script>

<style scoped>
.app-wrap { display: flex; flex-direction: column; min-height: 100dvh; }
.page-content { flex: 1; padding: 16px; padding-bottom: calc(72px + env(safe-area-inset-bottom)); display: flex; flex-direction: column; gap: 14px; }
</style>
