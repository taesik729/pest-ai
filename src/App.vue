<template>
  <div class="app-wrap">
    <router-view class="page-content" />

    <!-- 탭바 (로그인 화면에서는 숨김) -->
    <nav v-if="session" class="tab-bar">
      <button class="tab-item" :class="{ active: route.path === '/' }" @click="router.push('/')">
        <span class="tab-icon">🔬</span>
        진단
      </button>
      <button class="tab-item" :class="{ active: route.path === '/history' }" @click="router.push('/history')">
        <span class="tab-icon">📋</span>
        이력
      </button>
      <button class="tab-item" :class="{ active: route.path === '/settings' }" @click="router.push('/settings')">
        <span class="tab-icon">⚙️</span>
        설정
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from './supabase.js'
import { initAdMob, showBanner, hideBanner } from './composables/useAdMob.js'

const route   = useRoute()
const router  = useRouter()
const session = ref(null)

onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  session.value = data.session

  supabase.auth.onAuthStateChange((_, s) => {
    session.value = s
    if (!s) router.push('/login')
  })

  // AdMob 초기화
  await initAdMob()
})

// 로그인 상태 변경 시 배너 표시/숨김
watch(session, async (newSession) => {
  if (newSession) {
    await showBanner()
  } else {
    await hideBanner()
  }
})

async function logout() {
  await supabase.auth.signOut()
  router.push('/login')
}
</script>

<style scoped>
.app-wrap { display: flex; flex-direction: column; min-height: 100dvh; }
.page-content { flex: 1; padding: 16px; padding-bottom: calc(72px + env(safe-area-inset-bottom)); display: flex; flex-direction: column; gap: 14px; }
</style>
