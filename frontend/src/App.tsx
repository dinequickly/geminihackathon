import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import Onboarding from './pages/Onboarding';
import Interview from './pages/Interview';
import Results from './pages/Results';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import InterviewSettings from './pages/InterviewSettings';
import PackDetails from './pages/PackDetails';
import FlashcardPractice from './pages/FlashcardPractice';
import LiveAvatarInterview from './pages/LiveAvatarInterview';
import { initPostHog, posthog } from './lib/posthog';

import InterviewSetup from './pages/InterviewSetup';

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

  // Initialize PostHog on mount
  useEffect(() => {
    initPostHog();
  }, []);

  // Update user context and identify user in PostHog
  useEffect(() => {
    if (userId) {
      localStorage.setItem('interviewpro_user_id', userId);
      // Identify user in PostHog
      posthog.identify(userId);
    } else {
      localStorage.removeItem('interviewpro_user_id');
      // Reset PostHog user
      posthog.reset();
    }
    UserContext.userId = userId;
    UserContext.setUserId = setUserId;
  }, [userId]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cream-100 relative overflow-x-hidden">
        {/* Playful background blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-sky-200/30 rounded-blob animate-float" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-sunshine-200/30 rounded-blob-2 animate-float" style={{ animationDelay: '1s', animationDuration: '8s' }} />
          <div className="absolute top-[40%] left-[10%] w-64 h-64 bg-coral-200/20 rounded-blob-3 animate-float" style={{ animationDelay: '2s', animationDuration: '10s' }} />
        </div>

        <div className="relative z-10">
          <Routes>
          <Route
            path="/"
            element={<LandingPage />}
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
            path="/interview/setup"
            element={
              userId ? <InterviewSetup userId={userId} /> : <Navigate to="/" replace />
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
          <Route
            path="/chat/:chatId"
            element={<Chat />}
          />
          <Route
            path="/interview-settings"
            element={
              userId ? <InterviewSettings userId={userId} /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/pack/:packId"
            element={
              userId ? <PackDetails userId={userId} /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/pack/:packId/flashcards"
            element={
              userId ? <FlashcardPractice userId={userId} /> : <Navigate to="/" replace />
            }
          />
          <Route
            path="/live-avatar-interview"
            element={
              userId ? <LiveAvatarInterview userId={userId} /> : <Navigate to="/" replace />
            }
          />
        </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
