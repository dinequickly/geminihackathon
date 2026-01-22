import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, EmotionTimelineItem, TranscriptHighlight } from '../lib/api';
import { MessageSquare, User, Bot, ChevronDown, ChevronUp, AlertCircle, Terminal, Database, Smile, Mic, Highlighter, X, Sparkles } from 'lucide-react';
import { PlayfulCard, Badge, PlayfulButton, LoadingSpinner } from './PlayfulUI';

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
  joy: '#06A77D',
  happiness: '#06A77D',
  amusement: '#FFC857',
  excitement: '#FF6B35',
  interest: '#4D9DE0',
  surprise: '#FF9B71',
  concentration: '#4D9DE0',
  contemplation: '#9B59B6',
  determination: '#FF6B35',
  calmness: '#4D9DE0',
  contentment: '#06A77D',
  realization: '#FFC857',
  admiration: '#FF9B71',
  sadness: '#7B8794',
  disappointment: '#95A5A6',
  tiredness: '#BDC3C7',
  confusion: '#9B59B6',
  anxiety: '#E74C3C',
  fear: '#C0392B',
  anger: '#E74C3C',
  disgust: '#95A5A6',
  contempt: '#7F8C8D',
  embarrassment: '#FF9B71',
  awkwardness: '#FFC857',
  neutral: '#BDC3C7',
};

const HIGHLIGHT_COLORS = {
  yellow: { bg: 'bg-sunshine-100', border: 'border-sunshine-300', text: 'text-sunshine-800', light: 'bg-sunshine-50' },
  green: { bg: 'bg-mint-100', border: 'border-mint-300', text: 'text-mint-800', light: 'bg-mint-50' },
  blue: { bg: 'bg-sky-100', border: 'border-sky-300', text: 'text-sky-800', light: 'bg-sky-50' },
  pink: { bg: 'bg-coral-100', border: 'border-coral-300', text: 'text-coral-800', light: 'bg-coral-50' },
  orange: { bg: 'bg-primary-100', border: 'border-primary-300', text: 'text-primary-800', light: 'bg-primary-50' },
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
  const navigate = useNavigate();
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
  const [actionHighlight, setActionHighlight] = useState<TranscriptHighlight | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const REVIEW_PRACTICE_WEBHOOK_URL = 'https://maxipad.app.n8n.cloud/webhook/a0894027-a899-473b-b864-e0a2d18950d3';

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

  const getHighlightTranscriptEntry = (highlight: TranscriptHighlight) => {
    return transcriptJson.find(item => {
      if (!item.message) return false;
      return item.message.includes(highlight.highlighted_sentence) || highlight.highlighted_sentence.includes(item.message);
    });
  };

  const getHighlightMessage = (highlight: TranscriptHighlight) => {
    const match = getHighlightTranscriptEntry(highlight);
    return match?.message || highlight.comment || highlight.highlighted_sentence;
  };

  const getHighlightTimestampMs = (highlight: TranscriptHighlight) => {
    const match = getHighlightTranscriptEntry(highlight);
    if (match?.time_in_call_secs === undefined || match?.time_in_call_secs === null) {
      return null;
    }
    return Math.round(match.time_in_call_secs * 1000);
  };

  const getNearestEmotionSegment = (segments: EmotionTimelineItem[], timeMs: number | null) => {
    if (!segments.length || timeMs === null) return null;
    const exact = segments.find(segment => segment.start_timestamp_ms <= timeMs && segment.end_timestamp_ms >= timeMs);
    if (exact) return exact;
    for (let i = segments.length - 1; i >= 0; i -= 1) {
      if (segments[i].start_timestamp_ms <= timeMs) {
        return segments[i];
      }
    }
    return null;
  };

  const getTopEmotions = (emotions: Array<{ name: string; score: number }>, limit = 5) => {
    return [...emotions].sort((a, b) => b.score - a.score).slice(0, limit);
  };

  const getActionId = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `${conversationId}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const buildTranscriptMessages = () => {
    return transcriptJson
      .filter(item => item.message && item.message.trim().length > 0)
      .map(item => ({
        role: item.role === 'agent' ? 'assistant' : 'user',
        content: item.message,
        time_in_call_secs: item.time_in_call_secs ?? null
      }));
  };

  const openActionModal = (highlight: TranscriptHighlight) => {
    setActionHighlight(highlight);
    setActionError(null);
  };

  const closeActionModal = () => {
    setActionHighlight(null);
    setIsSubmittingAction(false);
    setActionError(null);
  };

  const sendReviewPracticeAction = async (actionType: 'practice' | 'analyze') => {
    if (!actionHighlight) return;
    setIsSubmittingAction(true);
    setActionError(null);

    const payload = {
      id: getActionId(),
      conversation_id: conversationId,
      highlighted_text: actionHighlight.highlighted_sentence,
      messages: buildTranscriptMessages(),
      type: actionType,
      highlight_id: actionHighlight.id,
      highlight_message: getHighlightMessage(actionHighlight),
      emotions_at_time: (() => {
        const timestampMs = getHighlightTimestampMs(actionHighlight);
        const faceSegment = getNearestEmotionSegment(emotionData.face, timestampMs);
        const prosodySegment = getNearestEmotionSegment(emotionData.prosody, timestampMs);
        return {
          timestamp_ms: timestampMs,
          face_top5: faceSegment ? getTopEmotions(faceSegment.emotions) : [],
          prosody_top5: prosodySegment ? getTopEmotions(prosodySegment.emotions) : []
        };
      })()
    };

    try {
      const response = await fetch(REVIEW_PRACTICE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || `Webhook error (${response.status})`);
      }

      const raw = await response.text();
      let data: any = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch (parseError) {
        data = null;
      }

      const reviewPracticeId = (
        data?.review_practice_id ||
        data?.reviewPracticeId ||
        data?.review_practice?.id ||
        data?.id
      )?.toString().trim();
      const nextChatId = (reviewPracticeId || data?.chat_id || data?.conversation_id || raw)?.toString().trim();
      if (!nextChatId) {
        throw new Error('No conversation id returned from webhook');
      }

      closeActionModal();
      const query = reviewPracticeId ? `?review_practice_id=${encodeURIComponent(reviewPracticeId)}` : '';
      navigate(`/chat/${nextChatId}${query}`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to send action');
      setIsSubmittingAction(false);
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
      <PlayfulCard variant="white" className="animate-fade-in">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" color="primary" />
          <span className="mt-4 text-gray-600 font-medium">Loading transcript...</span>
        </div>
      </PlayfulCard>
    );
  }

  if (error) {
    return (
      <PlayfulCard variant="white" className="animate-fade-in">
        <div className="flex items-center gap-3 text-red-600 p-4 bg-red-50 rounded-2xl border-2 border-red-200">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">{error}</span>
        </div>
      </PlayfulCard>
    );
  }

  // Emotion badge component
  const EmotionBadge = ({ emotion, type }: { emotion: EmotionTimelineItem; type: 'face' | 'prosody' }) => (
    <div className="flex items-center gap-2 px-3 py-2 bg-cream-50 rounded-2xl border-2 border-gray-100 shadow-soft">
      <div className="flex items-center gap-1.5">
        {type === 'face' ? (
          <Smile className="w-4 h-4 text-primary-500" />
        ) : (
          <Mic className="w-4 h-4 text-sky-500" />
        )}
        <span className="text-xs text-gray-600 uppercase tracking-wide font-semibold">{type}</span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full shadow-sm"
          style={{ backgroundColor: getEmotionColor(emotion.top_emotion_name) }}
        />
        <span className="text-sm font-bold text-gray-800 capitalize">
          {emotion.top_emotion_name}
        </span>
        <span className="text-xs text-gray-500 font-semibold">
          {(emotion.top_emotion_score * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );

  // Render transcript with emotions
  const renderTranscriptWithEmotions = () => (
    <div className="space-y-4">
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
              className={`rounded-3xl border-2 transition-all duration-300 shadow-soft group relative ${
                highlightColors
                  ? `${highlightColors.border} ${highlightColors.light} border-l-4 cursor-pointer hover:shadow-soft-lg`
                  : isActive
                  ? 'border-primary-400 bg-primary-50/50 shadow-soft-lg'
                  : isUser
                  ? 'border-sky-100 bg-white hover:border-sky-300 hover:shadow-sky'
                  : 'border-coral-100 bg-white hover:border-coral-300 hover:shadow-soft-lg'
              }`}
              onClick={() => highlight && openActionModal(highlight)}
            >
              {highlight && (
                <>
                  <div className={`absolute -left-1 top-0 bottom-0 w-1 rounded-l-2xl ${highlightColors?.bg}`} />
                  <HighlightTooltip highlight={highlight} colors={highlightColors} />
                </>
              )}
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b-2 border-gray-100 bg-cream-50/50">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-soft ${
                    isUser ? 'bg-sky-400' : 'bg-coral-400'
                  }`}>
                    {isUser ? (
                      <User className="w-4.5 h-4.5 text-white" />
                    ) : (
                      <Bot className="w-4.5 h-4.5 text-white" />
                    )}
                  </div>
                  <span className={`text-sm font-bold ${isUser ? 'text-sky-700' : 'text-coral-700'}`}>
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

  // Highlight tooltip component
  const HighlightTooltip = ({ highlight, colors }: { highlight: TranscriptHighlight; colors: any }) => (
    <div className={`absolute bottom-full left-0 mb-2 p-3 rounded-xl bg-white border-2 ${colors.border} shadow-soft-lg z-10 whitespace-normal w-max max-w-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300`}>
      {highlight.comment && (
        <p className={`text-xs ${colors.text} font-semibold leading-relaxed`}>
          {highlight.comment}
        </p>
      )}
      {!highlight.comment && (
        <p className="text-xs text-gray-600 font-medium">Highlighted</p>
      )}
    </div>
  );

  return (
    <PlayfulCard variant="white" className="overflow-hidden h-full flex flex-col animate-fade-in">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 flex items-center justify-between hover:bg-cream-50 transition-all duration-300 rounded-t-3xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary-100 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Conversation Transcript
          </h2>
          {emotionData.face.length > 0 && (
            <Badge variant="primary" icon={Sparkles}>
              with emotions
            </Badge>
          )}
          {highlights.length > 0 && (
            <Badge variant="sunshine" icon={Highlighter}>
              {highlights.length} highlights
            </Badge>
          )}
        </div>
        <div className={`p-2 rounded-xl transition-all duration-300 ${isExpanded ? 'bg-primary-100' : 'bg-gray-100'}`}>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-primary-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t-2 border-gray-100 flex-1 min-h-0 flex flex-col">
          {/* Controls */}
          <div className="px-5 py-3 bg-cream-50/50 border-b-2 border-gray-100 flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm text-gray-700 font-medium">
              <span className="text-primary-600 font-bold">{transcriptJson.length}</span> messages
              {emotionData.face.length > 0 && (
                <>
                  {' • '}
                  <span className="text-sky-600 font-bold">{emotionData.face.length}</span> emotion readings
                </>
              )}
              {highlights.length > 0 && (
                <>
                  {' • '}
                  <span className="text-sunshine-600 font-bold">{highlights.length}</span> highlights
                </>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-primary-600 transition-colors">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded-lg border-2 border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 w-5 h-5"
              />
              <span className="font-semibold">Auto-scroll</span>
            </label>
          </div>

          {/* Single-column Transcript with Inline Highlights */}
          <div
            ref={containerRef}
            className="flex-1 min-h-0 overflow-y-auto p-4"
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

      {actionHighlight && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={closeActionModal}>
          <div className="bg-white rounded-3xl shadow-soft-lg p-8 max-w-md w-full mx-4 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-sunshine-100 flex items-center justify-center">
                  <Highlighter className="w-5 h-5 text-sunshine-600" />
                </div>
                What would you like to do?
              </h3>
              <button onClick={closeActionModal} className="p-2 hover:bg-gray-100 rounded-2xl transition-all duration-300 hover:scale-110">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-sunshine-50 border-2 border-sunshine-200 rounded-2xl">
              <p className="text-sm text-sunshine-900 font-semibold leading-relaxed">"{actionHighlight.highlighted_sentence}"</p>
            </div>

            {actionError && (
              <div className="mb-6 text-sm text-red-700 bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-2 animate-slide-down">
                <span className="text-lg">⚠️</span>
                {actionError}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <PlayfulButton
                onClick={() => sendReviewPracticeAction('practice')}
                disabled={isSubmittingAction}
                variant="primary"
                size="lg"
                className="w-full"
              >
                Practice this question again
              </PlayfulButton>
              <PlayfulButton
                onClick={() => sendReviewPracticeAction('analyze')}
                disabled={isSubmittingAction}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                Analyze this turn
              </PlayfulButton>
            </div>
          </div>
        </div>
      )}
    </PlayfulCard>
  );
}
