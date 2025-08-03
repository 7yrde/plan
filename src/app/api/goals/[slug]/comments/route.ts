import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { getServerSession } from 'next-auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = getDatabase();
    
    const comments = db.prepare(`
      SELECT c.*, u.username
      FROM comments c
      JOIN users u ON c.user_id = u.id
      JOIN goals g ON c.goal_id = g.id
      WHERE g.slug = ?
      ORDER BY c.created_at DESC
    `).all(slug) as Array<{
      id: number;
      goal_id: number;
      user_id: number;
      content: string;
      likes: number;
      created_at: string;
      username: string;
    }>;

    const commentsWithUser = comments.map(comment => ({
      ...comment,
      user: {
        username: comment.username
      }
    }));

    return NextResponse.json(commentsWithUser);
  } catch (error) {
    console.error('댓글 조회 실패:', error);
    return NextResponse.json(
      { error: '댓글 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.name) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const { content } = await request.json();
    const db = getDatabase();
    
    // 목표 ID 조회
    const goal = db.prepare('SELECT id FROM goals WHERE slug = ?').get(slug) as {
      id: number;
    } | undefined;
    if (!goal) {
      return NextResponse.json(
        { error: '목표를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 사용자 ID 조회
    const user = db.prepare('SELECT id FROM users WHERE username = ?').get(session.user.name) as {
      id: number;
    } | undefined;
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const result = db.prepare(`
      INSERT INTO comments (goal_id, user_id, content)
      VALUES (?, ?, ?)
    `).run(goal.id, user.id, content);

    return NextResponse.json({ 
      message: '댓글이 작성되었습니다.',
      id: result.lastInsertRowid 
    });
  } catch (error) {
    console.error('댓글 작성 실패:', error);
    return NextResponse.json(
      { error: '댓글 작성에 실패했습니다.' },
      { status: 500 }
    );
  }
} 