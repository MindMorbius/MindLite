import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('file');
    
    // 创建新的 FormData，添加必需的 model 参数
    const apiFormData = new FormData();
    apiFormData.append('file', audioFile);
    apiFormData.append('model', 'FunAudioLLM/SenseVoiceSmall');
    
    const response = await fetch('https://api.siliconflow.cn/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SILICONFLOW_API_KEY}`,
      },
      body: apiFormData,
    });

    // 添加响应类型检查
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Invalid response type:', contentType, 'Response:', text);
      return NextResponse.json(
        { error: '服务器返回了非预期的响应格式' },
        { status: 500 }
      );
    }

    const data = await response.json();

    // 处理不同状态码
    switch (response.status) {
      case 200:
        return NextResponse.json(data);
      case 400:
        return NextResponse.json(
          { error: data.error || '无效的请求参数' },
          { status: 400 }
        );
      case 401:
        return NextResponse.json(
          { error: 'API密钥无效或已过期' },
          { status: 401 }
        );
      case 429:
        return NextResponse.json(
          { error: '请求过于频繁，请稍后再试' },
          { status: 429 }
        );
      case 503:
      case 504:
        return NextResponse.json(
          { error: '服务暂时不可用，请稍后再试' },
          { status: response.status }
        );
      default:
        return NextResponse.json(
          { error: data.error || '转录失败' },
          { status: response.status }
        );
    }
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: error.message || '音频转录失败' },
      { status: 500 }
    );
  }
} 