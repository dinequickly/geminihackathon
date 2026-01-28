import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, AristotleAnalysis as AristotleAnalysisType } from '../../lib/api';
import { Sparkles, Loader2, RefreshCw, AlertCircle, MessageSquare, Lightbulb, Eye } from 'lucide-react';
import { LiquidButton } from '../LiquidButton';

interface AristotleAIAnalysisProps {
  analysis: AristotleAnalysisType;
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
  | 'rambling-moment'
  | 'strength-highlight'
  | 'improvement-area'
  | 'specific-example'
  | 'instant-rewrite'
  | 'filler-word-cluster'
  | 'confidence-peak'
  | 'pattern-insight';

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

// Pre-defined component renderers - SMALLER CARDS
const createComponentRegistry = (_navigate: any, _conversationId?: string): Record<ComponentType, React.FC<any>> => ({
  'rambling-moment': ({ timestamp, duration, reason, original, improved, onClick, onChat }) => (
    <div className="bg-plato-50/80 rounded-lg p-3 border-l-3 border-plato-400 my-2 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-mono font-semibold text-plato-700 bg-plato-200 px-2 py-1 rounded">
          {formatTimestamp(timestamp)}
        </span>
        <span className="text-xs font-semibold text-plato-600">Rambling • {duration}s</span>
      </div>
      <p className="text-sm font-medium text-warmGray-800 mb-2 leading-relaxed">{reason}</p>
      <div className="bg-white/80 rounded p-2 mb-2 border border-plato-200">
        <p className="text-[10px] font-bold text-plato-600 uppercase mb-1">Original</p>
        <p className="text-sm text-warmGray-800 italic">"{original?.substring(0, 100)}..."</p>
      </div>
      {improved && (
        <div className="bg-aristotle-100/60 rounded p-2 border border-aristotle-300">
          <p className="text-[10px] font-bold text-aristotle-700 uppercase mb-1">Rewrite</p>
          <p className="text-sm font-semibold text-warmGray-900">"{improved?.substring(0, 100)}..."</p>
        </div>
      )}
      <div className="flex items-center gap-2 mt-2">
        <button 
          onClick={() => onClick?.(timestamp)}
          className="text-xs font-semibold text-plato-700 hover:text-plato-800 flex items-center gap-1 bg-plato-100 hover:bg-plato-200 px-2 py-1.5 rounded transition-colors"
        >
          <Eye className="w-3 h-3" />
          View
        </button>
        <button 
          onClick={() => onChat?.({ type: 'improve', timestamp, context: original, improved })}
          className="text-xs font-semibold text-aristotle-700 hover:text-aristotle-800 flex items-center gap-1 bg-aristotle-100 hover:bg-aristotle-200 px-2 py-1.5 rounded transition-colors"
        >
          <Lightbulb className="w-3 h-3" />
          Improve
        </button>
      </div>
    </div>
  ),
  
  'strength-highlight': ({ title, description, aristotelianTerm }) => (
    <div className="bg-mint-50/90 rounded-lg p-3 border-l-3 border-mint-500 my-2 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-green-600 text-lg">✓</span>
        <span className="font-bold text-sm text-warmGray-900">{title}</span>
      </div>
      <p className="text-sm font-medium text-warmGray-800 mb-2 leading-relaxed">{description}</p>
      {aristotelianTerm && (
        <span className="inline-block text-xs font-bold bg-mint-200 text-mint-800 px-2 py-1 rounded-full">
          {aristotelianTerm}
        </span>
      )}
    </div>
  ),
  
  'improvement-area': ({ title, description, actionableTip, rhetoricalConcept, onChat }) => (
    <div className="bg-amber-50/90 rounded-lg p-3 border-l-3 border-amber-500 my-2 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-amber-600 text-lg">→</span>
        <span className="font-bold text-sm text-warmGray-900">{title}</span>
      </div>
      <p className="text-sm font-medium text-warmGray-800 mb-2 leading-relaxed">{description}</p>
      {actionableTip && (
        <div className="bg-white/80 rounded p-2 mt-2 border border-amber-200">
          <p className="text-[10px] font-bold text-amber-700 uppercase mb-1">💡 Tip</p>
          <p className="text-sm text-warmGray-800">{actionableTip}</p>
        </div>
      )}
      <div className="flex items-center gap-2 mt-2">
        {rhetoricalConcept && (
          <span className="inline-block text-xs font-bold bg-amber-200 text-amber-800 px-2 py-1 rounded-full">
            {rhetoricalConcept}
          </span>
        )}
        <button 
          onClick={() => onChat?.({ type: 'explain', title, description })}
          className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 bg-amber-200 hover:bg-amber-300 px-2 py-1 rounded-full transition-colors"
        >
          <MessageSquare className="w-3 h-3" />
          Explain
        </button>
      </div>
    </div>
  ),
  
  'specific-example': ({ timestamp, text, issue, improvement, onClick, onChat }) => (
    <div className="bg-parchment-100 rounded-lg p-3 border border-aristotle-300 my-2 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-mono font-bold text-aristotle-800 bg-aristotle-200 px-2 py-1 rounded">
          {formatTimestamp(timestamp)}
        </span>
        <span className="text-xs font-bold text-warmGray-700 bg-warmGray-200 px-2 py-1 rounded">
          {issue}
        </span>
      </div>
      <div className="bg-white/90 rounded p-2 mb-2 border border-red-200">
        <p className="text-[10px] font-bold text-red-600 uppercase mb-1">Issue</p>
        <p className="text-sm font-semibold text-warmGray-900 italic leading-relaxed">"{text?.substring(0, 120)}..."</p>
      </div>
      <div className="bg-aristotle-100 rounded p-2 border border-aristotle-300">
        <p className="text-[10px] font-bold text-aristotle-800 uppercase mb-1">Fix</p>
        <p className="text-sm font-semibold text-warmGray-900 leading-relaxed">{improvement}</p>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <button 
          onClick={() => onClick?.(timestamp)}
          className="text-xs font-semibold text-aristotle-800 hover:text-aristotle-900 flex items-center gap-1 bg-aristotle-200 hover:bg-aristotle-300 px-2 py-1.5 rounded transition-colors"
        >
          <Eye className="w-3 h-3" />
          View
        </button>
        <button 
          onClick={() => onChat?.({ type: 'explain_rewrite', timestamp, text, improvement })}
          className="text-xs font-semibold text-warmGray-800 hover:text-warmGray-900 flex items-center gap-1 bg-warmGray-200 hover:bg-warmGray-300 px-2 py-1.5 rounded transition-colors"
        >
          <Lightbulb className="w-3 h-3" />
          What to say?
        </button>
      </div>
    </div>
  ),
  
  'instant-rewrite': ({ timestamp, original, improved, why, onClick, onChat }) => (
    <div className="bg-gradient-to-br from-aristotle-100 to-parchment-100 rounded-lg p-3 border border-aristotle-300 my-2 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-aristotle-600" />
        <span className="font-bold text-sm text-warmGray-900">Rewrite</span>
        <span className="text-xs font-mono font-bold text-aristotle-700 bg-aristotle-200 px-2 py-1 rounded">
          {formatTimestamp(timestamp)}
        </span>
      </div>
      
      <div className="grid gap-2">
        <div className="bg-white/90 rounded p-2 border border-plato-200">
          <p className="text-[10px] font-bold text-plato-700 uppercase mb-1">Original</p>
          <p className="text-sm font-semibold text-warmGray-800 italic leading-relaxed">"{original?.substring(0, 100)}..."</p>
        </div>
        
        <div className="bg-aristotle-200/70 rounded p-2 border-l-3 border-aristotle-600">
          <p className="text-[10px] font-bold text-aristotle-800 uppercase mb-1">Improved</p>
          <p className="text-sm font-bold text-warmGray-900 leading-relaxed">"{improved?.substring(0, 100)}..."</p>
        </div>
        
        <div className="bg-parchment-100 rounded p-2 border border-warmGray-300">
          <p className="text-[10px] font-bold text-warmGray-700 uppercase mb-1">Why</p>
          <p className="text-sm text-warmGray-800 leading-relaxed">{why}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-2">
        <button 
          onClick={() => onClick?.(timestamp)}
          className="text-xs font-semibold text-aristotle-800 hover:text-aristotle-900 flex items-center gap-1 bg-aristotle-300 hover:bg-aristotle-400 px-2 py-1.5 rounded transition-colors"
        >
          <Eye className="w-3 h-3" />
          Practice
        </button>
        <button 
          onClick={() => onChat?.({ type: 'practice', timestamp, original, improved })}
          className="text-xs font-semibold text-warmGray-800 hover:text-warmGray-900 flex items-center gap-1 bg-warmGray-200 hover:bg-warmGray-300 px-2 py-1.5 rounded transition-colors"
        >
          <MessageSquare className="w-3 h-3" />
          Help
        </button>
      </div>
    </div>
  ),
  
  'filler-word-cluster': ({ word, count, timestamps, suggestions, onChat }) => (
    <div className="bg-amber-50/80 rounded-lg p-3 border border-amber-300 my-2 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold font-mono text-amber-700">"{word}"</span>
          <span className="text-sm font-bold text-amber-800">{count}×</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {timestamps?.slice(0, 5).map((ts: number, i: number) => (
          <span key={i} className="text-xs font-semibold bg-amber-200 text-amber-800 px-2 py-1 rounded">
            {formatTimestamp(ts)}
          </span>
        ))}
        {timestamps?.length > 5 && (
          <span className="text-xs font-bold text-amber-700">+{timestamps.length - 5}</span>
        )}
      </div>
      {suggestions && (
        <p className="text-sm text-warmGray-700 mb-2">💡 {suggestions}</p>
      )}
      <button 
        onClick={() => onChat?.({ type: 'filler_help', word, count })}
        className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 bg-amber-200 hover:bg-amber-300 px-2 py-1.5 rounded transition-colors"
      >
        <Lightbulb className="w-3 h-3" />
        Reduce fillers?
      </button>
    </div>
  ),
  
  'confidence-peak': ({ description, techniques }) => (
    <div className="bg-mint-50/90 rounded-lg p-3 border border-mint-400 my-2 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-green-600 text-lg">★</span>
        <span className="font-bold text-sm text-warmGray-900">Confidence Peak</span>
      </div>
      <p className="text-sm font-semibold text-warmGray-800 mb-2 leading-relaxed">{description}</p>
      {techniques && (
        <div className="flex flex-wrap gap-1.5">
          {techniques.map((tech: string, i: number) => (
            <span key={i} className="text-xs font-bold bg-mint-200 text-mint-800 px-2 py-1 rounded-full">
              {tech}
            </span>
          ))}
        </div>
      )}
    </div>
  ),
  
  'pattern-insight': ({ pattern, explanation, recommendation, severity, onChat }) => {
    const severityColors = {
      high: 'border-red-400 bg-red-50/80 border',
      medium: 'border-amber-400 bg-amber-50/80 border',
      low: 'border-sky-400 bg-sky-50/80 border'
    };
    return (
      <div className={`rounded-lg p-3 my-2 shadow-sm ${severityColors[severity as keyof typeof severityColors] || severityColors.medium}`}>
        <p className="font-bold text-sm text-warmGray-900 mb-2">{pattern}</p>
        <p className="text-sm text-warmGray-800 mb-2 leading-relaxed">{explanation}</p>
        {recommendation && (
          <p className="text-sm font-semibold text-warmGray-700 mb-2">→ {recommendation}</p>
        )}
        <button 
          onClick={() => onChat?.({ type: 'pattern_help', pattern, explanation })}
          className="text-xs font-semibold text-warmGray-800 hover:text-warmGray-900 flex items-center gap-1 bg-white/80 hover:bg-white px-2 py-1.5 rounded transition-colors border border-warmGray-300"
        >
          <MessageSquare className="w-3 h-3" />
          Work on this
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

export function AristotleAIAnalysis({ analysis, conversationId, onHighlightClick }: AristotleAIAnalysisProps) {
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
    
    // Build the full payload matching TranscriptViewer format
    const highlightedText = chatData.context || chatData.original || chatData.text || '';
    
    const payload = {
      id: chatId,
      conversation_id: conversationId,  // Original conversation ID (results page)
      source_conversation_id: conversationId,
      button_clicked: actionType,
      first_click: isFirstClick,
      highlighted_text: highlightedText,
      messages: transcriptMessages,
      type: actionType,
      highlight_id: chatId,
      highlight_message: highlightedText,
      philosopher: 'aristotle',
      commenter: 'aristotle',
      emotions_at_time: {
        timestamp_ms: chatData.timestamp ? chatData.timestamp * 1000 : Date.now(),
        face_top5: [],
        prosody_top5: []
      },
      chat_context: chatData
    };
    
    // Send to webhook without waiting
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
      commenter: 'aristotle',
      type: actionType
    }));

    // Navigate to chat
    const query = `?type=${encodeURIComponent(actionType)}&conversation_id=${encodeURIComponent(conversationId)}&source_conversation_id=${encodeURIComponent(conversationId)}&button=${encodeURIComponent(actionType)}&first_click=${encodeURIComponent(String(isFirstClick))}&commenter=${encodeURIComponent('aristotle')}`;
    navigate(`/chat/${chatId}${query}`);
  }, [conversationId, transcriptMessages, navigate]);

  const generateAnalysis = useCallback(async () => {
    setIsStreaming(true);
    setError(null);
    setStreamedComponents([]);
    setSummary('');

    try {
      const comm = analysis.communication_analysis;
      const components: UIComponent[] = [];

      // Add summary component first
      await new Promise(r => setTimeout(r, 300));
      setSummary(`Overall rhetoric score: ${comm.score}/5.0. I've analyzed your communication patterns and identified key strengths in ${comm.patterns.confidence_peaks.length} areas, with ${comm.patterns.hesitation_triggers.length} opportunities for refinement.`);

      // Stream filler word clusters
      for (const fw of comm.metrics.filler_words) {
        await new Promise(r => setTimeout(r, 150));
        components.push({
          type: 'filler-word-cluster',
          id: `filler-${fw.word}`,
          priority: fw.count > 5 ? 'high' : 'medium',
          props: {
            word: fw.word,
            count: fw.count,
            timestamps: fw.timestamps,
            suggestions: fw.word === 'um' ? 'Try pausing silently instead' : 'Consider more direct transitions',
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream strengths
      for (const strength of comm.feedback.strengths) {
        await new Promise(r => setTimeout(r, 200));
        const term = strength.match(/\(([^)]+)\)/)?.[1] || 'Rhetoric';
        components.push({
          type: 'strength-highlight',
          id: `strength-${components.length}`,
          priority: 'high',
          props: {
            title: strength.split('.')[0],
            description: strength,
            aristotelianTerm: term
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream rambling moments with rewrites
      for (const rm of comm.patterns.rambling_moments) {
        await new Promise(r => setTimeout(r, 250));
        const rewrite = comm.instant_rewrites.find(rw => 
          Math.abs(rw.timestamp - rm.timestamp) < 5
        );
        components.push({
          type: 'rambling-moment',
          id: `ramble-${rm.timestamp}`,
          timestamp: rm.timestamp,
          priority: 'high',
          props: {
            timestamp: rm.timestamp,
            duration: rm.duration,
            reason: rm.reason,
            original: rewrite?.original,
            improved: rewrite?.improved,
            onClick: onHighlightClick,
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream specific examples
      for (const ex of comm.feedback.specific_examples) {
        await new Promise(r => setTimeout(r, 200));
        components.push({
          type: 'specific-example',
          id: `example-${ex.timestamp}`,
          timestamp: ex.timestamp,
          priority: 'high',
          props: {
            timestamp: ex.timestamp,
            text: ex.text,
            issue: ex.issue,
            improvement: ex.improvement,
            onClick: onHighlightClick,
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream instant rewrites not already shown
      for (const rw of comm.instant_rewrites) {
        const alreadyShown = components.some(c => 
          c.type === 'rambling-moment' && Math.abs((c.timestamp || 0) - rw.timestamp) < 5
        );
        if (!alreadyShown) {
          await new Promise(r => setTimeout(r, 200));
          components.push({
            type: 'instant-rewrite',
            id: `rewrite-${rw.timestamp}`,
            timestamp: rw.timestamp,
            priority: 'medium',
            props: {
              timestamp: rw.timestamp,
              original: rw.original,
              improved: rw.improved,
              why: rw.why,
              onClick: onHighlightClick,
              onChat: handleChatRequest
            }
          });
          setStreamedComponents([...components]);
        }
      }

      // Stream improvement areas
      for (const area of comm.feedback.areas_for_improvement) {
        await new Promise(r => setTimeout(r, 180));
        const concept = area.match(/\(([^)]+)\)/)?.[1] || 'Refinement';
        components.push({
          type: 'improvement-area',
          id: `improve-${components.length}`,
          priority: 'medium',
          props: {
            title: area.split(':')[0] || area.substring(0, 50) + '...',
            description: area,
            actionableTip: 'Practice with shorter, declarative sentences',
            rhetoricalConcept: concept,
            onChat: handleChatRequest
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream confidence peaks
      for (const peak of comm.patterns.confidence_peaks) {
        await new Promise(r => setTimeout(r, 150));
        components.push({
          type: 'confidence-peak',
          id: `peak-${components.length}`,
          priority: 'high',
          props: {
            description: peak,
            techniques: ['Strong Ethos', 'Clear Logos', 'Effective Lexis']
          }
        });
        setStreamedComponents([...components]);
      }

      // Stream pattern insights
      if (comm.patterns.hesitation_triggers.length > 0) {
        await new Promise(r => setTimeout(r, 200));
        components.push({
          type: 'pattern-insight',
          id: 'hesitation-pattern',
          priority: 'medium',
          props: {
            pattern: 'Hesitation Triggers Detected',
            explanation: `You show hesitation when: ${comm.patterns.hesitation_triggers.join(', ')}`,
            recommendation: 'Prepare transition phrases for these topics',
            severity: 'medium',
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
      {/* Header - Smaller */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-full bg-aristotle-200 flex items-center justify-center">
              <span className="text-lg">🎭</span>
            </div>
            <div>
              <h2 className="font-sans font-bold text-lg tracking-tight text-warmGray-900">
                Aristotle's Analysis
              </h2>
              <p className="text-xs text-warmGray-600">Rhetoric insights...</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isStreaming && (
            <div className="flex items-center gap-1 text-xs text-aristotle-700">
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

      {/* Error - Smaller */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-xs font-semibold text-red-700">{error}</p>
        </div>
      )}

      {/* AI Summary - Smaller */}
      {summary && (
        <div className="bg-gradient-to-r from-aristotle-100 to-parchment-100 rounded-lg p-3 border border-aristotle-300">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-4 h-4 text-aristotle-600" />
            <span className="text-xs font-bold text-aristotle-800">Summary</span>
          </div>
          <p className="text-sm font-medium text-warmGray-900 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* High Priority Insights - Smaller spacing */}
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

      {/* Medium Priority Insights - Smaller spacing */}
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

      {/* Low Priority / Positive - Smaller spacing */}
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
          <Sparkles className="w-12 h-12 text-aristotle-300 mx-auto mb-4" />
          <p className="text-base font-semibold text-warmGray-700">No insights generated yet.</p>
          <button
            onClick={generateAnalysis}
            className="mt-4 text-aristotle-700 hover:text-aristotle-800 text-sm font-bold"
          >
            Generate Analysis
          </button>
        </div>
      )}
    </div>
  );
}
