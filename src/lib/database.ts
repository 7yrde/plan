import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'dashboard.db');

// 데이터베이스 초기화
export function initDatabase() {
  const db = new Database(dbPath);
  
  // 사용자 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 주제 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      color TEXT NOT NULL,
      icon TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 목표 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
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
      FOREIGN KEY (category_id) REFERENCES categories (id)
    )
  `);

  // 세부 계획 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goal_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (goal_id) REFERENCES goals (id)
    )
  `);

  // 댓글 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goal_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      likes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (goal_id) REFERENCES goals (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // 첨부파일 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goal_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      file_path TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (goal_id) REFERENCES goals (id)
    )
  `);

  // 기존 categories 테이블에 slug 컬럼 추가 (없는 경우)
  try {
    db.exec('ALTER TABLE categories ADD COLUMN slug TEXT');
  } catch (error) {
    // 컬럼이 이미 존재하는 경우 무시
  }

  // categories 테이블에 tag 컬럼 추가 (Jira 태그)
  try {
    db.exec('ALTER TABLE categories ADD COLUMN tag TEXT');
  } catch (error) {
    // 컬럼이 이미 존재하는 경우 무시
  }

  // categories 테이블에 link 컬럼 추가 (관련 서비스 경로)
  try {
    db.exec('ALTER TABLE categories ADD COLUMN link TEXT');
  } catch (error) {
    // 컬럼이 이미 존재하는 경우 무시
  }

  // 기존 goals 테이블에 slug 컬럼 추가 (없는 경우)
  try {
    db.exec('ALTER TABLE goals ADD COLUMN slug TEXT');
  } catch (error) {
    // 컬럼이 이미 존재하는 경우 무시
  }

  // 기본 주제 데이터 삽입
  const categories = [
    { name: '컴퓨터', slug: 'computer', color: '#4c7cff', icon: '💻', tag: 'CPTR', link: '/proj/' },
    { name: '음악', slug: 'music', color: '#7b4fff', icon: '🎵', tag: 'MUSC', link: null },
    { name: '건강', slug: 'health', color: '#4ade80', icon: '💪', tag: 'HLTH', link: '/hlth/' },
    { name: '돈', slug: 'money', color: '#fbbf24', icon: '💰', tag: 'NVST', link: '/nvst/' },
    { name: '언어', slug: 'language', color: '#f87171', icon: '🌍', tag: 'LNGG', link: '/lngg/' }
  ];

  const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO categories (name, slug, color, icon) VALUES (?, ?, ?, ?)
  `);

  categories.forEach(category => {
    insertCategory.run(category.name, category.slug, category.color, category.icon);
  });

  // 기존 카테고리의 slug, color, tag, link 업데이트
  const updateCategory = db.prepare(`
    UPDATE categories SET slug = ?, color = ?, tag = ?, link = ? WHERE name = ?
  `);

  categories.forEach(c => {
    updateCategory.run(c.slug, c.color, c.tag, c.link, c.name);
  });

  // 2026 목표 시드 데이터 (Jira PLAN 이슈 기반)
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
    INSERT OR IGNORE INTO goals (category_id, year, slug, title, description, priority, start_date, target_date)
    VALUES ((SELECT id FROM categories WHERE slug = ?), ?, ?, ?, ?, ?, '2026-01-01', '2026-12-31')
  `);

  seedGoals.forEach(g => {
    insertGoal.run(g.categorySlug, g.year, g.slug, g.title, g.description, g.priority);
  });

  // 기본 사용자 생성 (test/test)
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)
  `);
  insertUser.run('test', 'test');
  // 기존 tester 계정이 있으면 test로 변경
  db.prepare(`UPDATE users SET username = 'test', password = 'test' WHERE username = 'tester'`).run();

  return db;
}

// 목표 slug 생성 함수
export function generateGoalSlug(categorySlug: string, goalId: number): string {
  return `${categorySlug}-${goalId}`;
}

// 데이터베이스 인스턴스
let db: Database.Database;

export function getDatabase() {
  if (!db) {
    db = initDatabase();
  }
  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
  }
} 