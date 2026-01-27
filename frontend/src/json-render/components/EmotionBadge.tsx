import { getEmotionColor } from '../../lib/emotions';

export interface EmotionBadgeProps {
  emotion: string;
  score: number;
  type?: 'face' | 'prosody';
  showBar?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function EmotionBadge({
  emotion,
  score,
  type = 'face',
  showBar = true,
  size = 'md',
  className = ''
}: EmotionBadgeProps) {
  const sizeClasses = {
    sm: {
      container: 'p-2',
      dot: 'w-3 h-3',
      text: 'text-xs',
      score: 'text-xs',
      bar: 'h-1',
    },
    md: {
      container: 'p-3',
      dot: 'w-4 h-4',
      text: 'text-sm',
      score: 'text-sm',
      bar: 'h-1.5',
    },
    lg: {
      container: 'p-4',
      dot: 'w-5 h-5',
      text: 'text-base',
      score: 'text-base',
      bar: 'h-2',
    },
  };

  const sizes = sizeClasses[size];
  const color = getEmotionColor(emotion);
  const percentage = Math.round(score * 100);

  return (
    <div className={`bg-cream-50 rounded-xl border border-gray-100 ${sizes.container} ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        <div
          className={`${sizes.dot} rounded-full shadow-sm`}
          style={{ backgroundColor: color }}
        />
        <span className={`font-medium text-gray-900 capitalize ${sizes.text}`}>
          {emotion}
        </span>
        <span className={`ml-auto font-semibold text-primary-600 ${sizes.score}`}>
          {percentage}%
        </span>
      </div>

      {showBar && (
        <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizes.bar}`}>
          <div
            className={`${sizes.bar} rounded-full transition-all duration-300`}
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
      )}

      {type && (
        <div className="mt-1 text-[10px] text-gray-400 uppercase tracking-wide">
          {type === 'face' ? 'Facial' : 'Voice'}
        </div>
      )}
    </div>
  );
}
