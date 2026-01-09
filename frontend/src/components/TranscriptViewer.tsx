import { useState, useEffect, useRef } from 'react';
import { api, TranscriptSegment } from '../lib/api';
import { MessageSquare, User, Bot, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface TranscriptViewerProps {
  conversationId: string;
  currentTimeMs?: number;
  onSegmentClick?: (startTime: number) => void;
}

const EMOTION_CATEGORY_COLORS = {
  positive: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    badge: 'bg-green-100'
  },
  negative: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100'
  },
  neutral: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-700',
    badge: 'bg-gray-100'
  },
  surprise: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100'
  }
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

  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [rawTranscript, setRawTranscript] = useState<string | null>(null);
  const [hasAnnotations, setHasAnnotations] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showEmotionDetails, setShowEmotionDetails] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Load transcript data
  useEffect(() => {
    const loadTranscript = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getAnnotatedTranscript(conversationId);

        if (data.has_annotations && data.segments) {
          setSegments(data.segments);
          setHasAnnotations(true);
        } else if (data.transcript) {
          setRawTranscript(data.transcript);
          setHasAnnotations(false);
        }
      } catch (err) {
        console.error('Failed to load transcript:', err);
        setError(err instanceof Error ? err.message : 'Failed to load transcript');
      } finally {
        setIsLoading(false);
      }
    };

    loadTranscript();
  }, [conversationId]);

  // Auto-scroll to active segment
  useEffect(() => {
    if (autoScroll && activeSegmentRef.current && containerRef.current) {
      const container = containerRef.current;
      const element = activeSegmentRef.current;

      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      // Check if element is outside visible area
      if (elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentTimeMs, autoScroll]);

  // Find active segment based on current time
  const currentTimeSec = currentTimeMs / 1000;
  const activeSegmentIndex = segments.findIndex(
    seg => seg.start_time <= currentTimeSec && seg.end_time >= currentTimeSec
  );

  const handleSegmentClick = (segment: TranscriptSegment) => {
    if (onSegmentClick) {
      onSegmentClick(segment.start_time);
    }
  };

  const toggleEmotionDetails = (segmentId: string) => {
    setShowEmotionDetails(prev => prev === segmentId ? null : segmentId);
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
            Transcript {hasAnnotations && <span className="text-sm font-normal text-primary-600">(with emotions)</span>}
          </h2>
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
          {hasAnnotations && (
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  {Object.entries(EMOTION_CATEGORY_COLORS).map(([category, colors]) => (
                    <span
                      key={category}
                      className={`px-2 py-0.5 rounded text-xs ${colors.badge} ${colors.text} capitalize`}
                    >
                      {category}
                    </span>
                  ))}
                </div>
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
          )}

          {/* Transcript Content */}
          <div
            ref={containerRef}
            className="max-h-[500px] overflow-y-auto p-4"
          >
            {hasAnnotations && segments.length > 0 ? (
              <div className="space-y-3">
                {segments.map((segment, index) => {
                  const isActive = index === activeSegmentIndex;
                  const categoryColors = EMOTION_CATEGORY_COLORS[segment.emotion_category] || EMOTION_CATEGORY_COLORS.neutral;
                  const isUser = segment.speaker === 'user';

                  return (
                    <div
                      key={segment.id}
                      ref={isActive ? activeSegmentRef : null}
                      className={`rounded-lg border transition-all duration-200 ${
                        isActive
                          ? `${categoryColors.bg} ${categoryColors.border} ring-2 ring-primary-400`
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className="p-3 cursor-pointer"
                        onClick={() => handleSegmentClick(segment)}
                      >
                        {/* Speaker and Time */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {isUser ? (
                              <User className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Bot className="w-4 h-4 text-purple-500" />
                            )}
                            <span className={`text-xs font-medium ${isUser ? 'text-blue-600' : 'text-purple-600'}`}>
                              {isUser ? 'You' : 'Interviewer'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatTimestamp(segment.start_time)}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleEmotionDetails(segment.id);
                            }}
                            className={`px-2 py-0.5 rounded text-xs ${categoryColors.badge} ${categoryColors.text} capitalize flex items-center gap-1`}
                          >
                            {segment.dominant_emotion}
                            {showEmotionDetails === segment.id ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        {/* Text */}
                        <p className={`text-sm ${isActive ? categoryColors.text : 'text-gray-700'}`}>
                          {segment.text}
                        </p>

                        {/* Emotion Details */}
                        {showEmotionDetails === segment.id && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-xs text-gray-500 mb-2">Emotion breakdown:</div>
                            <div className="space-y-1">
                              {segment.emotions.slice(0, 5).map((emotion, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs">
                                  <div className="w-20 text-gray-600 capitalize">{emotion.name}</div>
                                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-primary-500"
                                      style={{ width: `${emotion.score * 100}%` }}
                                    />
                                  </div>
                                  <div className="w-10 text-right text-gray-400">
                                    {(emotion.score * 100).toFixed(0)}%
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
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

          {/* Footer Stats */}
          {hasAnnotations && segments.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{segments.length} segments</span>
                <div className="flex items-center gap-4">
                  <span>
                    Positive: {segments.filter(s => s.emotion_category === 'positive').length}
                  </span>
                  <span>
                    Neutral: {segments.filter(s => s.emotion_category === 'neutral').length}
                  </span>
                  <span>
                    Negative: {segments.filter(s => s.emotion_category === 'negative').length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
