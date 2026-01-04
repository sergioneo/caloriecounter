import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  FoodRecognitionRequest,
  FoodRecognitionResponse,
  ManualEntryRequest,
  FoodEntry,
  DailySummary,
  User,
  FoodItem,
} from '../../../shared/types/index';

const API_BASE = '/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
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

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // Auth
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.token);
    return response;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.token);
    return response;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Food
  async analyzeImage(data: FoodRecognitionRequest): Promise<FoodRecognitionResponse> {
    return this.request<FoodRecognitionResponse>('/food/analyze-image', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async parseManualEntry(data: ManualEntryRequest): Promise<{ foods: FoodItem[] }> {
    return this.request<{ foods: FoodItem[] }>('/food/manual-entry', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createEntry(entry: Omit<FoodEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<FoodEntry> {
    return this.request<FoodEntry>('/food/entries', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  async updateEntry(id: string, foods: FoodItem[]): Promise<FoodEntry> {
    return this.request<FoodEntry>(`/food/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ foods }),
    });
  }

  async deleteEntry(id: string): Promise<void> {
    return this.request<void>(`/food/entries/${id}`, {
      method: 'DELETE',
    });
  }

  async getDailySummary(date: string): Promise<DailySummary> {
    return this.request<DailySummary>(`/food/daily/${date}`);
  }

  async getHistory(startDate: string, endDate: string): Promise<FoodEntry[]> {
    return this.request<FoodEntry[]>(
      `/food/history?startDate=${startDate}&endDate=${endDate}`
    );
  }
}

export const api = new ApiClient();
