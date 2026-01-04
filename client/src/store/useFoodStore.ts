import { create } from 'zustand';
import { api } from '../services/api';
import type { FoodEntry, DailySummary, FoodItem } from '../../../shared/types/index';

interface FoodState {
  dailySummary: DailySummary | null;
  selectedDate: string;
  isLoading: boolean;
  error: string | null;
  setDate: (date: string) => void;
  fetchDailySummary: (date: string) => Promise<void>;
  addEntry: (
    mealType: FoodEntry['mealType'],
    foods: FoodItem[],
    imageUrl?: string,
    notes?: string
  ) => Promise<void>;
  updateEntry: (id: string, foods: FoodItem[]) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}

export const useFoodStore = create<FoodState>((set, get) => ({
  dailySummary: null,
  selectedDate: new Date().toISOString().split('T')[0],
  isLoading: false,
  error: null,

  setDate: (date) => {
    set({ selectedDate: date });
    get().fetchDailySummary(date);
  },

  fetchDailySummary: async (date) => {
    try {
      set({ isLoading: true, error: null });
      const summary = await api.getDailySummary(date);
      set({ dailySummary: summary, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addEntry: async (mealType, foods, imageUrl, notes) => {
    try {
      set({ isLoading: true, error: null });
      const date = get().selectedDate;
      await api.createEntry({ date, mealType, foods, imageUrl, notes });
      await get().fetchDailySummary(date);
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateEntry: async (id, foods) => {
    try {
      set({ isLoading: true, error: null });
      await api.updateEntry(id, foods);
      await get().fetchDailySummary(get().selectedDate);
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  deleteEntry: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await api.deleteEntry(id);
      await get().fetchDailySummary(get().selectedDate);
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
}));
