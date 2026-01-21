import { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import {
  PlayfulButton,
  PlayfulCard,
  Badge,
  LoadingSpinner,
  PlayfulCharacter
} from '../components/PlayfulUI';
import { api } from '../lib/api';

interface LiveAvatarInterviewProps {
  userId: string;
}

const DEFAULT_CONVERSATION_PLAN = '';

export default function LiveAvatarInterview({ userId }: LiveAvatarInterviewProps) {
  const activeConversationRef = useRef<string | null>(null);

  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [conversationPlan] = useState(DEFAULT_CONVERSATION_PLAN);
  const sessionActive = Boolean(conversationUrl);

  // Check subscription on mount
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        setLoading(true);
        const subscription = await api.getUserSubscription(userId);

        // User has active subscription
        setHasSubscription(
          subscription.has_subscription &&
          ['basic', 'premium', 'enterprise'].includes(subscription.plan)
        );
      } catch (err) {
        console.error('Failed to check subscription:', err);
        setHasSubscription(false);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [userId]);

  useEffect(() => {
    activeConversationRef.current = conversationId;
  }, [conversationId]);

  // Cleanup session on unmount
  useEffect(() => {
    return () => {
      if (activeConversationRef.current) {
        api.endTavusConversation(activeConversationRef.current).catch(console.error);
      }
    };
  }, []);

  const handleStartSession = async () => {
    try {
      setStarting(true);
      setError(null);

      console.log('Creating Tavus conversation for user:', userId);

      const sessionData = await api.createTavusConversation(userId, conversationPlan.trim());

      if (!sessionData.conversation_url) {
        throw new Error('Tavus conversation URL missing');
      }

      setConversationId(sessionData.conversation_id);
      setConversationUrl(sessionData.conversation_url);
    } catch (err: any) {
      console.error('Failed to start session:', err);
      setError(err.message || 'Failed to start Tavus session');
    } finally {
      setStarting(false);
    }
  };

  const handleStopSession = async () => {
    if (!conversationId) {
      setConversationUrl(null);
      return;
    }

    try {
      setStopping(true);
      setError(null);

      await api.endTavusConversation(conversationId);
      console.log('Tavus session ended');
      setConversationId(null);
      setConversationUrl(null);
    } catch (err: any) {
      console.error('Failed to stop session:', err);
      setError(err.message || 'Failed to stop session');
    } finally {
      setStopping(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-sky-50 to-mint-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" color="primary" />
          <p className="text-gray-600">Checking subscription...</p>
        </div>
      </div>
    );
  }

  // No subscription
  if (!hasSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-sky-50 to-mint-50 flex items-center justify-center p-4">
        <PlayfulCard className="max-w-md text-center">
          <PlayfulCharacter emotion="surprised" size={100} className="mx-auto mb-4" />
          <div className="mb-4">
            <Badge variant="sunshine" icon={Sparkles}>
              Premium Feature
            </Badge>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Premium Subscription Required
          </h2>
          <p className="text-gray-600 mb-6">
            Tavus video interviews are available exclusively for premium members. Upgrade your plan to unlock this feature!
          </p>
        </PlayfulCard>
      </div>
    );
  }

  // Main interface
  return (
    <div className="h-screen w-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Top Controls Bar */}
      <div className="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-sky-400" />
            <h1 className="text-lg font-semibold text-white">Tavus Video Interview</h1>
            <Badge variant="sunshine" icon={Sparkles}>
              Premium
            </Badge>
          </div>
          {sessionActive && (
            <div className="flex items-center gap-2 bg-mint-500/20 text-mint-400 px-3 py-1.5 rounded-full text-sm">
              <div className="w-2 h-2 bg-mint-400 rounded-full animate-pulse" />
              Live
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {error && (
            <div className="flex items-center gap-2 bg-coral-500/20 text-coral-400 px-3 py-1.5 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {!sessionActive ? (
            <PlayfulButton
              variant="primary"
              icon={Video}
              onClick={handleStartSession}
              disabled={starting}
              size="sm"
            >
              {starting ? 'Starting...' : 'Start Session'}
            </PlayfulButton>
          ) : (
            <PlayfulButton
              variant="coral"
              icon={VideoOff}
              onClick={handleStopSession}
              disabled={stopping}
              size="sm"
            >
              {stopping ? 'Stopping...' : 'End Session'}
            </PlayfulButton>
          )}
        </div>
      </div>

      {/* Full Screen Video Area */}
      <div className="flex-1 relative">
        {sessionActive && conversationUrl ? (
          <iframe
            src={conversationUrl}
            title="Tavus Interview"
            allow="camera; microphone; autoplay; fullscreen; display-capture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : starting ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <LoadingSpinner size="lg" color="primary" />
            <p className="text-xl mt-4">Starting Tavus session...</p>
            <p className="text-sm mt-2 text-gray-500">Preparing your AI interviewer</p>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <div className="text-center">
              <VideoOff className="w-24 h-24 mb-6 mx-auto opacity-50" />
              <h2 className="text-2xl font-semibold text-gray-300 mb-2">Ready to Start</h2>
              <p className="text-gray-500 mb-6">Click "Start Session" to begin your AI video interview</p>
              <PlayfulButton
                variant="primary"
                icon={Video}
                onClick={handleStartSession}
                disabled={starting}
                size="lg"
              >
                Start Session
              </PlayfulButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
