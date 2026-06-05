// Vercel 서버리스 — Groq Vision API 호출 (범용 작물 진단)
export const config = { runtime: 'edge' }

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

  const { image, mimeType, context } = await req.json()
  if (!image) return new Response(JSON.stringify({ error: '이미지가 없습니다' }), { status: 400 })

  const prompt = `당신은 식물 병해충 전문가입니다.
사용자가 촬영한 작물 사진을 분석하여 병해충을 진단합니다.

${context?.crop && context.crop !== '범용' ? `작물: ${context.crop}` : '작물: 알 수 없음(사진에서 판단)'}

다음 JSON 형식으로만 응답하세요. 마크다운 코드블록 없이 순수 JSON만:
{
  "disease": "진단된 병해충 이름 (이상 없으면 '정상')",
  "type": "병 또는 충 또는 null",
  "risk": "높음 또는 중간 또는 낮음",
  "symptoms_found": "관찰된 증상 설명 (2-3문장)",
  "recommendation": "방제 권고사항 (2-3문장)",
  "chemicals": ["추천 약제1", "추천 약제2"],
  "confidence": "높음 또는 중간 또는 낮음"
}

사진에 작물이 없거나 판단 불가 시: disease를 "판단 불가", risk를 "낮음"으로 설정하세요.`

  try {
    const groqRes = await fetch(GROQ_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${image}` } }
          ]
        }],
        temperature: 0.2,
        max_tokens: 600
      })
    })

    const groqData = await groqRes.json()
    if (!groqRes.ok) throw new Error(groqData.error?.message ?? 'Groq 오류')

    const content = groqData.choices?.[0]?.message?.content ?? ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('AI 응답 파싱 실패')

    const result = JSON.parse(jsonMatch[0])
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
