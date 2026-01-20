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
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-sky-50 to-mint-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-900">Tavus Video Interview</h1>
                <Badge variant="sunshine" icon={Sparkles}>
                  Premium
                </Badge>
              </div>
              <p className="text-lg text-gray-600">
                Practice with an AI video interviewer in real-time
              </p>
            </div>
            <PlayfulCharacter emotion="excited" size={80} />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <PlayfulCard variant="coral" className="mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-coral-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Error</h3>
                <p className="text-gray-700">{error}</p>
              </div>
            </div>
          </PlayfulCard>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Video Display */}
          <div className="md:col-span-2">
            <PlayfulCard className="aspect-video bg-gray-900 relative overflow-hidden">
              {sessionActive && conversationUrl ? (
                <>
                  <iframe
                    src={conversationUrl}
                    title="Tavus Interview"
                    allow="camera; microphone; autoplay; fullscreen; display-capture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                  <div className="absolute top-4 left-4 right-4">
                    <div className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-2xl text-sm">
                      <Video className="w-4 h-4 inline mr-2" />
                      Tavus session active
                    </div>
                  </div>
                </>
              ) : starting ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <LoadingSpinner size="lg" color="primary" />
                  <p className="text-lg mt-4">Starting Tavus session...</p>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <VideoOff className="w-16 h-16 mb-4" />
                  <p className="text-lg">No active session</p>
                  <p className="text-sm mt-2">Start a session to begin your interview</p>
                </div>
              )}
            </PlayfulCard>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <PlayfulCard variant="sky">
              <h3 className="font-bold text-gray-900 mb-4">Session Controls</h3>

              <div className="space-y-3">
                {!sessionActive ? (
                  <PlayfulButton
                    variant="primary"
                    icon={Video}
                    onClick={handleStartSession}
                    disabled={starting}
                    className="w-full"
                  >
                    {starting ? 'Starting...' : 'Start Session'}
                  </PlayfulButton>
                ) : (
                  <PlayfulButton
                    variant="secondary"
                    icon={VideoOff}
                    onClick={handleStopSession}
                    disabled={stopping}
                    className="w-full"
                  >
                    {stopping ? 'Stopping...' : 'Stop Session'}
                  </PlayfulButton>
                )}
              </div>

              {sessionActive && (
                <div className="mt-4 p-3 bg-mint-50 rounded-2xl border-2 border-mint-200">
                  <div className="flex items-center gap-2 text-mint-700 text-sm">
                    <div className="w-2 h-2 bg-mint-500 rounded-full animate-pulse" />
                    Session Active
                  </div>
                </div>
              )}
            </PlayfulCard>
          </div>
        </div>
      </div>
    </div>
  );
}
