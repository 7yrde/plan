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

  // 기존 goals 테이블에 slug 컬럼 추가 (없는 경우)
  try {
    db.exec('ALTER TABLE goals ADD COLUMN slug TEXT');
  } catch (error) {
    // 컬럼이 이미 존재하는 경우 무시
  }

  // 기본 주제 데이터 삽입
  const categories = [
    { name: '컴퓨터', slug: 'computer', color: '#15803d', icon: '💻' },
    { name: '음악', slug: 'music', color: '#15803d', icon: '🎵' },
    { name: '건강', slug: 'health', color: '#15803d', icon: '💪' },
    { name: '돈', slug: 'money', color: '#15803d', icon: '💰' },
    { name: '언어', slug: 'language', color: '#15803d', icon: '🌍' }
  ];

  const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO categories (name, slug, color, icon) VALUES (?, ?, ?, ?)
  `);

  categories.forEach(category => {
    insertCategory.run(category.name, category.slug, category.color, category.icon);
  });

  // 기존 카테고리의 slug 업데이트
  const updateCategory = db.prepare(`
    UPDATE categories SET slug = ?, color = ? WHERE name = ?
  `);
  
  updateCategory.run('computer', '#15803d', '컴퓨터');
  updateCategory.run('music', '#15803d', '음악');
  updateCategory.run('health', '#15803d', '건강');
  updateCategory.run('money', '#15803d', '돈');
  updateCategory.run('language', '#15803d', '언어');

  // 기본 사용자 생성 (oyako/secretweapon)
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)
  `);
  insertUser.run('oyako', 'secretweapon');

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