<template>
  <div class="privacy-wrap">
    <div class="privacy-header">
      <button class="back-btn" @click="$router.back()">
        <span class="back-icon">←</span>
      </button>
      <h1 class="privacy-title">개인정보처리방침</h1>
    </div>

    <div class="privacy-body">
      <p class="effective-date">시행일: 2025년 6월 1일 &nbsp;|&nbsp; 최종 수정일: 2026년 6월 9일</p>

      <section>
        <h2>제1조 (개인정보 수집 항목 및 수집 방법)</h2>
        <p>병해충 AI 진단 앱(이하 "앱")은 다음의 개인정보를 수집합니다.</p>
        <table>
          <thead><tr><th>항목</th><th>수집 목적</th><th>보유 기간</th></tr></thead>
          <tbody>
            <tr><td>이메일 주소</td><td>회원 가입·로그인·비밀번호 재설정</td><td>탈퇴 시 즉시 삭제</td></tr>
            <tr><td>진단에 사용된 이미지</td><td>AI 병해충 분석 (분석 후 저장 안 됨)</td><td>전송 즉시 폐기</td></tr>
            <tr><td>진단 결과 텍스트</td><td>이력 조회 서비스 제공</td><td>탈퇴 시 즉시 삭제</td></tr>
            <tr><td>접속 일시·기기 정보</td><td>서비스 보안 및 오류 개선</td><td>1년</td></tr>
          </tbody>
        </table>
        <p>수집 방법: 회원가입 폼 직접 입력, 서비스 이용 중 자동 수집</p>
      </section>

      <section>
        <h2>제2조 (개인정보의 처리 목적)</h2>
        <ul>
          <li>회원 가입 및 본인 확인</li>
          <li>AI 기반 작물 병해충 진단 서비스 제공</li>
          <li>진단 이력 조회 및 관리</li>
          <li>서비스 개선을 위한 통계 분석</li>
          <li>고지 사항 전달 및 고객 문의 응대</li>
        </ul>
      </section>

      <section>
        <h2>제3조 (개인정보의 제3자 제공)</h2>
        <p>앱은 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 서비스 운영을 위해 아래 업체에 최소한의 정보를 위탁합니다.</p>
        <table>
          <thead><tr><th>수탁 업체</th><th>위탁 업무</th><th>전달 정보</th></tr></thead>
          <tbody>
            <tr><td>Supabase Inc.</td><td>데이터베이스·인증 서비스</td><td>이메일, 진단 결과</td></tr>
            <tr><td>Groq Inc. (Llama 4)</td><td>AI 병해충 진단 분석</td><td>진단용 이미지 (결과 반환 후 폐기)</td></tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>제4조 (개인정보의 보유 및 이용 기간)</h2>
        <ul>
          <li>회원 탈퇴 시 지체 없이 파기합니다.</li>
          <li>단, 관련 법령에 따라 보존이 필요한 정보는 해당 기간 동안 보관합니다.
            <ul>
              <li>전자상거래법 — 계약·청약 철회 기록: 5년</li>
              <li>통신비밀보호법 — 로그인 기록: 3개월</li>
            </ul>
          </li>
        </ul>
      </section>

      <section>
        <h2>제5조 (이용자의 권리)</h2>
        <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
        <ul>
          <li>개인정보 열람 요청</li>
          <li>개인정보 정정·삭제 요청</li>
          <li>개인정보 처리 정지 요청</li>
          <li>회원 탈퇴 (앱 내 설정 → 회원 탈퇴)</li>
        </ul>
        <p>문의는 아래 개인정보 보호책임자에게 이메일로 연락하시면 됩니다.</p>
      </section>

      <section>
        <h2>제6조 (쿠키 및 자동 수집 정보)</h2>
        <p>앱은 서비스 제공을 위해 로컬 스토리지를 사용합니다. 로그인 세션 유지를 위한 인증 토큰 외에는 기기에 저장되는 정보가 없습니다.</p>
      </section>

      <section>
        <h2>제7조 (미성년자 보호)</h2>
        <p>본 앱은 만 14세 미만 아동을 대상으로 하지 않습니다. 만 14세 미만 아동은 회원가입이 제한됩니다.</p>
      </section>

      <section>
        <h2>제8조 (개인정보 보호책임자)</h2>
        <div class="contact-box">
          <div class="contact-row"><span class="contact-label">담당자</span><span>태식 팜 운영팀</span></div>
          <div class="contact-row"><span class="contact-label">이메일</span><span>taesikfarm@gmail.com</span></div>
          <div class="contact-row"><span class="contact-label">주소</span><span>경상북도 김천시</span></div>
        </div>
        <p style="margin-top:12px">개인정보 관련 불만·피해 신고는 아래 기관에도 접수할 수 있습니다.</p>
        <ul>
          <li>개인정보보호위원회: <a href="https://www.pipc.go.kr" target="_blank">www.pipc.go.kr</a> / 국번없이 182</li>
          <li>한국인터넷진흥원 개인정보 침해신고센터: <a href="https://privacy.kisa.or.kr" target="_blank">privacy.kisa.or.kr</a> / 국번없이 118</li>
        </ul>
      </section>

      <section>
        <h2>제9조 (방침 변경)</h2>
        <p>본 개인정보처리방침은 법령·정책 변경 시 앱 내 공지사항을 통해 사전 고지 후 개정됩니다. 변경 전 내용은 이 페이지에서 확인할 수 있습니다.</p>
      </section>
    </div>
  </div>
</template>

<script setup>
// 뒤로 가기가 없으면 홈으로
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
.privacy-wrap {
  min-height: 100dvh;
  background: var(--bg, #f4f6f5);
  padding-bottom: 40px;
}

.privacy-header {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--surface, #fff);
  border-bottom: 1px solid var(--border, #e5e7eb);
  z-index: 10;
}
.back-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--text, #1a1a1a);
  padding: 2px 4px;
  line-height: 1;
}
.back-icon { font-size: 18px; }
.privacy-title {
  font-size: 17px;
  font-weight: 700;
  margin: 0;
  color: var(--text, #1a1a1a);
}

.privacy-body {
  max-width: 720px;
  margin: 0 auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.effective-date {
  font-size: 12px;
  color: var(--text-3, #888);
  background: var(--surface, #fff);
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--border, #e5e7eb);
}

section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

h2 {
  font-size: 15px;
  font-weight: 700;
  color: var(--green, #2d7a4f);
  margin: 0;
  padding-bottom: 6px;
  border-bottom: 1.5px solid var(--green-light, #dcfce7);
}

p, li {
  font-size: 13px;
  line-height: 1.75;
  color: var(--text-2, #444);
  margin: 0;
}

ul {
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
ul ul { margin-top: 4px; }

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
th, td {
  padding: 8px 10px;
  border: 1px solid var(--border, #e5e7eb);
  text-align: left;
  color: var(--text-2, #444);
  line-height: 1.5;
}
th {
  background: var(--surface, #f9fafb);
  font-weight: 600;
  color: var(--text, #1a1a1a);
}

.contact-box {
  background: var(--surface, #fff);
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.contact-row {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: var(--text-2, #444);
}
.contact-label {
  font-weight: 600;
  color: var(--text, #1a1a1a);
  width: 56px;
  flex-shrink: 0;
}

a { color: var(--green, #2d7a4f); }
</style>
