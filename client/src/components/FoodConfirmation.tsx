import { useState } from 'react';
import type { FoodItem, ClarificationQuestion, ClarificationAnswer } from '../../../shared/types/index';
import './FoodConfirmation.css';

interface FoodConfirmationProps {
  foods: FoodItem[];
  clarifications?: ClarificationQuestion[];
  onConfirm: (foods: FoodItem[], answers?: ClarificationAnswer[]) => void;
  onCancel: () => void;
  imageUrl?: string;
}

export function FoodConfirmation({
  foods,
  clarifications,
  onConfirm,
  onCancel,
  imageUrl,
}: FoodConfirmationProps) {
  const [editedFoods, setEditedFoods] = useState(foods);
  const [answers, setAnswers] = useState<ClarificationAnswer[]>([]);

  const handleFoodEdit = (index: number, field: string, value: any) => {
    const updated = [...editedFoods];
    if (field.startsWith('nutrition.')) {
      const nutrientField = field.split('.')[1];
      updated[index] = {
        ...updated[index],
        nutrition: {
          ...updated[index].nutrition,
          [nutrientField]: parseFloat(value) || 0,
        },
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setEditedFoods(updated);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      if (existing) {
        return prev.map(a => a.questionId === questionId ? { ...a, answer } : a);
      }
      return [...prev, { questionId, answer }];
    });
  };

  const handleRemoveFood = (index: number) => {
    setEditedFoods(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    const confirmedFoods = editedFoods.map(food => ({ ...food, confirmed: true }));
    onConfirm(confirmedFoods, clarifications && answers.length > 0 ? answers : undefined);
  };

  return (
    <div className="food-confirmation">
      <div className="confirmation-header">
        <button onClick={onCancel} className="btn-icon">
          ← Back
        </button>
        <h2>Review & Confirm</h2>
        <div style={{ width: '40px' }} />
      </div>

      <div className="confirmation-content">
        {imageUrl && (
          <div className="food-image">
            <img src={imageUrl} alt="Food" />
          </div>
        )}

        {clarifications && clarifications.length > 0 && (
          <div className="clarifications-section card">
            <h3>Quick Questions</h3>
            {clarifications.map(q => (
              <div key={q.id} className="clarification-question">
                <label>{q.question}</label>
                {q.options ? (
                  <select
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    className="input"
                  >
                    <option value="">Select...</option>
                    {q.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    className="input"
                    placeholder="Your answer..."
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="foods-list">
          {editedFoods.map((food, index) => (
            <div key={food.id} className="food-item-card card">
              <div className="food-item-header">
                <input
                  type="text"
                  value={food.name}
                  onChange={(e) => handleFoodEdit(index, 'name', e.target.value)}
                  className="input food-name-input"
                />
                <button
                  onClick={() => handleRemoveFood(index)}
                  className="btn-remove"
                >
                  ✕
                </button>
              </div>

              <div className="food-item-details">
                <div className="portion-row">
                  <input
                    type="number"
                    value={food.quantity}
                    onChange={(e) => handleFoodEdit(index, 'quantity', e.target.value)}
                    className="input quantity-input"
                    step="0.1"
                  />
                  <input
                    type="text"
                    value={food.unit}
                    onChange={(e) => handleFoodEdit(index, 'unit', e.target.value)}
                    className="input unit-input"
                  />
                </div>

                <div className="nutrition-grid">
                  <div className="nutrition-item">
                    <label>Calories</label>
                    <input
                      type="number"
                      value={food.nutrition.calories}
                      onChange={(e) => handleFoodEdit(index, 'nutrition.calories', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div className="nutrition-item">
                    <label>Protein (g)</label>
                    <input
                      type="number"
                      value={food.nutrition.protein}
                      onChange={(e) => handleFoodEdit(index, 'nutrition.protein', e.target.value)}
                      className="input"
                      step="0.1"
                    />
                  </div>
                  <div className="nutrition-item">
                    <label>Carbs (g)</label>
                    <input
                      type="number"
                      value={food.nutrition.carbohydrates}
                      onChange={(e) => handleFoodEdit(index, 'nutrition.carbohydrates', e.target.value)}
                      className="input"
                      step="0.1"
                    />
                  </div>
                  <div className="nutrition-item">
                    <label>Fat (g)</label>
                    <input
                      type="number"
                      value={food.nutrition.fat}
                      onChange={(e) => handleFoodEdit(index, 'nutrition.fat', e.target.value)}
                      className="input"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="confirmation-footer">
        <button onClick={onCancel} className="btn btn-outline">
          Cancel
        </button>
        <button onClick={handleConfirm} className="btn btn-primary">
          Confirm & Save
        </button>
      </div>
    </div>
  );
}
