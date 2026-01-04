import { Request, Response } from 'express';
import { FoodEntryModel } from '../models/FoodEntry.js';
import { ClaudeService } from '../services/claudeService.js';
import type { AuthRequest } from '../middleware/auth.js';
import type { FoodRecognitionRequest, ManualEntryRequest } from '../../../shared/types/index.js';

export class FoodController {
  static async analyzeImage(req: AuthRequest, res: Response) {
    try {
      const { image, mealType } = req.body as FoodRecognitionRequest;
      const userId = req.userId!;

      if (!image) {
        return res.status(400).json({ error: 'Image is required' });
      }

      // Remove data URL prefix if present
      const base64Image = image.replace(/^data:image\/\w+;base64,/, '');

      const result = await ClaudeService.analyzeFoodImage(base64Image, mealType);

      res.json(result);
    } catch (error) {
      console.error('Image analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze image' });
    }
  }

  static async createEntry(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { date, mealType, foods, imageUrl, notes } = req.body;

      if (!date || !mealType || !foods || !Array.isArray(foods)) {
        return res.status(400).json({ error: 'Date, meal type, and foods are required' });
      }

      const entry = await FoodEntryModel.create(userId, date, mealType, foods, imageUrl, notes);

      res.status(201).json(entry);
    } catch (error) {
      console.error('Create entry error:', error);
      res.status(500).json({ error: 'Failed to create food entry' });
    }
  }

  static async updateEntry(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const { foods } = req.body;

      if (!foods || !Array.isArray(foods)) {
        return res.status(400).json({ error: 'Foods array is required' });
      }

      // Verify entry belongs to user
      const existingEntry = FoodEntryModel.findById(id);
      if (!existingEntry) {
        return res.status(404).json({ error: 'Entry not found' });
      }
      if (existingEntry.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const entry = await FoodEntryModel.update(id, foods);

      res.json(entry);
    } catch (error) {
      console.error('Update entry error:', error);
      res.status(500).json({ error: 'Failed to update food entry' });
    }
  }

  static async deleteEntry(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      // Verify entry belongs to user
      const existingEntry = FoodEntryModel.findById(id);
      if (!existingEntry) {
        return res.status(404).json({ error: 'Entry not found' });
      }
      if (existingEntry.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const deleted = FoodEntryModel.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Entry not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete entry error:', error);
      res.status(500).json({ error: 'Failed to delete food entry' });
    }
  }

  static async getDailySummary(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { date } = req.params;

      if (!date) {
        return res.status(400).json({ error: 'Date is required' });
      }

      const summary = FoodEntryModel.getDailySummary(userId, date);

      res.json(summary);
    } catch (error) {
      console.error('Get daily summary error:', error);
      res.status(500).json({ error: 'Failed to get daily summary' });
    }
  }

  static async getHistory(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      const entries = FoodEntryModel.findByUserAndDateRange(
        userId,
        startDate as string,
        endDate as string
      );

      res.json(entries);
    } catch (error) {
      console.error('Get history error:', error);
      res.status(500).json({ error: 'Failed to get history' });
    }
  }

  static async manualEntry(req: AuthRequest, res: Response) {
    try {
      const { prompt, foodItem } = req.body as ManualEntryRequest;

      if (!prompt && !foodItem) {
        return res.status(400).json({ error: 'Either prompt or foodItem is required' });
      }

      if (foodItem) {
        // Direct manual entry - just validate and return
        return res.json({ foods: [foodItem] });
      }

      if (prompt) {
        // AI-assisted entry
        const foods = await ClaudeService.parseManualEntry(prompt);
        return res.json({ foods });
      }
    } catch (error) {
      console.error('Manual entry error:', error);
      res.status(500).json({ error: 'Failed to process manual entry' });
    }
  }
}
