<template>
  <div class="login-wrap">
    <div class="login-box">
      <div class="login-logo">🔬</div>
      <div class="login-title">병해충 AI 진단</div>
      <div class="login-sub">Groq AI · 실시간 카메라 진단</div>

      <!-- 비밀번호 찾기 모드 -->
      <div v-if="isForgot" class="login-form">
        <p style="font-size:13px;color:var(--text-3);text-align:center;line-height:1.6">
          가입한 이메일을 입력하면<br>비밀번호 재설정 링크를 보내드립니다.
        </p>
        <div class="field">
          <label>이메일</label>
          <input v-model="email" type="email" placeholder="이메일 입력" @keyup.enter="sendReset" />
        </div>
        <div v-if="error" :class="error.startsWith('✅') ? 'success-box' : 'error-box'">{{ error }}</div>
        <button class="btn btn-primary" :disabled="loading" @click="sendReset">
          {{ loading ? '전송 중...' : '재설정 링크 보내기' }}
        </button>
        <button class="toggle-btn" @click="isForgot=false; error=null">← 로그인으로</button>
      </div>

      <!-- 로그인 / 회원가입 모드 -->
      <div v-else class="login-form">
        <div class="field">
          <label>이메일</label>
          <input v-model="email" type="email" placeholder="이메일 입력" @keyup.enter="submit" />
        </div>
        <div class="field">
          <label>비밀번호</label>
          <input v-model="password" type="password" placeholder="비밀번호 입력" @keyup.enter="submit" />
        </div>

        <div v-if="error" :class="error.startsWith('✅') ? 'success-box' : 'error-box'">{{ error }}</div>

        <button class="btn btn-primary" :disabled="loading" @click="submit">
          <span v-if="loading" style="animation:spin 1s linear infinite;display:inline-block">⏳</span>
          {{ loading ? '처리 중...' : (isSignup ? '회원가입' : '로그인') }}
        </button>

        <button v-if="!isSignup" class="toggle-btn" style="color:var(--text-3)" @click="isForgot=true; error=null">
          비밀번호를 잊으셨나요?
        </button>
        <button class="toggle-btn" @click="isSignup = !isSignup; error=null">
          {{ isSignup ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입' }}
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
const email    = ref('')
const password = ref('')
const loading  = ref(false)
const error    = ref(null)
const isSignup = ref(false)
const isForgot = ref(false)

async function sendReset() {
  if (!email.value) { error.value = '이메일을 입력해주세요'; return }
  loading.value = true; error.value = null
  const { error: e } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: 'https://pest-ai-umber.vercel.app/reset-password'
  })
  loading.value = false
  error.value = e ? e.message : '✅ 재설정 링크를 이메일로 보냈습니다'
}

async function submit() {
  if (!email.value || !password.value) {
    error.value = '이메일과 비밀번호를 입력해주세요'
    return
  }
  loading.value = true
  error.value   = null

  try {
    if (isSignup.value) {
      const { error: e } = await supabase.auth.signUp({ email: email.value, password: password.value })
      if (e) throw e
      error.value = '✅ 가입 완료! 이메일 인증 후 로그인해주세요'
      isSignup.value = false
    } else {
      const { error: e } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
      if (e) throw e
      router.replace('/')
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg) } }

.login-wrap {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: var(--bg);
}
.login-box {
  width: 100%;
  max-width: 360px;
  background: var(--surface);
  border-radius: var(--radius);
  padding: 32px 24px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.login-logo  { font-size: 52px; margin-bottom: 4px; }
.login-title { font-size: 22px; font-weight: 700; }
.login-sub   { font-size: 12px; color: var(--text-3); margin-bottom: 12px; }

.login-form  { width: 100%; display: flex; flex-direction: column; gap: 12px; margin-top: 8px; }
.field       { display: flex; flex-direction: column; gap: 6px; }
label        { font-size: 13px; font-weight: 600; color: var(--text-2); }
input {
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border);
  font-size: 15px;
  background: var(--bg);
  color: var(--text);
  outline: none;
  transition: border-color .15s;
}
input:focus { border-color: var(--green); }

.error-box {
  background: var(--red-light);
  border: 1px solid var(--red);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  color: var(--red-dark);
  font-size: 13px;
}
.toggle-btn {
  background: none;
  border: none;
  color: var(--green);
  font-size: 13px;
  cursor: pointer;
  text-align: center;
  padding: 4px;
  text-decoration: underline;
}
.success-box {
  background: #e8f5ee;
  border: 1px solid var(--green);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  color: var(--green-dark);
  font-size: 13px;
}
</style>
