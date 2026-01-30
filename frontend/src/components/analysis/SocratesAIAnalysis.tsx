import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, SocratesAnalysis as SocratesAnalysisType } from '../../lib/api';
import { Sparkles, Loader2, RefreshCw, AlertCircle, MessageSquare, Lightbulb, Eye, HelpCircle, Brain, Target } from 'lucide-react';
import { LiquidButton } from '../LiquidButton';

interface SocratesAIAnalysisProps {
  analysis: SocratesAnalysisType;
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
  | 'question-analysis'
  | 'missed-opportunity'
  | 'intellectual-signal'
  | 'framework-usage'
  | 'good-vs-great'
  | 'thinking-pattern'
  | 'intellectual-strength'
  | 'thinking-blindspot'
  | 'strategy-recommendation';

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
  'question-analysis': ({ timestamp, question, qualityScore, type, whyItMatters, onClick, onChat }) => {
    const qualityInfo = qualityScore >= 4.5 
      ? { label: 'Exceptional', color: 'text-green-600 bg-green-50' }
      : qualityScore >= 4 
      ? { label: 'Strong', color: 'text-blue-600 bg-blue-50' }
      : qualityScore >= 3 
      ? { label: 'Good', color: 'text-yellow-600 bg-yellow-50' }
      : { label: 'Developing', color: 'text-gray-600 bg-gray-50' };
    
    const typeColors: Record<string, string> = {
      'Foundational/Theoretical': 'bg-purple-500',
      'Alignment/Meta-Strategic': 'bg-blue-500',
      'Fit/Self-Awareness': 'bg-green-500',
      'Probing': 'bg-amber-500',
      'Clarifying': 'bg-pink-500',
      'Challenging': 'bg-red-500'
    };
    
    return (
      <div className="bg-socrates-50/80 rounded-lg p-3 border-l-3 border-socrates-400 my-2 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono font-semibold text-socrates-700 bg-socrates-200 px-2 py-1 rounded">
            {formatTimestamp(timestamp)}
          </span>
          <span 
            className="text-xs font-semibold text-white px-2 py-0.5 rounded"
            style={{ backgroundColor: typeColors[type] || '#6b7280' }}
          >
            {type}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${qualityInfo.color}`}>
            {qualityInfo.label} ({qualityScore}/5)
          </span>
        </div>
        <p className="text-sm font-medium text-warmGray-800 mb-2">"{question}"</p>
        <div className="bg-white/80 rounded p-2 mb-2 border border-socrates-200">
          <p className="text-[10px] font-bold text-socrates-600 uppercase mb-1">Why This Matters</p>
          <p className="text-sm text-warmGray-700">{whyItMatters}</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onClick?.(timestamp)}
            className="text-xs font-semibold text-socrates-700 hover:text-socrates-800 flex items-center gap-1 bg-socrates-100 hover:bg-socrates-200 px-2 py-1.5 rounded transition-colors"
          >
            <Eye className="w-3 h-3" />
            View
          </button>
          <button 
            onClick={() => onChat?.({ type: 'question_help', question, type })}
            className="text-xs font-semibold text-warmGray-800 hover:text-warmGray-900 flex items-center gap-1 bg-warmGray-200 hover:bg-warmGray-300 px-2 py-1.5 rounded transition-colors"
          >
            <Lightbulb className="w-3 h-3" />
            Better questions?
          </button>
        </div>
      </div>
    );
  },
  
  'missed-opportunity': ({ timestamp, context, whatToAsk, why, onClick, onChat }) => (
    <div className="bg-aristotle-50/80 rounded-lg p-3 border border-aristotle-200 my-2 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-mono font-semibold text-aristotle-700 bg-aristotle-200 px-2 py-1 rounded">
          {formatTimestamp(timestamp)}
        </span>
        <span className="text-xs font-semibold text-aristotle-600">Missed Opportunity</span>
      </div>
      <p className="text-sm text-warmGray-600 mb-2">
        <span className="font-medium text-warmGray-700">Context: </span>
        {context}
      </p>
      <div className="bg-parchment-50 rounded-lg p-3 border border-aristotle-200 mb-2">
        <p className="text-[10px] font-bold text-aristotle-700 uppercase mb-1">What You Could Have Asked</p>
        <p className="text-sm text-warmGray-800 italic">"{whatToAsk}"</p>
      </div>
      <div className="bg-socrates-50 rounded-lg p-2 border border-socrates-200 mb-2">
        <p className="text-[10px] font-bold text-socrates-600 uppercase mb-1">Why</p>
        <p className="text-sm text-warmGray-700">{why}</p>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onClick?.(timestamp)}
          className="text-xs font-semibold text-aristotle-700 hover:text-aristotle-800 flex items-center gap-1 bg-aristotle-100 hover:bg-aristotle-200 px-2 py-1.5 rounded transition-colors"
        >
          <Eye className="w-3 h-3" />
          View
        </button>
        <button 
          onClick={() => onChat?.({ type: 'missed_opportunity', context, whatToAsk })}
          className="text-xs font-semibold text-socrates-700 hover:text-socrates-800 flex items-center gap-1 bg-socrates-100 hover:bg-socrates-200 px-2 py-1.5 rounded transition-colors"
        >
          <Lightbulb className="w-3 h-3" />
          Practice
        </button>
      </div>
    </div>
  ),
  
  'intellectual-signal': ({ signal, present, description, onChat }) => (
    <div className={`rounded-lg p-3 border my-2 shadow-sm ${present ? 'bg-mint-50/80 border-mint-300' : 'bg-warmGray-50/80 border-warmGray-200'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Brain className={`w-4 h-4 ${present ? 'text-mint-600' : 'text-warmGray-400'}`} />
        <span className="font-bold text-sm text-warmGray-900">{signal}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${present ? 'bg-mint-200 text-mint-800' : 'bg-warmGray-200 text-warmGray-600'}`}>
          {present ? 'Present' : 'Not detected'}
        </span>
      </div>
      {description && (
        <p className="text-sm text-warmGray-700 mb-2">{description}</p>
      )}
      {present && (
        <button 
          onClick={() => onChat?.({ type: 'intellectual_signal', signal })}
          className="text-xs font-semibold text-mint-800 hover:text-mint-900 flex items-center gap-1 bg-mint-200 hover:bg-mint-300 px-2 py-1 rounded transition-colors"
        >
          <MessageSquare className="w-3 h-3" />
          Explore
        </button>
      )}
    </div>
  ),
  
  'framework-usage': ({ label, value, type, onChat }) => {
    if (type === 'boolean') {
      return (
        <div className={`rounded-lg p-3 border my-2 shadow-sm ${value ? 'bg-socrates-50 border-socrates-200' : 'bg-parchment-100 border-warmGray-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-warmGray-800">{label}</span>
            <span className={`font-mono text-lg font-bold ${value ? 'text-socrates-600' : 'text-warmGray-400'}`}>
              {value ? '✓ Yes' : '✗ No'}
            </span>
          </div>
          {value && (
            <button 
              onClick={() => onChat?.({ type: 'framework', label })}
              className="mt-2 text-xs font-semibold text-socrates-700 hover:text-socrates-800 flex items-center gap-1 bg-socrates-100 hover:bg-socrates-200 px-2 py-1 rounded transition-colors"
            >
              <Lightbulb className="w-3 h-3" />
              Improve
            </button>
          )}
        </div>
      );
    }
    
    const getStatus = (v: number) => {
      if (v >= 4) return { bg: 'bg-socrates-50 border-socrates-200', value: 'text-socrates-700' };
      if (v >= 3) return { bg: 'bg-socrates-100 border-socrates-300', value: 'text-socrates-600' };
      return { bg: 'bg-aristotle-50 border-aristotle-200', value: 'text-aristotle-700' };
    };
    
    const status = getStatus(value);
    
    return (
      <div className={`rounded-lg p-3 border my-2 shadow-sm ${status.bg}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-warmGray-800">{label}</span>
          <span className={`font-mono text-lg font-bold ${status.value}`}>{value.toFixed(1)}/5</span>
        </div>
        <button 
          onClick={() => onChat?.({ type: 'framework', label, value })}
          className="text-xs font-semibold text-warmGray-800 hover:text-warmGray-900 flex items-center gap-1 bg-white/50 hover:bg-white px-2 py-1 rounded transition-colors"
        >
          <Lightbulb className="w-3 h-3" />
          Strengthen
        </button>
      </div>
    );
  },
  
  'good-vs-great': ({ yourApproach, greatApproach, gap, howToBridge, onChat }) => (
    <div className="border border-warmGray-200 rounded-xl overflow-hidden my-2 shadow-sm">
      {/* Your Approach */}
      <div className="bg-aristotle-50 p-4 border-b border-warmGray-200">
        <span className="text-xs font-mono uppercase text-aristotle-600 block mb-2">Your Approach</span>
        <p className="text-sm text-warmGray-700">{yourApproach}</p>
      </div>
      
      {/* Great Approach */}
      <div className="bg-zeno-50 p-4 border-b border-warmGray-200">
        <span className="text-xs font-mono uppercase text-zeno-600 block mb-2">Great Approach</span>
        <p className="text-sm text-warmGray-700">{greatApproach}</p>
      </div>
      
      {/* The Gap */}
      <div className="bg-plato-50/50 p-4 border-b border-warmGray-200">
        <span className="text-xs font-mono uppercase text-plato-600 block mb-2">The Gap</span>
        <p className="text-sm text-warmGray-700">{gap}</p>
      </div>
      
      {/* How to Bridge */}
      <div className="bg-socrates-50 p-4">
        <span className="text-xs font-mono uppercase text-socrates-600 block mb-2">How to Bridge</span>
        <p className="text-sm text-warmGray-700 mb-2">{howToBridge}</p>
        <button 
          onClick={() => onChat?.({ type: 'bridge_gap', gap, howToBridge })}
          className="text-xs font-semibold text-socrates-700 hover:text-socrates-800 flex items-center gap-1 bg-socrates-200 hover:bg-socrates-300 px-2 py-1 rounded transition-colors"
        >
          <Target className="w-3 h-3" />
          Work on this
        </button>
      </div>
    </div>
  ),
  
  'thinking-pattern': ({ pattern, score, description, onChat }) => {
    const getStatus = (v: number) => {
      if (v >= 4) return { bg: 'bg-socrates-50 border-socrates-200', text: 'text-socrates-600', value: 'text-socrates-700' };
      if (v >= 3) return { bg: 'bg-socrates-100 border-socrates-300', text: 'text-socrates-500', value: 'text-socrates-600' };
      return { bg: 'bg-aristotle-50 border-aristotle-200', text: 'text-aristotle-600', value: 'text-aristotle-700' };
    };
    
    const status = getStatus(score);
    
    return (
      <div className={`rounded-lg p-3 border my-2 shadow-sm ${status.bg}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-sm text-warmGray-900">{pattern}</span>
          <span className={`font-mono text-xl font-bold ${status.value}`}>{score.toFixed(1)}</span>
        </div>
        <p className="text-xs text-warmGray-600 mb-2">{description}</p>
        <button 
          onClick={() => onChat?.({ type: 'thinking_pattern', pattern, score })}
          className="text-xs font-semibold text-warmGray-800 hover:text-warmGray-900 flex items-center gap-1 bg-white/50 hover:bg-white px-2 py-1 rounded transition-colors"
        >
          <Lightbulb className="w-3 h-3" />
          Develop
        </button>
      </div>
    );
  },
  
  'intellectual-strength': ({ title, description, socraticTerm, onChat }) => (
    <div className="bg-mint-50/90 rounded-lg p-3 border-l-3 border-mint-500 my-2 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-green-600 text-lg">✓</span>
        <span className="font-bold text-sm text-warmGray-900">{title}</span>
      </div>
      <p className="text-sm font-medium text-warmGray-800 mb-2">{description}</p>
      <div className="flex items-center gap-2">
        {socraticTerm && (
          <span className="inline-block text-xs font-bold bg-mint-200 text-mint-800 px-2 py-1 rounded-full">
            {socraticTerm}
          </span>
        )}
        <button 
          onClick={() => onChat?.({ type: 'strength', title })}
          className="text-xs font-semibold text-mint-800 hover:text-mint-900 flex items-center gap-1 bg-mint-100 hover:bg-mint-200 px-2 py-1 rounded transition-colors"
        >
          <MessageSquare className="w-3 h-3" />
          Leverage
        </button>
      </div>
    </div>
  ),
  
  'thinking-blindspot': ({ title, description, impact, onChat }) => (
    <div className="bg-amber-50/90 rounded-lg p-3 border-l-3 border-amber-500 my-2 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-amber-600 text-lg">⚠</span>
        <span className="font-bold text-sm text-warmGray-900">{title}</span>
      </div>
      <p className="text-sm font-medium text-warmGray-800 mb-2">{description}</p>
      {impact && (
        <p className="text-xs text-amber-700 mb-2">Impact: {impact}</p>
      )}
      <button 
        onClick={() => onChat?.({ type: 'blindspot', title, description })}
        className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 bg-amber-200 hover:bg-amber-300 px-2 py-1 rounded transition-colors"
      >
        <Lightbulb className="w-3 h-3" />
        Address
      </button>
    </div>
  ),
  
  'strategy-recommendation': ({ strategy, description, difficulty, onChat }) => {
    const difficultyColors = {
      beginner: 'bg-green-50 border-green-200',
      intermediate: 'bg-amber-50 border-amber-200',
      advanced: 'bg-purple-50 border-purple-200'
    };
    
    return (
      <div className={`rounded-lg p-3 border my-2 shadow-sm ${difficultyColors[difficulty as keyof typeof difficultyColors] || difficultyColors.intermediate}`}>
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-warmGray-600" />
          <span className="font-bold text-sm text-warmGray-900">{strategy}</span>
          <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-white/50">
            {difficulty}
          </span>
        </div>
        <p className="text-sm text-warmGray-700 mb-2">{description}</p>
        <button 
          onClick={() => onChat?.({ type: 'strategy', strategy })}
          className="text-xs font-semibold text-warmGray-800 hover:text-warmGray-900 flex items-center gap-1 bg-white/50 hover:bg-white px-2 py-1 rounded transition-colors border border-warmGray-300"
        >
          <MessageSquare className="w-3 h-3" />
          Practice
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

export function SocratesAIAnalysis({ analysis, conversationId, onHighlightClick }: SocratesAIAnalysisProps) {
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
      philosopher: 'socrates',
      commenter: 'socrates',
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
      commenter: 'socrates',
      type: actionType
    }));

    const query = `?type=${encodeURIComponent(actionType)}&conversation_id=${encodeURIComponent(conversationId)}&source_conversation_id=${encodeURIComponent(conversationId)}&button=${encodeURIComponent(actionType)}&first_click=${encodeURIComponent(String(isFirstClick))}&commenter=${encodeURIComponent('socrates')}`;
    navigate(`/chat/${chatId}${query}`);
  }, [conversationId, transcriptMessages, navigate]);

  const generateAnalysis = useCallback(async () => {
    setIsStreaming(true);
    setError(null);
    setStreamedComponents([]);
    setSummary('');

    try {
      const strat = analysis.strategic_analysis;
      const components: UIComponent[] = [];

      // Add summary component first
      await new Promise(r => setTimeout(r, 300));
      setSummary(`Strategic thinking score: ${strat.score}/5.0. I've analyzed ${strat.question_analysis.questions_asked.length} questions you asked and identified ${strat.thinking_patterns.depth_score >= 4 ? 'strong' : 'developing'} depth in your thinking patterns.`);

      // Stream thinking patterns
      const patterns = [
        { name: 'Depth', score: strat.thinking_patterns.depth_score, description: 'Ability to explore topics thoroughly' },
        { name: 'Curiosity', score: strat.thinking_patterns.curiosity_score, description: 'Drive to understand and explore' },
        { name: 'Ambiguity Handling', score: strat.thinking_patterns.ambiguity_handling, description: 'Comfort with uncertainty' },
        { name: 'Strategic Framing', score: strat.thinking_patterns.strategic_framing, description: 'Structuring thoughts strategically' },
        { name: 'Authenticity', score: strat.thinking_patterns.authenticity_vs_rehearsed, description: 'Genuine vs rehearsed responses' }
      ];
      
      for (const pattern of patterns) {
        await new Promise(r => setTimeout(r, 150));
        components.push({
          type: 'thinking-pattern',
          id: `pattern-${pattern.name}`,
          priority: pattern.score >= 4 ? 'medium' : 'high',
          props: {
            pattern: pattern.name,
            score: pattern.score,
            description: pattern.description,
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream questions asked
      for (const q of strat.question_analysis.questions_asked) {
        await new Promise(r => setTimeout(r, 200));
        components.push({
          type: 'question-analysis',
          id: `question-${q.timestamp}`,
          timestamp: q.timestamp,
          priority: q.quality_score >= 4 ? 'medium' : 'high',
          props: {
            timestamp: q.timestamp,
            question: q.question,
            qualityScore: q.quality_score,
            type: q.type,
            whyItMatters: q.why_it_matters,
            onClick: onHighlightClick,
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream missed opportunities
      for (const mo of strat.question_analysis.missed_opportunities) {
        await new Promise(r => setTimeout(r, 200));
        components.push({
          type: 'missed-opportunity',
          id: `missed-${mo.timestamp}`,
          timestamp: mo.timestamp,
          priority: 'high',
          props: {
            timestamp: mo.timestamp,
            context: mo.context,
            whatToAsk: mo.what_to_ask,
            why: mo.why,
            onClick: onHighlightClick,
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream intellectual signals
      const signals = [
        { name: 'Admits Knowledge Gaps', present: strat.intellectual_signals.admits_knowledge_gaps, description: 'Openness about what you don\'t know' },
        { name: 'Challenges Assumptions', present: strat.intellectual_signals.challenges_assumptions, description: 'Critical thinking about premises' },
        { name: 'Shows Meta-Awareness', present: strat.intellectual_signals.shows_meta_awareness, description: 'Understanding of your own thinking' },
        { name: 'Learning Agility', present: strat.intellectual_signals.demonstrates_learning_agility, description: 'Ability to adapt and learn quickly' }
      ];
      
      for (const signal of signals) {
        await new Promise(r => setTimeout(r, 150));
        components.push({
          type: 'intellectual-signal',
          id: `signal-${signal.name}`,
          priority: signal.present ? 'medium' : 'low',
          props: {
            signal: signal.name,
            present: signal.present,
            description: signal.description,
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream framework metrics
      const frameworks = [
        { label: 'Uses Structured Frameworks', value: strat.response_framework_analysis.uses_structured_frameworks, type: 'boolean' },
        { label: 'Answer Completeness', value: strat.response_framework_analysis.answer_completeness, type: 'score' },
        { label: 'Storytelling Quality', value: strat.response_framework_analysis.storytelling_quality, type: 'score' },
        { label: 'Metric Usage', value: strat.response_framework_analysis.metric_usage, type: 'score' }
      ];
      
      for (const fw of frameworks) {
        await new Promise(r => setTimeout(r, 150));
        components.push({
          type: 'framework-usage',
          id: `framework-${fw.label}`,
          priority: fw.type === 'boolean' ? (fw.value ? 'low' : 'medium') : ((fw.value as number) >= 4 ? 'low' : 'medium'),
          props: {
            label: fw.label,
            value: fw.value,
            type: fw.type,
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream good vs great analysis
      for (const comp of strat.comparison.good_vs_great_analysis) {
        await new Promise(r => setTimeout(r, 250));
        components.push({
          type: 'good-vs-great',
          id: `comparison-${components.length}`,
          priority: 'high',
          props: {
            yourApproach: comp.your_approach,
            greatApproach: comp.great_approach,
            gap: comp.gap,
            howToBridge: comp.how_to_bridge,
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream intellectual strengths
      for (const strength of strat.feedback.intellectual_strengths) {
        await new Promise(r => setTimeout(r, 180));
        components.push({
          type: 'intellectual-strength',
          id: `strength-${components.length}`,
          priority: 'low',
          props: {
            title: strength.split('.')[0] || strength.substring(0, 50) + '...',
            description: strength,
            socraticTerm: 'Dialectical Excellence',
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream thinking blindspots
      for (const blindspot of strat.feedback.thinking_blindspots) {
        await new Promise(r => setTimeout(r, 180));
        components.push({
          type: 'thinking-blindspot',
          id: `blindspot-${components.length}`,
          priority: 'high',
          props: {
            title: blindspot.split('.')[0] || blindspot.substring(0, 50) + '...',
            description: blindspot,
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream framework recommendations
      for (const rec of strat.feedback.framework_recommendations) {
        await new Promise(r => setTimeout(r, 180));
        const title = rec.split(':')[0] || rec;
        components.push({
          type: 'strategy-recommendation',
          id: `framework-rec-${components.length}`,
          priority: 'medium',
          props: {
            strategy: title,
            description: rec.includes(':') ? rec.split(':').slice(1).join(':') : rec,
            difficulty: 'intermediate',
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream advanced strategies
      for (const strategy of strat.feedback.advanced_strategies) {
        await new Promise(r => setTimeout(r, 180));
        components.push({
          type: 'strategy-recommendation',
          id: `strategy-${components.length}`,
          priority: 'low',
          props: {
            strategy: strategy.split(':')[0] || strategy.substring(0, 50) + '...',
            description: strategy,
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
            <div className="w-9 h-9 rounded-full bg-socrates-200 flex items-center justify-center">
              <span className="text-lg">🏛️</span>
            </div>
            <div>
              <h2 className="font-sans font-bold text-lg tracking-tight text-warmGray-900">
                Socrates' Analysis
              </h2>
              <p className="text-xs text-warmGray-600">Strategic thinking insights...</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isStreaming && (
            <div className="flex items-center gap-1 text-xs text-socrates-700">
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
        <div className="bg-gradient-to-r from-socrates-100 to-parchment-100 rounded-lg p-3 border border-socrates-300">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-4 h-4 text-socrates-600" />
            <span className="text-xs font-bold text-socrates-800">Summary</span>
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
          <Sparkles className="w-12 h-12 text-socrates-300 mx-auto mb-4" />
          <p className="text-base font-semibold text-warmGray-700">No insights generated yet.</p>
          <button
            onClick={generateAnalysis}
            className="mt-4 text-socrates-700 hover:text-socrates-800 text-sm font-bold"
          >
            Generate Analysis
          </button>
        </div>
      )}
    </div>
  );
}
