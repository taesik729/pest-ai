/**
 * useAdMob.js — Google AdMob 래퍼
 * - 네이티브(Android) 환경에서만 동작, 웹 브라우저에서는 graceful skip
 * - 배너: 하단 고정 (탭바 위)
 * - 전면광고(Interstitial): 진단 3회마다 1번 노출
 *
 * ──────────────────────────────────────────────────
 * 실제 배포 전 교체할 항목 (AdMob 콘솔에서 발급)
 *   ADMOB_APP_ID      → AndroidManifest.xml + capacitor.config.json
 *   BANNER_UNIT_ID    → 아래 BANNER_ID
 *   INTERSTITIAL_ID   → 아래 INTERSTITIAL_ID
 * ──────────────────────────────────────────────────
 */

// ── 광고 단위 ID (테스트 ID — 배포 전 실제 ID로 교체) ──────────────────
const BANNER_ID       = 'ca-app-pub-3940256099942544/6300978111'
const INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712'

// 전면 광고 노출 주기: N회 진단마다 1번
const INTERSTITIAL_EVERY = 3

let admobModule = null          // 플러그인 동적 import 캐시
let diagnoseCount = 0           // 진단 횟수 카운터
let interstitialReady = false   // 전면 광고 로드 여부

/** Capacitor AdMob 플러그인을 동적 import */
async function getAdMob() {
  if (admobModule) return admobModule
  try {
    const { AdMob } = await import('@capacitor-community/admob')
    admobModule = AdMob
    return AdMob
  } catch {
    return null
  }
}

/** 네이티브 앱 환경인지 확인 */
function isNative() {
  return !!(window.Capacitor && window.Capacitor.isNativePlatform?.())
}

// ─────────────────────────────────────────────────────────────────────────────
// 공개 API
// ─────────────────────────────────────────────────────────────────────────────

/** AdMob 초기화 (앱 시작 시 1회 호출) */
export async function initAdMob() {
  if (!isNative()) return
  const AdMob = await getAdMob()
  if (!AdMob) return
  try {
    await AdMob.initialize({ testingDevices: [], initializeForTesting: true })
    // 초기화 후 전면 광고 미리 로드
    await loadInterstitial()
  } catch (e) {
    console.warn('[AdMob] 초기화 실패:', e)
  }
}

/** 배너 광고 표시 (하단 고정) */
export async function showBanner() {
  if (!isNative()) return
  const AdMob = await getAdMob()
  if (!AdMob) return
  try {
    const { BannerAdSize, BannerAdPosition } = await import('@capacitor-community/admob')
    await AdMob.showBanner({
      adId: BANNER_ID,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 56,           // 탭바 높이(56px)만큼 위로 올림
      isTesting: true,      // 배포 시 false로 변경
    })
  } catch (e) {
    console.warn('[AdMob] 배너 표시 실패:', e)
  }
}

/** 배너 광고 숨기기 */
export async function hideBanner() {
  if (!isNative()) return
  const AdMob = await getAdMob()
  if (!AdMob) return
  try { await AdMob.hideBanner() } catch {}
}

/** 배너 광고 제거 */
export async function removeBanner() {
  if (!isNative()) return
  const AdMob = await getAdMob()
  if (!AdMob) return
  try { await AdMob.removeBanner() } catch {}
}

/** 전면 광고 미리 로드 */
async function loadInterstitial() {
  const AdMob = await getAdMob()
  if (!AdMob) return
  try {
    await AdMob.prepareInterstitial({ adId: INTERSTITIAL_ID, isTesting: true })
    interstitialReady = true
  } catch (e) {
    console.warn('[AdMob] 전면광고 로드 실패:', e)
    interstitialReady = false
  }
}

/**
 * 진단 완료 후 호출 — N회마다 전면 광고 표시
 * @returns {Promise<void>}
 */
export async function onDiagnoseComplete() {
  if (!isNative()) return
  diagnoseCount++
  if (diagnoseCount % INTERSTITIAL_EVERY !== 0) return

  const AdMob = await getAdMob()
  if (!AdMob || !interstitialReady) return

  try {
    interstitialReady = false
    await AdMob.showInterstitial()
    // 다음 노출을 위해 미리 로드
    await loadInterstitial()
  } catch (e) {
    console.warn('[AdMob] 전면광고 표시 실패:', e)
    await loadInterstitial()
  }
}
