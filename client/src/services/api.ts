import { auth, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type {
  FoodRecognitionRequest,
  FoodRecognitionResponse,
  ManualEntryRequest,
  FoodEntry,
  DailySummary,
  FoodItem,
} from '../../../shared/types/index';

const API_BASE = '/.netlify/functions';

class ApiClient {
  private async getAuthToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async uploadImage(imageData: string): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      const blob = await fetch(imageData).then(r => r.blob());
      const fileName = `food-images/${user.uid}/${Date.now()}.jpg`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload image');
    }
  }

  async analyzeImage(data: FoodRecognitionRequest): Promise<FoodRecognitionResponse> {
    return this.request<FoodRecognitionResponse>('/analyze-image', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async parseManualEntry(data: ManualEntryRequest): Promise<{ foods: FoodItem[] }> {
    return this.request<{ foods: FoodItem[] }>('/manual-entry', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createEntry(entry: Omit<FoodEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<FoodEntry> {
    return this.request<FoodEntry>('/food-entries', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  async updateEntry(id: string, foods: FoodItem[]): Promise<FoodEntry> {
    return this.request<FoodEntry>(`/food-entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ foods }),
    });
  }

  async deleteEntry(id: string): Promise<void> {
    return this.request<void>(`/food-entries/${id}`, {
      method: 'DELETE',
    });
  }

  async getDailySummary(date: string): Promise<DailySummary> {
    return this.request<DailySummary>(`/food-entries/daily/${date}`);
  }

  async getHistory(startDate: string, endDate: string): Promise<FoodEntry[]> {
    return this.request<FoodEntry[]>(
      `/food-entries/history?startDate=${startDate}&endDate=${endDate}`
    );
  }
}

export const api = new ApiClient();
