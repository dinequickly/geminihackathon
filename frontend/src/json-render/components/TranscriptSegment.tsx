import { ReactNode } from 'react';

export interface TranscriptSegmentProps {
  role: 'user' | 'agent';
  message: string;
  timestamp?: number;
  emotions?: {
    face?: { name: string; score: number };
    prosody?: { name: string; score: number };
  };
  isActive?: boolean;
  isHighlighted?: boolean;
  highlightColor?: 'yellow' | 'green' | 'blue' | 'pink' | 'orange';
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
}

const formatTimestamp = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const HIGHLIGHT_COLORS = {
  yellow: 'bg-sunshine-50 border-l-4 border-sunshine-300',
  green: 'bg-mint-50 border-l-4 border-mint-300',
  blue: 'bg-sky-50 border-l-4 border-sky-300',
  pink: 'bg-coral-50 border-l-4 border-coral-300',
  orange: 'bg-primary-50 border-l-4 border-primary-300',
};

export function TranscriptSegment({
  role,
  message,
  timestamp,
  emotions,
  isActive = false,
  isHighlighted = false,
  highlightColor = 'yellow',
  className = '',
  onClick,
  children
}: TranscriptSegmentProps) {
  const isUser = role === 'user';

  const bgClass = isHighlighted
    ? HIGHLIGHT_COLORS[highlightColor]
    : isActive
    ? 'bg-gray-50 border-l-4 border-gray-300'
    : 'bg-gray-50/50 border-l-4 border-transparent hover:bg-gray-50';

  return (
    <div
      className={`flex gap-4 group transition-all duration-200 ${className}`}
      onClick={onClick}
    >
      {/* Left side - role label and timestamp */}
      <div className="flex-shrink-0 w-24 pt-1">
        <div className={`text-xs uppercase tracking-wide font-medium ${
          isUser ? 'text-gray-900' : 'text-gray-500'
        }`}>
          {isUser ? 'You' : 'Interviewer'}
        </div>
        {timestamp !== undefined && (
          <div className="text-xs text-gray-400 mt-1 cursor-pointer hover:text-gray-600">
            {formatTimestamp(timestamp)}
          </div>
        )}
      </div>

      {/* Right side - message content */}
      <div className="flex-1">
        <div className={`rounded-xl p-6 transition-all duration-200 ${bgClass}`}>
          <p className="text-gray-900 leading-relaxed">{message}</p>

          {/* Emotion indicators */}
          {isUser && emotions && (emotions.face || emotions.prosody) && (
            <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200/50">
              {emotions.face && (
                <div className="text-xs text-gray-500">
                  <span className="font-medium capitalize">{emotions.face.name}</span>
                  <span className="text-gray-400 ml-1">{(emotions.face.score * 100).toFixed(0)}%</span>
                </div>
              )}
              {emotions.prosody && (
                <div className="text-xs text-gray-500">
                  <span className="font-medium capitalize">{emotions.prosody.name}</span>
                  <span className="text-gray-400 ml-1">{(emotions.prosody.score * 100).toFixed(0)}%</span>
                </div>
              )}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
