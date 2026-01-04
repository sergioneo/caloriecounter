import db from './database.js';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import type { User } from '../../../shared/types/index.js';

export class UserModel {
  static async create(email: string, password: string, name: string): Promise<User> {
    const id = randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    const stmt = db.prepare(`
      INSERT INTO users (id, email, password_hash, name)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(id, email, passwordHash, name);

    return {
      id,
      email,
      name,
      createdAt: new Date().toISOString()
    };
  }

  static async findByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const stmt = db.prepare(`
      SELECT id, email, password_hash as passwordHash, name, created_at as createdAt
      FROM users
      WHERE email = ?
    `);

    return stmt.get(email) as (User & { passwordHash: string }) | null;
  }

  static async findById(id: string): Promise<User | null> {
    const stmt = db.prepare(`
      SELECT id, email, name, created_at as createdAt
      FROM users
      WHERE id = ?
    `);

    return stmt.get(id) as User | null;
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
