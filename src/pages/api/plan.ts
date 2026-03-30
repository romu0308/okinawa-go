import type { APIRoute } from 'astro';
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const apiKey = import.meta.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured', fallback: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const prompt = `あなたは沖縄在住5年の地元ガイドです。観光客向けのガイドブック的な提案ではなく、在住者だからこそ知っている穴場やリアルなおすすめを含めたプランを作成してください。

以下の条件で沖縄旅行プランを作成してください：
- 日数: ${body.days}
- 人数構成: ${body.group}
- 予算: ${body.budget}
- 興味: ${body.interests?.join('、')}
- 時期: ${body.month}月

フォーマット：
- 日ごとのタイムライン形式
- 各スポットの具体的な名前と理由
- 予算の目安
- 移動時間の目安
- 地元民ならではのTips

マークダウン形式で出力してください。`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || 'プランの生成に失敗しました';

    return new Response(JSON.stringify({ plan: text }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'API call failed', fallback: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
