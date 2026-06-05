// Vercel Serverless — Groq Vision 병해충 진단 (범용 다작물)
export const config = {
  api: { bodyParser: { sizeLimit: '10mb' }, responseLimit: false },
}

const GROQ_KEY = process.env.GROQ_API_KEY

// ─── 작물별 주요 병해충 목록 ───────────────────────────────────────
const PEST_DB = {
  포도: [
    { name: '갈색무늬병',   type: '병', symptom: '잎에 갈색~암갈색 원형 반점, 주위 황색 후광, 낙엽',      chemicals: ['만코지', '델란', '지오람'] },
    { name: '흑두병',       type: '병', symptom: '잎·과실에 흑색 점무늬, 경계 뚜렷, 함몰 없음',           chemicals: ['델란', '만코지', '스코어'] },
    { name: '노균병',       type: '병', symptom: '잎 앞면 황색 반점, 뒷면 흰색 솜털 균총',               chemicals: ['리도밀', '포룸', '만코지'] },
    { name: '탄저병',       type: '병', symptom: '과실 갈색 원형 함몰, 분홍색 포자',                       chemicals: ['델란', '스코어', '만코지'] },
    { name: '꼭지마름병',   type: '병', symptom: '꼭지·줄기 갈색~흑갈색 변색 후 낙과',                    chemicals: ['만코지', '델란'] },
    { name: '잿빛곰팡이병', type: '병', symptom: '과실·잎 회갈색 썩음, 잿빛 균총',                        chemicals: ['이프로디온', '카프탄'] },
    { name: '꽃매미',       type: '충', symptom: '흰 납질 분비물, 그을음병 유발, 수액 흡즙',               chemicals: ['아세타미프리드', '이미다클로프리드'] },
  ],
  복숭아: [
    { name: '세균성구멍병', type: '병', symptom: '잎 수침상 반점→구멍, 과실 갈색 반점·균열',              chemicals: ['가스가마이신', '옥시테트라'] },
    { name: '잿빛무늬병',   type: '병', symptom: '과실 갈색 수침상→잿빛 균총, 부패',                      chemicals: ['이프로디온', '카프탄'] },
    { name: '탄저병',       type: '병', symptom: '과실 갈색 원형 함몰, 분홍색 포자',                       chemicals: ['델란', '스코어'] },
    { name: '흰가루병',     type: '병', symptom: '잎·신초에 흰색 분말 균총',                               chemicals: ['훼나리몰', '마이클로뷰타닐'] },
    { name: '잎오갈병',     type: '병', symptom: '잎이 두껍게 오그라들며 적자색~황색 변색',                chemicals: ['티오파네이트메틸'] },
    { name: '복숭아심식충', type: '충', symptom: '과실 표면 침입공, 내부 갱도·배설물',                     chemicals: ['클로르플루아주론', '다이아지논'] },
    { name: '복숭아순나방', type: '충', symptom: '신초 끝 시들음·고사, 과실 침입공',                       chemicals: ['스피노사드', '델타메트린'] },
    { name: '복숭아혹진딧물', type: '충', symptom: '잎 뒷면 녹색~황색 진딧물 집단, 잎 말림',              chemicals: ['아세타미프리드', '이미다클로프리드'] },
  ],
  사과: [
    { name: '점무늬낙엽병', type: '병', symptom: '잎에 자갈색 원형 반점, 조기 낙엽',                       chemicals: ['만코지', '캡탄', '스코어'] },
    { name: '탄저병',       type: '병', symptom: '과실 갈색 원형 함몰, 분홍색 포자',                       chemicals: ['델란', '스코어'] },
    { name: '겹무늬썩음병', type: '병', symptom: '과실에 갈색 겹무늬 원형 썩음',                           chemicals: ['만코지', '프로피'] },
    { name: '흰가루병',     type: '병', symptom: '잎·신초 흰색 분말 균총, 신초 기형',                      chemicals: ['훼나리몰', '마이클로뷰타닐'] },
    { name: '사과면충',     type: '충', symptom: '가지·줄기에 흰 솜털 덩어리, 혹 형성',                    chemicals: ['디노테퓨란', '이미다클로프리드'] },
    { name: '사과굴나방',   type: '충', symptom: '잎에 굴 파는 흔적(광산형 피해)',                          chemicals: ['스피로디클로펜'] },
  ],
  배: [
    { name: '검은별무늬병', type: '병', symptom: '잎·과실에 흑갈색 방사상 균총, 과실 기형·균열',           chemicals: ['델란', '만코지', '스코어'] },
    { name: '붉은별무늬병', type: '병', symptom: '잎 앞면 주황색 반점, 뒷면 털모양 균총',                  chemicals: ['훼나리몰', '트리플루미졸'] },
    { name: '흑성병',       type: '병', symptom: '과실에 흑색 균열, 잎에 흑갈색 병반',                     chemicals: ['만코지', '델란'] },
    { name: '배나무이',     type: '충', symptom: '잎 뒷면 흰 납질 분비물, 그을음병',                       chemicals: ['스피로테트라맷', '아세타미프리드'] },
  ],
  토마토: [
    { name: '잿빛곰팡이병', type: '병', symptom: '잎·과실·줄기에 회갈색 썩음, 잿빛 균총',                  chemicals: ['이프로디온', '보스칼리드'] },
    { name: '역병',         type: '병', symptom: '잎·줄기·과실에 수침상 암갈색 반점, 흰 균총',              chemicals: ['메탈락실', '포룸'] },
    { name: '풋마름병',     type: '병', symptom: '낮에 시들고 밤에 회복, 줄기 절단 시 갈변',                chemicals: ['없음(토양 소독)'] },
    { name: '바이러스병',   type: '병', symptom: '잎 모자이크·황화·기형, 과실 변형',                        chemicals: ['없음(매개충 방제)'] },
    { name: '총채벌레',     type: '충', symptom: '잎·꽃에 은백색 반점, 꽃·과실 기형',                       chemicals: ['스피노사드', '아세타미프리드'] },
    { name: '온실가루이',   type: '충', symptom: '잎 뒷면 흰색 소형 해충, 그을음병',                        chemicals: ['이미다클로프리드', '비펜트린'] },
    { name: '진딧물',       type: '충', symptom: '신초·잎 뒷면 녹색~황색 집단, 잎 말림',                    chemicals: ['아세타미프리드', '피메트로진'] },
  ],
  고추: [
    { name: '탄저병',       type: '병', symptom: '과실에 갈색~흑갈색 원형 함몰 반점, 분홍색 포자',         chemicals: ['만코지', '델란', '스코어'] },
    { name: '역병',         type: '병', symptom: '줄기 기부 흑갈색 썩음, 급격한 시들음',                    chemicals: ['메탈락실', '포룸'] },
    { name: '잿빛곰팡이병', type: '병', symptom: '과실·잎에 회갈색 썩음, 잿빛 균총',                        chemicals: ['이프로디온', '카프탄'] },
    { name: '바이러스병',   type: '병', symptom: '잎 모자이크·황화, 과실 기형·줄기 괴사',                   chemicals: ['없음(매개충 방제)'] },
    { name: '총채벌레',     type: '충', symptom: '잎·꽃에 은백색 반점, 과실 기형',                          chemicals: ['스피노사드', '아세타미프리드'] },
    { name: '점박이응애',   type: '충', symptom: '잎 뒷면 흰색~황색 반점, 세밀한 거미줄',                   chemicals: ['아바멕틴', '비펜아제이트'] },
  ],
  딸기: [
    { name: '잿빛곰팡이병', type: '병', symptom: '과실·잎에 회갈색 썩음, 잿빛 균총',                        chemicals: ['이프로디온', '보스칼리드'] },
    { name: '흰가루병',     type: '병', symptom: '잎·과실 흰색 분말 균총, 잎 말림',                         chemicals: ['훼나리몰', '마이클로뷰타닐'] },
    { name: '탄저병',       type: '병', symptom: '런너·엽병에 갈색~흑색 방추형 병반',                        chemicals: ['델란', '스코어'] },
    { name: '시들음병',     type: '병', symptom: '한쪽 잎부터 시들음, 크라운 갈변',                          chemicals: ['없음(토양 소독)'] },
    { name: '점박이응애',   type: '충', symptom: '잎 뒷면 황백색 반점, 거미줄',                              chemicals: ['아바멕틴', '비펜아제이트'] },
    { name: '진딧물',       type: '충', symptom: '잎 뒷면 녹색~황색 집단, 바이러스 매개',                    chemicals: ['아세타미프리드', '피메트로진'] },
  ],
  기타: [],
}

// ─── 작물별 상세 증상 참고표 ─────────────────────────────────────────
const SYMPTOM_REF = {
  포도: `
- 갈색무늬병: 잎에 갈색~암갈색 원형 반점, 주위 황색 후광, 심하면 낙엽
- 흑두병: 잎·과실에 【흑색】 점무늬, 병반 경계 매우 뚜렷, 함몰 없음. ※탄저병과 혼동 주의(흑두병=흑색·함몰없음)
- 노균병: 잎 앞면 황색 반점 + 뒷면 흰색 솜털 균총 (뒷면 흰털이 핵심)
- 탄저병: 과실에만 발생. 갈색 원형 반점이 함몰, 분홍색 포자. ※흑두병과 혼동 주의(탄저병=갈색·함몰있음)
- 꼭지마름병: 과실 꼭지·줄기 갈색~흑갈색 변색, 꼭지에서 시작해 낙과
- 잿빛곰팡이병: 과실·잎에 회갈색 썩음, 잿빛 균총 덮임
- 꽃매미: 줄기·잎에 흰 납질 분비물, 그을음병 동반`,
  복숭아: `
- 세균성구멍병: 잎 수침상 갈색 반점→건조 후 구멍(핵심), 과실에도 갈색 반점·균열
- 잿빛무늬병: 과실 갈색 수침상→잿빛 균총, 빠른 부패
- 탄저병: 과실 갈색 원형 함몰, 분홍색 포자
- 흰가루병: 잎·신초에 흰색 분말 균총
- 잎오갈병: 잎이 두껍게 오그라들며 적자색~황색 변색, 봄철 신초에서 시작
- 복숭아심식충: 과실 표면 작은 침입공, 내부 갱도·배설물
- 복숭아순나방: 신초 끝 시들음·고사, 과실 침입공
- 복숭아혹진딧물: 잎 뒷면 녹색~황색 진딧물 집단, 잎 말림`,
  사과: `
- 점무늬낙엽병: 잎에 자갈색 원형 반점, 조기 낙엽
- 탄저병: 과실 갈색 원형 함몰, 분홍색 포자
- 겹무늬썩음병: 과실에 갈색 겹무늬 원형 썩음, 보관 중 발생 多
- 흰가루병: 잎·신초 흰색 분말 균총
- 사과면충: 가지·뿌리목에 흰 솜털 덩어리, 혹 형성
- 사과굴나방: 잎에 구불구불한 굴(터널) 흔적`,
  배: `
- 검은별무늬병: 잎·과실에 흑갈색 방사상 균총, 과실 기형·균열
- 붉은별무늬병: 잎 앞면 주황색 반점, 뒷면 털모양 균총 (봄철)
- 흑성병: 과실에 흑색 균열, 잎에 흑갈색 병반
- 배나무이: 잎 뒷면 흰 납질 분비물, 그을음병`,
  토마토: `
- 잿빛곰팡이병: 회갈색 썩음+잿빛 균총, 저온다습 시 多
- 역병: 수침상 암갈색 반점 빠른 확산, 흰 균총, 과실까지 감염
- 풋마름병: 낮 시들음+밤 회복 반복, 줄기 절단 시 갈변(세균성)
- 바이러스병: 모자이크·황화·잎 기형, 매개충 방제 필요
- 총채벌레: 은백색 반점, 꽃·과실 기형, 매우 작은 해충
- 온실가루이: 잎 뒷면 흰색 작은 해충, 꿀물 분비→그을음
- 진딧물: 신초·잎 뒷면 집단, 바이러스 매개`,
  고추: `
- 탄저병: 과실 갈색~흑갈색 원형 함몰+분홍포자 (과실에 집중)
- 역병: 줄기 기부 흑갈색 썩음, 급격한 시들음(토양 전염)
- 잿빛곰팡이병: 회갈색 썩음+잿빛 균총, 꽃·과실·잎 가해
- 바이러스병: 모자이크·황화·과실 기형, 진딧물·총채벌레 매개
- 총채벌레: 잎·꽃에 은백색 반점, 꽃 탈락, 과실 기형
- 점박이응애: 잎 뒷면 황백색 반점+세밀한 거미줄, 고온건조 시 多`,
  딸기: `
- 잿빛곰팡이병: 과실·잎 회갈색 썩음+잿빛 균총, 저온다습
- 흰가루병: 잎·과실 흰색 분말 균총, 잎 위로 말림
- 탄저병: 런너·엽병에 갈색~흑색 방추형 병반, 묘 생산기 피해
- 시들음병: 한쪽부터 시들음, 크라운(관부) 절단 시 갈변
- 점박이응애: 잎 뒷면 황백색 반점+거미줄, 고온건조
- 진딧물: 잎 뒷면 집단, 바이러스 매개`,
  기타: `
- 잿빛곰팡이병: 회갈색 썩음+잿빛 균총
- 흰가루병: 흰색 분말 균총
- 탄저병: 갈색 원형 함몰+분홍색 포자
- 역병: 수침상 암갈색 병반, 빠른 확산
- 진딧물: 신초·잎 뒷면 녹색~황색 집단
- 응애: 잎 뒷면 황백색 반점+거미줄
- 총채벌레: 은백색 반점, 꽃·과실 기형`,
}

// 각 작물에 해당하지 않는 병해충 (오진 방지용)
const CROP_BANNED = {
  포도:   '세균성구멍병, 복숭아심식충, 복숭아순나방, 복숭아혹진딧물, 잎오갈병, 점무늬낙엽병, 겹무늬썩음병, 사과면충, 검은별무늬병, 붉은별무늬병, 역병, 풋마름병, 시들음병',
  복숭아: '갈색무늬병, 흑두병, 노균병, 꼭지마름병, 새눈무늬병, 점무늬낙엽병, 겹무늬썩음병, 검은별무늬병, 붉은별무늬병, 역병, 풋마름병',
  사과:   '갈색무늬병, 흑두병, 노균병, 꼭지마름병, 세균성구멍병, 잎오갈병, 복숭아심식충, 복숭아순나방, 검은별무늬병, 붉은별무늬병',
  배:     '갈색무늬병, 흑두병, 노균병, 세균성구멍병, 잎오갈병, 점무늬낙엽병, 사과면충, 역병, 풋마름병',
  토마토: '갈색무늬병, 흑두병, 노균병, 꼭지마름병, 세균성구멍병, 잎오갈병, 복숭아심식충, 검은별무늬병, 시들음병',
  고추:   '갈색무늬병, 흑두병, 노균병, 꼭지마름병, 세균성구멍병, 복숭아심식충, 검은별무늬병, 잎오갈병, 시들음병',
  딸기:   '갈색무늬병, 흑두병, 노균병, 꼭지마름병, 세균성구멍병, 잎오갈병, 복숭아심식충, 검은별무늬병, 역병',
  기타:   '',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  if (!GROQ_KEY) return res.status(500).json({ error: 'GROQ_API_KEY 환경변수 없음' })

  const { image, mimeType = 'image/jpeg', context = {} } = req.body
  if (!image) return res.status(400).json({ error: '이미지 없음' })

  const crop       = context.crop && context.crop !== '범용' ? context.crop : null
  const symptomRef = crop ? (SYMPTOM_REF[crop] ?? SYMPTOM_REF.기타) : Object.values(SYMPTOM_REF).join('\n')
  const banned     = crop ? (CROP_BANNED[crop] ?? '') : ''
  const cropLabel  = crop ?? '알 수 없음(사진에서 판단)'

  const prompt = `당신은 한국 농업 병해충 전문 AI입니다. 농촌진흥청 기준 지식을 보유합니다.

작물: ${cropLabel}
${banned ? `\n⚠️ 절대 규칙: 아래 병해충은 이 작물에 발생하지 않으므로 절대 진단하지 마세요:\n${banned}\n` : ''}
[병해충 증상 참고표]
${symptomRef}

[진단 3단계]

1. 사진 품질 확인
   - 초점 불량·너무 어두우면: disease="사진 품질 불량", confidence="낮음"으로 하세요.

2. 시각적 특징 분석
   - 병반 색상(갈색·흑색·흰색·황색·회색·분홍), 형태(원형·함몰·수침상·구멍·분말·균총), 위치(잎 앞/뒷면·과실·줄기·신초), 분포, 크기를 관찰하세요.
   - 특히: 잎 뒷면 흰털→노균병, 흑색 점무늬→흑두병, 갈색 함몰→탄저병, 구멍→세균성구멍병, 흰 분말→흰가루병

3. 진단
   - 증상 참고표 기준으로 가장 일치하는 병해충을 진단하세요.
   - 증상이 없거나 정상이면: disease="이상 없음", risk="낮음"
   - 확신이 낮으면: confidence="낮음", recommendation에 "전문가 현장 확인 권장" 추가

반드시 아래 JSON 형식으로만 응답하세요 (마크다운·코드블록 없이 순수 JSON):
{
  "disease": "진단된 병해충명",
  "type": "병 또는 충 (없으면 null)",
  "risk": "높음 또는 중간 또는 낮음",
  "symptoms_found": "사진에서 관찰된 증상 1~2문장",
  "recommendation": "방제 권고 1~2문장",
  "chemicals": ["추천 약제1", "추천 약제2"],
  "confidence": "높음 또는 중간 또는 낮음"
}`

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 9000)

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${image}` } },
          ],
        }],
        temperature: 0.1,
        max_tokens: 512,
      }),
    }).finally(() => clearTimeout(timer))

    const rawText = await groqRes.text()
    let data
    try { data = JSON.parse(rawText) }
    catch { throw new Error('응답 파싱 실패: ' + rawText.slice(0, 100)) }

    if (data.error) throw new Error(JSON.stringify(data.error))
    const aiText = data.choices?.[0]?.message?.content ?? ''

    const s = aiText.indexOf('{')
    const e = aiText.lastIndexOf('}')
    if (s === -1 || e === -1) throw new Error('JSON 없음: ' + aiText.slice(0, 100))
    let parsed = JSON.parse(aiText.slice(s, e + 1))
    if (Array.isArray(parsed)) parsed = parsed[0]
    res.json(parsed)
  } catch (err) {
    console.error('[diagnose] 오류:', err.message)
    res.status(500).json({ error: err.message })
  }
}
