import { useEffect, useState } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import './App.css';

type Page = 'dashboard' | 'history' | 'profile';

export function App() {
  const { isAuthenticated, isLoading, checkAuth, logout, user } = useAuthStore();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  return (
    <div className="app">
      <main className="app-main">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'history' && <History />}
        {currentPage === 'profile' && (
          <div className="profile-page">
            <div className="profile-header">
              <h1>Profile</h1>
            </div>
            <div className="profile-content">
              <div className="card">
                <div className="profile-info">
                  <h2>{user?.name}</h2>
                  <p>{user?.email}</p>
                </div>
                <button onClick={logout} className="btn btn-outline">
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className="bottom-nav">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-label">Today</span>
        </button>
        <button
          onClick={() => setCurrentPage('history')}
          className={`nav-item ${currentPage === 'history' ? 'active' : ''}`}
        >
          <span className="nav-icon">📈</span>
          <span className="nav-label">History</span>
        </button>
        <button
          onClick={() => setCurrentPage('profile')}
          className={`nav-item ${currentPage === 'profile' ? 'active' : ''}`}
        >
          <span className="nav-icon">👤</span>
          <span className="nav-label">Profile</span>
        </button>
      </nav>
    </div>
  );
}
