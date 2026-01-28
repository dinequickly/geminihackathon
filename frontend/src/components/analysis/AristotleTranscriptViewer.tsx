import React, { useState, useEffect, useRef } from 'react';
import { api, AristotleAnalysis as AristotleAnalysisType } from '../../lib/api';
import { AlertCircle, Clock, Sparkles, RefreshCw, MessageSquare, ChevronRight } from 'lucide-react';
import { LoadingSpinner } from '../PlayfulUI';

interface AristotleTranscriptViewerProps {
  conversationId: string;
  analysis: AristotleAnalysisType;
  currentTimeMs?: number;
  onTimeClick?: (timestamp: number) => void;
  onSegmentClick?: (startTime: number) => void;
}

interface TranscriptItem {
  role: 'agent' | 'user';
  message: string | null;
  time_in_call_secs?: number;
}

interface Annotation {
  type: 'filler_word' | 'rambling' | 'rewrite' | 'confidence_peak' | 'hesitation';
  timestamp: number;
  data: any;
}

const formatTimestamp = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function AristotleTranscriptViewer({
  conversationId,
  analysis,
  currentTimeMs = 0,
  onTimeClick,
  onSegmentClick
}: AristotleTranscriptViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeSegmentRef = useRef<HTMLDivElement>(null);
  
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRewrite, setExpandedRewrite] = useState<number | null>(null);
  const [hoveredAnnotation, setHoveredAnnotation] = useState<string | null>(null);

  const comm = analysis.communication_analysis;

  // Load transcript
  useEffect(() => {
    const loadTranscript = async () => {
      try {
        setIsLoading(true);
        const data = await api.getAnnotatedTranscript(conversationId);
        
        if (data.transcript_json && Array.isArray(data.transcript_json)) {
          let items = data.transcript_json;
          if (items.length === 1 && Array.isArray(items[0])) {
            items = items[0];
          }
          setTranscript(items.filter((item: TranscriptItem) => item.message?.trim()));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transcript');
      } finally {
        setIsLoading(false);
      }
    };

    loadTranscript();
  }, [conversationId]);

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeSegmentRef.current && containerRef.current) {
      const container = containerRef.current;
      const element = activeSegmentRef.current;
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      if (elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentTimeMs]);

  // Build annotations map from analysis data
  const buildAnnotations = (): Annotation[] => {
    const annotations: Annotation[] = [];

    // Add filler word annotations
    comm.metrics.filler_words.forEach(fw => {
      fw.timestamps.forEach(ts => {
        annotations.push({
          type: 'filler_word',
          timestamp: ts,
          data: { word: fw.word, count: fw.count }
        });
      });
    });

    // Add rambling moment annotations
    comm.patterns.rambling_moments.forEach(rm => {
      annotations.push({
        type: 'rambling',
        timestamp: rm.timestamp,
        data: rm
      });
    });

    // Add instant rewrite annotations
    comm.instant_rewrites.forEach((rw, idx) => {
      annotations.push({
        type: 'rewrite',
        timestamp: rw.timestamp,
        data: { ...rw, index: idx }
      });
    });

    // Add confidence peak annotations (approximate timestamps from description)
    comm.patterns.confidence_peaks.forEach((peak, idx) => {
      // Use a placeholder timestamp or infer from context
      annotations.push({
        type: 'confidence_peak',
        timestamp: idx * 30, // Approximate spacing
        data: { description: peak }
      });
    });

    // Add hesitation trigger annotations
    comm.patterns.hesitation_triggers.forEach((trigger, idx) => {
      annotations.push({
        type: 'hesitation',
        timestamp: idx * 45 + 10, // Approximate spacing
        data: { description: trigger }
      });
    });

    return annotations.sort((a, b) => a.timestamp - b.timestamp);
  };

  const annotations = buildAnnotations();

  // Find annotations near a specific timestamp
  const getAnnotationsAtTime = (timeSecs: number, windowSecs: number = 3): Annotation[] => {
    return annotations.filter(a => 
      Math.abs(a.timestamp - timeSecs) <= windowSecs
    );
  };

  // Find active segment based on current time
  const currentTimeSec = currentTimeMs / 1000;
  let activeIndex = -1;
  for (let i = 0; i < transcript.length; i++) {
    if ((transcript[i].time_in_call_secs || 0) <= currentTimeSec) {
      activeIndex = i;
    } else {
      break;
    }
  }

  // Check if text contains filler words
  const getFillerWordsInText = (text: string): Array<{ word: string; index: number }> => {
    const found: Array<{ word: string; index: number }> = [];
    const lowerText = text.toLowerCase();
    
    comm.metrics.filler_words.forEach(fw => {
      const regex = new RegExp(`\\b${fw.word}\\b`, 'gi');
      let match;
      while ((match = regex.exec(lowerText)) !== null) {
        found.push({ word: fw.word, index: match.index });
      }
    });
    
    return found.sort((a, b) => a.index - b.index);
  };

  // Check if this segment has a rewrite suggestion
  const getRewriteForSegment = (item: TranscriptItem, index: number): typeof comm.instant_rewrites[0] | null => {
    if (!item.message || !item.time_in_call_secs) return null;
    
    return comm.instant_rewrites.find(rw => 
      item.message?.includes(rw.original.substring(0, 50)) ||
      Math.abs(rw.timestamp - item.time_in_call_secs!) < 5
    ) || null;
  };

  // Check if this segment overlaps with rambling moment
  const getRamblingForSegment = (item: TranscriptItem): typeof comm.patterns.rambling_moments[0] | null => {
    if (!item.time_in_call_secs) return null;
    
    return comm.patterns.rambling_moments.find(rm =>
      item.time_in_call_secs! >= rm.timestamp &&
      item.time_in_call_secs! <= rm.timestamp + rm.duration
    ) || null;
  };

  const handleTimeClick = (timestamp: number) => {
    onTimeClick?.(timestamp);
    onSegmentClick?.(timestamp);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-parchment-50">
        <div className="flex flex-col items-center">
          <LoadingSpinner size="lg" color="primary" />
          <span className="mt-4 text-warmGray-600 font-medium">Loading annotated transcript...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-parchment-50">
        <div className="flex items-center gap-3 text-red-600 p-4 bg-red-50 rounded-2xl border-2 border-red-200">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-parchment-50">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-aristotle-200/60 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-aristotle-100 flex items-center justify-center">
              <span className="text-xl">🎭</span>
            </div>
            <div>
              <h3 className="font-semibold text-warmGray-900">Aristotle's Transcript Analysis</h3>
              <p className="text-xs text-warmGray-500">Rhetoric annotations & insights</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
              {comm.metrics.filler_word_count} fillers
            </span>
            <span className="px-2 py-1 rounded-full bg-aristotle-100 text-aristotle-700 border border-aristotle-200">
              {comm.instant_rewrites.length} rewrites
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-shrink-0 px-6 py-3 bg-aristotle-50/50 border-b border-aristotle-200/40">
        <div className="flex items-center gap-4 text-xs">
          <span className="text-warmGray-500 font-medium">Annotations:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="text-warmGray-600">Filler words</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-aristotle-500"></span>
            <span className="text-warmGray-600">Rewrite available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-plato-400"></span>
            <span className="text-warmGray-600">Rambling</span>
          </div>
        </div>
      </div>

      {/* Transcript with Annotations */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-6"
      >
        <div className="space-y-4 max-w-3xl mx-auto">
          {transcript.map((item, index) => {
            const isUser = item.role === 'user';
            const isActive = index === activeIndex;
            const hasMessage = !!item.message;
            
            if (!hasMessage) return null;

            const fillerWords = isUser ? getFillerWordsInText(item.message!) : [];
            const rewrite = isUser ? getRewriteForSegment(item, index) : null;
            const rambling = isUser ? getRamblingForSegment(item) : null;
            const hasAnnotation = fillerWords.length > 0 || rewrite || rambling;

            return (
              <div
                key={index}
                ref={isActive ? activeSegmentRef : null}
                className={`transition-all duration-200 ${isActive ? 'scale-[1.02]' : ''}`}
              >
                <div className="flex gap-4 group">
                  {/* Left side - role and timestamp */}
                  <div className="flex-shrink-0 w-20 pt-1">
                    <div className={`text-xs uppercase tracking-wide font-medium ${
                      isUser ? 'text-warmGray-900' : 'text-warmGray-500'
                    }`}>
                      {isUser ? 'You' : 'Interviewer'}
                    </div>
                    {item.time_in_call_secs !== undefined && (
                      <button
                        onClick={() => handleTimeClick(item.time_in_call_secs || 0)}
                        className="text-xs text-warmGray-400 mt-1 hover:text-aristotle-600 transition-colors flex items-center gap-1"
                      >
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(item.time_in_call_secs)}
                      </button>
                    )}
                  </div>

                  {/* Right side - message with annotations */}
                  <div className="flex-1">
                    <div
                      className={`rounded-xl p-4 transition-all duration-200 border-l-4 ${
                        isActive
                          ? 'bg-white border-aristotle-400 shadow-md'
                          : hasAnnotation
                          ? 'bg-white/80 border-aristotle-300'
                          : 'bg-white/50 border-transparent hover:bg-white/80'
                      } ${rambling ? 'border-plato-400' : ''}`}
                    >
                      {/* Annotation indicators in margin */}
                      {hasAnnotation && (
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-aristotle-100">
                          {fillerWords.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs">
                              <MessageSquare className="w-3 h-3" />
                              {fillerWords.length} filler{fillerWords.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {rewrite && (
                            <button
                              onClick={() => setExpandedRewrite(expandedRewrite === index ? null : index)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-aristotle-100 text-aristotle-700 text-xs hover:bg-aristotle-200 transition-colors"
                            >
                              <Sparkles className="w-3 h-3" />
                              Rewrite available
                              <ChevronRight className={`w-3 h-3 transition-transform ${expandedRewrite === index ? 'rotate-90' : ''}`} />
                            </button>
                          )}
                          {rambling && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-plato-100 text-plato-700 text-xs">
                              <Clock className="w-3 h-3" />
                              Rambling ({rambling.duration}s)
                            </span>
                          )}
                        </div>
                      )}

                      {/* Message content with inline filler word highlighting */}
                      <div className="relative">
                        {isUser && fillerWords.length > 0 ? (
                          <p className="text-warmGray-900 leading-relaxed">
                            {(() => {
                              const parts: React.ReactNode[] = [];
                              let lastIndex = 0;
                              const text = item.message!;
                              
                              fillerWords.forEach((fw, fwIdx) => {
                                // Add text before filler word
                                if (fw.index > lastIndex) {
                                  parts.push(
                                    <span key={`text-${fwIdx}`}>
                                      {text.substring(lastIndex, fw.index)}
                                    </span>
                                  );
                                }
                                
                                // Add highlighted filler word
                                parts.push(
                                  <span
                                    key={`filler-${fwIdx}`}
                                    className="bg-amber-200/60 text-amber-900 px-0.5 rounded cursor-help hover:bg-amber-300/80 transition-colors"
                                    title={`Filler word: "${fw.word}"`}
                                  >
                                    {text.substring(fw.index, fw.index + fw.word.length)}
                                  </span>
                                );
                                
                                lastIndex = fw.index + fw.word.length;
                              });
                              
                              // Add remaining text
                              if (lastIndex < text.length) {
                                parts.push(
                                  <span key="text-end">{text.substring(lastIndex)}</span>
                                );
                              }
                              
                              return parts;
                            })()}
                          </p>
                        ) : (
                          <p className="text-warmGray-900 leading-relaxed">{item.message}</p>
                        )}
                      </div>

                      {/* Expanded Rewrite Section */}
                      {rewrite && expandedRewrite === index && (
                        <div className="mt-4 pt-4 border-t border-aristotle-200 space-y-3">
                          <div className="bg-plato-50/50 rounded-lg p-3 border border-plato-200">
                            <span className="text-xs font-mono uppercase text-plato-600 block mb-1">
                              Original
                            </span>
                            <p className="text-sm text-warmGray-700 italic">"{rewrite.original}"</p>
                          </div>
                          
                          <div className="bg-aristotle-50 rounded-lg p-3 border border-aristotle-200">
                            <span className="text-xs font-mono uppercase text-aristotle-600 block mb-1">
                              Aristotle's Rewrite
                            </span>
                            <p className="text-sm text-warmGray-800">"{rewrite.improved}"</p>
                          </div>
                          
                          <div className="bg-parchment-100/50 rounded-lg p-3 border border-warmGray-200">
                            <span className="text-xs font-mono uppercase text-warmGray-600 block mb-1">
                              Why This Works
                            </span>
                            <p className="text-sm text-warmGray-700">{rewrite.why}</p>
                          </div>

                          <button
                            onClick={() => handleTimeClick(rewrite.timestamp)}
                            className="text-xs text-aristotle-600 hover:text-aristotle-700 flex items-center gap-1"
                          >
                            <Clock className="w-3 h-3" />
                            Jump to {formatTimestamp(rewrite.timestamp)}
                          </button>
                        </div>
                      )}

                      {/* Rambling explanation */}
                      {rambling && (
                        <div className="mt-3 pt-3 border-t border-plato-100">
                          <p className="text-xs text-plato-600 flex items-start gap-2">
                            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>{rambling.reason}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary at bottom */}
        <div className="mt-8 pt-6 border-t border-aristotle-200">
          <div className="bg-white rounded-xl p-4 border border-aristotle-200">
            <h4 className="font-semibold text-warmGray-800 mb-3 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-aristotle-600" />
              Key Patterns Detected
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-warmGray-500">Confidence Peaks:</span>
                <ul className="mt-1 space-y-1">
                  {comm.patterns.confidence_peaks.slice(0, 2).map((peak, i) => (
                    <li key={i} className="text-warmGray-700 flex items-start gap-1">
                      <span className="text-green-500 mt-0.5">★</span>
                      <span className="text-xs">{peak}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-warmGray-500">Hesitation Triggers:</span>
                <ul className="mt-1 space-y-1">
                  {comm.patterns.hesitation_triggers.slice(0, 2).map((trigger, i) => (
                    <li key={i} className="text-warmGray-700 flex items-start gap-1">
                      <span className="text-amber-500 mt-0.5">!</span>
                      <span className="text-xs">{trigger}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
