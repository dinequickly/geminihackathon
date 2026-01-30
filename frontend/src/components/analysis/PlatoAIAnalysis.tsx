import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, PlatoAnalysis as PlatoAnalysisType } from '../../lib/api';
import { Sparkles, Loader2, RefreshCw, AlertCircle, MessageSquare, Lightbulb, Eye, Heart, TrendingUp, TrendingDown } from 'lucide-react';
import { LiquidButton } from '../LiquidButton';

interface PlatoAIAnalysisProps {
  analysis: PlatoAnalysisType;
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
  | 'emotion-spike'
  | 'calm-moment'
  | 'authenticity-marker'
  | 'stress-trigger'
  | 'recovery-strategy'
  | 'performed-moment'
  | 'emotional-strength'
  | 'growth-area'
  | 'coaching-insight';

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
  'emotion-spike': ({ timestamp, emotion, intensity, trigger, onClick, onChat }) => {
    const emotionColors: Record<string, string> = {
      anxious: 'bg-red-50 border-red-300 text-red-700',
      confused: 'bg-amber-50 border-amber-300 text-amber-700',
      enthusiastic: 'bg-pink-50 border-pink-300 text-pink-700',
      engaged: 'bg-purple-50 border-purple-300 text-purple-700',
      confident: 'bg-blue-50 border-blue-300 text-blue-700'
    };
    const colorClass = emotionColors[emotion?.toLowerCase()] || 'bg-plato-50 border-plato-300 text-plato-700';
    
    return (
      <div className={`rounded-lg p-3 border-l-3 my-2 shadow-sm ${colorClass}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono font-semibold bg-white/50 px-2 py-1 rounded">
            {formatTimestamp(timestamp)}
          </span>
          <span className="text-xs font-bold uppercase">{emotion} Spike</span>
          <span className="text-xs font-bold">{(intensity * 100).toFixed(0)}%</span>
        </div>
        {trigger && (
          <p className="text-sm font-medium mb-2">Trigger: {trigger}</p>
        )}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onClick?.(timestamp)}
            className="text-xs font-semibold flex items-center gap-1 bg-white/50 hover:bg-white px-2 py-1.5 rounded transition-colors"
          >
            <Eye className="w-3 h-3" />
            View
          </button>
          <button 
            onClick={() => onChat?.({ type: 'emotion_help', emotion, trigger })}
            className="text-xs font-semibold flex items-center gap-1 bg-white/50 hover:bg-white px-2 py-1.5 rounded transition-colors"
          >
            <Lightbulb className="w-3 h-3" />
            Manage
          </button>
        </div>
      </div>
    );
  },
  
  'calm-moment': ({ timestamp, description, techniques }) => (
    <div className="bg-plato-50/80 rounded-lg p-3 border-l-3 border-plato-400 my-2 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-mono font-semibold text-plato-700 bg-plato-200 px-2 py-1 rounded">
          {formatTimestamp(timestamp)}
        </span>
        <span className="text-xs font-semibold text-plato-600">Calm Moment</span>
      </div>
      <p className="text-sm font-medium text-warmGray-800 mb-2">{description}</p>
      {techniques && (
        <div className="flex flex-wrap gap-1.5">
          {techniques.map((tech: string, i: number) => (
            <span key={i} className="text-xs font-bold bg-plato-200 text-plato-800 px-2 py-1 rounded-full">
              {tech}
            </span>
          ))}
        </div>
      )}
    </div>
  ),
  
  'authenticity-marker': ({ description, indicator, onChat }) => (
    <div className="bg-mint-50/90 rounded-lg p-3 border-l-3 border-mint-500 my-2 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2">
        <Heart className="w-4 h-4 text-mint-600" />
        <span className="font-bold text-sm text-warmGray-900">Authentic Expression</span>
      </div>
      <p className="text-sm font-medium text-warmGray-800 mb-2">{description}</p>
      <div className="flex items-center gap-2">
        <span className="inline-block text-xs font-bold bg-mint-200 text-mint-800 px-2 py-1 rounded-full">
          {indicator}
        </span>
        <button 
          onClick={() => onChat?.({ type: 'authenticity', description })}
          className="text-xs font-semibold text-mint-800 hover:text-mint-900 flex items-center gap-1 bg-mint-200 hover:bg-mint-300 px-2 py-1 rounded transition-colors"
        >
          <MessageSquare className="w-3 h-3" />
          Explore
        </button>
      </div>
    </div>
  ),
  
  'stress-trigger': ({ trigger, frequency, contexts, onChat }) => (
    <div className="bg-red-50/80 rounded-lg p-3 border border-red-200 my-2 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2">
        <TrendingDown className="w-4 h-4 text-red-500" />
        <span className="font-bold text-sm text-warmGray-900">Stress Trigger</span>
        <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
          {frequency}×
        </span>
      </div>
      <p className="text-sm font-medium text-warmGray-800 mb-2">{trigger}</p>
      {contexts && contexts.length > 0 && (
        <p className="text-xs text-warmGray-600 mb-2">Contexts: {contexts.join(', ')}</p>
      )}
      <button 
        onClick={() => onChat?.({ type: 'stress_help', trigger })}
        className="text-xs font-semibold text-red-800 hover:text-red-900 flex items-center gap-1 bg-red-200 hover:bg-red-300 px-2 py-1 rounded transition-colors"
      >
        <Lightbulb className="w-3 h-3" />
        Build resilience
      </button>
    </div>
  ),
  
  'recovery-strategy': ({ strategy, effectiveness, example }) => (
    <div className="bg-zeno-50/80 rounded-lg p-3 border border-zeno-200 my-2 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2">
        <TrendingUp className="w-4 h-4 text-zeno-600" />
        <span className="font-bold text-sm text-warmGray-900">Recovery Strategy</span>
        <span className="text-xs font-bold text-zeno-700 bg-zeno-100 px-2 py-0.5 rounded-full">
          {effectiveness}%
        </span>
      </div>
      <p className="text-sm font-medium text-warmGray-800 mb-2">{strategy}</p>
      {example && (
        <p className="text-xs text-warmGray-600 italic">"{example}"</p>
      )}
    </div>
  ),
  
  'performed-moment': ({ timestamp, reason, onClick, onChat }) => (
    <div className="bg-amber-50/80 rounded-lg p-3 border border-amber-200 my-2 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-mono font-semibold text-amber-700 bg-amber-200 px-2 py-1 rounded">
          {formatTimestamp(timestamp)}
        </span>
        <span className="text-xs font-semibold text-amber-600">Performed/Scripted</span>
      </div>
      <p className="text-sm font-medium text-warmGray-800 mb-2">{reason}</p>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onClick?.(timestamp)}
          className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 bg-amber-200 hover:bg-amber-300 px-2 py-1.5 rounded transition-colors"
        >
          <Eye className="w-3 h-3" />
          View
        </button>
        <button 
          onClick={() => onChat?.({ type: 'authenticity_help', reason })}
          className="text-xs font-semibold text-warmGray-800 hover:text-warmGray-900 flex items-center gap-1 bg-warmGray-200 hover:bg-warmGray-300 px-2 py-1.5 rounded transition-colors"
        >
          <Lightbulb className="w-3 h-3" />
          Be more natural
        </button>
      </div>
    </div>
  ),
  
  'emotional-strength': ({ title, description, platoTerm }) => (
    <div className="bg-mint-50/90 rounded-lg p-3 border-l-3 border-mint-500 my-2 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-green-600 text-lg">✓</span>
        <span className="font-bold text-sm text-warmGray-900">{title}</span>
      </div>
      <p className="text-sm font-medium text-warmGray-800 mb-2">{description}</p>
      {platoTerm && (
        <span className="inline-block text-xs font-bold bg-mint-200 text-mint-800 px-2 py-1 rounded-full">
          {platoTerm}
        </span>
      )}
    </div>
  ),
  
  'growth-area': ({ title, description, actionableTip, onChat }) => (
    <div className="bg-amber-50/90 rounded-lg p-3 border-l-3 border-amber-500 my-2 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-amber-600 text-lg">→</span>
        <span className="font-bold text-sm text-warmGray-900">{title}</span>
      </div>
      <p className="text-sm font-medium text-warmGray-800 mb-2">{description}</p>
      {actionableTip && (
        <div className="bg-white/80 rounded p-2 mt-2 border border-amber-200">
          <p className="text-[10px] font-bold text-amber-700 uppercase mb-1">💡 Tip</p>
          <p className="text-sm text-warmGray-800">{actionableTip}</p>
        </div>
      )}
      <button 
        onClick={() => onChat?.({ type: 'growth_help', title, description })}
        className="mt-2 text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 bg-amber-200 hover:bg-amber-300 px-2 py-1 rounded transition-colors"
      >
        <MessageSquare className="w-3 h-3" />
        Work on this
      </button>
    </div>
  ),
  
  'coaching-insight': ({ insight, category, priority, onChat }) => {
    const priorityColors = {
      high: 'border-red-400 bg-red-50/80',
      medium: 'border-amber-400 bg-amber-50/80',
      low: 'border-sky-400 bg-sky-50/80'
    };
    return (
      <div className={`rounded-lg p-3 my-2 shadow-sm border ${priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium}`}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-warmGray-600" />
          <span className="text-xs font-bold uppercase text-warmGray-600">{category}</span>
        </div>
        <p className="text-sm font-medium text-warmGray-800">{insight}</p>
        <button 
          onClick={() => onChat?.({ type: 'coaching', category, insight })}
          className="mt-2 text-xs font-semibold text-warmGray-800 hover:text-warmGray-900 flex items-center gap-1 bg-white/80 hover:bg-white px-2 py-1 rounded transition-colors border border-warmGray-300"
        >
          <MessageSquare className="w-3 h-3" />
          Discuss
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

export function PlatoAIAnalysis({ analysis, conversationId, onHighlightClick }: PlatoAIAnalysisProps) {
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
      philosopher: 'plato',
      commenter: 'plato',
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
      commenter: 'plato',
      type: actionType
    }));

    const query = `?type=${encodeURIComponent(actionType)}&conversation_id=${encodeURIComponent(conversationId)}&source_conversation_id=${encodeURIComponent(conversationId)}&button=${encodeURIComponent(actionType)}&first_click=${encodeURIComponent(String(isFirstClick))}&commenter=${encodeURIComponent('plato')}`;
    navigate(`/chat/${chatId}${query}`);
  }, [conversationId, transcriptMessages, navigate]);

  const generateAnalysis = useCallback(async () => {
    setIsStreaming(true);
    setError(null);
    setStreamedComponents([]);
    setSummary('');

    try {
      const emo = analysis.emotional_analysis;
      const components: UIComponent[] = [];

      // Add summary component first
      await new Promise(r => setTimeout(r, 300));
      setSummary(`Emotional intelligence score: ${emo.score}/10.0. I've analyzed your emotional journey through this interview, tracking ${emo.emotional_arc.length} emotional states and identifying ${emo.key_moments.length} key moments.`);

      // Stream emotional arc points (as spikes or calm moments)
      for (const point of emo.emotional_arc.slice(0, 5)) {
        await new Promise(r => setTimeout(r, 150));
        const intensity = Math.max(...Object.values(point.emotions));
        const isCalm = point.dominant_emotion.toLowerCase() === 'calm' || point.dominant_emotion.toLowerCase() === 'confident';
        
        components.push({
          type: isCalm ? 'calm-moment' : 'emotion-spike',
          id: `arc-${point.timestamp}`,
          timestamp: point.timestamp,
          priority: intensity > 0.7 ? 'high' : 'medium',
          props: {
            timestamp: point.timestamp,
            emotion: point.dominant_emotion,
            intensity,
            trigger: point.trigger,
            techniques: isCalm ? ['Deep breathing', 'Grounding', 'Presence'] : undefined,
            onClick: onHighlightClick,
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream key moments
      for (const moment of emo.key_moments) {
        await new Promise(r => setTimeout(r, 200));
        const type = moment.type.toLowerCase().includes('strength') || moment.type.toLowerCase().includes('high eq')
          ? 'authenticity-marker'
          : moment.type.toLowerCase().includes('performed')
          ? 'performed-moment'
          : 'emotion-spike';
        
        components.push({
          type: type as ComponentType,
          id: `moment-${moment.timestamp}`,
          timestamp: moment.timestamp,
          priority: 'high',
          props: {
            timestamp: moment.timestamp,
            description: moment.description,
            emotion: moment.emotion_state,
            indicator: moment.type,
            reason: moment.description,
            onClick: onHighlightClick,
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream stress triggers
      for (const trigger of emo.patterns.stress_triggers) {
        await new Promise(r => setTimeout(r, 180));
        components.push({
          type: 'stress-trigger',
          id: `trigger-${components.length}`,
          priority: 'high',
          props: {
            trigger,
            frequency: 1,
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream recovery strategies
      for (const strategy of emo.patterns.recovery_strategies) {
        await new Promise(r => setTimeout(r, 150));
        components.push({
          type: 'recovery-strategy',
          id: `recovery-${components.length}`,
          priority: 'medium',
          props: {
            strategy,
            effectiveness: 75
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream authenticity markers
      for (const marker of emo.patterns.authenticity_markers) {
        await new Promise(r => setTimeout(r, 150));
        components.push({
          type: 'authenticity-marker',
          id: `authenticity-${components.length}`,
          priority: 'medium',
          props: {
            description: marker,
            indicator: 'Authentic Expression',
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream performed moments
      for (const pm of emo.patterns.performed_moments) {
        await new Promise(r => setTimeout(r, 200));
        components.push({
          type: 'performed-moment',
          id: `performed-${pm.timestamp}`,
          timestamp: pm.timestamp,
          priority: 'medium',
          props: {
            timestamp: pm.timestamp,
            reason: pm.reason,
            onClick: onHighlightClick,
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream strengths
      for (const strength of emo.feedback.strengths) {
        await new Promise(r => setTimeout(r, 180));
        components.push({
          type: 'emotional-strength',
          id: `strength-${components.length}`,
          priority: 'medium',
          props: {
            title: strength.split('.')[0] || strength.substring(0, 40) + '...',
            description: strength,
            platoTerm: 'Emotional Intelligence'
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream growth areas
      for (const area of emo.feedback.growth_areas) {
        await new Promise(r => setTimeout(r, 180));
        components.push({
          type: 'growth-area',
          id: `growth-${components.length}`,
          priority: 'medium',
          props: {
            title: area.split('.')[0] || area.substring(0, 40) + '...',
            description: area,
            actionableTip: 'Practice mindfulness during challenging questions',
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream coaching insights
      for (const insight of emo.feedback.coaching_insights) {
        await new Promise(r => setTimeout(r, 200));
        components.push({
          type: 'coaching-insight',
          id: `coaching-${components.length}`,
          priority: 'low',
          props: {
            insight,
            category: 'Emotional Growth',
            priority: 'medium',
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
            <div className="w-9 h-9 rounded-full bg-plato-200 flex items-center justify-center">
              <span className="text-lg">🧠</span>
            </div>
            <div>
              <h2 className="font-sans font-bold text-lg tracking-tight text-warmGray-900">
                Plato's Analysis
              </h2>
              <p className="text-xs text-warmGray-600">Emotional intelligence insights...</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isStreaming && (
            <div className="flex items-center gap-1 text-xs text-plato-700">
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
        <div className="bg-gradient-to-r from-plato-100 to-parchment-100 rounded-lg p-3 border border-plato-300">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-4 h-4 text-plato-600" />
            <span className="text-xs font-bold text-plato-800">Summary</span>
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
          <Sparkles className="w-12 h-12 text-plato-300 mx-auto mb-4" />
          <p className="text-base font-semibold text-warmGray-700">No insights generated yet.</p>
          <button
            onClick={generateAnalysis}
            className="mt-4 text-plato-700 hover:text-plato-800 text-sm font-bold"
          >
            Generate Analysis
          </button>
        </div>
      )}
    </div>
  );
}
