// Shared types between client and server

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface FoodEntry {
  id: string;
  userId: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: FoodItem[];
  imageUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  nutrition: NutritionInfo;
  confirmed: boolean;
}

export interface NutritionInfo {
  calories: number;
  protein: number;        // grams
  carbohydrates: number;  // grams
  fat: number;            // grams
  fiber?: number;         // grams
  sugar?: number;         // grams
  sodium?: number;        // mg
  cholesterol?: number;   // mg
  saturatedFat?: number;  // grams
  transFat?: number;      // grams
}

export interface DailySummary {
  date: string;
  totalNutrition: NutritionInfo;
  entries: FoodEntry[];
  goals?: NutritionGoals;
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

export interface FoodRecognitionRequest {
  image: string; // base64
  mealType?: string;
}

export interface FoodRecognitionResponse {
  foods: FoodItem[];
  clarificationNeeded?: ClarificationQuestion[];
  confidence: 'high' | 'medium' | 'low';
}

export interface ClarificationQuestion {
  id: string;
  foodId: string;
  question: string;
  options?: string[];
  type: 'size' | 'portion' | 'identification' | 'preparation';
}

export interface ClarificationAnswer {
  questionId: string;
  answer: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface ManualEntryRequest {
  prompt?: string;  // AI-assisted entry
  foodItem?: Partial<FoodItem>;  // Direct entry
}
