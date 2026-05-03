import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { readFile } from 'fs/promises';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const attachmentId = parseInt(id);
    const db = getDatabase();
    
    const attachment = db.prepare(`
      SELECT * FROM plan_attachments WHERE id = ?
    `).get(attachmentId) as {
      id: number;
      file_path: string;
      mime_type: string;
      original_name: string;
      file_size: number;
    } | undefined;

    if (!attachment) {
      return NextResponse.json(
        { error: '첨부파일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 파일 읽기
    const fileBuffer = await readFile(attachment.file_path);
    
    // 응답 헤더 설정
    const headers = new Headers();
    headers.set('Content-Type', attachment.mime_type);
    headers.set('Content-Disposition', `attachment; filename="${attachment.original_name}"`);
    headers.set('Content-Length', attachment.file_size.toString());

    return new NextResponse(fileBuffer, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('파일 다운로드 실패:', error);
    return NextResponse.json(
      { error: '파일 다운로드에 실패했습니다.' },
      { status: 500 }
    );
  }
} 