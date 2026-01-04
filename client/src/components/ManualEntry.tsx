import { useState } from 'react';
import { api } from '../services/api';
import type { FoodItem } from '../../../shared/types/index';
import './ManualEntry.css';

interface ManualEntryProps {
  mealType: string;
  onSave: (foods: FoodItem[]) => void;
  onCancel: () => void;
}

export function ManualEntry({ mealType, onSave, onCancel }: ManualEntryProps) {
  const [mode, setMode] = useState<'ai' | 'direct'>('ai');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedFoods, setParsedFoods] = useState<FoodItem[] | null>(null);

  // Direct entry state
  const [directFood, setDirectFood] = useState({
    name: '',
    quantity: 1,
    unit: 'serving',
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
  });

  const handleAiParse = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const result = await api.parseManualEntry({ prompt });
      setParsedFoods(result.foods);
    } catch (error) {
      alert('Failed to parse food description. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectSave = () => {
    if (!directFood.name.trim()) {
      alert('Please enter a food name');
      return;
    }

    const foodItem: FoodItem = {
      id: `food-${Date.now()}`,
      name: directFood.name,
      quantity: directFood.quantity,
      unit: directFood.unit,
      confirmed: true,
      nutrition: {
        calories: directFood.calories,
        protein: directFood.protein,
        carbohydrates: directFood.carbohydrates,
        fat: directFood.fat,
      },
    };

    onSave([foodItem]);
  };

  const handleAiSave = () => {
    if (!parsedFoods) return;
    onSave(parsedFoods);
  };

  return (
    <div className="manual-entry">
      <div className="manual-entry-header">
        <button onClick={onCancel} className="btn-icon">
          ← Back
        </button>
        <h2>Add {mealType}</h2>
        <div style={{ width: '40px' }} />
      </div>

      <div className="manual-entry-content">
        <div className="mode-selector">
          <button
            onClick={() => setMode('ai')}
            className={`mode-btn ${mode === 'ai' ? 'active' : ''}`}
          >
            AI Assisted
          </button>
          <button
            onClick={() => setMode('direct')}
            className={`mode-btn ${mode === 'direct' ? 'active' : ''}`}
          >
            Direct Entry
          </button>
        </div>

        {mode === 'ai' ? (
          <div className="ai-mode">
            <div className="card">
              <label>Describe what you ate:</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., 'two eggs scrambled with cheese and a slice of toast'"
                className="input textarea"
                rows={4}
              />
              <button
                onClick={handleAiParse}
                disabled={isLoading || !prompt.trim()}
                className="btn btn-primary"
              >
                {isLoading ? 'Parsing...' : 'Parse with AI'}
              </button>
            </div>

            {parsedFoods && (
              <div className="parsed-results card">
                <h3>Recognized Foods:</h3>
                {parsedFoods.map((food, idx) => (
                  <div key={idx} className="parsed-food-item">
                    <div className="parsed-food-header">
                      <strong>{food.name}</strong>
                      <span>{food.quantity} {food.unit}</span>
                    </div>
                    <div className="parsed-food-nutrition">
                      <span>{Math.round(food.nutrition.calories)} cal</span>
                      <span>P: {food.nutrition.protein}g</span>
                      <span>C: {food.nutrition.carbohydrates}g</span>
                      <span>F: {food.nutrition.fat}g</span>
                    </div>
                  </div>
                ))}
                <button onClick={handleAiSave} className="btn btn-primary">
                  Save Entry
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="direct-mode">
            <div className="card">
              <div className="form-group">
                <label>Food Name *</label>
                <input
                  type="text"
                  value={directFood.name}
                  onChange={(e) => setDirectFood({ ...directFood, name: e.target.value })}
                  className="input"
                  placeholder="E.g., Chicken breast"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    value={directFood.quantity}
                    onChange={(e) => setDirectFood({ ...directFood, quantity: parseFloat(e.target.value) })}
                    className="input"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label>Unit *</label>
                  <input
                    type="text"
                    value={directFood.unit}
                    onChange={(e) => setDirectFood({ ...directFood, unit: e.target.value })}
                    className="input"
                    placeholder="g, oz, cup, etc."
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Calories *</label>
                <input
                  type="number"
                  value={directFood.calories}
                  onChange={(e) => setDirectFood({ ...directFood, calories: parseFloat(e.target.value) })}
                  className="input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Protein (g) *</label>
                  <input
                    type="number"
                    value={directFood.protein}
                    onChange={(e) => setDirectFood({ ...directFood, protein: parseFloat(e.target.value) })}
                    className="input"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label>Carbs (g) *</label>
                  <input
                    type="number"
                    value={directFood.carbohydrates}
                    onChange={(e) => setDirectFood({ ...directFood, carbohydrates: parseFloat(e.target.value) })}
                    className="input"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label>Fat (g) *</label>
                  <input
                    type="number"
                    value={directFood.fat}
                    onChange={(e) => setDirectFood({ ...directFood, fat: parseFloat(e.target.value) })}
                    className="input"
                    step="0.1"
                  />
                </div>
              </div>

              <button onClick={handleDirectSave} className="btn btn-primary">
                Save Entry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
