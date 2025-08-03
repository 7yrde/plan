import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = getDatabase();
    
    const goal = db.prepare(`
      SELECT g.*, c.name as category_name, c.slug as category_slug, c.icon as category_icon
      FROM goals g
      JOIN categories c ON g.category_id = c.id
      WHERE g.slug = ?
    `).get(slug) as {
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
      created_at: string;
      updated_at: string;
      category_name: string;
      category_slug: string;
      category_icon: string;
    } | undefined;

    if (!goal) {
      return NextResponse.json(
        { error: '목표를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 카테고리 정보를 객체로 변환
    const goalWithCategory = {
      id: goal.id,
      category_id: goal.category_id,
      year: goal.year,
      slug: goal.slug,
      title: goal.title,
      description: goal.description,
      content: goal.content,
      status: goal.status,
      priority: goal.priority,
      start_date: goal.start_date,
      target_date: goal.target_date,
      created_at: goal.created_at,
      updated_at: goal.updated_at,
      category: {
        name: goal.category_name,
        slug: goal.category_slug,
        icon: goal.category_icon
      }
    };

    return NextResponse.json(goalWithCategory);
  } catch (error) {
    console.error('목표 조회 실패:', error);
    return NextResponse.json(
      { error: '목표 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const db = getDatabase();
    
    const allowedFields = ['status', 'priority', 'content', 'title', 'description', 'start_date', 'target_date'];
    const updateFields = Object.keys(body).filter(key => allowedFields.includes(key));
    
    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: '업데이트할 수 있는 필드가 없습니다.' },
        { status: 400 }
      );
    }

    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => body[field]);
    values.push(new Date().toISOString()); // updated_at
    values.push(slug);

    const result = db.prepare(`
      UPDATE goals 
      SET ${setClause}, updated_at = ?
      WHERE slug = ?
    `).run(...values);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: '목표를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: '목표가 업데이트되었습니다.' 
    });
  } catch (error) {
    console.error('목표 업데이트 실패:', error);
    return NextResponse.json(
      { error: '목표 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
} 