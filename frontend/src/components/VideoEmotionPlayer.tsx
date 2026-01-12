import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { api, EmotionTimelineItem } from '../lib/api';
import { EMOTION_COLORS, getEmotionColor } from '../lib/emotions';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';

export interface VideoEmotionPlayerProps {
  conversationId: string;
  videoUrl: string;
  audioUrl?: string;
  humeJobId?: string;
  onTimeUpdate?: (timeMs: number) => void;
  onEmotionUpdate?: (payload: { timeMs: number; emotions: CurrentEmotions }) => void;
  showLiveEmotions?: boolean;
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

const formatTime = (ms: number): string => {
  if (!ms || !isFinite(ms) || isNaN(ms)) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const VideoEmotionPlayer = forwardRef<VideoEmotionPlayerRef, VideoEmotionPlayerProps>(
  ({ conversationId, videoUrl, audioUrl, humeJobId, onTimeUpdate, onEmotionUpdate, showLiveEmotions = true }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);

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
  const [audioOffset, setAudioOffset] = useState(0); // Offset in seconds to sync audio with video
  const [duration, setDuration] = useState(0);
  const [emotionData, setEmotionData] = useState<EmotionData>({ face: [], prosody: [] });
  const [currentEmotions, setCurrentEmotions] = useState<CurrentEmotions>({});
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);

  // Load emotion timeline data
  useEffect(() => {
    const loadEmotionData = async () => {
      try {
        setIsLoading(true);
        const fallbackJobId = humeJobId?.trim() || undefined;
        const data = await api.getEmotionTimeline(conversationId, {
          models: ['face', 'prosody'],
          fallbackJobId
        });
        setEmotionData({
          face: data.timeline.face || [],
          prosody: data.timeline.prosody || []
        });
      } catch (err) {
        console.error('Failed to load emotion timeline:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadEmotionData();
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
  }, [emotionData, onEmotionUpdate, onTimeUpdate]);

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

  // Generate emotion timeline visualization
  const renderEmotionTimeline = (data: EmotionTimelineItem[], label: string) => {
    if (data.length === 0 || duration === 0) return null;

    return (
      <div className="mt-2">
        <div className="text-xs text-gray-500 mb-1">{label}</div>
        <div className="h-4 bg-gray-100 rounded overflow-hidden relative">
          {data.map((item, idx) => {
            const left = (item.start_timestamp_ms / duration) * 100;
            const width = ((item.end_timestamp_ms - item.start_timestamp_ms) / duration) * 100;
            return (
              <div
                key={idx}
                className="absolute h-full"
                style={{
                  left: `${left}%`,
                  width: `${Math.max(width, 0.5)}%`,
                  backgroundColor: getEmotionColor(item.top_emotion_name),
                  opacity: 0.3 + item.top_emotion_score * 0.7
                }}
                title={`${item.top_emotion_name} (${(item.top_emotion_score * 100).toFixed(0)}%)`}
              />
            );
          })}
          {/* Playhead */}
          <div
            className="absolute top-0 h-full w-0.5 bg-white shadow-md z-10"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  const EmotionPanel = ({
    title,
    emotion
  }: {
    title: string;
    emotion?: { name: string; score: number; allEmotions: Array<{ name: string; score: number }> }
  }) => (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">{title}</h4>
      {emotion ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: getEmotionColor(emotion.name) }}
            />
            <span className="font-medium text-gray-900 capitalize">{emotion.name}</span>
            <span className="ml-auto text-sm text-gray-500">
              {(emotion.score * 100).toFixed(0)}%
            </span>
          </div>
          <div className="space-y-2">
            {emotion.allEmotions.map((e, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${e.score * 100}%`,
                      backgroundColor: getEmotionColor(e.name)
                    }}
                  />
                </div>
                <span className="w-20 text-gray-600 capitalize truncate">{e.name}</span>
                <span className="w-10 text-right text-gray-400">
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className={`grid grid-cols-1 ${showLiveEmotions ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-0`}>
        {/* Video Section */}
        <div className={showLiveEmotions ? 'lg:col-span-2' : ''}>
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
                    if (audioRef.current && Math.abs((audioRef.current.currentTime + audioOffset) - (e.target as HTMLVideoElement).currentTime) > 0.3) {
                      audioRef.current.currentTime = (e.target as HTMLVideoElement).currentTime - audioOffset;
                    }
                  }}
                  onLoadedMetadata={handleLoadedMetadata}
                  onError={handleError}
                  onPlay={() => {
                    setIsPlaying(true);
                    if (audioRef.current) {
                      audioRef.current.currentTime = videoRef.current!.currentTime - audioOffset;
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

          {/* Emotion Timeline Bars */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Emotion Timeline</h3>
            {isLoading ? (
              <div className="h-12 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent" />
              </div>
            ) : (
              <>
                {renderEmotionTimeline(emotionData.face, 'Facial Expression')}
                {renderEmotionTimeline(emotionData.prosody, 'Voice Prosody')}
              </>
            )}
          </div>

          {/* Audio Sync Control - only show if audio is available */}
          {audioUrl && (
            <div className="px-4 pb-4 border-t border-gray-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Audio Sync Offset</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAudioOffset(prev => prev - 0.1)}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    -0.1s
                  </button>
                  <span className="text-sm font-mono w-16 text-center">
                    {audioOffset >= 0 ? '+' : ''}{audioOffset.toFixed(1)}s
                  </span>
                  <button
                    onClick={() => setAudioOffset(prev => prev + 0.1)}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    +0.1s
                  </button>
                  <button
                    onClick={() => setAudioOffset(0)}
                    className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded ml-2"
                  >
                    Reset
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">Adjust if audio is ahead (+) or behind (-) the video</p>
            </div>
          )}
        </div>

        {/* Emotion Panel */}
        {showLiveEmotions && (
          <div className="lg:border-l border-gray-200 p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Live Emotions</h3>
            <p className="text-sm text-gray-500">
              Emotions detected at {formatTime(currentTime)}
            </p>

            <EmotionPanel title="Facial Expression" emotion={currentEmotions.face} />
            <EmotionPanel title="Voice Prosody" emotion={currentEmotions.prosody} />

            {/* Emotion Legend */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Emotion Legend</h4>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {Object.entries(EMOTION_COLORS).slice(0, 12).map(([name, color]) => (
                  <div key={name} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="capitalize text-gray-600">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default VideoEmotionPlayer;
