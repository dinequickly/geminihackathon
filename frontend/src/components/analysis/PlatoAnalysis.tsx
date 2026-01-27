import { useState } from 'react';
import {
  Heart,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Sparkles,
  Clock,
  ChevronDown,
  ChevronUp,
  Eye,
  Lightbulb,
  Target,
  Shield
} from 'lucide-react';
import { PlatoAnalysis as PlatoAnalysisType } from '../../lib/api';

interface PlatoAnalysisProps {
  analysis: PlatoAnalysisType;
  duration?: number;
  onTimeClick?: (timestamp: number) => void;
}

export function PlatoAnalysis({ analysis, duration: _duration = 120, onTimeClick }: PlatoAnalysisProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['arc', 'moments', 'feedback'])
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

  const emo = analysis.emotional_analysis;
  const score = emo.score;

  // Score color based on 0-10 scale - using Plato's warm palette
  const getScoreColor = (s: number) => {
    if (s >= 8) return 'text-plato-700';
    if (s >= 6) return 'text-plato-500';
    return 'text-warmGray-600';
  };

  const getScoreBg = (s: number) => {
    if (s >= 8) return 'bg-plato-50 border-plato-200';
    if (s >= 6) return 'bg-plato-100 border-plato-300';
    return 'bg-warmGray-100 border-warmGray-300';
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      calm: '#10b981',
      confident: '#3b82f6',
      confused: '#f59e0b',
      engaged: '#8b5cf6',
      anxious: '#ef4444',
      enthusiastic: '#ec4899'
    };
    return colors[emotion.toLowerCase()] || '#6b7280';
  };

  const getMomentTypeIcon = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes('strength') || lower.includes('high eq')) return <Sparkles className="w-5 h-5 text-green-500" />;
    if (lower.includes('limitation') || lower.includes('authenticity check')) return <Shield className="w-5 h-5 text-blue-500" />;
    if (lower.includes('performed')) return <AlertCircle className="w-5 h-5 text-amber-500" />;
    return <Target className="w-5 h-5 text-purple-500" />;
  };

  const getMomentTypeBg = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes('strength') || lower.includes('high eq')) return 'bg-green-50 border-green-200';
    if (lower.includes('limitation') || lower.includes('authenticity check')) return 'bg-blue-50 border-blue-200';
    if (lower.includes('performed')) return 'bg-amber-50 border-amber-200';
    return 'bg-purple-50 border-purple-200';
  };

  return (
    <div className="space-y-6">
      {/* Header with Score */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-plato-200 flex items-center justify-center">
              <span className="text-2xl">🧠</span>
            </div>
            <div>
              <h2 className="font-sans font-semibold text-2xl tracking-tight text-warmGray-900">
                Plato Analysis
              </h2>
              <p className="text-sm text-warmGray-500">Emotional Intelligence & Self-Awareness</p>
            </div>
          </div>
        </div>
        <div className={`px-6 py-4 rounded-2xl border ${getScoreBg(score)} text-center`}>
          <div className={`font-mono text-4xl font-bold ${getScoreColor(score)}`}>
            {score.toFixed(1)}
          </div>
          <div className="text-xs text-warmGray-500 uppercase tracking-wider mt-1">/ 10.0</div>
        </div>
      </div>

      {/* Regulation Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <RegulationMetric
          label="Stress Recovery"
          value={`${emo.regulation_metrics.stress_recovery_time_avg.toFixed(1)}s`}
          description="Avg time to recover"
          icon={<Clock className="w-5 h-5" />}
          status={emo.regulation_metrics.stress_recovery_time_avg < 5 ? 'excellent' : 'good'}
        />
        <RegulationMetric
          label="Emotional Range"
          value={`${(emo.regulation_metrics.emotional_range * 100).toFixed(0)}%`}
          description="Variation in emotions"
          icon={<TrendingUp className="w-5 h-5" />}
          status={emo.regulation_metrics.emotional_range > 0.5 ? 'good' : 'warning'}
        />
        <RegulationMetric
          label="Authenticity"
          value={emo.regulation_metrics.authenticity_score.toFixed(1)}
          description="Genuine expression"
          icon={<Heart className="w-5 h-5" />}
          status={emo.regulation_metrics.authenticity_score >= 8 ? 'excellent' : 'good'}
        />
        <RegulationMetric
          label="Self-Awareness"
          value={emo.regulation_metrics.self_awareness_score.toFixed(1)}
          description="Metacognitive ability"
          icon={<Eye className="w-5 h-5" />}
          status={emo.regulation_metrics.self_awareness_score >= 8 ? 'excellent' : 'good'}
        />
      </div>

      {/* Emotional Arc Timeline */}
      {emo.emotional_arc.length > 0 && (
        <div className="bg-parchment-50 rounded-2xl border border-plato-200/60 overflow-hidden">
          <button
            onClick={() => toggleSection('arc')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-plato-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-plato-600" />
              <span className="font-semibold text-warmGray-800">Emotional Arc</span>
            </div>
            {expandedSections.has('arc') ? (
              <ChevronUp className="w-5 h-5 text-warmGray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-warmGray-400" />
            )}
          </button>

          {expandedSections.has('arc') && (
            <div className="px-6 pb-6">
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-6 text-xs">
                {['Calm', 'Confident', 'Confused', 'Engaged', 'Anxious', 'Enthusiastic'].map(emo => (
                  <div key={emo} className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getEmotionColor(emo) }}
                    />
                    <span className="text-gray-600">{emo}</span>
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                {emo.emotional_arc.map((point, idx) => (
                  <div
                    key={idx}
                    className="bg-parchment-100 rounded-xl p-4 border border-plato-200/70 cursor-pointer hover:border-plato-300 transition-colors"
                    onClick={() => onTimeClick?.(point.timestamp)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-sm text-warmGray-500">
                        {formatTimestamp(point.timestamp)}
                      </span>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: getEmotionColor(point.dominant_emotion) }}
                      >
                        {point.dominant_emotion}
                      </span>
                    </div>

                    {/* Emotion bars */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {Object.entries(point.emotions).map(([emotion, value]) => (
                        <div key={emotion} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500 capitalize">{emotion}</span>
                            <span className="text-gray-700">{(value * 100).toFixed(0)}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${value * 100}%`,
                                backgroundColor: getEmotionColor(emotion)
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {point.trigger && (
                      <p className="text-sm text-warmGray-600 border-t border-plato-200 pt-3 mt-2">
                        <span className="font-medium text-warmGray-700">Trigger: </span>
                        {point.trigger}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Key Moments */}
      {emo.key_moments.length > 0 && (
        <div className="bg-parchment-50 rounded-2xl border border-plato-200/60 overflow-hidden">
          <button
            onClick={() => toggleSection('moments')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-plato-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Lightbulb className="w-5 h-5 text-plato-600" />
              <span className="font-semibold text-warmGray-800">Key Emotional Moments</span>
              <span className="bg-plato-200 text-plato-700 text-xs px-2 py-0.5 rounded-full">
                {emo.key_moments.length}
              </span>
            </div>
            {expandedSections.has('moments') ? (
              <ChevronUp className="w-5 h-5 text-warmGray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-warmGray-400" />
            )}
          </button>

          {expandedSections.has('moments') && (
            <div className="px-6 pb-6 space-y-4">
              {emo.key_moments.map((moment, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl p-5 border ${getMomentTypeBg(moment.type)} cursor-pointer hover:shadow-md transition-all`}
                  onClick={() => onTimeClick?.(moment.timestamp)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getMomentTypeIcon(moment.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-xs text-warmGray-500">
                          {formatTimestamp(moment.timestamp)}
                        </span>
                        <span className="text-xs font-semibold text-warmGray-700 bg-parchment-50/60 px-2 py-0.5 rounded">
                          {moment.type}
                        </span>
                      </div>
                      <p className="text-sm text-warmGray-800 mb-3">{moment.description}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-warmGray-500">Emotion State:</span>
                        <span className="text-xs font-medium text-warmGray-700">{moment.emotion_state}</span>
                      </div>
                      <div className="bg-parchment-50/70 rounded-lg p-3 border border-plato-200/50">
                        <span className="text-xs font-mono uppercase text-plato-600 block mb-1">
                          Recommendation
                        </span>
                        <p className="text-sm text-warmGray-700">{moment.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Patterns */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Stress Triggers */}
        {emo.patterns.stress_triggers.length > 0 && (
          <PatternCard
            title="Stress Triggers"
            icon={<TrendingDown className="w-5 h-5 text-red-500" />}
            items={emo.patterns.stress_triggers}
            color="red"
          />
        )}

        {/* Recovery Strategies */}
        {emo.patterns.recovery_strategies.length > 0 && (
          <PatternCard
            title="Recovery Strategies"
            icon={<TrendingUp className="w-5 h-5 text-green-500" />}
            items={emo.patterns.recovery_strategies}
            color="green"
          />
        )}

        {/* Authenticity Markers */}
        {emo.patterns.authenticity_markers.length > 0 && (
          <PatternCard
            title="Authenticity Markers"
            icon={<Heart className="w-5 h-5 text-purple-500" />}
            items={emo.patterns.authenticity_markers}
            color="purple"
          />
        )}
      </div>

      {/* Performed Moments */}
      {emo.patterns.performed_moments.length > 0 && (
        <div className="bg-aristotle-100/40 rounded-2xl border border-aristotle-200 p-6">
          <h3 className="font-semibold text-warmGray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-aristotle-600" />
            Performed Moments (Less Authentic)
          </h3>
          <div className="space-y-3">
            {emo.patterns.performed_moments.map((pm, idx) => (
              <div
                key={idx}
                className="bg-parchment-50 rounded-lg p-4 border border-aristotle-200 cursor-pointer hover:border-aristotle-300 transition-colors"
                onClick={() => onTimeClick?.(pm.timestamp)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-sm text-aristotle-600">
                    {formatTimestamp(pm.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-warmGray-700">{pm.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Section */}
      <div className="bg-parchment-50 rounded-2xl border border-plato-200/60 overflow-hidden">
        <button
          onClick={() => toggleSection('feedback')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-plato-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-plato-600" />
            <span className="font-semibold text-warmGray-800">Plato's Insights</span>
          </div>
          {expandedSections.has('feedback') ? (
            <ChevronUp className="w-5 h-5 text-warmGray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-warmGray-400" />
          )}
        </button>

        {expandedSections.has('feedback') && (
          <div className="px-6 pb-6 space-y-6">
            {/* Strengths */}
            <div>
              <h4 className="text-sm font-mono uppercase tracking-wider text-plato-600 mb-3">
                Emotional Strengths
              </h4>
              <ul className="space-y-2">
                {emo.feedback.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-warmGray-700">
                    <span className="text-plato-500 mt-1">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Growth Areas */}
            <div>
              <h4 className="text-sm font-mono uppercase tracking-wider text-aristotle-600 mb-3">
                Growth Areas
              </h4>
              <ul className="space-y-2">
                {emo.feedback.growth_areas.map((a, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-warmGray-700">
                    <span className="text-aristotle-500 mt-1">→</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Coaching Insights */}
            {emo.feedback.coaching_insights.length > 0 && (
              <div className="bg-plato-50/50 rounded-xl p-5 border border-plato-200">
                <h4 className="text-sm font-mono uppercase tracking-wider text-plato-600 mb-3 flex items-center gap-2">
                  <span>🧠</span> Coaching Insights
                </h4>
                <ul className="space-y-3">
                  {emo.feedback.coaching_insights.map((insight, idx) => (
                    <li key={idx} className="text-sm text-warmGray-700 leading-relaxed">
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function RegulationMetric({
  label,
  value,
  description,
  icon,
  status
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  status: 'excellent' | 'good' | 'warning';
}) {
  const statusColors = {
    excellent: 'bg-plato-50 border-plato-200 text-plato-600',
    good: 'bg-socrates-50 border-socrates-200 text-socrates-600',
    warning: 'bg-aristotle-50 border-aristotle-200 text-aristotle-600'
  };

  const valueColors = {
    excellent: 'text-plato-700',
    good: 'text-socrates-700',
    warning: 'text-aristotle-700'
  };

  return (
    <div className={`rounded-xl p-4 border ${statusColors[status]}`}>
      <div className="mb-2">{icon}</div>
      <div className={`font-mono text-2xl font-bold ${valueColors[status]}`}>{value}</div>
      <div className="text-sm font-medium text-warmGray-800 mt-1">{label}</div>
      <div className="text-xs text-warmGray-500">{description}</div>
    </div>
  );
}

function PatternCard({
  title,
  icon,
  items,
  color
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  color: 'red' | 'green' | 'purple';
}) {
  const colorClasses = {
    red: 'bg-aristotle-50/50 border-aristotle-200',
    green: 'bg-zeno-50/50 border-zeno-200',
    purple: 'bg-plato-50/50 border-plato-200'
  };

  return (
    <div className={`rounded-2xl border p-6 ${colorClasses[color]}`}>
      <h3 className="font-semibold text-warmGray-800 mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-warmGray-700">
            <span className={
              color === 'green' ? 'text-zeno-500' :
                color === 'purple' ? 'text-plato-500' : 'text-aristotle-500'
            }>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
