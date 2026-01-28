import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, EmotionTimelineItem, TranscriptHighlight } from '../lib/api';
import { AlertCircle, Highlighter, X } from 'lucide-react';
import { LoadingSpinner } from './PlayfulUI';

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

const HIGHLIGHT_COLORS = {
  yellow: { bg: 'bg-sunshine-100', border: 'border-sunshine-300', text: 'text-sunshine-800', light: 'bg-sunshine-50' },
  green: { bg: 'bg-mint-100', border: 'border-mint-300', text: 'text-mint-800', light: 'bg-mint-50' },
  blue: { bg: 'bg-sky-100', border: 'border-sky-300', text: 'text-sky-800', light: 'bg-sky-50' },
  pink: { bg: 'bg-coral-100', border: 'border-coral-300', text: 'text-coral-800', light: 'bg-coral-50' },
  orange: { bg: 'bg-primary-100', border: 'border-primary-300', text: 'text-primary-800', light: 'bg-primary-50' },
};

const PHILOSOPHER_IMAGES: Record<string, { src: string; name: string; color: string }> = {
  aristotle: { src: '/philosophers/aristotle.png', name: 'Aristotle', color: 'bg-amber-100 border-amber-300' },
  plato: { src: '/philosophers/plato.png', name: 'Plato', color: 'bg-purple-100 border-purple-300' },
  socrates: { src: '/philosophers/socrates.png', name: 'Socrates', color: 'bg-teal-100 border-teal-300' },
  zeno: { src: '/philosophers/zeno.png', name: 'Zeno', color: 'bg-indigo-100 border-indigo-300' },
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
  const [autoScroll] = useState(true);
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
      philosopher: actionHighlight.commenter || null,
      commenter: actionHighlight.commenter || null,
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

      // Only process response for analyze actions
      if (actionType === 'analyze') {
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
      } else {
        // For practice action, just close the modal
        closeActionModal();
      }
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
      <div className="bg-white h-full flex items-center justify-center animate-fade-in">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" color="primary" />
          <span className="mt-4 text-gray-600 font-medium">Loading transcript...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white h-full flex items-center justify-center p-8 animate-fade-in">
        <div className="flex items-center gap-3 text-red-600 p-4 bg-red-50 rounded-2xl border-2 border-red-200">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">{error}</span>
        </div>
      </div>
    );
  }

  // Render transcript with emotions
  const renderTranscriptWithEmotions = () => (
    <div className="space-y-6 max-w-4xl mx-auto">
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
            className="transition-all duration-200"
          >
            <div
              className={`flex gap-4 group relative ${
                highlightColors ? 'cursor-pointer' : ''
              }`}
              onClick={() => highlight && openActionModal(highlight)}
            >
              {/* Left side - role label and timestamp */}
              <div className="flex-shrink-0 w-24 pt-1">
                <div className={`text-xs uppercase tracking-wide font-medium ${
                  isUser ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {isUser ? 'You' : 'Interviewer'}
                </div>
                {item.time_in_call_secs !== undefined && (
                  <div
                    className="text-xs text-gray-400 mt-1 cursor-pointer hover:text-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSegmentClick(item.time_in_call_secs || 0);
                    }}
                  >
                    {formatTimestamp(item.time_in_call_secs)}
                  </div>
                )}
              </div>

              {/* Right side - message content */}
              <div className="flex-1">
                <div
                  className={`rounded-xl p-6 transition-all duration-200 ${
                    highlightColors
                      ? `${highlightColors.light} border-l-4 ${highlightColors.border}`
                      : isActive
                      ? 'bg-gray-50 border-l-4 border-gray-300'
                      : 'bg-gray-50/50 border-l-4 border-transparent hover:bg-gray-50'
                  }`}
                >
                  {highlight && <HighlightTooltip highlight={highlight} colors={highlightColors} />}

                  {/* Message content with philosopher indicator */}
                  {hasMessage && (
                    <div className="flex items-start gap-3">
                      <p className="text-gray-900 leading-relaxed flex-1">{item.message}</p>
                      {highlight?.commenter && PHILOSOPHER_IMAGES[highlight.commenter] && (
                        <div className="flex-shrink-0 mt-1">
                          <img
                            src={PHILOSOPHER_IMAGES[highlight.commenter].src}
                            alt={PHILOSOPHER_IMAGES[highlight.commenter].name}
                            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-md"
                            title={`${PHILOSOPHER_IMAGES[highlight.commenter].name}'s feedback`}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Emotion indicators (subtle, inline) */}
                  {isUser && (emotions.face || emotions.prosody) && (
                    <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200/50">
                      {emotions.face && (
                        <div className="text-xs text-gray-500">
                          <span className="font-medium capitalize">{emotions.face.top_emotion_name}</span>
                          <span className="text-gray-400 ml-1">{(emotions.face.top_emotion_score * 100).toFixed(0)}%</span>
                        </div>
                      )}
                      {emotions.prosody && (
                        <div className="text-xs text-gray-500">
                          <span className="font-medium capitalize">{emotions.prosody.top_emotion_name}</span>
                          <span className="text-gray-400 ml-1">{(emotions.prosody.top_emotion_score * 100).toFixed(0)}%</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Highlight tooltip component with philosopher avatar
  const HighlightTooltip = ({ highlight, colors }: { highlight: TranscriptHighlight; colors: any }) => {
    const philosopher = highlight.commenter ? PHILOSOPHER_IMAGES[highlight.commenter] : null;

    return (
      <div className={`absolute -top-2 -translate-y-full left-0 mb-2 p-3 rounded-xl bg-white border ${philosopher ? philosopher.color : colors.border} shadow-lg z-10 whitespace-normal w-max max-w-sm opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300`}>
        <div className="flex items-start gap-3">
          {philosopher && (
            <div className="flex-shrink-0">
              <img
                src={philosopher.src}
                alt={philosopher.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {philosopher && (
              <div className="font-semibold text-xs text-gray-600 uppercase tracking-wide mb-1">
                {philosopher.name}
              </div>
            )}
            {highlight.comment ? (
              <p className="text-sm text-gray-700 leading-relaxed">
                {highlight.comment}
              </p>
            ) : (
              <p className="text-sm text-gray-600">Highlighted</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-hidden h-full flex flex-col bg-white">
      {/* Single-column Transcript with Inline Highlights */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-y-auto p-8"
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

      {actionHighlight && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={closeActionModal}>
          <div className="bg-white rounded-3xl shadow-soft-lg p-8 max-w-md w-full mx-4 animate-scale-in" onClick={e => e.stopPropagation()}>
            {/* Header with philosopher avatar */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                {actionHighlight.commenter && PHILOSOPHER_IMAGES[actionHighlight.commenter] ? (
                  <img
                    src={PHILOSOPHER_IMAGES[actionHighlight.commenter].src}
                    alt={PHILOSOPHER_IMAGES[actionHighlight.commenter].name}
                    className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-sunshine-100 flex items-center justify-center">
                    <Highlighter className="w-6 h-6 text-sunshine-600" />
                  </div>
                )}
                <div>
                  {actionHighlight.commenter && PHILOSOPHER_IMAGES[actionHighlight.commenter] && (
                    <div className={`inline-block px-3 py-1 ${PHILOSOPHER_IMAGES[actionHighlight.commenter].color} rounded-full text-xs font-bold uppercase tracking-wide mb-1`}>
                      {PHILOSOPHER_IMAGES[actionHighlight.commenter].name}
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-gray-900">
                    What would you like to do?
                  </h3>
                </div>
              </div>
              <button onClick={closeActionModal} className="p-2 hover:bg-gray-100 rounded-2xl transition-all duration-300 hover:scale-110">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Highlighted sentence */}
            <div className={`mb-6 p-4 ${
              actionHighlight.commenter && PHILOSOPHER_IMAGES[actionHighlight.commenter]
                ? PHILOSOPHER_IMAGES[actionHighlight.commenter].color
                : 'bg-sunshine-50 border-sunshine-200'
            } border-2 rounded-2xl`}>
              <p className="text-sm text-gray-900 font-semibold leading-relaxed">"{actionHighlight.highlighted_sentence}"</p>
              {actionHighlight.comment && (
                <p className="text-sm text-gray-600 mt-2 italic">"{actionHighlight.comment}"</p>
              )}
            </div>

            {actionError && (
              <div className="mb-6 text-sm text-red-700 bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-2 animate-slide-down">
                <span className="text-lg">⚠️</span>
                {actionError}
              </div>
            )}

            {/* Action buttons with philosopher image */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => sendReviewPracticeAction('practice')}
                disabled={isSubmittingAction}
                className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-4 ${
                  actionHighlight.commenter && PHILOSOPHER_IMAGES[actionHighlight.commenter]
                    ? `${PHILOSOPHER_IMAGES[actionHighlight.commenter].color} hover:shadow-lg`
                    : 'bg-primary-500 text-white border-primary-500 hover:bg-primary-600'
                }`}
              >
                {actionHighlight.commenter && PHILOSOPHER_IMAGES[actionHighlight.commenter] && (
                  <img
                    src={PHILOSOPHER_IMAGES[actionHighlight.commenter].src}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                )}
                <span className="font-semibold text-gray-900">Practice this question again</span>
              </button>
              <button
                onClick={() => sendReviewPracticeAction('analyze')}
                disabled={isSubmittingAction}
                className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-4 ${
                  actionHighlight.commenter && PHILOSOPHER_IMAGES[actionHighlight.commenter]
                    ? `bg-white ${PHILOSOPHER_IMAGES[actionHighlight.commenter].color.replace('bg-', 'border-')} hover:shadow-lg`
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                {actionHighlight.commenter && PHILOSOPHER_IMAGES[actionHighlight.commenter] && (
                  <img
                    src={PHILOSOPHER_IMAGES[actionHighlight.commenter].src}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                )}
                <span className="font-semibold text-gray-700">Analyze this turn</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
