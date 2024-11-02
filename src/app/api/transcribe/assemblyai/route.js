import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('file');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'Authorization': process.env.ASSEMBLYAI_API_KEY,
      },
      body: audioFile,
      signal: controller.signal,
    });

    const { upload_url } = await response.json();

    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': process.env.ASSEMBLYAI_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: upload_url,
        language_detection: true,
        speaker_labels: true
      }),
    });

    const transcript = await transcriptResponse.json();

    // 轮询获取结果
    const pollingEndpoint = `https://api.assemblyai.com/v2/transcript/${transcript.id}`;
    
    while (true) {
      const pollingResponse = await fetch(pollingEndpoint, {
        headers: {
          'Authorization': process.env.ASSEMBLYAI_API_KEY,
        },
      });
      const transcriptionResult = await pollingResponse.json();

      if (transcriptionResult.status === 'completed') {
        clearTimeout(timeoutId);
        
        // 格式化带说话人的文本
        let formattedText = '';
        if (transcriptionResult.utterances) {
          formattedText = transcriptionResult.utterances
            .map(u => `说话人 ${u.speaker}:\n${u.text}`)
            .join('\n\n');
        } else {
          formattedText = transcriptionResult.text;
        }
        
        return NextResponse.json({ 
          text: formattedText,
          utterances: transcriptionResult.utterances 
        });
      }

      if (transcriptionResult.status === 'error') {
        throw new Error(transcriptionResult.error);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: '请求超时，请稍后重试' },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || '转录失败' },
      { status: 500 }
    );
  }
} 