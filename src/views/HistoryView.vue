<template>
  <div>
    <div class="header">
      <div class="title">📋 진단 이력</div>
      <div class="subtitle">저장된 진단 결과 목록</div>
    </div>

    <div v-if="loading" class="loading">불러오는 중...</div>

    <div v-else-if="!rows.length" class="empty">
      <div style="font-size:48px;margin-bottom:12px">🔍</div>
      <div>아직 진단 이력이 없습니다</div>
    </div>

    <div v-else class="list">
      <div v-for="row in rows" :key="row.id" class="card history-card">
        <div class="hc-top">
          <div class="hc-disease">{{ row.disease }}</div>
          <span :class="['risk-badge', `risk-${row.risk}`]">{{ row.risk }} 위험</span>
        </div>
        <div class="hc-date">{{ formatDate(row.diagnosed_at) }}</div>
        <div class="hc-rec">{{ row.recommendation }}</div>
        <div v-if="row.chemicals?.length" class="pills" style="margin-top:8px">
          <span v-for="c in row.chemicals" :key="c" class="pill">{{ c }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase.js'

const rows    = ref([])
const loading = ref(true)

async function fetch() {
  loading.value = true
  const { data } = await supabase
    .from('pest_ai_history')
    .select('*')
    .order('diagnosed_at', { ascending: false })
    .limit(50)
  rows.value = data ?? []
  loading.value = false
}

function formatDate(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

onMounted(fetch)
</script>

<style scoped>
.header { text-align: center; padding: 8px 0 4px; }
.title  { font-size: 22px; font-weight: 700; }
.subtitle { font-size: 12px; color: var(--text-3); margin-top: 4px; }
.loading, .empty { text-align: center; padding: 60px 20px; color: var(--text-3); font-size: 15px; }
.list { display: flex; flex-direction: column; gap: 12px; }
.history-card { display: flex; flex-direction: column; gap: 6px; }
.hc-top { display: flex; align-items: center; justify-content: space-between; }
.hc-disease { font-size: 18px; font-weight: 700; }
.hc-date { font-size: 12px; color: var(--text-3); }
.hc-rec  { font-size: 13px; color: var(--text-2); line-height: 1.5; }
.risk-badge { font-size: 11px; font-weight: 700; padding: 2px 10px; border-radius: 99px; }
.risk-높음 { background: var(--red-light);   color: var(--red-dark);   border: 1px solid var(--red); }
.risk-중간 { background: var(--amber-light);  color: var(--amber-dark); border: 1px solid var(--amber); }
.risk-낮음 { background: var(--green-light);  color: var(--green-dark); border: 1px solid var(--green); }
.pills { display: flex; flex-wrap: wrap; gap: 5px; }
.pill  { background: var(--green-light); color: var(--green-dark); border: 1px solid var(--green); border-radius: 99px; padding: 2px 10px; font-size: 11px; font-weight: 600; }
</style>
