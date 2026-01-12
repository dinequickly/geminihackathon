import { useState, useEffect, useRef } from 'react';
import { api, EmotionTimelineItem, TranscriptHighlight } from '../lib/api';
import { MessageSquare, User, Bot, ChevronDown, ChevronUp, AlertCircle, Terminal, Database, Smile, Mic, Highlighter, X, Plus, Trash2 } from 'lucide-react';

interface TranscriptViewerProps {
  conversationId: string;
  currentTimeMs?: number;
  humeJobId?: string;
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

const HIGHLIGHT_COLORS = {
  yellow: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800', light: 'bg-yellow-50' },
  green: { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800', light: 'bg-green-50' },
  blue: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800', light: 'bg-blue-50' },
  pink: { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-800', light: 'bg-pink-50' },
  orange: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800', light: 'bg-orange-50' },
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
  humeJobId,
  onSegmentClick
}: TranscriptViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeSegmentRef = useRef<HTMLDivElement>(null);

  const [transcriptJson, setTranscriptJson] = useState<TranscriptItem[]>([]);
  const [rawTranscript, setRawTranscript] = useState<string | null>(null);
  const [emotionData, setEmotionData] = useState<EmotionData>({ face: [], prosody: [] });
  const [highlights, setHighlights] = useState<TranscriptHighlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);

  // Highlight creation state
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [showHighlightForm, setShowHighlightForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newColor, setNewColor] = useState<'yellow' | 'green' | 'blue' | 'pink' | 'orange'>('yellow');
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);

  // Load transcript, emotion data, and highlights
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const fallbackJobId = humeJobId?.trim() || undefined;
        const [transcriptData, emotionTimeline, highlightsData] = await Promise.all([
          api.getAnnotatedTranscript(conversationId),
          api.getEmotionTimeline(conversationId, { models: ['face', 'prosody'], fallbackJobId }).catch(() => null),
          api.getHighlights(conversationId).catch(() => ({ highlights: [] }))
        ]);

        console.log('Transcript data received:', transcriptData);

        if (transcriptData.transcript_json && Array.isArray(transcriptData.transcript_json) && transcriptData.transcript_json.length > 0) {
          let items = transcriptData.transcript_json;
          if (items.length === 1 && Array.isArray(items[0])) {
            items = items[0];
          }
          setTranscriptJson(items);
        }

        if (transcriptData.transcript) {
          setRawTranscript(transcriptData.transcript);
        }

        if (emotionTimeline) {
          setEmotionData({
            face: emotionTimeline.timeline.face || [],
            prosody: emotionTimeline.timeline.prosody || []
          });
        }

        setHighlights(highlightsData.highlights || []);
      } catch (err) {
        console.error('Failed to load transcript:', err);
        setError(err instanceof Error ? err.message : 'Failed to load transcript');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [conversationId, humeJobId]);

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

  // Handle text selection
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString().trim());
      setShowHighlightForm(true);
    }
  };

  // Create highlight
  const handleCreateHighlight = async () => {
    if (!selectedText) return;

    try {
      const newHighlight = await api.createHighlight(conversationId, {
        highlighted_sentence: selectedText,
        comment: newComment || undefined,
        color: newColor
      });
      setHighlights(prev => [...prev, newHighlight]);
      setShowHighlightForm(false);
      setSelectedText(null);
      setNewComment('');
      setNewColor('yellow');
    } catch (err) {
      console.error('Failed to create highlight:', err);
    }
  };

  // Delete highlight
  const handleDeleteHighlight = async (highlightId: string) => {
    try {
      await api.deleteHighlight(conversationId, highlightId);
      setHighlights(prev => prev.filter(h => h.id !== highlightId));
    } catch (err) {
      console.error('Failed to delete highlight:', err);
    }
  };

  // Find emotions at a specific time
  const getEmotionsAtTime = (timeSecs: number) => {
    const timeMs = timeSecs * 1000;

    const faceEmotion = emotionData.face.find(
      e => e.start_timestamp_ms <= timeMs + 1500 && e.end_timestamp_ms >= timeMs - 1500
    );

    const prosodyEmotion = emotionData.prosody.find(
      e => e.start_timestamp_ms <= timeMs + 1500 && e.end_timestamp_ms >= timeMs - 1500
    );

    return { face: faceEmotion, prosody: prosodyEmotion };
  };

  // Check if text is highlighted
  const getHighlightForText = (text: string) => {
    return highlights.find(h => text.includes(h.highlighted_sentence) || h.highlighted_sentence.includes(text));
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
    <div className="space-y-4" onMouseUp={handleTextSelection}>
      {transcriptJson.map((item, index) => {
        const isUser = item.role === 'user';
        const isActive = index === activeIndex;
        const hasMessage = !!item.message;
        const hasTools = (item.tool_calls && item.tool_calls.length > 0) || (item.tool_results && item.tool_results.length > 0);

        if (!hasMessage && !hasTools) return null;

        const emotions = isUser && item.time_in_call_secs !== undefined
          ? getEmotionsAtTime(item.time_in_call_secs)
          : { face: null, prosody: null };

        const highlight = item.message ? getHighlightForText(item.message) : null;
        const highlightColors = highlight ? HIGHLIGHT_COLORS[highlight.color] : null;

        return (
          <div
            key={index}
            ref={isActive ? activeSegmentRef : null}
            className={`transition-all duration-200 ${isActive ? 'scale-[1.01]' : ''}`}
          >
            <div
              className={`rounded-xl border-2 transition-colors ${
                highlightColors
                  ? `${highlightColors.border} ${highlightColors.light}`
                  : isActive
                  ? 'border-primary-400 bg-primary-50/50'
                  : isUser
                  ? 'border-blue-100 bg-white hover:border-blue-200'
                  : 'border-purple-100 bg-white hover:border-purple-200'
              }`}
              onClick={() => highlight && setActiveHighlight(highlight.id)}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    isUser ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    {isUser ? (
                      <User className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 text-purple-600" />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${isUser ? 'text-blue-700' : 'text-purple-700'}`}>
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
                  {highlight && (
                    <span className={`text-xs px-2 py-0.5 rounded ${highlightColors?.bg} ${highlightColors?.text}`}>
                      Highlighted
                    </span>
                  )}
                </div>

                {isUser && (emotions.face || emotions.prosody) && (
                  <div className="flex items-center gap-2">
                    {emotions.face && <EmotionBadge emotion={emotions.face} type="face" />}
                    {emotions.prosody && <EmotionBadge emotion={emotions.prosody} type="prosody" />}
                  </div>
                )}
              </div>

              {/* Message content */}
              {hasMessage && (
                <div className="px-4 py-3">
                  <p className="text-gray-800 leading-relaxed text-sm">{item.message}</p>
                </div>
              )}

              {/* Tool calls/results */}
              {hasTools && (
                <div className="px-4 pb-3 space-y-2">
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

              {/* Emotion breakdown */}
              {isUser && (emotions.face || emotions.prosody) && (
                <div className="px-4 py-2 bg-gray-50/50 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    {emotions.face && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Smile className="w-3 h-3 text-gray-400" />
                          <span className="text-xs font-medium text-gray-500">Face</span>
                        </div>
                        <div className="space-y-1">
                          {emotions.face.emotions.slice(0, 3).map((e, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${e.score * 100}%`,
                                    backgroundColor: getEmotionColor(e.name)
                                  }}
                                />
                              </div>
                              <span className="text-xs text-gray-600 w-16 capitalize truncate">{e.name}</span>
                              <span className="text-xs text-gray-400 w-6">{(e.score * 100).toFixed(0)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {emotions.prosody && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Mic className="w-3 h-3 text-gray-400" />
                          <span className="text-xs font-medium text-gray-500">Voice</span>
                        </div>
                        <div className="space-y-1">
                          {emotions.prosody.emotions.slice(0, 3).map((e, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${e.score * 100}%`,
                                    backgroundColor: getEmotionColor(e.name)
                                  }}
                                />
                              </div>
                              <span className="text-xs text-gray-600 w-16 capitalize truncate">{e.name}</span>
                              <span className="text-xs text-gray-400 w-6">{(e.score * 100).toFixed(0)}%</span>
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

  // Highlights panel
  const renderHighlightsPanel = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Highlighter className="w-4 h-4" />
          Highlights & Notes
        </h3>
        <span className="text-xs text-gray-500">{highlights.length} notes</span>
      </div>

      {highlights.length === 0 ? (
        <div className="text-center py-8">
          <Highlighter className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No highlights yet</p>
          <p className="text-xs text-gray-400 mt-1">Select text in the transcript to add a highlight</p>
        </div>
      ) : (
        <div className="space-y-3">
          {highlights.map((highlight) => {
            const colors = HIGHLIGHT_COLORS[highlight.color];
            const isActive = activeHighlight === highlight.id;

            return (
              <div
                key={highlight.id}
                className={`rounded-lg border-2 p-3 cursor-pointer transition-all ${
                  isActive
                    ? `${colors.border} ${colors.bg} shadow-sm`
                    : `border-gray-100 hover:${colors.border} ${colors.light}`
                }`}
                onClick={() => setActiveHighlight(isActive ? null : highlight.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm ${colors.text} font-medium line-clamp-2`}>
                    "{highlight.highlighted_sentence}"
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteHighlight(highlight.id);
                    }}
                    className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {highlight.comment && (
                  <p className="text-xs text-gray-600 mt-2 bg-white/50 rounded p-2">
                    {highlight.comment}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-3 h-3 rounded-full ${colors.bg} border ${colors.border}`} />
                  <span className="text-xs text-gray-400">
                    {new Date(highlight.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
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
          {highlights.length > 0 && (
            <span className="text-sm font-normal text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
              {highlights.length} highlights
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
        <div className="border-t border-gray-200 flex-1 min-h-0 flex flex-col">
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

          {/* Two-column layout: Transcript + Highlights */}
          <div className="flex flex-1 min-h-0">
            {/* Transcript - Left side */}
            <div
              ref={containerRef}
              className="flex-1 min-h-0 overflow-y-auto p-4 border-r border-gray-100"
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

            {/* Highlights Panel - Right side */}
            <div className="w-80 min-h-0 overflow-y-auto p-4 bg-gray-50/50">
              {renderHighlightsPanel()}
            </div>
          </div>
        </div>
      )}

      {/* Highlight creation modal */}
      {showHighlightForm && selectedText && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowHighlightForm(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Highlighter className="w-5 h-5 text-yellow-500" />
                Add Highlight
              </h3>
              <button onClick={() => setShowHighlightForm(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">"{selectedText}"</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <div className="flex gap-2">
                {(Object.keys(HIGHLIGHT_COLORS) as Array<keyof typeof HIGHLIGHT_COLORS>).map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewColor(color)}
                    className={`w-8 h-8 rounded-full ${HIGHLIGHT_COLORS[color].bg} border-2 ${
                      newColor === color ? 'border-gray-800 ring-2 ring-offset-2 ring-gray-300' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Comment (optional)</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a note about this highlight..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowHighlightForm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateHighlight}
                className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Highlight
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
