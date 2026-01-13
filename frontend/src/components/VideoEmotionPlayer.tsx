import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { api, EmotionTimelineItem, TranscriptHighlight } from '../lib/api';
import { getEmotionColor } from '../lib/emotions';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, FileText, X } from 'lucide-react';
import { PlayfulButton } from './PlayfulUI';

export interface VideoEmotionPlayerProps {
  conversationId: string;
  videoUrl: string;
  audioUrl?: string;
  humeJobId?: string;
  onTimeUpdate?: (timeMs: number) => void;
  onEmotionUpdate?: (payload: { timeMs: number; emotions: CurrentEmotions }) => void;
  showLiveEmotions?: boolean;
  onReviewTranscript?: () => void;
}

export interface VideoEmotionPlayerRef {
  pause: () => void;
  play: () => void;
  seekTo: (timeSec: number) => void;
  getCurrentTime: () => number;
}

export interface EmotionSnapshot {
  name: string;
  score: number;
  allEmotions: Array<{ name: string; score: number }>;
}

export interface CurrentEmotions {
  face?: EmotionSnapshot;
  prosody?: EmotionSnapshot;
}

interface EmotionData {
  face: EmotionTimelineItem[];
  prosody: EmotionTimelineItem[];
}

interface TranscriptItem {
  role: 'agent' | 'user';
  message: string | null;
  time_in_call_secs?: number;
}

const formatTime = (ms: number): string => {
  if (!ms || !isFinite(ms) || isNaN(ms)) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const VideoEmotionPlayer = forwardRef<VideoEmotionPlayerRef, VideoEmotionPlayerProps>(
  ({ conversationId, videoUrl, audioUrl, humeJobId, onTimeUpdate, onEmotionUpdate, showLiveEmotions = true, onReviewTranscript }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const wasPlayingBeforePause = useRef(false);

    useImperativeHandle(ref, () => ({
      play: () => {
        videoRef.current?.play();
        audioRef.current?.play();
      },
      pause: () => {
        videoRef.current?.pause();
        audioRef.current?.pause();
      },
      seekTo: (timeSec: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = timeSec;
        }
        if (audioRef.current) {
          audioRef.current.currentTime = timeSec;
        }
      },
      getCurrentTime: () => videoRef.current?.currentTime || 0,
    }));

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [_audioOffset, _setAudioOffset] = useState(0); // Offset in seconds to sync audio with video
  const [duration, setDuration] = useState(0);
  const [emotionData, setEmotionData] = useState<EmotionData>({ face: [], prosody: [] });
  const [currentEmotions, setCurrentEmotions] = useState<CurrentEmotions>({});
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [highlights, setHighlights] = useState<TranscriptHighlight[]>([]);
  const [activeHighlight, setActiveHighlight] = useState<TranscriptHighlight | null>(null);
  const [shownHighlightIds, setShownHighlightIds] = useState<Set<string>>(new Set());
  const [_transcriptJson, setTranscriptJson] = useState<TranscriptItem[]>([]);
  const [highlightTimestamps, setHighlightTimestamps] = useState<Map<string, number>>(new Map());

  // Load emotion timeline data, highlights, and transcript
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const fallbackJobId = humeJobId?.trim() || undefined;

        const [emotionData, highlightsData, transcriptData] = await Promise.all([
          api.getEmotionTimeline(conversationId, {
            models: ['face', 'prosody'],
            fallbackJobId
          }),
          api.getHighlights(conversationId).catch(() => ({ highlights: [] })),
          api.getAnnotatedTranscript(conversationId).catch(() => ({ transcript_json: [] }))
        ]);

        setEmotionData({
          face: emotionData.timeline.face || [],
          prosody: emotionData.timeline.prosody || []
        });

        // Process transcript
        let items: TranscriptItem[] = [];
        if (transcriptData.transcript_json && Array.isArray(transcriptData.transcript_json) && transcriptData.transcript_json.length > 0) {
          items = transcriptData.transcript_json;
          if (items.length === 1 && Array.isArray(items[0])) {
            items = items[0];
          }
        }
        setTranscriptJson(items);

        // Build highlight timestamp map
        const timestampMap = new Map<string, number>();
        const receivedHighlights = highlightsData.highlights || [];

        receivedHighlights.forEach(highlight => {
          // Find the transcript entry that contains this highlighted sentence
          const matchingEntry = items.find(item =>
            item.message && (
              item.message.includes(highlight.highlighted_sentence) ||
              highlight.highlighted_sentence.includes(item.message)
            )
          );

          if (matchingEntry && matchingEntry.time_in_call_secs !== undefined) {
            // Store timestamp in milliseconds
            timestampMap.set(highlight.id, matchingEntry.time_in_call_secs * 1000);
          }
        });

        setHighlightTimestamps(timestampMap);
        setHighlights(receivedHighlights);

        console.log('Loaded highlights with timestamps:', Array.from(timestampMap.entries()));
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [conversationId, humeJobId]);

  // Update current emotions based on video time
  const updateCurrentEmotions = useCallback((timeMs: number) => {
    // Find face emotion at current time
    const faceEmotion = emotionData.face.find(
      e => e.start_timestamp_ms <= timeMs && e.end_timestamp_ms >= timeMs
    );

    // Find prosody emotion at current time
    let prosodyEmotion = emotionData.prosody.find(
      e => e.start_timestamp_ms <= timeMs && e.end_timestamp_ms >= timeMs
    );
    if (!prosodyEmotion) {
      for (let i = emotionData.prosody.length - 1; i >= 0; i -= 1) {
        const candidate = emotionData.prosody[i];
        if (candidate.start_timestamp_ms <= timeMs) {
          prosodyEmotion = candidate;
          break;
        }
      }
    }

    const updatedEmotions: CurrentEmotions = {
      face: faceEmotion ? {
        name: faceEmotion.top_emotion_name,
        score: faceEmotion.top_emotion_score,
        allEmotions: faceEmotion.emotions.slice(0, 5)
      } : undefined,
      prosody: prosodyEmotion ? {
        name: prosodyEmotion.top_emotion_name,
        score: prosodyEmotion.top_emotion_score,
        allEmotions: prosodyEmotion.emotions.slice(0, 5)
      } : undefined
    };

    setCurrentEmotions(updatedEmotions);
    onEmotionUpdate?.({ timeMs, emotions: updatedEmotions });

    onTimeUpdate?.(timeMs);

    // Check for highlights at current time
    checkForHighlights(timeMs);
  }, [emotionData, onEmotionUpdate, onTimeUpdate]);

  // Check if there's a highlight at the current time
  const checkForHighlights = useCallback((timeMs: number) => {
    if (highlights.length === 0 || highlightTimestamps.size === 0) return;

    // Find a highlight that hasn't been shown yet and matches the current time
    const matchingHighlight = highlights.find(h => {
      // Skip if already shown
      if (shownHighlightIds.has(h.id)) return false;

      // Get the timestamp for this highlight from our map
      const highlightTimeMs = highlightTimestamps.get(h.id);
      if (!highlightTimeMs) return false;

      // Check if we're within 1 second of the highlight time and past it
      // This ensures we show it once when we reach that timestamp
      return timeMs >= highlightTimeMs && timeMs < highlightTimeMs + 1000;
    });

    if (matchingHighlight && !activeHighlight) {
      // Pause the video
      wasPlayingBeforePause.current = isPlaying;
      videoRef.current?.pause();
      audioRef.current?.pause();
      setIsPlaying(false);

      // Show the highlight
      setActiveHighlight(matchingHighlight);
      setShownHighlightIds(prev => new Set([...prev, matchingHighlight.id]));

      console.log('Showing highlight at time:', timeMs, 'Highlight:', matchingHighlight.highlighted_sentence);
    }
  }, [highlights, highlightTimestamps, shownHighlightIds, activeHighlight, isPlaying]);

  // Close highlight and resume playback
  const closeHighlight = () => {
    setActiveHighlight(null);

    // Resume if was playing before
    if (wasPlayingBeforePause.current) {
      videoRef.current?.play();
      audioRef.current?.play();
      setIsPlaying(true);
    }
  };

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const timeMs = videoRef.current.currentTime * 1000;
      setCurrentTime(timeMs);
      updateCurrentEmotions(timeMs);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration * 1000);
      setVideoError(false);
    }
  };

  const handleError = () => {
      console.error("Video failed to load");
      setVideoError(true);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        audioRef.current?.pause();
      } else {
        videoRef.current.play();
        audioRef.current?.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    // Only toggle the ElevenLabs audio (video is always muted)
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && videoRef.current && !videoError) {
      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
      if (audioRef.current) {
        audioRef.current.currentTime = newTime;
      }
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
      if (audioRef.current) {
        audioRef.current.currentTime += seconds;
      }
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };


  const EmotionBadge = ({
    title,
    emotion
  }: {
    title: string;
    emotion?: { name: string; score: number; allEmotions: Array<{ name: string; score: number }> }
  }) => (
    <div className="bg-cream-50 rounded-2xl p-4 border-2 border-gray-100 shadow-soft flex-1">
      <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">{title}</h4>
      {emotion ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full shadow-sm"
              style={{ backgroundColor: getEmotionColor(emotion.name) }}
            />
            <span className="font-bold text-gray-900 capitalize text-lg">{emotion.name}</span>
            <span className="ml-auto text-sm font-semibold text-primary-600">
              {(emotion.score * 100).toFixed(0)}%
            </span>
          </div>
          <div className="space-y-1.5">
            {emotion.allEmotions.slice(0, 3).map((e, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${e.score * 100}%`,
                      backgroundColor: getEmotionColor(e.name)
                    }}
                  />
                </div>
                <span className="w-16 text-gray-600 capitalize truncate font-medium">{e.name}</span>
                <span className="w-8 text-right text-gray-500 font-semibold">
                  {(e.score * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-400 italic">No data at this timestamp</div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-soft border-2 border-gray-200 overflow-hidden relative">
      {/* Full-width Video Section */}
      <div className="w-full">
          <div className="relative bg-black aspect-video flex items-center justify-center">
            {/* Hidden audio element for AI interviewer voice */}
            {audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                preload="auto"
                onLoadedData={() => console.log('Audio loaded:', audioUrl)}
                onError={(e) => console.error('Audio load error:', e)}
                onPlay={() => {
                  // Sync video if audio starts playing
                  if (videoRef.current?.paused) {
                    videoRef.current?.play();
                  }
                }}
                onPause={() => {
                  // Sync video if audio pauses
                  if (!videoRef.current?.paused) {
                    videoRef.current?.pause();
                  }
                }}
              />
            )}

            {!videoError ? (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-contain"
                  muted={true}  // Always mute video - we play ElevenLabs audio separately
                  onTimeUpdate={(e) => {
                    handleTimeUpdate();
                    // Keep audio synced with video (with offset)
                    if (audioRef.current && Math.abs((audioRef.current.currentTime + _audioOffset) - (e.target as HTMLVideoElement).currentTime) > 0.3) {
                      audioRef.current.currentTime = (e.target as HTMLVideoElement).currentTime - _audioOffset;
                    }
                  }}
                  onLoadedMetadata={handleLoadedMetadata}
                  onError={handleError}
                  onPlay={() => {
                    setIsPlaying(true);
                    if (audioRef.current) {
                      audioRef.current.currentTime = videoRef.current!.currentTime - _audioOffset;
                      audioRef.current.play();
                    }
                  }}
                  onPause={() => {
                    setIsPlaying(false);
                    audioRef.current?.pause();
                  }}
                />
            ) : (
                <div className="text-white text-center p-6">
                    <p className="text-lg font-semibold mb-2">Video Unavailable</p>
                    <p className="text-sm text-gray-400">The recording for this interview could not be loaded.</p>
                </div>
            )}

            {/* Video Controls Overlay */}
            {!videoError && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress Bar */}
              <div
                ref={progressRef}
                className="h-1 bg-white/30 rounded-full cursor-pointer mb-3 group"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-primary-500 rounded-full relative"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => skipTime(-10)}
                    className="p-2 text-white/80 hover:text-white transition"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => skipTime(10)}
                    className="p-2 text-white/80 hover:text-white transition"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                  <span className="text-white text-sm ml-2">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-2 text-white/80 hover:text-white transition"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 text-white/80 hover:text-white transition"
                  >
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>

      {/* Live Emotions - Horizontal below video */}
      {showLiveEmotions && (
        <div className="border-t-2 border-gray-100 p-5 bg-cream-50/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Live Emotions
                <span className="text-sm font-normal text-gray-500">
                  at {formatTime(currentTime)}
                </span>
              </h3>
            </div>
            {onReviewTranscript && (
              <PlayfulButton
                onClick={onReviewTranscript}
                variant="secondary"
                size="sm"
                icon={FileText}
              >
                Review Transcript
              </PlayfulButton>
            )}
          </div>

          {isLoading ? (
            <div className="h-24 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary-500 border-t-transparent" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EmotionBadge title="Facial Expression" emotion={currentEmotions.face} />
              <EmotionBadge title="Voice Prosody" emotion={currentEmotions.prosody} />
            </div>
          )}
        </div>
      )}

      {/* Highlight Popup Overlay */}
      {activeHighlight && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-soft-lg p-8 max-w-lg w-full mx-4 animate-scale-in">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="inline-block px-3 py-1 bg-sunshine-100 text-sunshine-700 rounded-full text-xs font-bold uppercase tracking-wide mb-3">
                  AI Highlight
                </div>
                <h3 className="text-xl font-bold text-gray-900 leading-tight">
                  "{activeHighlight.highlighted_sentence}"
                </h3>
              </div>
              <button
                onClick={closeHighlight}
                className="p-2 hover:bg-gray-100 rounded-2xl transition-all duration-300 hover:scale-110 ml-4"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {activeHighlight.comment && (
              <div className="mt-4 p-4 bg-sky-50 border-2 border-sky-200 rounded-2xl">
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  {activeHighlight.comment}
                </p>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <PlayfulButton
                onClick={closeHighlight}
                variant="primary"
                size="md"
                className="flex-1"
              >
                Continue Watching
              </PlayfulButton>
              {onReviewTranscript && (
                <PlayfulButton
                  onClick={() => {
                    closeHighlight();
                    onReviewTranscript();
                  }}
                  variant="secondary"
                  size="md"
                  className="flex-1"
                  icon={FileText}
                >
                  Review Full Transcript
                </PlayfulButton>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default VideoEmotionPlayer;
