import { useState } from 'react';
import {
  Brain,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  Sparkles,
  BookOpen,
  Search
} from 'lucide-react';
import { SocratesAnalysis as SocratesAnalysisType } from '../../lib/api';

interface SocratesAnalysisProps {
  analysis: SocratesAnalysisType;
  onTimeClick?: (timestamp: number) => void;
}

export function SocratesAnalysis({ analysis, onTimeClick }: SocratesAnalysisProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['questions', 'patterns', 'comparison', 'recommendations'])
  );

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const strat = analysis.strategic_analysis;
  const score = strat.score;

  // Score color based on 0-5 scale - using Socrates' cool palette
  const getScoreColor = (s: number) => {
    if (s >= 4) return 'text-socrates-700';
    if (s >= 3) return 'text-socrates-500';
    return 'text-warmGray-600';
  };

  const getScoreBg = (s: number) => {
    if (s >= 4) return 'bg-socrates-50 border-socrates-200';
    if (s >= 3) return 'bg-socrates-100 border-socrates-300';
    return 'bg-warmGray-100 border-warmGray-300';
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Foundational/Theoretical': '#8b5cf6',
      'Alignment/Meta-Strategic': '#3b82f6',
      'Fit/Self-Awareness': '#10b981',
      'Probing': '#f59e0b',
      'Clarifying': '#ec4899',
      'Challenging': '#ef4444'
    };
    return colors[type] || '#6b7280';
  };

  const getQuestionQualityLabel = (score: number) => {
    if (score >= 4.5) return { label: 'Exceptional', color: 'text-green-600 bg-green-50' };
    if (score >= 4) return { label: 'Strong', color: 'text-blue-600 bg-blue-50' };
    if (score >= 3) return { label: 'Good', color: 'text-yellow-600 bg-yellow-50' };
    return { label: 'Developing', color: 'text-gray-600 bg-gray-50' };
  };

  return (
    <div className="space-y-6">
      {/* Header with Score */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-socrates-200 flex items-center justify-center">
              <span className="text-2xl">🏛️</span>
            </div>
            <div>
              <h2 className="font-sans font-semibold text-2xl tracking-tight text-warmGray-900">
                Socrates Analysis
              </h2>
              <p className="text-sm text-warmGray-500">Strategic Thinking & Dialectical Inquiry</p>
            </div>
          </div>
        </div>
        <div className={`px-6 py-4 rounded-2xl border ${getScoreBg(score)} text-center`}>
          <div className={`font-mono text-4xl font-bold ${getScoreColor(score)}`}>
            {score.toFixed(1)}
          </div>
          <div className="text-xs text-warmGray-500 uppercase tracking-wider mt-1">/ 5.0</div>
        </div>
      </div>

      {/* Thinking Patterns Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <ThinkingPatternMetric
          label="Depth"
          value={strat.thinking_patterns.depth_score}
          icon={<Brain className="w-5 h-5" />}
        />
        <ThinkingPatternMetric
          label="Curiosity"
          value={strat.thinking_patterns.curiosity_score}
          icon={<Search className="w-5 h-5" />}
        />
        <ThinkingPatternMetric
          label="Ambiguity Handling"
          value={strat.thinking_patterns.ambiguity_handling}
          icon={<Target className="w-5 h-5" />}
        />
        <ThinkingPatternMetric
          label="Strategic Framing"
          value={strat.thinking_patterns.strategic_framing}
          icon={<Lightbulb className="w-5 h-5" />}
        />
        <ThinkingPatternMetric
          label="Authenticity"
          value={strat.thinking_patterns.authenticity_vs_rehearsed}
          icon={<Sparkles className="w-5 h-5" />}
        />
      </div>

      {/* Question Analysis Section */}
      <div className="bg-parchment-50 rounded-2xl border border-socrates-200/60 overflow-hidden">
        <button
          onClick={() => toggleSection('questions')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-socrates-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-socrates-600" />
            <span className="font-semibold text-warmGray-800">Question Analysis</span>
            <span className="bg-socrates-200 text-socrates-700 text-xs px-2 py-0.5 rounded-full">
              Avg: {strat.question_analysis.question_quality_avg.toFixed(1)}/5
            </span>
          </div>
          {expandedSections.has('questions') ? (
            <ChevronUp className="w-5 h-5 text-warmGray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-warmGray-400" />
          )}
        </button>

        {expandedSections.has('questions') && (
          <div className="px-6 pb-6 space-y-6">
            {/* Questions Asked */}
            <div>
              <h4 className="text-sm font-mono uppercase tracking-wider text-socrates-600 mb-4">
                Questions You Asked
              </h4>
              <div className="space-y-4">
                {strat.question_analysis.questions_asked.map((q, idx) => {
                  const qualityInfo = getQuestionQualityLabel(q.quality_score);
                  return (
                    <div
                      key={idx}
                      className="bg-parchment-100 rounded-xl p-5 border border-socrates-200/70 cursor-pointer hover:border-socrates-300 transition-colors"
                      onClick={() => onTimeClick?.(q.timestamp)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-mono text-xs text-warmGray-500">
                          {formatTimestamp(q.timestamp)}
                        </span>
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: getQuestionTypeColor(q.type) }}
                        >
                          {q.type}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${qualityInfo.color}`}>
                          {qualityInfo.label} ({q.quality_score}/5)
                        </span>
                      </div>
                      <p className="text-sm text-warmGray-800 font-medium mb-3">"{q.question}"</p>
                      <div className="bg-socrates-50/50 rounded-lg p-3 border border-socrates-200">
                        <span className="text-xs font-mono uppercase text-socrates-600 block mb-1">
                          Why This Matters
                        </span>
                        <p className="text-sm text-warmGray-700">{q.why_it_matters}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Missed Opportunities */}
            {strat.question_analysis.missed_opportunities.length > 0 && (
              <div>
                <h4 className="text-sm font-mono uppercase tracking-wider text-aristotle-600 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Missed Opportunities
                </h4>
                <div className="space-y-4">
                  {strat.question_analysis.missed_opportunities.map((mo, idx) => (
                    <div
                      key={idx}
                      className="bg-aristotle-50/50 rounded-xl p-5 border border-aristotle-200 cursor-pointer hover:border-aristotle-300 transition-colors"
                      onClick={() => onTimeClick?.(mo.timestamp)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-mono text-xs text-aristotle-600">
                          {formatTimestamp(mo.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-warmGray-600 mb-3">
                        <span className="font-medium text-warmGray-700">Context: </span>
                        {mo.context}
                      </p>
                      <div className="bg-parchment-50 rounded-lg p-4 border border-aristotle-200 mb-3">
                        <span className="text-xs font-mono uppercase text-aristotle-700 block mb-2">
                          What You Could Have Asked
                        </span>
                        <p className="text-sm text-warmGray-800 italic">"{mo.what_to_ask}"</p>
                      </div>
                      <div className="bg-socrates-50/50 rounded-lg p-3 border border-socrates-200">
                        <span className="text-xs font-mono uppercase text-socrates-600 block mb-1">
                          Why
                        </span>
                        <p className="text-sm text-warmGray-700">{mo.why}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Response Framework Analysis */}
      <div className="bg-parchment-50 rounded-2xl border border-socrates-200/60 overflow-hidden">
        <button
          onClick={() => toggleSection('patterns')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-socrates-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-socrates-600" />
            <span className="font-semibold text-warmGray-800">Response Framework & Intellectual Signals</span>
          </div>
          {expandedSections.has('patterns') ? (
            <ChevronUp className="w-5 h-5 text-warmGray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-warmGray-400" />
          )}
        </button>

        {expandedSections.has('patterns') && (
          <div className="px-6 pb-6 space-y-6">
            {/* Response Framework */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FrameworkMetric
                label="Uses Structured Frameworks"
                value={strat.response_framework_analysis.uses_structured_frameworks}
                type="boolean"
              />
              <FrameworkMetric
                label="Answer Completeness"
                value={strat.response_framework_analysis.answer_completeness}
                type="score"
              />
              <FrameworkMetric
                label="Storytelling Quality"
                value={strat.response_framework_analysis.storytelling_quality}
                type="score"
              />
              <FrameworkMetric
                label="Metric Usage"
                value={strat.response_framework_analysis.metric_usage}
                type="score"
              />
            </div>

            {/* Intellectual Signals */}
            <div>
              <h4 className="text-sm font-mono uppercase tracking-wider text-socrates-600 mb-4">
                Intellectual Signals
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <IntellectualSignal
                  label="Admits Knowledge Gaps"
                  present={strat.intellectual_signals.admits_knowledge_gaps}
                />
                <IntellectualSignal
                  label="Challenges Assumptions"
                  present={strat.intellectual_signals.challenges_assumptions}
                />
                <IntellectualSignal
                  label="Shows Meta-Awareness"
                  present={strat.intellectual_signals.shows_meta_awareness}
                />
                <IntellectualSignal
                  label="Learning Agility"
                  present={strat.intellectual_signals.demonstrates_learning_agility}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Good vs Great Comparison */}
      {strat.comparison.good_vs_great_analysis.length > 0 && (
        <div className="bg-parchment-50 rounded-2xl border border-socrates-200/60 overflow-hidden">
          <button
            onClick={() => toggleSection('comparison')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-socrates-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-socrates-600" />
              <span className="font-semibold text-warmGray-800">Good vs Great: Close the Gap</span>
            </div>
            {expandedSections.has('comparison') ? (
              <ChevronUp className="w-5 h-5 text-warmGray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-warmGray-400" />
            )}
          </button>

          {expandedSections.has('comparison') && (
            <div className="px-6 pb-6 space-y-6">
              {strat.comparison.good_vs_great_analysis.map((comp, idx) => (
                <div key={idx} className="border border-warmGray-200 rounded-xl overflow-hidden">
                  {/* Your Approach */}
                  <div className="bg-aristotle-50 p-4 border-b border-warmGray-200">
                    <span className="text-xs font-mono uppercase text-aristotle-600 block mb-2">
                      Your Approach
                    </span>
                    <p className="text-sm text-warmGray-700">{comp.your_approach}</p>
                  </div>

                  {/* Great Approach */}
                  <div className="bg-zeno-50 p-4 border-b border-warmGray-200">
                    <span className="text-xs font-mono uppercase text-zeno-600 block mb-2">
                      Great Approach
                    </span>
                    <p className="text-sm text-warmGray-700">{comp.great_approach}</p>
                  </div>

                  {/* The Gap */}
                  <div className="bg-plato-50/50 p-4 border-b border-warmGray-200">
                    <span className="text-xs font-mono uppercase text-plato-600 block mb-2">
                      The Gap
                    </span>
                    <p className="text-sm text-warmGray-700">{comp.gap}</p>
                  </div>

                  {/* How to Bridge */}
                  <div className="bg-socrates-50 p-4">
                    <span className="text-xs font-mono uppercase text-socrates-600 block mb-2">
                      How to Bridge
                    </span>
                    <p className="text-sm text-warmGray-700">{comp.how_to_bridge}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Feedback & Recommendations */}
      <div className="bg-parchment-50 rounded-2xl border border-socrates-200/60 overflow-hidden">
        <button
          onClick={() => toggleSection('recommendations')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-socrates-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-socrates-600" />
            <span className="font-semibold text-warmGray-800">Socratic Insights & Recommendations</span>
          </div>
          {expandedSections.has('recommendations') ? (
            <ChevronUp className="w-5 h-5 text-warmGray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-warmGray-400" />
          )}
        </button>

        {expandedSections.has('recommendations') && (
          <div className="px-6 pb-6 space-y-6">
            {/* Intellectual Strengths */}
            <div>
              <h4 className="text-sm font-mono uppercase tracking-wider text-socrates-600 mb-3">
                Intellectual Strengths
              </h4>
              <ul className="space-y-2">
                {strat.feedback.intellectual_strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-warmGray-700">
                    <span className="text-socrates-500 mt-1">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Thinking Blindspots */}
            <div>
              <h4 className="text-sm font-mono uppercase tracking-wider text-aristotle-600 mb-3">
                Thinking Blindspots
              </h4>
              <ul className="space-y-2">
                {strat.feedback.thinking_blindspots.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-warmGray-700">
                    <span className="text-aristotle-500 mt-1">⚠</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Framework Recommendations */}
            <div className="bg-socrates-50/50 rounded-xl p-5 border border-socrates-200">
              <h4 className="text-sm font-mono uppercase tracking-wider text-socrates-600 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Recommended Frameworks
              </h4>
              <ul className="space-y-3">
                {strat.feedback.framework_recommendations.map((fr, idx) => (
                  <li key={idx} className="text-sm text-warmGray-700 leading-relaxed">
                    <strong className="text-socrates-700">{fr.split(':')[0]}:</strong>
                    {fr.includes(':') ? fr.split(':').slice(1).join(':') : fr}
                  </li>
                ))}
              </ul>
            </div>

            {/* Advanced Strategies */}
            <div className="bg-zeno-50/50 rounded-xl p-5 border border-zeno-200">
              <h4 className="text-sm font-mono uppercase tracking-wider text-zeno-600 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Advanced Strategies
              </h4>
              <ul className="space-y-3">
                {strat.feedback.advanced_strategies.map((as, idx) => (
                  <li key={idx} className="text-sm text-warmGray-700 leading-relaxed">
                    {as}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function ThinkingPatternMetric({
  label,
  value,
  icon
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  const getStatus = (v: number) => {
    if (v >= 4) return { bg: 'bg-socrates-50 border-socrates-200', text: 'text-socrates-600', value: 'text-socrates-700' };
    if (v >= 3) return { bg: 'bg-socrates-100 border-socrates-300', text: 'text-socrates-500', value: 'text-socrates-600' };
    return { bg: 'bg-aristotle-50 border-aristotle-200', text: 'text-aristotle-600', value: 'text-aristotle-700' };
  };

  const status = getStatus(value);

  return (
    <div className={`rounded-xl p-4 border ${status.bg}`}>
      <div className={`mb-2 ${status.text}`}>{icon}</div>
      <div className={`font-mono text-2xl font-bold ${status.value}`}>{value.toFixed(1)}</div>
      <div className="text-xs text-warmGray-600 mt-1">{label}</div>
    </div>
  );
}

function FrameworkMetric({
  label,
  value,
  type
}: {
  label: string;
  value: boolean | number;
  type: 'boolean' | 'score';
}) {
  if (type === 'boolean') {
    return (
      <div className={`rounded-xl p-4 border ${value ? 'bg-socrates-50 border-socrates-200' : 'bg-parchment-100 border-warmGray-200'}`}>
        <div className={`font-mono text-xl font-bold ${value ? 'text-socrates-600' : 'text-warmGray-400'}`}>
          {value ? '✓ Yes' : '✗ No'}
        </div>
        <div className="text-xs text-warmGray-600 mt-1">{label}</div>
      </div>
    );
  }

  const numValue = value as number;
  const getStatus = (v: number) => {
    if (v >= 4) return { bg: 'bg-socrates-50 border-socrates-200', value: 'text-socrates-700' };
    if (v >= 3) return { bg: 'bg-socrates-100 border-socrates-300', value: 'text-socrates-600' };
    return { bg: 'bg-aristotle-50 border-aristotle-200', value: 'text-aristotle-700' };
  };

  const status = getStatus(numValue);

  return (
    <div className={`rounded-xl p-4 border ${status.bg}`}>
      <div className={`font-mono text-xl font-bold ${status.value}`}>{numValue.toFixed(1)}/5</div>
      <div className="text-xs text-warmGray-600 mt-1">{label}</div>
    </div>
  );
}

function IntellectualSignal({
  label,
  present
}: {
  label: string;
  present: boolean;
}) {
  return (
    <div className={`rounded-lg p-3 border flex items-center gap-2 ${present ? 'bg-socrates-50 border-socrates-200' : 'bg-parchment-100 border-warmGray-200'
      }`}>
      <span className={present ? 'text-socrates-500' : 'text-warmGray-400'}>
        {present ? '✓' : '○'}
      </span>
      <span className={`text-xs ${present ? 'text-socrates-700' : 'text-warmGray-500'}`}>
        {label}
      </span>
    </div>
  );
}
