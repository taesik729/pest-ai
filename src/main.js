import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import DiagnoseView from './views/DiagnoseView.vue'
import HistoryView from './views/HistoryView.vue'
import LoginView from './views/LoginView.vue'
import SettingsView from './views/SettingsView.vue'
import ResetPasswordView from './views/ResetPasswordView.vue'
import PrivacyView from './views/PrivacyView.vue'
import { supabase } from './supabase.js'
import './style.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login',          component: LoginView,         meta: { public: true } },
    { path: '/reset-password', component: ResetPasswordView, meta: { public: true } },
    { path: '/privacy',        component: PrivacyView,       meta: { public: true } },
    { path: '/',               component: DiagnoseView },
    { path: '/history',        component: HistoryView },
    { path: '/settings',       component: SettingsView },
  ]
})

// 라우터 가드 — 미로그인 시 /login으로
router.beforeEach(async (to) => {
  if (to.meta.public) return true
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return '/login'
})

createApp(App).use(router).mount('#app')
