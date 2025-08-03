import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    
    const db = getDatabase();
    const goals = db.prepare(`
      SELECT 
        g.id,
        g.category_id,
        g.year,
        g.title,
        g.description,
        g.target_date,
        COALESCE(
          CASE 
            WHEN COUNT(t.id) = 0 THEN 0
            ELSE ROUND((COUNT(CASE WHEN t.status = 'completed' THEN 1 END) * 100.0) / COUNT(t.id))
          END, 0
        ) as progress
      FROM goals g
      LEFT JOIN tasks t ON g.id = t.goal_id
      WHERE g.year = ?
      GROUP BY g.id, g.category_id, g.year, g.title, g.description, g.target_date
      ORDER BY g.category_id, g.id
    `).all(parseInt(year));

    return NextResponse.json(goals);
  } catch (error) {
    console.error('목표 조회 실패:', error);
    return NextResponse.json(
      { error: '목표 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { category_id, year, title, description, target_date } = await request.json();
    
    const db = getDatabase();
    const result = db.prepare(`
      INSERT INTO goals (category_id, year, title, description, target_date)
      VALUES (?, ?, ?, ?, ?)
    `).run(category_id, year, title, description, target_date);

    return NextResponse.json({ 
      id: result.lastInsertRowid,
      message: '목표가 생성되었습니다.' 
    });
  } catch (error) {
    console.error('목표 생성 실패:', error);
    return NextResponse.json(
      { error: '목표 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
} 