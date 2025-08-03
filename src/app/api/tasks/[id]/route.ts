import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json();
    const { id } = await params;
    const taskId = parseInt(id);
    
    const db = getDatabase();
    const completedAt = status === 'completed' ? new Date().toISOString() : null;
    
    db.prepare(`
      UPDATE tasks 
      SET status = ?, completed_at = ?
      WHERE id = ?
    `).run(status, completedAt, taskId);

    return NextResponse.json({ 
      message: '세부 계획이 업데이트되었습니다.' 
    });
  } catch (error) {
    console.error('세부 계획 업데이트 실패:', error);
    return NextResponse.json(
      { error: '세부 계획 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taskId = parseInt(id);
    
    const db = getDatabase();
    db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);

    return NextResponse.json({ 
      message: '세부 계획이 삭제되었습니다.' 
    });
  } catch (error) {
    console.error('세부 계획 삭제 실패:', error);
    return NextResponse.json(
      { error: '세부 계획 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
} 