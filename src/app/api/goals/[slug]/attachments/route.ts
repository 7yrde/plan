import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = getDatabase();
    
    const attachments = db.prepare(`
      SELECT a.*
      FROM plan_attachments a
      JOIN plan_goals g ON a.goal_id = g.id
      WHERE g.slug = ?
      ORDER BY a.created_at DESC
    `).all(slug) as Array<{
      id: number;
      goal_id: number;
      filename: string;
      original_name: string;
      file_size: number;
      mime_type: string;
      created_at: string;
    }>;

    return NextResponse.json(attachments);
  } catch (error) {
    console.error('첨부파일 조회 실패:', error);
    return NextResponse.json(
      { error: '첨부파일 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: '파일이 필요합니다.' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // 목표 ID 조회
    const goal = db.prepare('SELECT id FROM plan_goals WHERE slug = ?').get(slug) as {
      id: number;
    } | undefined;
    if (!goal) {
      return NextResponse.json(
        { error: '목표를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 파일 저장 디렉토리 생성
    const uploadDir = path.join(process.cwd(), 'uploads', goal.id.toString());
    await mkdir(uploadDir, { recursive: true });

    // 파일명 생성 (중복 방지)
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filePath = path.join(uploadDir, filename);

    // 파일 저장
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // 데이터베이스에 저장
    const result = db.prepare(`
      INSERT INTO plan_attachments (goal_id, filename, original_name, file_size, mime_type, file_path)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(goal.id, filename, file.name, file.size, file.type, filePath);

    return NextResponse.json({ 
      message: '파일이 업로드되었습니다.',
      id: result.lastInsertRowid 
    });
  } catch (error) {
    console.error('파일 업로드 실패:', error);
    return NextResponse.json(
      { error: '파일 업로드에 실패했습니다.' },
      { status: 500 }
    );
  }
} 