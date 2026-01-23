import { useState, useMemo } from 'react';

interface EmotionDataPoint {
  timestamp: number;
  emotions: {
    calm: number;
    confident: number;
    confused: number;
    engaged: number;
    anxious: number;
    enthusiastic: number;
  };
  dominant_emotion: string;
  trigger?: string;
}

interface EmotionalArcTimelineProps {
  emotionalArc: EmotionDataPoint[];
  duration: number; // Total duration in seconds
  onTimeClick?: (timestamp: number) => void;
}

export function EmotionalArcTimeline({ emotionalArc, duration, onTimeClick }: EmotionalArcTimelineProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Generate timeline buckets (every 5 seconds)
  const bucketSize = 5; // seconds
  const numBuckets = Math.ceil(duration / bucketSize);

  const buckets = useMemo(() => {
    const result: Array<{
      startTime: number;
      endTime: number;
      avgEmotions: { calm: number; confused: number; engaged: number };
      keyMoments: EmotionDataPoint[];
    }> = [];

    for (let i = 0; i < numBuckets; i++) {
      const startTime = i * bucketSize;
      const endTime = Math.min((i + 1) * bucketSize, duration);

      // Find data points in this bucket
      const pointsInBucket = emotionalArc.filter(
        p => p.timestamp >= startTime && p.timestamp < endTime
      );

      if (pointsInBucket.length > 0) {
        // Calculate averages
        const avgEmotions = {
          calm: pointsInBucket.reduce((sum, p) => sum + p.emotions.calm, 0) / pointsInBucket.length,
          confused: pointsInBucket.reduce((sum, p) => sum + p.emotions.confused, 0) / pointsInBucket.length,
          engaged: pointsInBucket.reduce((sum, p) => sum + p.emotions.engaged, 0) / pointsInBucket.length,
        };

        // Find key moments (high emotion peaks or transitions)
        const keyMoments = pointsInBucket.filter(p =>
          p.emotions.confused > 70 ||
          p.emotions.anxious > 70 ||
          p.trigger
        );

        result.push({ startTime, endTime, avgEmotions, keyMoments });
      } else {
        // No data, use neutral values
        result.push({
          startTime,
          endTime,
          avgEmotions: { calm: 50, confused: 20, engaged: 50 },
          keyMoments: []
        });
      }
    }

    return result;
  }, [emotionalArc, duration, numBuckets]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'calm': return '#10b981'; // green
      case 'confused': return '#f59e0b'; // orange
      case 'engaged': return '#3b82f6'; // blue
      default: return '#6b7280'; // gray
    }
  };

  const getBarHeight = (value: number) => {
    return Math.max(2, (value / 100) * 100); // 0-100%
  };

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex items-center gap-6 text-xs font-mono uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-600">Calm</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-gray-600">Confused</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-gray-600">Engaged</span>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="relative bg-white rounded-xl border border-gray-100 p-6">
        {/* Emotion tracks */}
        <div className="space-y-6">
          {(['calm', 'confused', 'engaged'] as const).map((emotion) => (
            <div key={emotion} className="relative">
              {/* Label */}
              <div className="absolute -left-20 top-0 text-xs font-mono uppercase tracking-wider text-gray-500 capitalize">
                {emotion}
              </div>

              {/* Bars */}
              <div className="flex gap-1 h-16 items-end">
                {buckets.map((bucket, idx) => {
                  const value = bucket.avgEmotions[emotion];
                  const height = getBarHeight(value);
                  const isHovered = hoveredPoint === idx;
                  const hasKeyMoment = bucket.keyMoments.length > 0;

                  return (
                    <div
                      key={idx}
                      className="flex-1 relative group cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(idx)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      onClick={() => onTimeClick?.(bucket.startTime)}
                    >
                      {/* Bar */}
                      <div
                        className="rounded-t transition-all duration-200"
                        style={{
                          height: `${height}%`,
                          backgroundColor: getEmotionColor(emotion),
                          opacity: isHovered ? 1 : 0.7
                        }}
                      >
                        {/* Key moment indicator */}
                        {hasKeyMoment && emotion === 'confused' && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>

                      {/* Tooltip on hover */}
                      {isHovered && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
                          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                            <div className="font-mono mb-1">{formatTime(bucket.startTime)}</div>
                            <div className="capitalize">{emotion}: {Math.round(value)}%</div>
                            {bucket.keyMoments.length > 0 && bucket.keyMoments[0].trigger && (
                              <div className="mt-1 text-gray-300 text-[10px]">
                                {bucket.keyMoments[0].trigger}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Time axis */}
        <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
          {[0, Math.floor(duration / 4), Math.floor(duration / 2), Math.floor(duration * 3 / 4), duration].map((time, idx) => (
            <span key={idx} className="text-xs font-mono text-gray-400">
              {formatTime(time)}
            </span>
          ))}
        </div>
      </div>

      {/* Key moments list */}
      {buckets.some(b => b.keyMoments.length > 0) && (
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
          <h4 className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-4">
            Key Emotional Moments
          </h4>
          <div className="space-y-2">
            {buckets.flatMap(b => b.keyMoments).map((moment, idx) => (
              <button
                key={idx}
                onClick={() => onTimeClick?.(moment.timestamp)}
                className="w-full text-left flex items-start gap-3 p-3 rounded-lg hover:bg-white transition-colors"
              >
                <span className="font-mono text-xs text-gray-400 flex-shrink-0">
                  {formatTime(moment.timestamp)}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 capitalize">
                    {moment.dominant_emotion}
                  </div>
                  {moment.trigger && (
                    <div className="text-xs text-gray-600 mt-1">
                      {moment.trigger}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
