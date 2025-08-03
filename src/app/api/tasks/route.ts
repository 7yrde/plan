import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get('goalId');
    
    const db = getDatabase();
    let tasks;
    
    if (goalId) {
      tasks = db.prepare(`
        SELECT id, goal_id, title, description, status, priority, created_at, completed_at
        FROM tasks 
        WHERE goal_id = ?
        ORDER BY created_at DESC
      `).all(goalId);
    } else {
      tasks = db.prepare(`
        SELECT id, goal_id, title, description, status, priority, created_at, completed_at
        FROM tasks 
        ORDER BY created_at DESC
      `).all();
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('세부 계획 조회 실패:', error);
    return NextResponse.json(
      { error: '세부 계획 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { goal_id, title, description, priority } = await request.json();
    
    const db = getDatabase();
    const result = db.prepare(`
      INSERT INTO tasks (goal_id, title, description, priority)
      VALUES (?, ?, ?, ?)
    `).run(goal_id, title, description, priority || 'medium');

    return NextResponse.json({ 
      id: result.lastInsertRowid,
      message: '세부 계획이 생성되었습니다.' 
    });
  } catch (error) {
    console.error('세부 계획 생성 실패:', error);
    return NextResponse.json(
      { error: '세부 계획 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
} 