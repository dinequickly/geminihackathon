import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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

  // Session state
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnding, setIsEnding] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

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

  // ElevenLabs hook
  const {
    status: elStatus,
    isAgentSpeaking,
    connect: connectElevenLabs,
    disconnect: disconnectElevenLabs
  } = useElevenLabs({
    signedUrl: signedUrl || '',
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

  // Connect to ElevenLabs when we have signed URL
  useEffect(() => {
    if (signedUrl && !isInitializing && elStatus === 'disconnected') {
      connectElevenLabs();
    }
  }, [signedUrl, isInitializing, elStatus]);

  const initializeSession = async () => {
    try {
      setIsInitializing(true);
      setError(null);

      // Start camera first
      await startCamera();

      // Get interview session from backend
      const session = await api.startInterview(userId);
      setConversationId(session.conversation_id);
      setSignedUrl(session.signed_url);

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
      // Stop recording
      stopRecording();

      // Disconnect from ElevenLabs
      disconnectElevenLabs();

      // End interview on backend
      await api.endInterview(conversationId, elConvId);

      // Upload video if we have it
      if (recordingBlobRef.current) {
        try {
          await api.uploadVideo(conversationId, recordingBlobRef.current);
        } catch (uploadErr) {
          console.error('Video upload failed:', uploadErr);
          // Continue even if upload fails
        }
      }

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
