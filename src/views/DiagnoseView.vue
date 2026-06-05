<template>
  <div>
    <!-- 헤더 -->
    <div class="header">
      <div class="title">🔬 병해충 AI 진단</div>
      <div class="subtitle">Groq AI · 실시간 카메라 진단</div>
    </div>

    <!-- 카메라 / 이미지 영역 -->
    <div class="card camera-card">
      <!-- 실시간 카메라 스트리밍 -->
      <div v-if="mode === 'camera'" class="camera-wrap">
        <video ref="videoEl" class="camera-video" autoplay playsinline muted></video>
        <div class="camera-overlay">
          <div class="camera-frame"></div>
        </div>
        <div class="camera-controls">
          <button class="ctrl-btn" @click="flipCamera" title="카메라 전환">🔄</button>
          <button class="shutter-btn" @click="capturePhoto">📷</button>
          <button class="ctrl-btn" @click="openGallery" title="갤러리">🖼</button>
        </div>
      </div>

      <!-- 캡처된 이미지 미리보기 -->
      <div v-else-if="imageUrl" class="preview-wrap">
        <img :src="imageUrl" class="preview-img" alt="진단 이미지" />
        <button class="retake-btn" @click="startCamera">
          ↩ 다시 찍기
        </button>
      </div>

      <!-- 초기 상태 -->
      <div v-else class="placeholder" @click="startCamera">
        <div class="placeholder-icon">📷</div>
        <div class="placeholder-text">탭하여 카메라 시작</div>
        <div class="placeholder-sub">또는 갤러리에서 선택</div>
        <button class="btn btn-outline" style="margin-top:14px;width:auto;padding:10px 24px" @click.stop="openGallery">
          🖼 갤러리에서 선택
        </button>
      </div>
    </div>

    <!-- 갤러리 input (숨김) -->
    <input ref="galleryInput" type="file" accept="image/*" style="display:none" @change="onGalleryFile" />
    <!-- 캔버스 (캡처용, 숨김) -->
    <canvas ref="canvasEl" style="display:none"></canvas>

    <!-- 진단 버튼 -->
    <button class="btn btn-primary" :disabled="!imageFile || diagnosing" @click="diagnose">
      <span v-if="diagnosing" style="animation:spin 1s linear infinite;display:inline-block">⏳</span>
      <span v-else">🔬</span>
      {{ diagnosing ? 'AI 분석 중...' : '진단 시작' }}
    </button>

    <!-- 오류 -->
    <div v-if="error" class="error-box">⚠️ {{ error }}</div>

    <!-- 결과 -->
    <div v-if="result" class="card result-card">
      <div class="result-header">
        <span class="result-title">진단 결과</span>
        <span :class="['risk-badge', `risk-${result.risk}`]">{{ result.risk }} 위험</span>
      </div>

      <div class="disease-row">
        <span class="disease-name">{{ result.disease }}</span>
        <span v-if="result.type" :class="['type-badge', `type-${result.type}`]">{{ result.type }}</span>
      </div>

      <div class="section">
        <div class="section-label">👁 관찰된 증상</div>
        <div class="section-text">{{ result.symptoms_found }}</div>
      </div>

      <div class="section">
        <div class="section-label">🛡 방제 권고</div>
        <div class="section-text">{{ result.recommendation }}</div>
      </div>

      <div v-if="result.chemicals?.length" class="section">
        <div class="section-label">🧪 추천 약제</div>
        <div class="pills">
          <span v-for="c in result.chemicals" :key="c" class="pill">{{ c }}</span>
        </div>
      </div>

      <div class="confidence">AI 진단 신뢰도: <strong>{{ result.confidence }}</strong> · 참고용, 전문가 확인 권장</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '../supabase.js'

const videoEl    = ref(null)
const canvasEl   = ref(null)
const galleryInput = ref(null)

const mode       = ref('idle')   // idle | camera | preview
const imageFile  = ref(null)
const imageUrl   = ref(null)
const diagnosing = ref(false)
const result     = ref(null)
const error      = ref(null)

let stream = null
let facingMode = 'environment'  // 후면 카메라

async function startCamera() {
  try {
    if (stream) stopCamera()
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    })
    mode.value = 'camera'
    imageUrl.value = null
    imageFile.value = null
    result.value = null
    error.value = null
    await new Promise(r => setTimeout(r, 50))
    if (videoEl.value) {
      videoEl.value.srcObject = stream
    }
  } catch (e) {
    error.value = '카메라 권한이 필요합니다: ' + e.message
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop())
    stream = null
  }
}

async function flipCamera() {
  facingMode = facingMode === 'environment' ? 'user' : 'environment'
  await startCamera()
}

function capturePhoto() {
  const video  = videoEl.value
  const canvas = canvasEl.value
  if (!video || !canvas) return

  canvas.width  = video.videoWidth
  canvas.height = video.videoHeight
  canvas.getContext('2d').drawImage(video, 0, 0)

  canvas.toBlob(blob => {
    if (!blob) return
    imageFile.value = new File([blob], 'capture.jpg', { type: 'image/jpeg' })
    imageUrl.value  = URL.createObjectURL(blob)
    mode.value = 'preview'
    result.value = null
    error.value = null
    stopCamera()
  }, 'image/jpeg', 0.9)
}

function openGallery() {
  galleryInput.value?.click()
}

function onGalleryFile(e) {
  const file = e.target.files[0]
  if (!file) return
  stopCamera()
  imageFile.value = file
  imageUrl.value  = URL.createObjectURL(file)
  mode.value = 'preview'
  result.value = null
  error.value = null
  e.target.value = ''
}

function resizeImage(file, maxSize = 1024, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('파일 읽기 실패'))
    reader.onload = e => {
      const img = new Image()
      img.onerror = () => reject(new Error('이미지 로드 실패'))
      img.onload = () => {
        const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1)
        const w = Math.round(img.width * ratio)
        const h = Math.round(img.height * ratio)
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve({ base64: dataUrl.split(',')[1], mimeType: 'image/jpeg' })
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

async function diagnose() {
  if (!imageFile.value || diagnosing.value) return
  diagnosing.value = true
  error.value = null
  result.value = null
  try {
    let { base64, mimeType } = await resizeImage(imageFile.value, 1024, 0.82)
    if (base64.length > 1.5 * 1024 * 1024) {
      ;({ base64, mimeType } = await resizeImage(imageFile.value, 768, 0.75))
    }

    const res = await fetch('/api/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64, mimeType, context: { crop: '범용' } })
    })
    const raw = await res.text()
    let data
    try { data = JSON.parse(raw) } catch { throw new Error('서버 오류: ' + raw.slice(0, 120)) }
    if (!res.ok) throw new Error(data.error ?? res.statusText)
    result.value = data

    // 이력 저장
    await supabase.from('pest_ai_history').insert({
      disease: data.disease,
      risk: data.risk,
      type: data.type,
      symptoms_found: data.symptoms_found,
      recommendation: data.recommendation,
      chemicals: data.chemicals,
      confidence: data.confidence,
      diagnosed_at: new Date().toISOString()
    })
  } catch (e) {
    error.value = e.message
  } finally {
    diagnosing.value = false
  }
}

onMounted(() => { /* 자동 카메라 시작 안 함 — 사용자가 탭하여 시작 */ })
onUnmounted(stopCamera)
</script>

<style scoped>
.header { text-align: center; padding: 8px 0 4px; }
.title  { font-size: 22px; font-weight: 700; }
.subtitle { font-size: 12px; color: var(--text-3); margin-top: 4px; }

/* 카메라 */
.camera-card { padding: 0; overflow: hidden; }
.camera-wrap { position: relative; width: 100%; aspect-ratio: 4/3; background: #000; }
.camera-video { width: 100%; height: 100%; object-fit: cover; display: block; }
.camera-overlay { position: absolute; inset: 0; pointer-events: none; display: flex; align-items: center; justify-content: center; }
.camera-frame { width: 65%; aspect-ratio: 1; border: 2px solid rgba(255,255,255,.6); border-radius: 12px; box-shadow: 0 0 0 9999px rgba(0,0,0,.3); }
.camera-controls { position: absolute; bottom: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: space-around; padding: 16px 24px 20px; background: linear-gradient(transparent, rgba(0,0,0,.5)); }
.shutter-btn { width: 68px; height: 68px; border-radius: 50%; background: #fff; border: 4px solid rgba(255,255,255,.5); font-size: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 12px rgba(0,0,0,.4); }
.shutter-btn:active { transform: scale(.93); }
.ctrl-btn { width: 46px; height: 46px; border-radius: 50%; background: rgba(255,255,255,.2); border: none; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #fff; }

/* 미리보기 */
.preview-wrap { position: relative; }
.preview-img  { width: 100%; max-height: 340px; object-fit: cover; display: block; }
.retake-btn   { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,.55); color: #fff; border: none; border-radius: 20px; padding: 6px 14px; font-size: 13px; cursor: pointer; }

/* 플레이스홀더 */
.placeholder { display: flex; flex-direction: column; align-items: center; padding: 40px 20px; cursor: pointer; }
.placeholder-icon { font-size: 52px; margin-bottom: 12px; }
.placeholder-text { font-size: 16px; font-weight: 600; }
.placeholder-sub  { font-size: 13px; color: var(--text-3); margin-top: 4px; }

/* 오류 */
.error-box { background: var(--red-light); border: 1px solid var(--red); border-radius: var(--radius-sm); padding: 12px 14px; color: var(--red-dark); font-size: 13px; }

/* 결과 */
.result-card { border: 2px solid var(--green); }
.result-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.result-title { font-size: 15px; font-weight: 700; }
.risk-badge { font-size: 12px; font-weight: 700; padding: 3px 12px; border-radius: 99px; }
.risk-높음 { background: var(--red-light);   color: var(--red-dark);   border: 1px solid var(--red); }
.risk-중간 { background: var(--amber-light);  color: var(--amber-dark); border: 1px solid var(--amber); }
.risk-낮음 { background: var(--green-light);  color: var(--green-dark); border: 1px solid var(--green); }
.disease-row { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.disease-name { font-size: 22px; font-weight: 700; }
.type-badge { font-size: 11px; padding: 2px 10px; border-radius: 99px; font-weight: 600; }
.type-병 { background: var(--amber-light); color: var(--amber-dark); }
.type-충 { background: var(--red-light);   color: var(--red-dark); }
.section { margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid var(--border); }
.section:last-of-type { border-bottom: none; margin-bottom: 0; }
.section-label { font-size: 11px; font-weight: 700; color: var(--text-3); margin-bottom: 6px; text-transform: uppercase; letter-spacing: .04em; }
.section-text  { font-size: 14px; line-height: 1.65; }
.pills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.pill  { background: var(--green-light); color: var(--green-dark); border: 1px solid var(--green); border-radius: 99px; padding: 3px 12px; font-size: 12px; font-weight: 600; }
.confidence { margin-top: 14px; font-size: 11px; color: var(--text-3); padding: 8px 12px; background: var(--bg); border-radius: var(--radius-sm); }
</style>
