import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DB_PATH || path.resolve(process.cwd(), '..', 'data', '7yr.db');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

export function initDatabase() {
  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS plan_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS plan_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      color TEXT NOT NULL,
      icon TEXT NOT NULL,
      tag TEXT,
      link TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS plan_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      content TEXT,
      status TEXT DEFAULT 'open',
      priority TEXT DEFAULT 'medium',
      start_date DATE,
      target_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES plan_categories (id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS plan_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goal_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (goal_id) REFERENCES plan_goals (id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS plan_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goal_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      likes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (goal_id) REFERENCES plan_goals (id),
      FOREIGN KEY (user_id) REFERENCES plan_users (id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS plan_attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goal_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      file_path TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (goal_id) REFERENCES plan_goals (id)
    )
  `);

  // 시드: 카테고리 + 2026 목표 + test 사용자
  const categories = [
    { name: '컴퓨터', slug: 'computer', color: '#4c7cff', icon: '💻', tag: 'CPTR', link: '/proj/' },
    { name: '음악', slug: 'music', color: '#7b4fff', icon: '🎵', tag: 'MUSC', link: '/musc/' },
    { name: '건강', slug: 'health', color: '#4ade80', icon: '💪', tag: 'HLTH', link: '/hlth/' },
    { name: '돈', slug: 'money', color: '#fbbf24', icon: '💰', tag: 'NVST', link: '/nvst/' },
    { name: '언어', slug: 'language', color: '#f87171', icon: '🌍', tag: 'LNGG', link: '/lngg/' },
  ];

  const insertCat = db.prepare(`
    INSERT OR IGNORE INTO plan_categories (name, slug, color, icon, tag, link) VALUES (?, ?, ?, ?, ?, ?)
  `);
  categories.forEach(c => insertCat.run(c.name, c.slug, c.color, c.icon, c.tag, c.link));

  const seedGoals = [
    { categorySlug: 'computer', slug: 'plan-25', year: 2026, title: 'Service Security 전문가 + 전문영역 구축', description: '보안 전문성 확보 및 전문 영역 구축', priority: 'high' },
    { categorySlug: 'computer', slug: 'plan-26', year: 2026, title: '백엔드 + DevOps (ADOS, 7yr+bxyz)', description: '백엔드 개발 및 DevOps 인프라 구축', priority: 'high' },
    { categorySlug: 'music', slug: 'plan-27', year: 2026, title: 'DistroKid 음원 10건 발매 (+Suno)', description: '음원 10건 이상 발매', priority: 'high' },
    { categorySlug: 'music', slug: 'plan-28', year: 2026, title: '영상 20건 업로드', description: '각 채널 영상 20건 이상 업로드', priority: 'high' },
    { categorySlug: 'money', slug: 'plan-29', year: 2026, title: '주식계좌 여윳돈 4억', description: 'ISA, IRP, 연금저축 포함 주식계좌 4억 목표', priority: 'medium' },
    { categorySlug: 'health', slug: 'plan-30', year: 2026, title: '헬스 구력 2년, 복싱 6개월 (골격근 38kg)', description: '헬스 지속 및 복싱 시작, 골격근 38kg 달성', priority: 'medium' },
    { categorySlug: 'language', slug: 'plan-31', year: 2026, title: '일본어, 영어 발전 (수업, 여행, 시험)', description: '어학 능력 향상 - 수업, 여행, 시험 등', priority: 'medium' },
  ];

  const insertGoal = db.prepare(`
    INSERT OR IGNORE INTO plan_goals (category_id, year, slug, title, description, priority, start_date, target_date)
    VALUES ((SELECT id FROM plan_categories WHERE slug = ?), ?, ?, ?, ?, ?, '2026-01-01', '2026-12-31')
  `);
  seedGoals.forEach(g => insertGoal.run(g.categorySlug, g.year, g.slug, g.title, g.description, g.priority));

  // test 사용자
  db.prepare(`INSERT OR IGNORE INTO plan_users (username, password) VALUES (?, ?)`).run('test', 'test');

  return db;
}

export function generateGoalSlug(categorySlug: string, goalId: number): string {
  return `${categorySlug}-${goalId}`;
}

let db: Database.Database;
export function getDatabase() {
  if (!db) db = initDatabase();
  return db;
}

export function closeDatabase() {
  if (db) db.close();
}
