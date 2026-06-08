<template>
  <div class="settings-wrap">

    <div class="card">
      <div class="sec-title">계정 정보</div>
      <div class="info-row">
        <span class="info-label">이메일</span>
        <span class="info-val">{{ email }}</span>
      </div>
    </div>

    <div class="card">
      <div class="sec-title">앱 정보</div>
      <div class="info-row">
        <span class="info-label">버전</span>
        <span class="info-val">0.1.0</span>
      </div>
      <div class="info-row">
        <span class="info-label">AI 모델</span>
        <span class="info-val">Llama 4 Scout (Groq)</span>
      </div>
    </div>

    <button class="btn btn-outline" style="width:100%" @click="logout">🚪 로그아웃</button>
    <button class="withdraw-btn" @click="showWithdraw = true">회원 탈퇴</button>

    <!-- 탈퇴 모달 -->
    <div v-if="showWithdraw" class="modal-overlay" @click.self="showWithdraw = false">
      <div class="modal-box">
        <div class="modal-title">⚠️ 회원 탈퇴</div>
        <p class="modal-desc">
          탈퇴 시 <strong style="color:var(--red)">모든 진단 이력이 삭제</strong>되며<br>복구할 수 없습니다.
        </p>
        <div class="field">
          <label>확인을 위해 <strong style="color:var(--red)">탈퇴</strong> 라고 입력하세요</label>
          <input v-model="confirmText" type="text" placeholder="탈퇴" />
        </div>
        <div v-if="withdrawError" class="error-box">⚠️ {{ withdrawError }}</div>
        <div class="modal-btns">
          <button class="btn btn-outline" style="flex:1" @click="showWithdraw = false">취소</button>
          <button class="btn" style="flex:1;background:var(--red);color:#fff" :disabled="withdrawing" @click="withdraw">
            {{ withdrawing ? '처리 중...' : '탈퇴하기' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase.js'

const router        = useRouter()
const email         = ref('')
const showWithdraw  = ref(false)
const confirmText   = ref('')
const withdrawError = ref('')
const withdrawing   = ref(false)

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  email.value = user?.email ?? ''
})

async function logout() {
  await supabase.auth.signOut()
  router.push('/login')
}

async function withdraw() {
  withdrawError.value = ''
  if (confirmText.value.trim() !== '탈퇴') {
    withdrawError.value = '"탈퇴" 라고 정확히 입력해주세요'; return
  }
  withdrawing.value = true
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('diagnoses').delete().eq('user_id', user.id)
    await supabase.rpc('delete_user').catch(() => {})
  }
  await supabase.auth.signOut()
  router.push('/login')
}
</script>

<style scoped>
.settings-wrap { display: flex; flex-direction: column; gap: 14px; }

.sec-title  { font-size: 12px; font-weight: 700; color: var(--text-3); text-transform: uppercase;
              letter-spacing: .06em; margin-bottom: 12px; }
.info-row   { display: flex; justify-content: space-between; align-items: center; padding: 6px 0;
              border-bottom: 1px solid var(--border); }
.info-row:last-child { border-bottom: none; }
.info-label { font-size: 14px; color: var(--text-2); }
.info-val   { font-size: 14px; font-weight: 500; max-width: 200px; overflow: hidden;
              text-overflow: ellipsis; white-space: nowrap; }

.withdraw-btn { background: none; border: none; color: var(--text-3); font-size: 13px;
                text-decoration: underline; cursor: pointer; text-align: center;
                padding: 4px; width: 100%; }
.withdraw-btn:hover { color: var(--red); }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4);
                 display: flex; align-items: center; justify-content: center; z-index: 200; padding: 24px; }
.modal-box     { background: var(--surface); border-radius: var(--radius); padding: 24px;
                 width: 100%; max-width: 360px; display: flex; flex-direction: column; gap: 14px; }
.modal-title   { font-size: 17px; font-weight: 700; }
.modal-desc    { font-size: 14px; color: var(--text-2); line-height: 1.7; }
.modal-btns    { display: flex; gap: 8px; }

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
</style>
