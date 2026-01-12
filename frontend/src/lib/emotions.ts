export const EMOTION_COLORS: Record<string, string> = {
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
  love: '#f43f5e',
  desire: '#e11d48',
  sadness: '#64748b',
  disappointment: '#475569',
  tiredness: '#94a3b8',
  boredom: '#9ca3af',
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

export const getEmotionColor = (emotionName: string): string => {
  const lower = emotionName.toLowerCase();
  return EMOTION_COLORS[lower] || '#9ca3af';
};
