import React, { useState, useEffect, useCallback } from 'react';
import { AristotleAnalysis as AristotleAnalysisType } from '../../lib/api';
import { Sparkles, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { LiquidButton } from '../LiquidButton';

interface AristotleAIAnalysisProps {
  analysis: AristotleAnalysisType;
  conversationId?: string;
  onHighlightClick?: (timestamp: number) => void;
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

// Pre-defined component renderers
const ComponentRegistry: Record<ComponentType, React.FC<any>> = {
  'rambling-moment': ({ timestamp, duration, reason, original, improved, onClick }) => (
    <div className="bg-plato-50/80 rounded-xl p-4 border-l-4 border-plato-400 my-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-mono text-plato-600 bg-plato-100 px-2 py-1 rounded">
          {formatTimestamp(timestamp)}
        </span>
        <span className="text-xs text-plato-500">Rambling Moment • {duration}s</span>
      </div>
      <p className="text-sm text-warmGray-700 mb-3">{reason}</p>
      <div className="bg-white/60 rounded-lg p-3 mb-2">
        <p className="text-xs text-warmGray-500 uppercase mb-1">Original</p>
        <p className="text-sm text-warmGray-800 italic">"{original?.substring(0, 100)}..."</p>
      </div>
      {improved && (
        <div className="bg-aristotle-50 rounded-lg p-3">
          <p className="text-xs text-aristotle-600 uppercase mb-1">Aristotle's Rewrite</p>
          <p className="text-sm text-warmGray-800">"{improved?.substring(0, 100)}..."</p>
        </div>
      )}
      <button 
        onClick={() => onClick?.(timestamp)}
        className="mt-3 text-xs text-plato-600 hover:text-plato-700 flex items-center gap-1"
      >
        Jump to moment →
      </button>
    </div>
  ),
  
  'strength-highlight': ({ title, description, aristotelianTerm }) => (
    <div className="bg-mint-50/80 rounded-xl p-4 border-l-4 border-mint-400 my-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-green-500">✓</span>
        <span className="font-semibold text-warmGray-800">{title}</span>
      </div>
      <p className="text-sm text-warmGray-700 mb-2">{description}</p>
      {aristotelianTerm && (
        <span className="inline-block text-xs bg-mint-100 text-mint-700 px-2 py-1 rounded-full">
          {aristotelianTerm}
        </span>
      )}
    </div>
  ),
  
  'improvement-area': ({ title, description, actionableTip, rhetoricalConcept }) => (
    <div className="bg-amber-50/80 rounded-xl p-4 border-l-4 border-amber-400 my-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-amber-500">→</span>
        <span className="font-semibold text-warmGray-800">{title}</span>
      </div>
      <p className="text-sm text-warmGray-700 mb-2">{description}</p>
      {actionableTip && (
        <div className="bg-white/60 rounded-lg p-3 mt-2">
          <p className="text-xs text-amber-600 uppercase mb-1">💡 Tip</p>
          <p className="text-sm text-warmGray-700">{actionableTip}</p>
        </div>
      )}
      {rhetoricalConcept && (
        <span className="inline-block text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full mt-2">
          {rhetoricalConcept}
        </span>
      )}
    </div>
  ),
  
  'specific-example': ({ timestamp, text, issue, improvement, onClick }) => (
    <div className="bg-parchment-100 rounded-xl p-4 border border-aristotle-200 my-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-mono text-aristotle-600 bg-aristotle-100 px-2 py-1 rounded">
          {formatTimestamp(timestamp)}
        </span>
        <span className="text-xs text-warmGray-500 bg-warmGray-100 px-2 py-1 rounded">
          {issue}
        </span>
      </div>
      <div className="bg-white/60 rounded-lg p-3 mb-3 border border-red-100">
        <p className="text-xs text-red-500 uppercase mb-1">Issue Detected</p>
        <p className="text-sm text-warmGray-700 italic">"{text}"</p>
      </div>
      <div className="bg-aristotle-50 rounded-lg p-3 border border-aristotle-200">
        <p className="text-xs text-aristotle-600 uppercase mb-1">Improvement</p>
        <p className="text-sm text-warmGray-800">{improvement}</p>
      </div>
      <button 
        onClick={() => onClick?.(timestamp)}
        className="mt-3 text-xs text-aristotle-600 hover:text-aristotle-700 flex items-center gap-1"
      >
        View in transcript →
      </button>
    </div>
  ),
  
  'instant-rewrite': ({ timestamp, original, improved, why, onClick }) => (
    <div className="bg-gradient-to-br from-aristotle-50 to-parchment-50 rounded-xl p-4 border border-aristotle-200 my-3">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-aristotle-500" />
        <span className="font-semibold text-warmGray-800">Aristotelian Rewrite</span>
        <span className="text-xs font-mono text-aristotle-500">
          {formatTimestamp(timestamp)}
        </span>
      </div>
      
      <div className="grid gap-3">
        <div className="bg-white/70 rounded-lg p-3">
          <p className="text-xs text-plato-600 uppercase mb-1">Original</p>
          <p className="text-sm text-warmGray-700 italic">"{original}"</p>
        </div>
        
        <div className="bg-aristotle-100/50 rounded-lg p-3 border-l-3 border-aristotle-400">
          <p className="text-xs text-aristotle-700 uppercase mb-1">Improved</p>
          <p className="text-sm text-warmGray-800">"{improved}"</p>
        </div>
        
        <div className="bg-parchment-100/50 rounded-lg p-3">
          <p className="text-xs text-warmGray-600 uppercase mb-1">Why This Works</p>
          <p className="text-sm text-warmGray-700">{why}</p>
        </div>
      </div>
      
      <button 
        onClick={() => onClick?.(timestamp)}
        className="mt-3 text-xs text-aristotle-600 hover:text-aristotle-700 flex items-center gap-1"
      >
        Practice this rewrite →
      </button>
    </div>
  ),
  
  'filler-word-cluster': ({ word, count, timestamps, suggestions }) => (
    <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-200 my-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-mono text-amber-600">"{word}"</span>
          <span className="text-sm text-amber-700">used {count} times</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {timestamps?.slice(0, 5).map((ts: number, i: number) => (
          <span key={i} className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
            {formatTimestamp(ts)}
          </span>
        ))}
        {timestamps?.length > 5 && (
          <span className="text-xs text-amber-600">+{timestamps.length - 5} more</span>
        )}
      </div>
      {suggestions && (
        <p className="text-sm text-warmGray-600">💡 {suggestions}</p>
      )}
    </div>
  ),
  
  'confidence-peak': ({ description, techniques }) => (
    <div className="bg-mint-50/60 rounded-xl p-4 border border-mint-200 my-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-green-500">★</span>
        <span className="font-semibold text-warmGray-800">Confidence Peak</span>
      </div>
      <p className="text-sm text-warmGray-700 mb-2">{description}</p>
      {techniques && (
        <div className="flex flex-wrap gap-2">
          {techniques.map((tech: string, i: number) => (
            <span key={i} className="text-xs bg-mint-100 text-mint-700 px-2 py-1 rounded-full">
              {tech}
            </span>
          ))}
        </div>
      )}
    </div>
  ),
  
  'pattern-insight': ({ pattern, explanation, recommendation, severity }) => {
    const severityColors = {
      high: 'border-red-300 bg-red-50/50',
      medium: 'border-amber-300 bg-amber-50/50',
      low: 'border-sky-300 bg-sky-50/50'
    };
    return (
      <div className={`rounded-xl p-4 border-l-4 my-3 ${severityColors[severity as keyof typeof severityColors] || severityColors.medium}`}>
        <p className="font-medium text-warmGray-800 mb-2">{pattern}</p>
        <p className="text-sm text-warmGray-700 mb-2">{explanation}</p>
        {recommendation && (
          <p className="text-sm text-warmGray-600">→ {recommendation}</p>
        )}
      </div>
    );
  }
};

const formatTimestamp = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function AristotleAIAnalysis({ analysis, onHighlightClick }: AristotleAIAnalysisProps) {
  const [streamedComponents, setStreamedComponents] = useState<UIComponent[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>('');

  const generateAnalysis = useCallback(async () => {
    setIsStreaming(true);
    setError(null);
    setStreamedComponents([]);
    setSummary('');

    try {
      // For demo purposes, we'll simulate AI streaming with the actual analysis data
      // In production, this would call generateText with the AI SDK
      
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
            suggestions: fw.word === 'um' ? 'Try pausing silently instead' : 'Consider more direct transitions'
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
            aristotelianTerm: term,
            evidence: 'Detected in transcript analysis'
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
            onClick: onHighlightClick
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
            onClick: onHighlightClick
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
              onClick: onHighlightClick
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
            rhetoricalConcept: concept
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
            severity: 'medium'
          }
        });
        setStreamedComponents([...components]);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate analysis');
    } finally {
      setIsStreaming(false);
    }
  }, [analysis, onHighlightClick]);

  useEffect(() => {
    generateAnalysis();
  }, [generateAnalysis]);

  const renderComponent = (component: UIComponent) => {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-aristotle-200 flex items-center justify-center">
              <span className="text-2xl">🎭</span>
            </div>
            <div>
              <h2 className="font-sans font-semibold text-2xl tracking-tight text-warmGray-900">
                Aristotle's AI Analysis
              </h2>
              <p className="text-sm text-warmGray-500">Streaming rhetoric insights...</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isStreaming && (
            <div className="flex items-center gap-2 text-sm text-aristotle-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing...</span>
            </div>
          )}
          <LiquidButton
            variant="ghost"
            size="sm"
            onClick={generateAnalysis}
            disabled={isStreaming}
            icon={<RefreshCw className={`w-4 h-4 ${isStreaming ? 'animate-spin' : ''}`} />}
          >
            Regenerate
          </LiquidButton>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* AI Summary */}
      {summary && (
        <div className="bg-gradient-to-r from-aristotle-50 to-parchment-50 rounded-xl p-5 border border-aristotle-200">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-aristotle-500" />
            <span className="text-sm font-medium text-aristotle-700">AI Summary</span>
          </div>
          <p className="text-warmGray-800 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* High Priority Insights */}
      {highPriority.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-mono uppercase tracking-wider text-warmGray-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            Priority Insights
          </h3>
          <div className="space-y-2">
            {highPriority.map(renderComponent)}
          </div>
        </div>
      )}

      {/* Medium Priority Insights */}
      {mediumPriority.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-mono uppercase tracking-wider text-warmGray-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Areas for Growth
          </h3>
          <div className="space-y-2">
            {mediumPriority.map(renderComponent)}
          </div>
        </div>
      )}

      {/* Low Priority / Positive */}
      {lowPriority.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-mono uppercase tracking-wider text-warmGray-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            Additional Observations
          </h3>
          <div className="space-y-2">
            {lowPriority.map(renderComponent)}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isStreaming && streamedComponents.length === 0 && !error && (
        <div className="text-center py-12">
          <Sparkles className="w-12 h-12 text-aristotle-300 mx-auto mb-4" />
          <p className="text-warmGray-600">No insights generated yet.</p>
          <button
            onClick={generateAnalysis}
            className="mt-4 text-aristotle-600 hover:text-aristotle-700 text-sm font-medium"
          >
            Generate Analysis
          </button>
        </div>
      )}
    </div>
  );
}
