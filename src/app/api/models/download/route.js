import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function GET(request) {
  console.log('API: Download request received');
  try {
    const url = new URL(request.url);
    const filePath = url.searchParams.get('path');
    console.log('Requested file path:', filePath);
    
    if (!filePath) {
      console.error('No file path provided');
      return NextResponse.json({ error: 'No file path provided' }, { status: 400 });
    }

    const fullPath = join(process.cwd(), 'public', filePath);
    console.log('Full file path:', fullPath);
    
    const stats = await stat(fullPath);
    
    const stream = createReadStream(fullPath);
    
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': stats.size.toString(),
        'X-Original-Size': stats.size.toString(),
        'Content-Disposition': `attachment; filename="${filePath.split('/').pop()}"`,
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'Content-Length, X-Original-Size',
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  }
} 