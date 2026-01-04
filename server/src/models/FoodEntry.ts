import db from './database.js';
import { randomUUID } from 'crypto';
import type { FoodEntry, FoodItem, NutritionInfo, DailySummary } from '../../../shared/types/index.js';

export class FoodEntryModel {
  static async create(
    userId: string,
    date: string,
    mealType: FoodEntry['mealType'],
    foods: FoodItem[],
    imageUrl?: string,
    notes?: string
  ): Promise<FoodEntry> {
    const id = randomUUID();
    const now = new Date().toISOString();

    const entryStmt = db.prepare(`
      INSERT INTO food_entries (id, user_id, date, meal_type, image_url, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const itemStmt = db.prepare(`
      INSERT INTO food_items (
        id, entry_id, name, quantity, unit,
        calories, protein, carbohydrates, fat,
        fiber, sugar, sodium, cholesterol, saturated_fat, trans_fat,
        confirmed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      entryStmt.run(id, userId, date, mealType, imageUrl || null, notes || null, now, now);

      for (const food of foods) {
        const foodId = food.id || randomUUID();
        itemStmt.run(
          foodId,
          id,
          food.name,
          food.quantity,
          food.unit,
          food.nutrition.calories,
          food.nutrition.protein,
          food.nutrition.carbohydrates,
          food.nutrition.fat,
          food.nutrition.fiber || null,
          food.nutrition.sugar || null,
          food.nutrition.sodium || null,
          food.nutrition.cholesterol || null,
          food.nutrition.saturatedFat || null,
          food.nutrition.transFat || null,
          food.confirmed ? 1 : 0
        );
      }
    });

    transaction();

    return this.findById(id)!;
  }

  static findById(id: string): FoodEntry | null {
    const entryStmt = db.prepare(`
      SELECT id, user_id as userId, date, meal_type as mealType,
             image_url as imageUrl, notes, created_at as createdAt, updated_at as updatedAt
      FROM food_entries
      WHERE id = ?
    `);

    const entry = entryStmt.get(id) as Omit<FoodEntry, 'foods'> | undefined;
    if (!entry) return null;

    const itemsStmt = db.prepare(`
      SELECT id, name, quantity, unit, confirmed,
             calories, protein, carbohydrates, fat,
             fiber, sugar, sodium, cholesterol, saturated_fat as saturatedFat, trans_fat as transFat
      FROM food_items
      WHERE entry_id = ?
    `);

    const items = itemsStmt.all(id) as any[];
    const foods: FoodItem[] = items.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      confirmed: Boolean(item.confirmed),
      nutrition: {
        calories: item.calories,
        protein: item.protein,
        carbohydrates: item.carbohydrates,
        fat: item.fat,
        fiber: item.fiber,
        sugar: item.sugar,
        sodium: item.sodium,
        cholesterol: item.cholesterol,
        saturatedFat: item.saturatedFat,
        transFat: item.transFat
      }
    }));

    return { ...entry, foods };
  }

  static findByUserAndDate(userId: string, date: string): FoodEntry[] {
    const entryStmt = db.prepare(`
      SELECT id
      FROM food_entries
      WHERE user_id = ? AND date = ?
      ORDER BY created_at ASC
    `);

    const entries = entryStmt.all(userId, date) as { id: string }[];
    return entries.map(e => this.findById(e.id)!).filter(Boolean);
  }

  static findByUserAndDateRange(userId: string, startDate: string, endDate: string): FoodEntry[] {
    const entryStmt = db.prepare(`
      SELECT id
      FROM food_entries
      WHERE user_id = ? AND date BETWEEN ? AND ?
      ORDER BY date DESC, created_at DESC
    `);

    const entries = entryStmt.all(userId, startDate, endDate) as { id: string }[];
    return entries.map(e => this.findById(e.id)!).filter(Boolean);
  }

  static getDailySummary(userId: string, date: string): DailySummary {
    const entries = this.findByUserAndDate(userId, date);

    const totalNutrition: NutritionInfo = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      cholesterol: 0,
      saturatedFat: 0,
      transFat: 0
    };

    for (const entry of entries) {
      for (const food of entry.foods) {
        totalNutrition.calories += food.nutrition.calories;
        totalNutrition.protein += food.nutrition.protein;
        totalNutrition.carbohydrates += food.nutrition.carbohydrates;
        totalNutrition.fat += food.nutrition.fat;
        totalNutrition.fiber! += food.nutrition.fiber || 0;
        totalNutrition.sugar! += food.nutrition.sugar || 0;
        totalNutrition.sodium! += food.nutrition.sodium || 0;
        totalNutrition.cholesterol! += food.nutrition.cholesterol || 0;
        totalNutrition.saturatedFat! += food.nutrition.saturatedFat || 0;
        totalNutrition.transFat! += food.nutrition.transFat || 0;
      }
    }

    return {
      date,
      totalNutrition,
      entries
    };
  }

  static async update(id: string, foods: FoodItem[]): Promise<FoodEntry | null> {
    const now = new Date().toISOString();

    const updateStmt = db.prepare(`
      UPDATE food_entries
      SET updated_at = ?
      WHERE id = ?
    `);

    const deleteStmt = db.prepare(`DELETE FROM food_items WHERE entry_id = ?`);

    const itemStmt = db.prepare(`
      INSERT INTO food_items (
        id, entry_id, name, quantity, unit,
        calories, protein, carbohydrates, fat,
        fiber, sugar, sodium, cholesterol, saturated_fat, trans_fat,
        confirmed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      updateStmt.run(now, id);
      deleteStmt.run(id);

      for (const food of foods) {
        const foodId = food.id || randomUUID();
        itemStmt.run(
          foodId,
          id,
          food.name,
          food.quantity,
          food.unit,
          food.nutrition.calories,
          food.nutrition.protein,
          food.nutrition.carbohydrates,
          food.nutrition.fat,
          food.nutrition.fiber || null,
          food.nutrition.sugar || null,
          food.nutrition.sodium || null,
          food.nutrition.cholesterol || null,
          food.nutrition.saturatedFat || null,
          food.nutrition.transFat || null,
          food.confirmed ? 1 : 0
        );
      }
    });

    transaction();

    return this.findById(id);
  }

  static delete(id: string): boolean {
    const stmt = db.prepare(`DELETE FROM food_entries WHERE id = ?`);
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
