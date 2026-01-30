import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ZenoAnalysis as ZenoAnalysisType } from '../../lib/api';
import { Sparkles, Loader2, RefreshCw, AlertCircle, MessageSquare, Lightbulb, Eye, Award, Zap, TrendingUp } from 'lucide-react';
import { LiquidButton } from '../LiquidButton';

interface ZenoAIAnalysisProps {
  analysis: ZenoAnalysisType;
  conversationId?: string;
  onHighlightClick?: (timestamp: number) => void;
}

interface TranscriptMessage {
  role: 'assistant' | 'user';
  content: string;
  time_in_call_secs?: number;
}

// Component definition types that the AI can generate
type ComponentType = 
  | 'visual-metric'
  | 'executive-presence'
  | 'body-language-pattern'
  | 'nervous-habit'
  | 'power-pose'
  | 'defensive-moment'
  | 'performance-gap'
  | 'visual-strength'
  | 'improvement-area'
  | 'quick-win'
  | 'advanced-technique';

interface UIComponent {
  type: ComponentType;
  id: string;
  timestamp?: number;
  priority: 'high' | 'medium' | 'low';
  props: Record<string, any>;
}

const CHAT_WEBHOOK_URL = 'https://maxipad.app.n8n.cloud/webhook/a0894027-a899-473b-b864-e0a2d18950d3';

const getActionId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

// Pre-defined component renderers
const createComponentRegistry = (_navigate: any, _conversationId?: string): Record<ComponentType, React.FC<any>> => ({
  'visual-metric': ({ label, value, description, status, onChat }) => {
    const statusColors = {
      excellent: { bg: 'bg-zeno-50 border-zeno-200', text: 'text-zeno-600', value: 'text-zeno-700' },
      good: { bg: 'bg-socrates-50 border-socrates-200', text: 'text-socrates-600', value: 'text-socrates-700' },
      warning: { bg: 'bg-aristotle-50 border-aristotle-200', text: 'text-aristotle-600', value: 'text-aristotle-700' }
    };
    
    const colors = statusColors[status as keyof typeof statusColors] || statusColors.good;
    
    return (
      <div className={`rounded-lg p-3 border my-2 shadow-sm ${colors.bg}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-warmGray-800">{label}</span>
          <span className={`font-mono text-2xl font-bold ${colors.value}`}>{value}</span>
        </div>
        <p className="text-xs text-warmGray-600 mb-2">{description}</p>
        <button 
          onClick={() => onChat?.({ type: 'visual_metric', label, value })}
          className="text-xs font-semibold text-warmGray-800 hover:text-warmGray-900 flex items-center gap-1 bg-white/50 hover:bg-white px-2 py-1 rounded transition-colors"
        >
          <Lightbulb className="w-3 h-3" />
          Improve
        </button>
      </div>
    );
  },
  
  'executive-presence': ({ factor, score, description, onChat }) => {
    const getStatus = (v: number) => {
      if (v >= 80) return { bg: 'bg-zeno-50 border-zeno-200', text: 'text-zeno-600', value: 'text-zeno-700' };
      if (v >= 60) return { bg: 'bg-socrates-50 border-socrates-200', text: 'text-socrates-600', value: 'text-socrates-700' };
      return { bg: 'bg-aristotle-50 border-aristotle-200', text: 'text-aristotle-600', value: 'text-aristotle-700' };
    };
    
    const status = getStatus(score);
    
    return (
      <div className={`rounded-lg p-3 border my-2 shadow-sm ${status.bg}`}>
        <div className="flex items-center gap-2 mb-2">
          <Award className={`w-4 h-4 ${status.text}`} />
          <span className="font-bold text-sm text-warmGray-900">{factor}</span>
          <span className={`font-mono text-lg font-bold ${status.value}`}>{score.toFixed(1)}</span>
        </div>
        <p className="text-xs text-warmGray-600 mb-2">{description}</p>
        <button 
          onClick={() => onChat?.({ type: 'executive_presence', factor, score })}
          className="text-xs font-semibold text-warmGray-800 hover:text-warmGray-900 flex items-center gap-1 bg-white/50 hover:bg-white px-2 py-1 rounded transition-colors"
        >
          <Lightbulb className="w-3 h-3" />
          Develop
        </button>
      </div>
    );
  },
  
  'body-language-pattern': ({ pattern, consistencyScore, observations, onChat }) => {
    const getStatus = (v: number) => {
      if (v >= 80) return { bg: 'bg-zeno-50 border-zeno-200', value: 'text-zeno-700' };
      if (v >= 60) return { bg: 'bg-socrates-50 border-socrates-200', value: 'text-socrates-700' };
      return { bg: 'bg-aristotle-50 border-aristotle-200', value: 'text-aristotle-700' };
    };
    
    const status = getStatus(consistencyScore);
    
    return (
      <div className={`rounded-lg p-3 border my-2 shadow-sm ${status.bg}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-sm text-warmGray-900">{pattern}</span>
          <span className={`text-xs font-bold ${status.value}`}>{consistencyScore}% consistency</span>
        </div>
        {observations && observations.length > 0 && (
          <ul className="text-xs text-warmGray-600 mb-2 space-y-1">
            {observations.map((obs: string, i: number) => (
              <li key={i}>• {obs}</li>
            ))}
          </ul>
        )}
        <button 
          onClick={() => onChat?.({ type: 'body_language', pattern })}
          className="text-xs font-semibold text-warmGray-800 hover:text-warmGray-900 flex items-center gap-1 bg-white/50 hover:bg-white px-2 py-1 rounded transition-colors"
        >
          <MessageSquare className="w-3 h-3" />
          Practice
        </button>
      </div>
    );
  },
  
  'nervous-habit': ({ habit, frequency, timestamp, alternative, onClick, onChat }) => (
    <div className="bg-aristotle-50/80 rounded-lg p-3 border border-aristotle-200 my-2 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-mono font-semibold text-aristotle-700 bg-aristotle-200 px-2 py-1 rounded">
          {timestamp ? formatTimestamp(timestamp) : 'Pattern'}
        </span>
        <span className="text-xs font-semibold text-aristotle-600">Nervous Habit</span>
      </div>
      <p className="text-sm font-medium text-warmGray-800 mb-2">{habit}</p>
      {frequency && (
        <p className="text-xs text-aristotle-600 mb-2">Frequency: {frequency}×</p>
      )}
      {alternative && (
        <div className="bg-parchment-50 rounded p-2 mb-2 border border-aristotle-100">
          <p className="text-[10px] font-bold text-aristotle-600 uppercase mb-1">Instead Try</p>
          <p className="text-sm text-warmGray-700">{alternative}</p>
        </div>
      )}
      <div className="flex items-center gap-2">
        {timestamp && (
          <button 
            onClick={() => onClick?.(timestamp)}
            className="text-xs font-semibold text-aristotle-700 hover:text-aristotle-800 flex items-center gap-1 bg-aristotle-100 hover:bg-aristotle-200 px-2 py-1.5 rounded transition-colors"
          >
            <Eye className="w-3 h-3" />
            View
          </button>
        )}
        <button 
          onClick={() => onChat?.({ type: 'nervous_habit', habit })}
          className="text-xs font-semibold text-warmGray-800 hover:text-warmGray-900 flex items-center gap-1 bg-warmGray-200 hover:bg-warmGray-300 px-2 py-1.5 rounded transition-colors"
        >
          <Lightbulb className="w-3 h-3" />
          Replace habit
        </button>
      </div>
    </div>
  ),
  
  'power-pose': ({ pose, impact, whenToUse, onChat }) => (
    <div className="bg-mint-50/90 rounded-lg p-3 border-l-3 border-mint-500 my-2 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2">
        <Zap className="w-4 h-4 text-mint-600" />
        <span className="font-bold text-sm text-warmGray-900">{pose}</span>
      </div>
      <p className="text-sm font-medium text-warmGray-800 mb-2">Impact: {impact}</p>
      {whenToUse && (
        <p className="text-xs text-warmGray-600 mb-2">When: {whenToUse}</p>
      )}
      <button 
        onClick={() => onChat?.({ type: 'power_pose', pose })}
        className="text-xs font-semibold text-mint-800 hover:text-mint-900 flex items-center gap-1 bg-mint-200 hover:bg-mint-300 px-2 py-1 rounded transition-colors"
      >
        <Lightbulb className="w-3 h-3" />
        Practice
      </button>
    </div>
  ),
  
  'defensive-moment': ({ timestamp, behavior, trigger, onClick, onChat }) => (
    <div className="bg-red-50/80 rounded-lg p-3 border border-red-200 my-2 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-mono font-semibold text-red-700 bg-red-200 px-2 py-1 rounded">
          {formatTimestamp(timestamp)}
        </span>
        <span className="text-xs font-semibold text-red-600">Defensive Behavior</span>
      </div>
      <p className="text-sm font-medium text-warmGray-800 mb-2">{behavior}</p>
      {trigger && (
        <p className="text-xs text-red-600 mb-2">Trigger: {trigger}</p>
      )}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onClick?.(timestamp)}
          className="text-xs font-semibold text-red-700 hover:text-red-800 flex items-center gap-1 bg-red-100 hover:bg-red-200 px-2 py-1.5 rounded transition-colors"
        >
          <Eye className="w-3 h-3" />
          View
        </button>
        <button 
          onClick={() => onChat?.({ type: 'defensive', behavior })}
          className="text-xs font-semibold text-warmGray-800 hover:text-warmGray-900 flex items-center gap-1 bg-warmGray-200 hover:bg-warmGray-300 px-2 py-1.5 rounded transition-colors"
        >
          <Lightbulb className="w-3 h-3" />
          Stay open
        </button>
      </div>
    </div>
  ),
  
  'performance-gap': ({ area, yourScore, top10Avg, improvement, onChat }) => (
    <div className="border border-zeno-200 rounded-xl overflow-hidden my-2 shadow-sm">
      <div className="bg-zeno-50 p-4 border-b border-zeno-200">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-warmGray-800">{area}</span>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className={`font-mono text-lg font-bold ${yourScore >= 80 ? 'text-zeno-700' : yourScore >= 60 ? 'text-socrates-700' : 'text-aristotle-700'}`}>
                {yourScore.toFixed(1)}
              </div>
              <div className="text-xs text-warmGray-500">You</div>
            </div>
            <div className="text-warmGray-300">vs</div>
            <div className="text-center">
              <div className="font-mono text-lg font-bold text-zeno-600">
                {top10Avg.toFixed(1)}
              </div>
              <div className="text-xs text-warmGray-500">Top 10%</div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 bg-parchment-100">
        <span className="text-xs font-mono uppercase text-zeno-600 block mb-2">How to Improve</span>
        <p className="text-sm text-warmGray-700 mb-2">{improvement}</p>
        <button 
          onClick={() => onChat?.({ type: 'gap', area, improvement })}
          className="text-xs font-semibold text-zeno-700 hover:text-zeno-800 flex items-center gap-1 bg-zeno-200 hover:bg-zeno-300 px-2 py-1 rounded transition-colors"
        >
          <Lightbulb className="w-3 h-3" />
          Close the gap
        </button>
      </div>
    </div>
  ),
  
  'visual-strength': ({ title, description, onChat }) => (
    <div className="bg-mint-50/90 rounded-lg p-3 border-l-3 border-mint-500 my-2 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-green-600 text-lg">✓</span>
        <span className="font-bold text-sm text-warmGray-900">{title}</span>
      </div>
      <p className="text-sm font-medium text-warmGray-800 mb-2">{description}</p>
      <button 
        onClick={() => onChat?.({ type: 'visual_strength', title })}
        className="text-xs font-semibold text-mint-800 hover:text-mint-900 flex items-center gap-1 bg-mint-200 hover:bg-mint-300 px-2 py-1 rounded transition-colors"
      >
        <MessageSquare className="w-3 h-3" />
        Amplify
      </button>
    </div>
  ),
  
  'improvement-area': ({ title, description, priority, action, onChat }) => {
    const priorityColors = {
      high: 'border-red-400 bg-red-50/80',
      medium: 'border-amber-400 bg-amber-50/80',
      low: 'border-sky-400 bg-sky-50/80'
    };
    
    return (
      <div className={`rounded-lg p-3 my-2 shadow-sm border ${priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium}`}>
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-amber-600 text-lg">→</span>
          <span className="font-bold text-sm text-warmGray-900">{title}</span>
        </div>
        <p className="text-sm font-medium text-warmGray-800 mb-2">{description}</p>
        {action && (
          <div className="bg-white/80 rounded p-2 mb-2 border border-amber-200">
            <p className="text-[10px] font-bold text-amber-700 uppercase mb-1">Action</p>
            <p className="text-sm text-warmGray-800">{action}</p>
          </div>
        )}
        <button 
          onClick={() => onChat?.({ type: 'improvement', title })}
          className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 bg-amber-200 hover:bg-amber-300 px-2 py-1 rounded transition-colors"
        >
          <Lightbulb className="w-3 h-3" />
          Work on this
        </button>
      </div>
    );
  },
  
  'quick-win': ({ tip, expectedImpact, howTo, onChat }) => (
    <div className="bg-zeno-50/80 rounded-lg p-3 border border-zeno-200 my-2 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-4 h-4 text-zeno-600" />
        <span className="font-bold text-sm text-warmGray-900">Quick Win</span>
      </div>
      <p className="text-sm font-medium text-warmGray-800 mb-2">{tip}</p>
      {expectedImpact && (
        <p className="text-xs text-zeno-600 mb-2">Expected impact: {expectedImpact}</p>
      )}
      {howTo && (
        <div className="bg-white/80 rounded p-2 mb-2 border border-zeno-100">
          <p className="text-[10px] font-bold text-zeno-600 uppercase mb-1">How</p>
          <p className="text-sm text-warmGray-700">{howTo}</p>
        </div>
      )}
      <button 
        onClick={() => onChat?.({ type: 'quick_win', tip })}
        className="text-xs font-semibold text-zeno-800 hover:text-zeno-900 flex items-center gap-1 bg-zeno-200 hover:bg-zeno-300 px-2 py-1 rounded transition-colors"
      >
        <Lightbulb className="w-3 h-3" />
        Try this
      </button>
    </div>
  ),
  
  'advanced-technique': ({ technique, description, difficulty, onChat }) => {
    const difficultyColors = {
      beginner: 'bg-green-50 border-green-200',
      intermediate: 'bg-socrates-50 border-socrates-200',
      advanced: 'bg-purple-50 border-purple-200'
    };
    
    return (
      <div className={`rounded-lg p-3 border my-2 shadow-sm ${difficultyColors[difficulty as keyof typeof difficultyColors] || difficultyColors.intermediate}`}>
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-warmGray-600" />
          <span className="font-bold text-sm text-warmGray-900">{technique}</span>
          <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-white/50">
            {difficulty}
          </span>
        </div>
        <p className="text-sm text-warmGray-700 mb-2">{description}</p>
        <button 
          onClick={() => onChat?.({ type: 'advanced', technique })}
          className="text-xs font-semibold text-warmGray-800 hover:text-warmGray-900 flex items-center gap-1 bg-white/50 hover:bg-white px-2 py-1 rounded transition-colors border border-warmGray-300"
        >
          <MessageSquare className="w-3 h-3" />
          Master this
        </button>
      </div>
    );
  }
});

const formatTimestamp = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function ZenoAIAnalysis({ analysis, conversationId, onHighlightClick }: ZenoAIAnalysisProps) {
  const navigate = useNavigate();
  const [streamedComponents, setStreamedComponents] = useState<UIComponent[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [transcriptMessages, setTranscriptMessages] = useState<TranscriptMessage[]>([]);

  // Load transcript messages for webhook payload
  useEffect(() => {
    const loadTranscript = async () => {
      if (!conversationId) return;
      try {
        const data = await api.getAnnotatedTranscript(conversationId);
        if (data.transcript_json && Array.isArray(data.transcript_json)) {
          let items = data.transcript_json;
          if (items.length === 1 && Array.isArray(items[0])) {
            items = items[0];
          }
          const messages: TranscriptMessage[] = items
            .filter((item: any) => item.message?.trim())
            .map((item: any) => ({
              role: (item.role === 'agent' ? 'assistant' : 'user') as 'assistant' | 'user',
              content: item.message,
              time_in_call_secs: item.time_in_call_secs
            }));
          setTranscriptMessages(messages);
        }
      } catch (err) {
        console.error('Failed to load transcript for chat:', err);
      }
    };
    loadTranscript();
  }, [conversationId]);

  // Send chat webhook and navigate
  const handleChatRequest = useCallback(async (chatData: any) => {
    if (!conversationId) return;
    
    const chatId = getActionId();
    const actionType = chatData.type === 'practice' ? 'practice' : 'analyze';
    const firstClickKey = `action_first_click_${conversationId}_${actionType}`;
    const isFirstClick = sessionStorage.getItem(firstClickKey) !== 'false';
    sessionStorage.setItem(firstClickKey, 'false');
    
    const highlightedText = chatData.context || chatData.original || chatData.text || '';
    
    const payload = {
      id: chatId,
      conversation_id: conversationId,
      source_conversation_id: conversationId,
      button_clicked: actionType,
      first_click: isFirstClick,
      highlighted_text: highlightedText,
      messages: transcriptMessages,
      type: actionType,
      highlight_id: chatId,
      highlight_message: highlightedText,
      philosopher: 'zeno',
      commenter: 'zeno',
      emotions_at_time: {
        timestamp_ms: chatData.timestamp ? chatData.timestamp * 1000 : Date.now(),
        face_top5: [],
        prosody_top5: []
      },
      chat_context: chatData
    };
    
    fetch(CHAT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => console.error('Chat webhook error:', err));
    
    sessionStorage.setItem(`chat_seed_${chatId}`, JSON.stringify({
      conversation_id: conversationId,
      source_conversation_id: conversationId,
      highlighted_sentence: highlightedText,
      comment: highlightedText,
      color: null,
      created_at: new Date().toISOString(),
      commenter: 'zeno',
      type: actionType
    }));

    const query = `?type=${encodeURIComponent(actionType)}&conversation_id=${encodeURIComponent(conversationId)}&source_conversation_id=${encodeURIComponent(conversationId)}&button=${encodeURIComponent(actionType)}&first_click=${encodeURIComponent(String(isFirstClick))}&commenter=${encodeURIComponent('zeno')}`;
    navigate(`/chat/${chatId}${query}`);
  }, [conversationId, transcriptMessages, navigate]);

  const generateAnalysis = useCallback(async () => {
    setIsStreaming(true);
    setError(null);
    setStreamedComponents([]);
    setSummary('');

    try {
      const presence = analysis.presence_analysis;
      const components: UIComponent[] = [];

      // Add summary component first
      await new Promise(r => setTimeout(r, 300));
      setSummary(`Visual presence score: ${presence.score.toFixed(1)}/100. I've analyzed your body language across ${Object.keys(presence.visual_metrics).length} visual dimensions, with ${presence.body_language_patterns.nervous_habits.length} nervous habits and ${presence.body_language_patterns.power_poses.length} power poses identified.`);

      // Stream visual metrics
      const metrics = [
        { label: 'Eye Contact', value: presence.visual_metrics.eye_contact_score, description: 'Direct gaze and engagement' },
        { label: 'Posture', value: presence.visual_metrics.posture_score, description: 'Openness and confidence' },
        { label: 'Gestures', value: presence.visual_metrics.gesture_effectiveness, description: 'Purposeful hand movements' },
        { label: 'Expressiveness', value: presence.visual_metrics.facial_expressiveness, description: 'Range of emotions conveyed' },
        { label: 'Energy Level', value: presence.visual_metrics.energy_level, description: 'Enthusiasm and vitality' }
      ];
      
      for (const metric of metrics) {
        await new Promise(r => setTimeout(r, 150));
        const status = metric.value >= 80 ? 'excellent' : metric.value >= 60 ? 'good' : 'warning';
        components.push({
          type: 'visual-metric',
          id: `metric-${metric.label}`,
          priority: status === 'warning' ? 'high' : 'medium',
          props: {
            label: metric.label,
            value: metric.value.toFixed(1),
            description: metric.description,
            status,
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream executive presence factors
      const factors = [
        { name: 'Gravitas', score: presence.executive_presence_factors.gravitas, description: 'Weight and seriousness' },
        { name: 'Confidence', score: presence.executive_presence_factors.confidence_without_arrogance, description: 'Self-assurance and poise' },
        { name: 'Intellectual Honesty', score: presence.executive_presence_factors.intellectual_honesty, description: 'Integrity and transparency' },
        { name: 'Composure Under Pressure', score: presence.executive_presence_factors.composure_under_pressure, description: 'Calmness in challenging situations' }
      ];
      
      for (const factor of factors) {
        await new Promise(r => setTimeout(r, 150));
        components.push({
          type: 'executive-presence',
          id: `executive-${factor.name}`,
          priority: factor.score >= 80 ? 'low' : factor.score >= 60 ? 'medium' : 'high',
          props: {
            factor: factor.name,
            score: factor.score,
            description: factor.description,
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream body language consistency
      components.push({
        type: 'body-language-pattern',
        id: 'consistency',
        priority: presence.body_language_patterns.consistency_score >= 80 ? 'low' : 'medium',
        props: {
          pattern: 'Body Language Consistency',
          consistencyScore: presence.body_language_patterns.consistency_score,
          observations: ['How well your verbal and non-verbal signals align'],
          onChat: handleChatRequest
        }
      });
      setStreamedComponents([...components]);

      // Stream nervous habits
      for (const habit of presence.body_language_patterns.nervous_habits) {
        await new Promise(r => setTimeout(r, 180));
        components.push({
          type: 'nervous-habit',
          id: `habit-${components.length}`,
          priority: 'high',
          props: {
            habit,
            alternative: 'Practice conscious stillness and purposeful movement',
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream power poses
      for (const pose of presence.body_language_patterns.power_poses) {
        await new Promise(r => setTimeout(r, 150));
        components.push({
          type: 'power-pose',
          id: `pose-${components.length}`,
          priority: 'low',
          props: {
            pose,
            impact: 'Increases confidence and authority',
            whenToUse: 'At key moments of emphasis',
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream defensive moments
      for (const moment of presence.body_language_patterns.defensive_moments) {
        await new Promise(r => setTimeout(r, 180));
        components.push({
          type: 'defensive-moment',
          id: `defensive-${components.length}`,
          priority: 'medium',
          props: {
            behavior: moment,
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream performance gaps
      for (const gap of presence.comparison_to_top_performers.specific_gaps) {
        await new Promise(r => setTimeout(r, 200));
        components.push({
          type: 'performance-gap',
          id: `gap-${gap.area}`,
          priority: gap.your_score < gap.top_10_avg - 10 ? 'high' : 'medium',
          props: {
            area: gap.area,
            yourScore: gap.your_score,
            top10Avg: gap.top_10_avg,
            improvement: gap.improvement,
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream visual strengths
      for (const strength of presence.feedback.what_works) {
        await new Promise(r => setTimeout(r, 150));
        components.push({
          type: 'visual-strength',
          id: `strength-${components.length}`,
          priority: 'low',
          props: {
            title: strength.split('.')[0] || strength.substring(0, 50) + '...',
            description: strength,
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream improvement areas
      for (const area of presence.feedback.what_needs_work) {
        await new Promise(r => setTimeout(r, 150));
        components.push({
          type: 'improvement-area',
          id: `improvement-${components.length}`,
          priority: 'medium',
          props: {
            title: area.split('.')[0] || area.substring(0, 50) + '...',
            description: area,
            priority: 'medium',
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream quick wins
      for (const win of presence.feedback.quick_wins) {
        await new Promise(r => setTimeout(r, 150));
        components.push({
          type: 'quick-win',
          id: `quickwin-${components.length}`,
          priority: 'high',
          props: {
            tip: win,
            expectedImpact: 'Immediate improvement in presence',
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream advanced techniques
      for (const technique of presence.feedback.advanced_techniques) {
        await new Promise(r => setTimeout(r, 150));
        components.push({
          type: 'advanced-technique',
          id: `technique-${components.length}`,
          priority: 'low',
          props: {
            technique: technique.split(':')[0] || technique.substring(0, 50) + '...',
            description: technique,
            difficulty: 'advanced',
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate analysis');
    } finally {
      setIsStreaming(false);
    }
  }, [analysis, onHighlightClick, handleChatRequest]);

  useEffect(() => {
    generateAnalysis();
  }, [generateAnalysis]);

  const renderComponent = (component: UIComponent) => {
    const ComponentRegistry = createComponentRegistry(navigate, conversationId);
    const Component = ComponentRegistry[component.type];
    if (!Component) return null;
    return (
      <div key={component.id} className="animate-fade-in">
        <Component {...component.props} />
      </div>
    );
  };

  // Group components by priority
  const highPriority = streamedComponents.filter(c => c.priority === 'high');
  const mediumPriority = streamedComponents.filter(c => c.priority === 'medium');
  const lowPriority = streamedComponents.filter(c => c.priority === 'low');

  return (
    <div className="space-y-4 text-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-full bg-zeno-200 flex items-center justify-center">
              <span className="text-lg">📹</span>
            </div>
            <div>
              <h2 className="font-sans font-bold text-lg tracking-tight text-warmGray-900">
                Zeno's Analysis
              </h2>
              <p className="text-xs text-warmGray-600">Visual presence insights...</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isStreaming && (
            <div className="flex items-center gap-1 text-xs text-zeno-700">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Analyzing...</span>
            </div>
          )}
          <LiquidButton
            variant="ghost"
            size="sm"
            onClick={generateAnalysis}
            disabled={isStreaming}
            icon={<RefreshCw className={`w-3 h-3 ${isStreaming ? 'animate-spin' : ''}`} />}
          >
            Regen
          </LiquidButton>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-xs font-semibold text-red-700">{error}</p>
        </div>
      )}

      {/* AI Summary */}
      {summary && (
        <div className="bg-gradient-to-r from-zeno-100 to-parchment-100 rounded-lg p-3 border border-zeno-300">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-4 h-4 text-zeno-600" />
            <span className="text-xs font-bold text-zeno-800">Summary</span>
          </div>
          <p className="text-sm font-medium text-warmGray-900 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* High Priority Insights */}
      {highPriority.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-warmGray-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Priority
          </h3>
          <div className="space-y-1">
            {highPriority.map(renderComponent)}
          </div>
        </div>
      )}

      {/* Medium Priority Insights */}
      {mediumPriority.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-warmGray-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Growth Areas
          </h3>
          <div className="space-y-1">
            {mediumPriority.map(renderComponent)}
          </div>
        </div>
      )}

      {/* Low Priority / Positive */}
      {lowPriority.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-warmGray-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Observations
          </h3>
          <div className="space-y-1">
            {lowPriority.map(renderComponent)}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isStreaming && streamedComponents.length === 0 && !error && (
        <div className="text-center py-12">
          <Sparkles className="w-12 h-12 text-zeno-300 mx-auto mb-4" />
          <p className="text-base font-semibold text-warmGray-700">No insights generated yet.</p>
          <button
            onClick={generateAnalysis}
            className="mt-4 text-zeno-700 hover:text-zeno-800 text-sm font-bold"
          >
            Generate Analysis
          </button>
        </div>
      )}
    </div>
  );
}
