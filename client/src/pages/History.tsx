import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { FoodEntry } from '../../../shared/types/index';
import './History.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

export function History() {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  useEffect(() => {
    fetchHistory();
  }, [timeRange]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (timeRange === 'week' ? 7 : 30));

      const data = await api.getHistory(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      setEntries(data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Group entries by date
  const groupedByDate = entries.reduce((acc, entry) => {
    if (!acc[entry.date]) {
      acc[entry.date] = [];
    }
    acc[entry.date].push(entry);
    return acc;
  }, {} as Record<string, FoodEntry[]>);

  // Calculate daily totals
  const dailyTotals = Object.entries(groupedByDate).map(([date, dateEntries]) => {
    const totals = {
      date,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };

    dateEntries.forEach(entry => {
      entry.foods.forEach(food => {
        totals.calories += food.nutrition.calories;
        totals.protein += food.nutrition.protein;
        totals.carbs += food.nutrition.carbohydrates;
        totals.fat += food.nutrition.fat;
      });
    });

    return totals;
  }).sort((a, b) => a.date.localeCompare(b.date));

  const chartData = {
    labels: dailyTotals.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Calories',
        data: dailyTotals.map(d => Math.round(d.calories)),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
      },
    ],
  };

  const macroChartData = {
    labels: dailyTotals.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Protein (g)',
        data: dailyTotals.map(d => Math.round(d.protein)),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
      },
      {
        label: 'Carbs (g)',
        data: dailyTotals.map(d => Math.round(d.carbs)),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
      },
      {
        label: 'Fat (g)',
        data: dailyTotals.map(d => Math.round(d.fat)),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Calculate averages
  const avgCalories = dailyTotals.length > 0
    ? Math.round(dailyTotals.reduce((sum, d) => sum + d.calories, 0) / dailyTotals.length)
    : 0;
  const avgProtein = dailyTotals.length > 0
    ? Math.round(dailyTotals.reduce((sum, d) => sum + d.protein, 0) / dailyTotals.length)
    : 0;
  const avgCarbs = dailyTotals.length > 0
    ? Math.round(dailyTotals.reduce((sum, d) => sum + d.carbs, 0) / dailyTotals.length)
    : 0;
  const avgFat = dailyTotals.length > 0
    ? Math.round(dailyTotals.reduce((sum, d) => sum + d.fat, 0) / dailyTotals.length)
    : 0;

  if (isLoading) {
    return (
      <div className="history-page">
        <div className="loading">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-header">
        <h1>History & Analytics</h1>
        <div className="time-range-selector">
          <button
            onClick={() => setTimeRange('week')}
            className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
          >
            Month
          </button>
        </div>
      </div>

      <div className="history-content">
        <div className="averages-card card">
          <h3>Daily Averages</h3>
          <div className="averages-grid">
            <div className="avg-item">
              <div className="avg-value">{avgCalories}</div>
              <div className="avg-label">Calories</div>
            </div>
            <div className="avg-item">
              <div className="avg-value">{avgProtein}g</div>
              <div className="avg-label">Protein</div>
            </div>
            <div className="avg-item">
              <div className="avg-value">{avgCarbs}g</div>
              <div className="avg-label">Carbs</div>
            </div>
            <div className="avg-item">
              <div className="avg-value">{avgFat}g</div>
              <div className="avg-label">Fat</div>
            </div>
          </div>
        </div>

        <div className="chart-card card">
          <h3>Calorie Trend</h3>
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="chart-card card">
          <h3>Macronutrient Trends</h3>
          <Line data={macroChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
