<template>
  <div class="login-wrap">
    <div class="login-box">
      <div class="login-logo">🔑</div>
      <div class="login-title">새 비밀번호 설정</div>

      <div class="login-form">
        <div class="field">
          <label>새 비밀번호</label>
          <input v-model="password" type="password" placeholder="6자 이상" />
        </div>
        <div class="field">
          <label>비밀번호 확인</label>
          <input v-model="confirm" type="password" placeholder="다시 입력" @keyup.enter="save" />
        </div>
        <div v-if="msg" :class="msg.startsWith('✅') ? 'success-box' : 'error-box'">{{ msg }}</div>
        <button class="btn btn-primary" :disabled="loading" @click="save">
          {{ loading ? '저장 중...' : '비밀번호 변경' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase.js'

const router   = useRouter()
const password = ref('')
const confirm  = ref('')
const loading  = ref(false)
const msg      = ref('')

async function save() {
  msg.value = ''
  if (password.value.length < 6)           { msg.value = '비밀번호는 6자 이상이어야 합니다'; return }
  if (password.value !== confirm.value)     { msg.value = '비밀번호가 일치하지 않습니다'; return }
  loading.value = true
  const { error } = await supabase.auth.updateUser({ password: password.value })
  loading.value = false
  if (error) { msg.value = error.message; return }
  msg.value = '✅ 비밀번호가 변경되었습니다. 로그인 페이지로 이동합니다...'
  setTimeout(() => router.replace('/login'), 2000)
}
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg) } }
.login-wrap {
  min-height: 100dvh; display: flex; align-items: center;
  justify-content: center; padding: 24px 16px; background: var(--bg);
}
.login-box {
  width: 100%; max-width: 360px; background: var(--surface); border-radius: var(--radius);
  padding: 32px 24px; box-shadow: var(--shadow); display: flex; flex-direction: column;
  align-items: center; gap: 6px;
}
.login-logo  { font-size: 52px; margin-bottom: 4px; }
.login-title { font-size: 22px; font-weight: 700; margin-bottom: 12px; }
.login-form  { width: 100%; display: flex; flex-direction: column; gap: 12px; }
.field       { display: flex; flex-direction: column; gap: 6px; }
label        { font-size: 13px; font-weight: 600; color: var(--text-2); }
input {
  padding: 12px 14px; border-radius: var(--radius-sm); border: 1.5px solid var(--border);
  font-size: 15px; background: var(--bg); color: var(--text); outline: none;
}
input:focus { border-color: var(--green); }
.error-box   { background: var(--red-light); border: 1px solid var(--red); border-radius: var(--radius-sm);
               padding: 10px 12px; color: var(--red-dark); font-size: 13px; }
.success-box { background: #e8f5ee; border: 1px solid var(--green); border-radius: var(--radius-sm);
               padding: 10px 12px; color: var(--green-dark); font-size: 13px; }
</style>
