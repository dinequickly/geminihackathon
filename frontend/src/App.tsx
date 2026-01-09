import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Onboarding from './pages/Onboarding';
import Interview from './pages/Interview';
import Results from './pages/Results';
import Dashboard from './pages/Dashboard';

// Simple user context - in production, use proper state management
interface UserContext {
  userId: string | null;
  setUserId: (id: string | null) => void;
}

export const UserContext = { userId: null as string | null, setUserId: (_id: string | null) => {} };

function App() {
  const [userId, setUserId] = useState<string | null>(() => {
    return localStorage.getItem('interviewpro_user_id');
  });

  useEffect(() => {
    if (userId) {
      localStorage.setItem('interviewpro_user_id', userId);
    } else {
      localStorage.removeItem('interviewpro_user_id');
    }
    UserContext.userId = userId;
    UserContext.setUserId = setUserId;
  }, [userId]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Routes>
          <Route
            path="/"
            element={
              userId ? <Navigate to="/dashboard" replace /> : <Onboarding onComplete={setUserId} />
            }
          />
          <Route
            path="/onboarding"
            element={<Onboarding onComplete={setUserId} />}
          />
          <Route
            path="/signup"
            element={<Onboarding onComplete={setUserId} />}
          />
          <Route
            path="/dashboard"
            element={
              userId ? <Dashboard userId={userId} onLogout={() => setUserId(null)} /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/interview"
            element={
              userId ? <Interview userId={userId} /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/results/:conversationId"
            element={<Results />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
