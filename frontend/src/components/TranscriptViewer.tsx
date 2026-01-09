import { useState, useEffect, useRef } from 'react';
import { api, TranscriptSegment } from '../lib/api';
import { MessageSquare, User, Bot, ChevronDown, ChevronUp, AlertCircle, Terminal, Database } from 'lucide-react';

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
  const [transcriptJson, setTranscriptJson] = useState<TranscriptItem[]>([]);
  const [rawTranscript, setRawTranscript] = useState<string | null>(null);
  const [hasAnnotations, setHasAnnotations] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showEmotionDetails, setShowEmotionDetails] = useState<string | null>(null);
  const [showToolDetails, setShowToolDetails] = useState<Record<string, boolean>>({});
  const [autoScroll, setAutoScroll] = useState(true);

  // Load transcript data
  useEffect(() => {
    const loadTranscript = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getAnnotatedTranscript(conversationId);

        console.log('Transcript data received:', data);

        if (data.transcript_json && Array.isArray(data.transcript_json) && data.transcript_json.length > 0) {
          console.log('Setting transcript_json with', data.transcript_json.length, 'items');
          setTranscriptJson(data.transcript_json);
        }

        if (data.has_annotations && data.segments) {
          console.log('Setting annotated segments with', data.segments.length, 'segments');
          setSegments(data.segments);
          setHasAnnotations(true);
        }

        // Always set raw transcript if available, as fallback
        if (data.transcript) {
          console.log('Setting raw transcript, length:', data.transcript.length);
          setRawTranscript(data.transcript);
          if (!data.has_annotations) {
            setHasAnnotations(false);
          }
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
  
  // Logic for active item depends on what data source we are using
  let activeIndex = -1;
  if (hasAnnotations) {
    activeIndex = segments.findIndex(
      seg => seg.start_time <= currentTimeSec && seg.end_time >= currentTimeSec
    );
  } else if (transcriptJson.length > 0) {
    // Approximate matching for JSON transcript based on time_in_call_secs
    // This assumes items are sorted by time
    for (let i = 0; i < transcriptJson.length; i++) {
        if ((transcriptJson[i].time_in_call_secs || 0) <= currentTimeSec) {
            activeIndex = i;
        } else {
            break;
        }
    }
  }

  const handleSegmentClick = (startTime: number) => {
    if (onSegmentClick) {
      onSegmentClick(startTime);
    }
  };

  const toggleEmotionDetails = (segmentId: string) => {
    setShowEmotionDetails(prev => prev === segmentId ? null : segmentId);
  };

  const toggleToolDetails = (index: number) => {
    setShowToolDetails(prev => ({
        ...prev,
        [index]: !prev[index]
    }));
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

  // Render Rich JSON Transcript (Preferred)
  const renderRichTranscript = () => (
    <div className="space-y-4">
      {transcriptJson.map((item, index) => {
        const isUser = item.role === 'user';
        const isActive = index === activeIndex;
        const hasMessage = !!item.message;
        const hasTools = (item.tool_calls && item.tool_calls.length > 0) || (item.tool_results && item.tool_results.length > 0);

        if (!hasMessage && !hasTools) return null;

        return (
          <div 
            key={index} 
            ref={isActive ? activeSegmentRef : null}
            className={`transition-colors duration-200 rounded-lg ${isActive ? 'bg-primary-50 -mx-2 px-2 py-1' : ''}`}
          >
            {/* Metadata / Time */}
            <div className="flex items-center justify-between mb-1 px-1">
                <span className={`text-xs font-medium ${isUser ? 'text-blue-600' : 'text-purple-600'} flex items-center gap-1`}>
                    {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    {isUser ? 'You' : 'Interviewer'}
                </span>
                {item.time_in_call_secs !== undefined && (
                    <span 
                        className="text-xs text-gray-400 font-mono cursor-pointer hover:text-primary-600"
                        onClick={() => handleSegmentClick(item.time_in_call_secs || 0)}
                    >
                        {formatTimestamp(item.time_in_call_secs)}
                    </span>
                )}
            </div>

            {/* Message Bubble */}
            {hasMessage && (
                <div 
                    className={`p-3 rounded-2xl text-sm mb-2 ${
                        isUser 
                        ? 'bg-blue-50 text-blue-900 rounded-tr-none ml-8' 
                        : 'bg-purple-50 text-purple-900 rounded-tl-none mr-8'
                    }`}
                >
                    {item.message}
                </div>
            )}

            {/* Tool Calls (Agent Actions) */}
            {item.tool_calls?.map((tool, tIdx) => (
                <div key={`call-${tIdx}`} className="ml-4 mr-8 mb-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5">
                        <Terminal className="w-3 h-3" />
                        <span className="font-mono">Action: {tool.tool_name}</span>
                        {tool.tool_details?.query_params && (
                             <span className="text-gray-400 truncate max-w-[200px]">
                                {JSON.stringify(tool.tool_details.query_params)}
                             </span>
                        )}
                    </div>
                </div>
            ))}

            {/* Tool Results (Data Fetched) */}
            {item.tool_results?.map((result, rIdx) => {
                const isExpanded = showToolDetails[`${index}-res-${rIdx}`];
                const isError = result.is_error;
                
                return (
                    <div key={`res-${rIdx}`} className="ml-4 mr-8 mb-2">
                        <div 
                            className={`text-xs border rounded-md overflow-hidden ${
                                isError ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                            }`}
                        >
                            <button
                                onClick={() => toggleToolDetails(`${index}-res-${rIdx}` as any)}
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 transition"
                            >
                                <div className="flex items-center gap-2">
                                    <Database className={`w-3 h-3 ${isError ? 'text-red-500' : 'text-gray-500'}`} />
                                    <span className={`font-mono font-medium ${isError ? 'text-red-700' : 'text-gray-700'}`}>
                                        Result: {result.tool_name}
                                    </span>
                                </div>
                                {isExpanded ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
                            </button>
                            
                            {isExpanded && (
                                <div className="p-3 bg-white border-t border-gray-200 overflow-x-auto">
                                    <pre className="font-mono text-[10px] text-gray-600 whitespace-pre-wrap">
                                        {result.result_value}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
          </div>
        );
      })}
    </div>
  );

  // Render Annotated Segments (Legacy/Emotion)
  const renderAnnotatedSegments = () => (
    <div className="space-y-3">
      {segments.map((segment, index) => {
        // For annotated segments, we use the specific index found earlier
        const isSegmentActive = segments.findIndex(
            s => s.start_time <= currentTimeSec && s.end_time >= currentTimeSec
          ) === index;

        const categoryColors = EMOTION_CATEGORY_COLORS[segment.emotion_category] || EMOTION_CATEGORY_COLORS.neutral;
        const isUser = segment.speaker === 'user';

        return (
          <div
            key={segment.id}
            ref={isSegmentActive ? activeSegmentRef : null}
            className={`rounded-lg border transition-all duration-200 ${
              isSegmentActive
                ? `${categoryColors.bg} ${categoryColors.border} ring-2 ring-primary-400`
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div
              className="p-3 cursor-pointer"
              onClick={() => handleSegmentClick(segment.start_time)}
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
              <p className={`text-sm ${isSegmentActive ? categoryColors.text : 'text-gray-700'}`}>
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
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            {hasAnnotations ? (
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
            ) : (
                <div className="text-xs text-gray-500">
                    Full conversation log
                </div>
            )}
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

          {/* Transcript Content */}
          <div
            ref={containerRef}
            className="max-h-[500px] overflow-y-auto p-4"
          >
            {/* Debug info - remove after testing */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                <div>transcript_json: {transcriptJson.length} items</div>
                <div>segments: {segments.length} items</div>
                <div>hasAnnotations: {hasAnnotations ? 'true' : 'false'}</div>
                <div>rawTranscript: {rawTranscript ? `${rawTranscript.length} chars` : 'null'}</div>
              </div>
            )}

            {transcriptJson.length > 0 ? (
                renderRichTranscript()
            ) : hasAnnotations && segments.length > 0 ? (
                renderAnnotatedSegments()
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