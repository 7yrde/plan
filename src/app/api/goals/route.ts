import { NextResponse } from 'next/server';
import { getDatabase, generateGoalSlug } from '@/lib/database';

interface GoalRow {
  id: number;
  category_id: number;
  year: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  status: string;
  priority: string;
  start_date: string;
  target_date: string;
  category_name: string;
  category_slug: string;
  category_icon: string;
  progress: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const category = searchParams.get('category');
    
    const db = getDatabase();
    
    let query = `
      SELECT g.id, g.category_id, g.year, g.slug, g.title, g.description, g.content, g.status, g.priority, g.start_date, g.target_date,
             c.id as category_id, c.name as category_name, c.slug as category_slug, c.icon as category_icon, c.color as category_color, c.tag as category_tag, c.link as category_link,
             COALESCE(
               CASE 
                 WHEN COUNT(t.id) = 0 THEN 0
                 ELSE ROUND((COUNT(CASE WHEN t.status = 'completed' THEN 1 END) * 100.0) / COUNT(t.id))
               END, 0
             ) as progress
      FROM plan_goals g
      JOIN plan_categories c ON g.category_id = c.id
      LEFT JOIN plan_tasks t ON g.id = t.goal_id
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
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' GROUP BY g.id ORDER BY g.created_at DESC';
    
    const goals = db.prepare(query).all(params) as GoalRow[];
    
    // 결과를 원하는 형태로 변환
    const formattedGoals = goals.map((goal) => ({
      id: goal.id,
      slug: goal.slug,
      title: goal.title,
      description: goal.description,
      content: goal.content,
      status: goal.status,
      priority: goal.priority,
      start_date: goal.start_date,
      target_date: goal.target_date,
      category: {
        id: goal.category_id,
        name: goal.category_name,
        slug: goal.category_slug,
        icon: goal.category_icon
      },
      progress: goal.progress
    }));
    
    return NextResponse.json(formattedGoals);
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
    const category = db.prepare('SELECT slug FROM plan_categories WHERE id = ?').get(category_id) as {
      slug: string;
    } | undefined;
    if (!category) {
      return NextResponse.json(
        { error: '카테고리를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 다음 목표 ID 조회
    const nextIdResult = db.prepare('SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM plan_goals WHERE category_id = ?').get(category_id) as {
      next_id: number;
    };
    const nextId = nextIdResult.next_id;
    
    // slug 생성
    const slug = generateGoalSlug(category.slug, nextId);

    // 목표 생성 (slug 포함)
    const result = db.prepare(`
      INSERT INTO plan_goals (category_id, year, slug, title, description, target_date, start_date)
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