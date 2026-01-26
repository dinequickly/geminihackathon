import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Loader2,
  AlertCircle,
  Volume2
} from 'lucide-react';
import { api } from '../lib/api';
import { useElevenLabs, ConnectionStatus } from '../hooks/useElevenLabs';
import { useMediaRecorder } from '../hooks/useMediaRecorder';
import { posthog } from '../lib/posthog';

// Type for navigation state from InterviewSetup
interface InterviewNavigationState {
  conversationId: string;
  signedUrl: string;
  userData: {
    formatted_resume: string;
    job_description: string;
    job_title: string;
    company_name: string;
    name: string;
  };
  interviewConfig: {
    original_intent: string;
    configuration: Record<string, any>;
    personality: string;
  } | null;
}

interface InterviewProps {
  userId: string;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export default function Interview({ userId }: InterviewProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Get navigation state from InterviewSetup (if coming from there)
  const navState = location.state as InterviewNavigationState | null;

  // Session state - initialize from navigation state if available
  const [conversationId, setConversationId] = useState<string | null>(navState?.conversationId || null);
  const [signedUrl, setSignedUrl] = useState<string | null>(navState?.signedUrl || null);
  const [isInitializing, setIsInitializing] = useState(!navState); // Not initializing if we have nav state
  const [error, setError] = useState<string | null>(null);
  const [isEnding, setIsEnding] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // Store user data and interview config for dynamic variables
  const [userData, setUserData] = useState(navState?.userData || null);
  const [interviewConfig, setInterviewConfig] = useState(navState?.interviewConfig || null);

  // Build dynamic variables for ElevenLabs from user data and interview config
  const dynamicVariables = useMemo(() => {
    if (!userData && !interviewConfig) return undefined;

    const vars: Record<string, string | number | boolean> = {};

    // Add user data
    if (userData) {
      if (userData.formatted_resume) vars.formatted_resume = userData.formatted_resume;
      if (userData.job_description) vars.job_description = userData.job_description;
      if (userData.job_title) vars.job_title = userData.job_title;
      if (userData.company_name) vars.company_name = userData.company_name;
      if (userData.name) vars.user_name = userData.name;
    }

    // Add interview config
    if (interviewConfig) {
      if (interviewConfig.personality) vars.interview_personality = interviewConfig.personality;
      if (interviewConfig.original_intent) vars.original_intent = interviewConfig.original_intent;
      if (interviewConfig.configuration) {
        const config = interviewConfig.configuration;
        if (config.choice_1) vars.interview_focus_1 = config.choice_1;
        if (config.choice_2) vars.interview_focus_2 = config.choice_2;
        if (config.duration) vars.interview_duration = config.duration;
        if (config.slider_1) vars.difficulty_level = config.slider_1;
      }
    }

    return Object.keys(vars).length > 0 ? vars : undefined;
  }, [userData, interviewConfig]);

  // UI state
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingBlobRef = useRef<Blob | null>(null);
  const initRef = useRef(false); // Prevent double initialization

  // Media recorder
  const {
    stream,
    isRecording,
    formattedDuration,
    startCamera,
    stopCamera,
    startRecording,
    stopRecording
  } = useMediaRecorder({
    onDataAvailable: (blob) => {
      recordingBlobRef.current = blob;
    },
    onError: (err) => setError(err)
  });

  // Handle messages from ElevenLabs
  const handleMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  // Handle status changes
  const handleStatusChange = useCallback((status: ConnectionStatus) => {
    console.log('ElevenLabs status:', status);
    if (status === 'error') {
      setError('Lost connection to interviewer');
    }
  }, []);

  // Handle conversation end from ElevenLabs
  const handleConversationEnd = useCallback(async (elConvId: string) => {
    console.log('Conversation ended:', elConvId);
    if (conversationId) {
      await endInterview(elConvId);
    }
  }, [conversationId]);

  // ElevenLabs hook with dynamic variables for personalization
  const {
    status: elStatus,
    isAgentSpeaking,
    connect: connectElevenLabs,
    disconnect: disconnectElevenLabs
  } = useElevenLabs({
    signedUrl: signedUrl || '',
    dynamicVariables,
    onMessage: handleMessage,
    onStatusChange: handleStatusChange,
    onConversationEnd: handleConversationEnd,
    onError: (err) => setError(err)
  });

  // Initialize interview session (with guard to prevent double init)
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    initializeSession();
    return () => {
      stopCamera();
      disconnectElevenLabs();
    };
  }, []);

  // Handle page navigation/refresh - warn user and cleanup
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only warn if interview is active
      if (conversationId && !isEnding) {
        e.preventDefault();
        e.returnValue = '';

        // Cleanup in background
        stopCamera();
        stopRecording();
        disconnectElevenLabs();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [conversationId, isEnding]);

  // Connect video stream to video element
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Connect to ElevenLabs when we have signed URL (but not when intentionally ending)
  useEffect(() => {
    if (signedUrl && !isInitializing && !isEnding && elStatus === 'disconnected') {
      connectElevenLabs();
    }
  }, [signedUrl, isInitializing, isEnding, elStatus]);

  const initializeSession = async () => {
    try {
      setIsInitializing(true);
      setError(null);

      // Start camera first
      await startCamera();

      // Check if we already have session data from navigation state (coming from InterviewSetup)
      if (navState?.conversationId && navState?.signedUrl) {
        // We already have everything from InterviewSetup - no need to call API again
        console.log('Using session from navigation state:', navState.conversationId);
        // State is already initialized from navState, just start recording
      } else {
        // Direct navigation to /interview without going through setup
        // Need to call API to create a new interview session
        console.log('No navigation state - creating new interview session');
        const session = await api.startInterview(userId);
        setConversationId(session.conversation_id);
        setSignedUrl(session.signed_url);
        setUserData(session.user_data);
        setInterviewConfig(session.interview_config);
      }

      // Start recording
      await startRecording();

      setIsInitializing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start interview');
      setIsInitializing(false);
    }
  };

  const endInterview = async (elConvId?: string) => {
    if (!conversationId || isEnding) return;

    setIsEnding(true);

    try {
      // Clear signedUrl to prevent any reconnection attempts
      setSignedUrl(null);

      // Immediately stop all media tracks to prevent agent from hearing more
      stopCamera(); // This stops both video and audio tracks from the user's stream

      // Stop recording
      stopRecording();

      // Disconnect from ElevenLabs
      await disconnectElevenLabs();

      // End interview on backend
      await api.endInterview(conversationId, elConvId);

      // Upload video and analyze audio if we have it
      if (recordingBlobRef.current) {
        try {
          const uploadPromise = api.uploadVideo(conversationId, recordingBlobRef.current);
          const analysisPromise = api.analyzeAudio(recordingBlobRef.current)
            .then(result => console.log('Audio analysis result:', result))
            .catch(err => console.error('Audio analysis failed:', err));

          await Promise.all([uploadPromise, analysisPromise]);
        } catch (uploadErr) {
          console.error('Video upload/analysis failed:', uploadErr);
          // Continue even if upload fails
        }
      }

      // Track interview completion
      posthog.capture('interview_completed', {
        conversation_id: conversationId,
        duration_seconds: recordingBlobRef.current ? Math.floor(recordingBlobRef.current.size / 1000) : 0
      });

      // Navigate to results (will show processing state)
      navigate(`/results/${conversationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end interview');
      setIsEnding(false);
    }
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  if (error && !isEnding) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
            >
              Go Back
            </button>
            <button
              onClick={() => {
                setError(null);
                initializeSession();
              }}
              className="flex-1 py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Preparing your interview</h2>
          <p className="text-gray-600">Setting up camera and connecting to AI interviewer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Main content */}
      <div className="flex-1 flex">
        {/* Video area */}
        <div className="flex-1 relative">
          {/* User video (large) */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
          />

          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <div className="text-center">
                <VideoOff className="w-16 h-16 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400">Camera off</p>
              </div>
            </div>
          )}

          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 recording-indicator" />
              <span className="text-white text-sm font-medium">{formattedDuration}</span>
            </div>
          )}

          {/* Agent speaking indicator */}
          {isAgentSpeaking && (
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-primary-500/80 backdrop-blur-sm rounded-full px-3 py-1.5">
              <Volume2 className="w-4 h-4 text-white animate-pulse" />
              <span className="text-white text-sm font-medium">AI Speaking</span>
            </div>
          )}

          {/* Connection status */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <div className={`flex items-center gap-2 backdrop-blur-sm rounded-full px-3 py-1.5 ${
              elStatus === 'connected' ? 'bg-green-500/80' :
              elStatus === 'connecting' ? 'bg-yellow-500/80' :
              'bg-red-500/80'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                elStatus === 'connected' ? 'bg-green-200' :
                elStatus === 'connecting' ? 'bg-yellow-200 animate-pulse' :
                'bg-red-200'
              }`} />
              <span className="text-white text-sm font-medium capitalize">{elStatus}</span>
            </div>
          </div>
        </div>

        {/* Transcript sidebar */}
        <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-medium">Conversation</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">
                {elStatus === 'connected'
                  ? 'Waiting for interviewer...'
                  : 'Connecting to interviewer...'}
              </p>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-primary-500 text-white rounded-br-sm'
                        : 'bg-gray-700 text-gray-100 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-center gap-4">
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
              isMuted
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
              !isVideoEnabled
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>

          <button
            onClick={() => endInterview()}
            disabled={isEnding}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition disabled:opacity-50"
          >
            {isEnding ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <PhoneOff className="w-6 h-6" />
            )}
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-3">
          {isEnding ? 'Ending interview...' : 'Click the red button to end the interview'}
        </p>
      </div>
    </div>
  );
}
