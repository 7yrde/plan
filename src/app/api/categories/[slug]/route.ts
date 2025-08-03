import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = getDatabase();
    
    const category = db.prepare(`
      SELECT id, name, slug, color, icon, created_at 
      FROM categories 
      WHERE slug = ?
    `).get(slug);

    if (!category) {
      return NextResponse.json(
        { error: '카테고리를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('카테고리 조회 실패:', error);
    return NextResponse.json(
      { error: '카테고리 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
} 