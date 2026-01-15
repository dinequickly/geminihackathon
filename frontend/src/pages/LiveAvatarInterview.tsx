import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
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
import { LiveAvatarSession } from '@heygen/liveavatar-web-sdk';

interface LiveAvatarInterviewProps {
  userId: string;
}

export default function LiveAvatarInterview({ userId }: LiveAvatarInterviewProps) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<LiveAvatarSession | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);

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

  // Cleanup session on unmount
  useEffect(() => {
    return () => {
      if (session && sessionActive) {
        session.stop().catch(console.error);
      }
    };
  }, [session, sessionActive]);

  const handleStartSession = async () => {
    try {
      setStarting(true);
      setError(null);

      console.log('Creating HeyGen session for user:', userId);

      // Get session token from backend
      const sessionData = await api.createHeyGenSession(userId);

      console.log('Session data received:', {
        session_id: sessionData.session_id,
        url: sessionData.url,
        duration_limit: sessionData.session_duration_limit
      });

      if (!sessionData.access_token) {
        throw new Error('LiveAvatar access token missing');
      }

      console.log('Access token expires in seconds:', sessionData.token_expires_in);

      // Initialize LiveAvatar session
      const avatarSession = new LiveAvatarSession(sessionData.access_token, {
        voiceChat: true,
      });

      console.log('LiveAvatar session initialized:', avatarSession);

      // Start the session
      await avatarSession.start();

      console.log('Session started successfully');

      setSession(avatarSession);
      setSessionActive(true);

      // Note: The SDK documentation doesn't specify how to attach the video stream.
      // Based on standard WebRTC patterns, the stream might be available at:
      // - avatarSession.videoStream
      // - avatarSession.mediaStream
      // - Or the SDK might automatically handle video display

      // Log the session object to inspect for video stream properties
      console.log('Session object for inspection:', Object.keys(avatarSession));
      console.log('Full session:', avatarSession);

      // Attempt to attach video if mediaStream property exists
      if ((avatarSession as any).mediaStream && videoRef.current) {
        videoRef.current.srcObject = (avatarSession as any).mediaStream;
        console.log('Video stream attached to video element');
      } else if ((avatarSession as any).videoStream && videoRef.current) {
        videoRef.current.srcObject = (avatarSession as any).videoStream;
        console.log('Video stream attached to video element');
      } else {
        console.warn('No obvious video stream property found. Check console logs above.');
      }

    } catch (err: any) {
      console.error('Failed to start session:', err);
      setError(err.message || 'Failed to start LiveAvatar session');
    } finally {
      setStarting(false);
    }
  };

  const handleStopSession = async () => {
    if (!session) return;

    try {
      setStopping(true);
      setError(null);

      await session.stop();

      // Clear video
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      console.log('Session stopped');
      setSession(null);
      setSessionActive(false);
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
            LiveAvatar video interviews are available exclusively for premium members. Upgrade your plan to unlock this feature!
          </p>
          <div className="flex gap-3 justify-center">
            <PlayfulButton
              variant="secondary"
              icon={ArrowLeft}
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </PlayfulButton>
            <PlayfulButton
              variant="sunshine"
              icon={Sparkles}
              onClick={() => navigate('/dashboard?showShop=true')}
            >
              Upgrade Now
            </PlayfulButton>
          </div>
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
          <PlayfulButton
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            Back to Dashboard
          </PlayfulButton>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-900">LiveAvatar Interview</h1>
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
              {sessionActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {/* Fallback message if video doesn't appear */}
                  <div className="absolute top-4 left-4 right-4">
                    <div className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-2xl text-sm">
                      <Video className="w-4 h-4 inline mr-2" />
                      Session Active - Check browser console for stream details
                    </div>
                  </div>
                </>
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

            <PlayfulCard variant="sunshine">
              <h3 className="font-bold text-gray-900 mb-3">How It Works</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-sunshine-600 font-bold">1.</span>
                  <span>Click "Start Session" to connect with your AI interviewer</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sunshine-600 font-bold">2.</span>
                  <span>The avatar will appear and begin the interview</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sunshine-600 font-bold">3.</span>
                  <span>Speak naturally - voice chat is enabled</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sunshine-600 font-bold">4.</span>
                  <span>End the session when you're done practicing</span>
                </li>
              </ul>
            </PlayfulCard>

            <PlayfulCard>
              <h3 className="font-bold text-gray-900 mb-3">Debug Info</h3>
              <p className="text-xs text-gray-600 mb-2">
                Open browser console (F12) to inspect the session object and video stream properties.
              </p>
              <div className="text-xs space-y-1 text-gray-500">
                <div>Session: {session ? 'Initialized' : 'Not created'}</div>
                <div>Active: {sessionActive ? 'Yes' : 'No'}</div>
                <div>Video Element: {videoRef.current ? 'Ready' : 'Not ready'}</div>
              </div>
            </PlayfulCard>
          </div>
        </div>
      </div>
    </div>
  );
}
