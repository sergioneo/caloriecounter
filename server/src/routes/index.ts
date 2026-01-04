import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { FoodController } from '../controllers/foodController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Auth routes
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get('/auth/me', authenticateToken, AuthController.me);

// Food routes (all protected)
router.post('/food/analyze-image', authenticateToken, FoodController.analyzeImage);
router.post('/food/manual-entry', authenticateToken, FoodController.manualEntry);
router.post('/food/entries', authenticateToken, FoodController.createEntry);
router.put('/food/entries/:id', authenticateToken, FoodController.updateEntry);
router.delete('/food/entries/:id', authenticateToken, FoodController.deleteEntry);
router.get('/food/daily/:date', authenticateToken, FoodController.getDailySummary);
router.get('/food/history', authenticateToken, FoodController.getHistory);

export default router;
