import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function GET() {
  try {
    const db = getDatabase();
    const categories = db.prepare(`
      SELECT id, name, slug, color, icon, tag, link, created_at
      FROM categories
      ORDER BY id
    `).all();

    return NextResponse.json(categories);
  } catch (error) {
    console.error('카테고리 조회 실패:', error);
    return NextResponse.json(
      { error: '카테고리 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
} 