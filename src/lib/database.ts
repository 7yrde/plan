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
      title TEXT NOT NULL,
      description TEXT,
      target_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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

  // 기본 주제 데이터 삽입
  const categories = [
    { name: '컴퓨터', color: '#3B82F6', icon: '💻' },
    { name: '음악', color: '#8B5CF6', icon: '🎵' },
    { name: '건강', color: '#10B981', icon: '💪' },
    { name: '돈', color: '#F59E0B', icon: '💰' },
    { name: '언어', color: '#EF4444', icon: '🌍' }
  ];

  const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO categories (name, color, icon) VALUES (?, ?, ?)
  `);

  categories.forEach(category => {
    insertCategory.run(category.name, category.color, category.icon);
  });

  // 기본 사용자 생성 (oyako/secretweapon)
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)
  `);
  insertUser.run('oyako', 'secretweapon');

  return db;
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