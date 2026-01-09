import { useState, useEffect, useRef } from 'react';
import { api, EmotionTimelineItem } from '../lib/api';
import { MessageSquare, User, Bot, ChevronDown, ChevronUp, AlertCircle, Terminal, Database, Smile, Mic } from 'lucide-react';

interface TranscriptViewerProps {
  conversationId: string;
  currentTimeMs?: number;
  onSegmentClick?: (startTime: number) => void;
}

interface TranscriptItem {
  role: 'agent' | 'user';
  message: string | null;
  tool_calls?: Array<{
    type: string;
    tool_name: string;
    tool_details?: {
      query_params?: Record<string, any>;
      url?: string;
    };
  }>;
  tool_results?: Array<{
    tool_name: string;
    result_value: string;
    is_error?: boolean;
  }>;
  time_in_call_secs?: number;
  feedback?: any;
}

interface EmotionData {
  face: EmotionTimelineItem[];
  prosody: EmotionTimelineItem[];
}

const EMOTION_COLORS: Record<string, string> = {
  joy: '#22c55e',
  happiness: '#22c55e',
  amusement: '#84cc16',
  excitement: '#eab308',
  interest: '#3b82f6',
  surprise: '#f59e0b',
  concentration: '#6366f1',
  contemplation: '#8b5cf6',
  determination: '#0ea5e9',
  calmness: '#06b6d4',
  contentment: '#14b8a6',
  realization: '#10b981',
  admiration: '#ec4899',
  sadness: '#64748b',
  disappointment: '#475569',
  tiredness: '#94a3b8',
  confusion: '#a855f7',
  anxiety: '#dc2626',
  fear: '#991b1b',
  anger: '#ef4444',
  disgust: '#78716c',
  contempt: '#57534e',
  embarrassment: '#fb923c',
  awkwardness: '#fdba74',
  neutral: '#9ca3af',
};

const getEmotionColor = (emotionName: string): string => {
  const lower = emotionName.toLowerCase();
  return EMOTION_COLORS[lower] || '#9ca3af';
};

const formatTimestamp = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function TranscriptViewer({
  conversationId,
  currentTimeMs = 0,
  onSegmentClick
}: TranscriptViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeSegmentRef = useRef<HTMLDivElement>(null);

  const [transcriptJson, setTranscriptJson] = useState<TranscriptItem[]>([]);
  const [rawTranscript, setRawTranscript] = useState<string | null>(null);
  const [emotionData, setEmotionData] = useState<EmotionData>({ face: [], prosody: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);

  // Load transcript and emotion data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load transcript and emotions in parallel
        const [transcriptData, emotionTimeline] = await Promise.all([
          api.getAnnotatedTranscript(conversationId),
          api.getEmotionTimeline(conversationId, { models: ['face', 'prosody'] }).catch(() => null)
        ]);

        console.log('Transcript data received:', transcriptData);

        if (transcriptData.transcript_json && Array.isArray(transcriptData.transcript_json) && transcriptData.transcript_json.length > 0) {
          let items = transcriptData.transcript_json;
          if (items.length === 1 && Array.isArray(items[0])) {
            items = items[0];
            console.log('Unwrapped nested transcript_json array');
          }
          console.log('Setting transcript_json with', items.length, 'items');
          setTranscriptJson(items);
        }

        if (transcriptData.transcript) {
          setRawTranscript(transcriptData.transcript);
        }

        if (emotionTimeline) {
          console.log('Emotion timeline loaded:', emotionTimeline.total_records, 'records');
          setEmotionData({
            face: emotionTimeline.timeline.face || [],
            prosody: emotionTimeline.timeline.prosody || []
          });
        }
      } catch (err) {
        console.error('Failed to load transcript:', err);
        setError(err instanceof Error ? err.message : 'Failed to load transcript');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [conversationId]);

  // Auto-scroll to active segment
  useEffect(() => {
    if (autoScroll && activeSegmentRef.current && containerRef.current) {
      const container = containerRef.current;
      const element = activeSegmentRef.current;

      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      if (elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentTimeMs, autoScroll]);

  // Find emotions at a specific time
  const getEmotionsAtTime = (timeSecs: number) => {
    const timeMs = timeSecs * 1000;

    // Find face emotion at this time (look within a 3-second window)
    const faceEmotion = emotionData.face.find(
      e => e.start_timestamp_ms <= timeMs + 1500 && e.end_timestamp_ms >= timeMs - 1500
    );

    // Find prosody emotion at this time
    const prosodyEmotion = emotionData.prosody.find(
      e => e.start_timestamp_ms <= timeMs + 1500 && e.end_timestamp_ms >= timeMs - 1500
    );

    return { face: faceEmotion, prosody: prosodyEmotion };
  };

  // Find active segment based on current time
  const currentTimeSec = currentTimeMs / 1000;
  let activeIndex = -1;
  for (let i = 0; i < transcriptJson.length; i++) {
    if ((transcriptJson[i].time_in_call_secs || 0) <= currentTimeSec) {
      activeIndex = i;
    } else {
      break;
    }
  }

  const handleSegmentClick = (startTime: number) => {
    if (onSegmentClick) {
      onSegmentClick(startTime);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent" />
          <span className="ml-3 text-gray-500">Loading transcript...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // Emotion badge component
  const EmotionBadge = ({ emotion, type }: { emotion: EmotionTimelineItem; type: 'face' | 'prosody' }) => (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
      <div className="flex items-center gap-1.5">
        {type === 'face' ? (
          <Smile className="w-3.5 h-3.5 text-gray-400" />
        ) : (
          <Mic className="w-3.5 h-3.5 text-gray-400" />
        )}
        <span className="text-xs text-gray-500 uppercase tracking-wide">{type}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: getEmotionColor(emotion.top_emotion_name) }}
        />
        <span className="text-sm font-medium text-gray-700 capitalize">
          {emotion.top_emotion_name}
        </span>
        <span className="text-xs text-gray-400">
          {(emotion.top_emotion_score * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );

  // Render transcript with emotions
  const renderTranscriptWithEmotions = () => (
    <div className="space-y-6">
      {transcriptJson.map((item, index) => {
        const isUser = item.role === 'user';
        const isActive = index === activeIndex;
        const hasMessage = !!item.message;
        const hasTools = (item.tool_calls && item.tool_calls.length > 0) || (item.tool_results && item.tool_results.length > 0);

        if (!hasMessage && !hasTools) return null;

        // Get emotions for user messages
        const emotions = isUser && item.time_in_call_secs !== undefined
          ? getEmotionsAtTime(item.time_in_call_secs)
          : { face: null, prosody: null };

        return (
          <div
            key={index}
            ref={isActive ? activeSegmentRef : null}
            className={`transition-all duration-200 ${isActive ? 'scale-[1.01]' : ''}`}
          >
            {/* Full-width message card */}
            <div
              className={`rounded-xl border-2 transition-colors ${
                isActive
                  ? 'border-primary-400 bg-primary-50/50'
                  : isUser
                  ? 'border-blue-100 bg-white hover:border-blue-200'
                  : 'border-purple-100 bg-white hover:border-purple-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isUser ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    {isUser ? (
                      <User className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Bot className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <span className={`font-medium ${isUser ? 'text-blue-700' : 'text-purple-700'}`}>
                      {isUser ? 'You' : 'Interviewer'}
                    </span>
                    {item.time_in_call_secs !== undefined && (
                      <span
                        className="ml-3 text-xs text-gray-400 font-mono cursor-pointer hover:text-primary-600"
                        onClick={() => handleSegmentClick(item.time_in_call_secs || 0)}
                      >
                        {formatTimestamp(item.time_in_call_secs)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Emotion badges for user messages */}
                {isUser && (emotions.face || emotions.prosody) && (
                  <div className="flex items-center gap-2">
                    {emotions.face && <EmotionBadge emotion={emotions.face} type="face" />}
                    {emotions.prosody && <EmotionBadge emotion={emotions.prosody} type="prosody" />}
                  </div>
                )}
              </div>

              {/* Message content */}
              {hasMessage && (
                <div className="px-4 py-4">
                  <p className="text-gray-800 leading-relaxed">{item.message}</p>
                </div>
              )}

              {/* Tool calls/results */}
              {hasTools && (
                <div className="px-4 pb-4 space-y-2">
                  {item.tool_calls?.map((tool, tIdx) => (
                    <div key={`call-${tIdx}`} className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-md px-3 py-2">
                      <Terminal className="w-3.5 h-3.5" />
                      <span className="font-mono">Action: {tool.tool_name}</span>
                    </div>
                  ))}
                  {item.tool_results?.map((result, rIdx) => (
                    <div key={`res-${rIdx}`} className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-md px-3 py-2">
                      <Database className="w-3.5 h-3.5" />
                      <span className="font-mono">Result: {result.tool_name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Detailed emotion breakdown for user messages */}
              {isUser && (emotions.face || emotions.prosody) && (
                <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    {emotions.face && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Smile className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs font-medium text-gray-500">Facial Expression</span>
                        </div>
                        <div className="space-y-1.5">
                          {emotions.face.emotions.slice(0, 3).map((e, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${e.score * 100}%`,
                                    backgroundColor: getEmotionColor(e.name)
                                  }}
                                />
                              </div>
                              <span className="text-xs text-gray-600 w-20 capitalize">{e.name}</span>
                              <span className="text-xs text-gray-400 w-8">{(e.score * 100).toFixed(0)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {emotions.prosody && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Mic className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs font-medium text-gray-500">Voice Tone</span>
                        </div>
                        <div className="space-y-1.5">
                          {emotions.prosody.emotions.slice(0, 3).map((e, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${e.score * 100}%`,
                                    backgroundColor: getEmotionColor(e.name)
                                  }}
                                />
                              </div>
                              <span className="text-xs text-gray-600 w-20 capitalize">{e.name}</span>
                              <span className="text-xs text-gray-400 w-8">{(e.score * 100).toFixed(0)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">
            Conversation Transcript
          </h2>
          {emotionData.face.length > 0 && (
            <span className="text-sm font-normal text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
              with emotions
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200">
          {/* Controls */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {transcriptJson.length} messages
              {emotionData.face.length > 0 && ` • ${emotionData.face.length} emotion readings`}
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              Auto-scroll
            </label>
          </div>

          {/* Transcript Content - Full Width */}
          <div
            ref={containerRef}
            className="max-h-[700px] overflow-y-auto p-6"
          >
            {transcriptJson.length > 0 ? (
              renderTranscriptWithEmotions()
            ) : rawTranscript ? (
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{rawTranscript}</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No transcript available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
