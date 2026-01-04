import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '../../data/caloriecounter.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Food entries table
  db.exec(`
    CREATE TABLE IF NOT EXISTS food_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      meal_type TEXT NOT NULL CHECK(meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
      image_url TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Food items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS food_items (
      id TEXT PRIMARY KEY,
      entry_id TEXT NOT NULL,
      name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      calories REAL NOT NULL,
      protein REAL NOT NULL,
      carbohydrates REAL NOT NULL,
      fat REAL NOT NULL,
      fiber REAL,
      sugar REAL,
      sodium REAL,
      cholesterol REAL,
      saturated_fat REAL,
      trans_fat REAL,
      confirmed INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (entry_id) REFERENCES food_entries(id) ON DELETE CASCADE
    )
  `);

  // Nutrition goals table
  db.exec(`
    CREATE TABLE IF NOT EXISTS nutrition_goals (
      user_id TEXT PRIMARY KEY,
      calories REAL NOT NULL,
      protein REAL NOT NULL,
      carbohydrates REAL NOT NULL,
      fat REAL NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_food_entries_user_date
    ON food_entries(user_id, date);

    CREATE INDEX IF NOT EXISTS idx_food_items_entry
    ON food_items(entry_id);
  `);
}

export default db;
