import { useEffect, useState } from 'react';
import { useFoodStore } from '../store/useFoodStore';
import { CameraCapture } from '../components/CameraCapture';
import { FoodConfirmation } from '../components/FoodConfirmation';
import { ManualEntry } from '../components/ManualEntry';
import { api } from '../services/api';
import type { FoodItem, FoodRecognitionResponse, ClarificationAnswer } from '../../../shared/types/index';
import './Dashboard.css';

type View = 'dashboard' | 'camera' | 'confirmation' | 'manual';
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export function Dashboard() {
  const { dailySummary, selectedDate, setDate, fetchDailySummary, addEntry } = useFoodStore();
  const [view, setView] = useState<View>('dashboard');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recognizedFoods, setRecognizedFoods] = useState<FoodRecognitionResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetchDailySummary(selectedDate);
  }, [selectedDate]);

  const handleAddFood = (mealType: MealType) => {
    setSelectedMealType(mealType);
    setView('camera');
  };

  const handleImageCapture = async (imageData: string) => {
    setCapturedImage(imageData);
    setIsAnalyzing(true);

    try {
      const result = await api.analyzeImage({ image: imageData, mealType: selectedMealType });
      setRecognizedFoods(result);
      setView('confirmation');
    } catch (error) {
      alert('Failed to analyze image. Please try again.');
      setView('dashboard');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmFoods = async (foods: FoodItem[], answers?: ClarificationAnswer[]) => {
    try {
      if (answers && answers.length > 0 && capturedImage) {
        // Re-analyze with clarification answers
        setIsAnalyzing(true);
        const result = await api.analyzeImage({
          image: capturedImage,
          mealType: selectedMealType,
        });
        setRecognizedFoods(result);
        setIsAnalyzing(false);
        return;
      }

      // Upload image to Firebase Storage if present
      let imageUrl: string | undefined;
      if (capturedImage) {
        setIsAnalyzing(true);
        try {
          imageUrl = await api.uploadImage(capturedImage);
        } catch (error) {
          console.error('Image upload failed:', error);
        } finally {
          setIsAnalyzing(false);
        }
      }

      await addEntry(selectedMealType, foods, imageUrl);
      setView('dashboard');
      setCapturedImage(null);
      setRecognizedFoods(null);
    } catch (error) {
      alert('Failed to save entry. Please try again.');
    }
  };

  const handleManualEntry = () => {
    setView('manual');
  };

  const handleManualSave = async (foods: FoodItem[]) => {
    try {
      await addEntry(selectedMealType, foods);
      setView('dashboard');
    } catch (error) {
      alert('Failed to save entry. Please try again.');
    }
  };

  const handleCancel = () => {
    setView('dashboard');
    setCapturedImage(null);
    setRecognizedFoods(null);
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    setDate(currentDate.toISOString().split('T')[0]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (view === 'camera') {
    return <CameraCapture onCapture={handleImageCapture} onCancel={handleCancel} />;
  }

  if (view === 'confirmation' && recognizedFoods) {
    return (
      <FoodConfirmation
        foods={recognizedFoods.foods}
        clarifications={recognizedFoods.clarificationNeeded}
        onConfirm={handleConfirmFoods}
        onCancel={handleCancel}
        imageUrl={capturedImage || undefined}
      />
    );
  }

  if (view === 'manual') {
    return (
      <ManualEntry
        mealType={selectedMealType}
        onSave={handleManualSave}
        onCancel={handleCancel}
      />
    );
  }

  const totalNutrition = dailySummary?.totalNutrition;
  const mealEntries = {
    breakfast: dailySummary?.entries.filter(e => e.mealType === 'breakfast') || [],
    lunch: dailySummary?.entries.filter(e => e.mealType === 'lunch') || [],
    dinner: dailySummary?.entries.filter(e => e.mealType === 'dinner') || [],
    snack: dailySummary?.entries.filter(e => e.mealType === 'snack') || [],
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>CalorieCounter</h1>
        <div className="date-selector">
          <button onClick={() => handleDateChange('prev')} className="btn-icon">
            ←
          </button>
          <span className="current-date">{formatDate(selectedDate)}</span>
          <button onClick={() => handleDateChange('next')} className="btn-icon">
            →
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="summary-card card">
          <h2>Daily Summary</h2>
          <div className="macro-grid">
            <div className="macro-item">
              <div className="macro-value">{Math.round(totalNutrition?.calories || 0)}</div>
              <div className="macro-label">Calories</div>
            </div>
            <div className="macro-item">
              <div className="macro-value">{Math.round(totalNutrition?.protein || 0)}g</div>
              <div className="macro-label">Protein</div>
            </div>
            <div className="macro-item">
              <div className="macro-value">{Math.round(totalNutrition?.carbohydrates || 0)}g</div>
              <div className="macro-label">Carbs</div>
            </div>
            <div className="macro-item">
              <div className="macro-value">{Math.round(totalNutrition?.fat || 0)}g</div>
              <div className="macro-label">Fat</div>
            </div>
          </div>
        </div>

        {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map(mealType => (
          <div key={mealType} className="meal-section card">
            <div className="meal-header">
              <h3>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h3>
              <div className="meal-actions">
                <button onClick={() => { setSelectedMealType(mealType); handleManualEntry(); }} className="btn-small">
                  Manual
                </button>
                <button onClick={() => handleAddFood(mealType)} className="btn-small btn-primary">
                  + Photo
                </button>
              </div>
            </div>

            {mealEntries[mealType].length > 0 ? (
              <div className="meal-entries">
                {mealEntries[mealType].map(entry => (
                  <div key={entry.id} className="entry-item">
                    {entry.foods.map(food => (
                      <div key={food.id} className="food-row">
                        <div className="food-info">
                          <div className="food-name">{food.name}</div>
                          <div className="food-portion">{food.quantity} {food.unit}</div>
                        </div>
                        <div className="food-calories">{Math.round(food.nutrition.calories)} cal</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-meal">No entries yet</div>
            )}
          </div>
        ))}
      </div>

      {isAnalyzing && (
        <div className="analyzing-overlay">
          <div className="spinner" />
          <p>Analyzing food image...</p>
        </div>
      )}
    </div>
  );
}
