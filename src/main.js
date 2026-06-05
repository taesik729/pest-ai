import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import DiagnoseView from './views/DiagnoseView.vue'
import HistoryView from './views/HistoryView.vue'
import './style.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: DiagnoseView },
    { path: '/history', component: HistoryView },
  ]
})

createApp(App).use(router).mount('#app')
