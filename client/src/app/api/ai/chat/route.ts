import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const aiApiUrl = process.env.AI_API_URL || 'https://nonmendicant-transcultural-porsche.ngrok-free.dev/v1/chat/completions';

    const response = await fetch(aiApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: body.model || 'lmstudio-community/gpt-oss-20b-GGUF',
        messages: body.messages,
        temperature: body.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: 'AI 服務器響應錯誤', error: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('AI Proxy Error:', error);
    return NextResponse.json(
      { message: '無法連接到 AI 服務器', error: error.message },
      { status: 500 }
    );
  }
}
