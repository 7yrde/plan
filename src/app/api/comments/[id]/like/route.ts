import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const commentId = parseInt(id);
    const db = getDatabase();
    
    const result = db.prepare(`
      UPDATE comments 
      SET likes = likes + 1
      WHERE id = ?
    `).run(commentId);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: '좋아요가 추가되었습니다.' 
    });
  } catch (error) {
    console.error('좋아요 실패:', error);
    return NextResponse.json(
      { error: '좋아요에 실패했습니다.' },
      { status: 500 }
    );
  }
} 