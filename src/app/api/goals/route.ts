import { NextResponse } from 'next/server';
import { getDatabase, generateGoalSlug } from '@/lib/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const category = searchParams.get('category');
    
    const db = getDatabase();
    
    let query = `
      SELECT g.id, g.category_id, g.year, g.slug, g.title, g.description, g.target_date,
             COALESCE(
               CASE 
                 WHEN COUNT(t.id) = 0 THEN 0
                 ELSE ROUND((COUNT(CASE WHEN t.status = 'completed' THEN 1 END) * 100.0) / COUNT(t.id))
               END, 0
             ) as progress
      FROM goals g
      LEFT JOIN tasks t ON g.id = t.goal_id
    `;
    
    const conditions = [];
    const params = [];
    
    if (year) {
      conditions.push('g.year = ?');
      params.push(parseInt(year));
    }
    
    if (category) {
      conditions.push('c.slug = ?');
      params.push(category);
      query = query.replace('FROM goals g', 'FROM goals g JOIN categories c ON g.category_id = c.id');
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' GROUP BY g.id ORDER BY g.created_at DESC';
    
    const goals = db.prepare(query).all(params);
    
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
    const { category_id, year, title, description, target_date, start_date } = await request.json();
    
    const db = getDatabase();
    
    // 카테고리 slug 조회
    const category = db.prepare('SELECT slug FROM categories WHERE id = ?').get(category_id) as {
      slug: string;
    } | undefined;
    if (!category) {
      return NextResponse.json(
        { error: '카테고리를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 다음 목표 ID 조회
    const nextIdResult = db.prepare('SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM goals WHERE category_id = ?').get(category_id) as {
      next_id: number;
    };
    const nextId = nextIdResult.next_id;
    
    // slug 생성
    const slug = generateGoalSlug(category.slug, nextId);

    // 목표 생성 (slug 포함)
    const result = db.prepare(`
      INSERT INTO goals (category_id, year, slug, title, description, target_date, start_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(category_id, year, slug, title, description, target_date || null, start_date || null);

    const goalId = result.lastInsertRowid as number;

    return NextResponse.json({ 
      message: '목표가 추가되었습니다.',
      id: goalId,
      slug: slug
    });
  } catch (error) {
    console.error('목표 추가 실패:', error);
    return NextResponse.json(
      { error: '목표 추가에 실패했습니다.' },
      { status: 500 }
    );
  }
} 