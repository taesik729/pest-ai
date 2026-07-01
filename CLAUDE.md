# 병해충 AI 진단 — CLAUDE.md

---

## 프로젝트 개요

- **이름**: 병해충 AI 진단
- **패키지**: (미정 — Android 설정 아직 안 됨)
- **배포**: Vercel (`https://pest-ai-umber.vercel.app`)

---

## 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | Vue 3 (`<script setup>`) |
| 빌드 | Vite |
| DB/Auth | Supabase |
| AI | Groq API (`meta-llama/llama-4-scout-17b-16e-instruct`) |

---

## 주요 기능

- 작물 선택 (포도/복숭아) → 사진 업로드 → AI 진단
- 회원가입 / 로그인 / 비밀번호 재설정 / 회원탈퇴
- 진단 이력 저장 (`diagnoses` 테이블)

---

## Android 빌드 설정 (중요! — HOUSEHOLD 앱 경험 기반)

### Gradle 버전 조합 (검증된 조합 사용할 것)
- **Gradle**: `8.7` (`gradle-wrapper.properties`)
- **AGP**: `8.3.0` (`build.gradle`)
- **targetSdkVersion**: `35` (`variables.gradle`)
- **Gradle JDK**: Android Studio Embedded JDK (jbr) 설정 필수

### Android 빌드 트러블슈팅 (HOUSEHOLD 앱에서 겪은 문제)

#### 문제 1: Android resource linking failed (RES_TABLE_TYPE_TYPE)
- **원인**: Gradle 8.0.2 + AGP 8.0.0 이 SDK 35 와 호환 안 됨
- **해결**: Gradle 8.7 + AGP 8.3.0 으로 업그레이드

#### 문제 2: Incompatible Gradle JVM version
- **원인**: Gradle JDK가 JVM 21로 설정됨
- **해결**: Android Studio → Settings → Build Tools → Gradle → Gradle JDK → Embedded JDK 선택

#### 문제 3: Could not move temporary workspace
- **원인**: Gradle 캐시 손상
- **해결**: `C:\Users\{user}\.gradle\caches` 삭제 후 Android Studio 재시작

#### 문제 4: 버전 코드 중복
- **원인**: 이전에 업로드한 AAB와 동일한 versionCode
- **해결**: `build.gradle` 에서 `versionCode` +1 증가 후 재빌드

---

## Google Play 등록 (예정)

- HOUSEHOLD 앱 심사 통과 후 진행 예정
- 개발자 계정: taesik729@gmail.com

---

## Android APK Safe Area 처리 (필수!)

Capacitor 5는 기본적으로 edge-to-edge 모드로 실행됨.
WebView가 상단 Status Bar / 하단 Navigation Bar 영역까지 침범해서 UI가 겹치는 문제 발생.

### 해결 방법 (HOUSEHOLD에서 검증 완료 — 동일하게 적용)

**1. `index.html`** — viewport-fit=cover 추가
```html
<meta name="viewport" content="..., viewport-fit=cover" />
```

**2. CSS** — safe-area 적용
```css
.topbar {
  padding: env(safe-area-inset-top, 0px) 20px 0;
  height: calc(56px + env(safe-area-inset-top, 0px));
  align-items: flex-end;
  padding-bottom: 8px;
}
.bottom-nav {
  bottom: env(safe-area-inset-bottom);
  height: 64px;
}
.content { padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px)); }
.btn-fab { bottom: calc(80px + env(safe-area-inset-bottom, 0px)); }
```

**3. `MainActivity.java`**
```java
import android.os.Bundle;
import androidx.core.view.WindowCompat;
public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
    }
}
```

**4. `capacitor.config.json`**
```json
"plugins": {
  "StatusBar": {
    "overlaysWebView": false,
    "style": "DEFAULT",
    "backgroundColor": "#ffffff"
  }
}
```

> 삼성 갤럭시 3버튼 네비 기준 safe-area-inset-bottom = **48px** 확인됨

---

## Supabase 인증 문제 디버깅 순서

1. Supabase 대시보드 → Authentication → URL Configuration 확인
   - **Site URL** 올바른지 확인
   - **Redirect URLs** 에 `/reset-password` URL 등록됐는지 확인
2. 환경변수 확인
3. 코드 확인

### 비밀번호 재설정 설정 (HOUSEHOLD에서 검증)
- `resetPasswordForEmail` 에 `redirectTo` 하드코딩 필수
- `src/supabase/client.js` → `detectSessionInUrl: true` 설정
- `src/router/index.js` → `/reset-password` 경로 가드 최상단에서 `return true` 처리
- 회원탈퇴 후 이동: `router.push` 대신 `window.location.href` 사용 (APK에서 router.push 미작동)

---

## 프로젝트 구분 (중요!)

- **심플 가계부** (`com.taesik.household`) — Android APK, Capacitor 앱
- **골프 스코어** (`C:\work\SCORE`) — Android APK, Capacitor 앱
- **AI 병해충 진단** — Android APK, Capacitor 앱
- **태식 팜 MES** — 웹앱 (PWA), APK 아님
- 앱 관련 작업(빌드, 배포, AdMob, Play Console)은 심플 가계부·골프 스코어·병해충 진단에만 해당

---

## 코드 수정 규칙

- 코드 수정 시 반드시 **수정 전 → 수정 후** 코드블록 형식으로 대화창에 펼쳐서 보여줌
- 터미널 명령어 실행 전 코드블록으로 명령어 먼저 표시
- "실행합니다" 하고 그냥 넘어가지 않음
- 모든 세션에 적용
- **구현 전 설계 먼저**: 새 기능 구현 전 반드시 폴더 구조·상태 흐름을 먼저 설계하고 사용자 확인 후 구현

---

## 할 일

- [ ] Capacitor Android 설정
- [ ] 앱 아이콘 512×512 PNG 제작
- [ ] 개인정보처리방침 페이지 추가
- [ ] AAB 빌드 및 Play Console 등록
