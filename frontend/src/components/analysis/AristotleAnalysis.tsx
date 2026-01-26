import { useState } from 'react';
import {
  MessageSquare,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Sparkles,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react';
import { AristotleAnalysis as AristotleAnalysisType } from '../../lib/api';

interface AristotleAnalysisProps {
  analysis: AristotleAnalysisType;
}

export function AristotleAnalysis({ analysis }: AristotleAnalysisProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['metrics', 'feedback', 'rewrites'])
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

  const comm = analysis.communication_analysis;
  const score = comm.score;

  // Score color based on 0-5 scale
  const getScoreColor = (s: number) => {
    if (s >= 4) return 'text-green-600';
    if (s >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (s: number) => {
    if (s >= 4) return 'bg-green-50 border-green-200';
    if (s >= 3) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Score */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-2xl">🎭</span>
            </div>
            <div>
              <h2 className="font-sans font-semibold text-2xl tracking-tight text-black">
                Aristotle Analysis
              </h2>
              <p className="text-sm text-gray-500">Rhetoric & Communication Mastery</p>
            </div>
          </div>
        </div>
        <div className={`px-6 py-4 rounded-2xl border ${getScoreBg(score)} text-center`}>
          <div className={`font-mono text-4xl font-bold ${getScoreColor(score)}`}>
            {score.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">/ 5.0</div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection('metrics')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-600" />
            <span className="font-semibold text-gray-900">Communication Metrics</span>
          </div>
          {expandedSections.has('metrics') ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.has('metrics') && (
          <div className="px-6 pb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Speaking Pace"
              value={`${comm.metrics.speaking_pace_wpm}`}
              unit="WPM"
              icon={<MessageSquare className="w-4 h-4" />}
              status={comm.metrics.speaking_pace_wpm > 180 ? 'warning' : 'good'}
            />
            <MetricCard
              label="Filler Words"
              value={`${comm.metrics.filler_word_count}`}
              unit="total"
              icon={<AlertCircle className="w-4 h-4" />}
              status={comm.metrics.filler_word_count > 10 ? 'warning' : 'good'}
            />
            <MetricCard
              label="Vocabulary Richness"
              value={`${(comm.metrics.vocabulary_richness * 100).toFixed(0)}%`}
              icon={<Sparkles className="w-4 h-4" />}
              status={comm.metrics.vocabulary_richness > 0.6 ? 'good' : 'warning'}
            />
            <MetricCard
              label="Technical Clarity"
              value={comm.metrics.technical_clarity_score.toFixed(1)}
              unit="/ 5"
              icon={<TrendingUp className="w-4 h-4" />}
              status={comm.metrics.technical_clarity_score >= 4 ? 'good' : 'warning'}
            />
            <MetricCard
              label="Transition Quality"
              value={comm.metrics.transition_quality.toFixed(1)}
              unit="/ 5"
              icon={<RefreshCw className="w-4 h-4" />}
              status={comm.metrics.transition_quality >= 4 ? 'good' : 'warning'}
            />
            <MetricCard
              label="Avg Sentence Length"
              value={comm.metrics.avg_sentence_length.toFixed(1)}
              unit="words"
              icon={<MessageSquare className="w-4 h-4" />}
              status={comm.metrics.avg_sentence_length > 25 ? 'warning' : 'good'}
            />
            <MetricCard
              label="Hedging Language"
              value={`${comm.metrics.hedging_language_count}`}
              unit="instances"
              icon={<AlertCircle className="w-4 h-4" />}
              status={comm.metrics.hedging_language_count > 5 ? 'warning' : 'good'}
            />
          </div>
        )}
      </div>

      {/* Filler Words Breakdown */}
      {comm.metrics.filler_words.length > 0 && (
        <div className="bg-amber-50/50 rounded-2xl border border-amber-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Filler Word Breakdown
          </h3>
          <div className="flex flex-wrap gap-3">
            {comm.metrics.filler_words.map((fw, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg px-4 py-2 border border-amber-200 flex items-center gap-2"
              >
                <span className="font-mono text-amber-700">"{fw.word}"</span>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
                  {fw.count}x
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patterns */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Hesitation Triggers */}
        {comm.patterns.hesitation_triggers.length > 0 && (
          <PatternCard
            title="Hesitation Triggers"
            icon={<TrendingDown className="w-5 h-5 text-red-500" />}
            items={comm.patterns.hesitation_triggers}
            color="red"
          />
        )}

        {/* Confidence Peaks */}
        {comm.patterns.confidence_peaks.length > 0 && (
          <PatternCard
            title="Confidence Peaks"
            icon={<TrendingUp className="w-5 h-5 text-green-500" />}
            items={comm.patterns.confidence_peaks}
            color="green"
          />
        )}
      </div>

      {/* Rambling Moments */}
      {comm.patterns.rambling_moments.length > 0 && (
        <div className="bg-orange-50/50 rounded-2xl border border-orange-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            Rambling Moments
          </h3>
          <div className="space-y-3">
            {comm.patterns.rambling_moments.map((rm, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 border border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-sm text-orange-600">
                    {formatTimestamp(rm.timestamp)}
                  </span>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                    {rm.duration}s duration
                  </span>
                </div>
                <p className="text-sm text-gray-700">{rm.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Section */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection('feedback')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Feedback & Insights</span>
          </div>
          {expandedSections.has('feedback') ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSections.has('feedback') && (
          <div className="px-6 pb-6 space-y-6">
            {/* Strengths */}
            <div>
              <h4 className="text-sm font-mono uppercase tracking-wider text-green-600 mb-3">
                Strengths
              </h4>
              <ul className="space-y-2">
                {comm.feedback.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div>
              <h4 className="text-sm font-mono uppercase tracking-wider text-amber-600 mb-3">
                Areas for Improvement
              </h4>
              <ul className="space-y-2">
                {comm.feedback.areas_for_improvement.map((a, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-amber-500 mt-1">→</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Specific Examples */}
            {comm.feedback.specific_examples.length > 0 && (
              <div>
                <h4 className="text-sm font-mono uppercase tracking-wider text-blue-600 mb-3">
                  Specific Examples
                </h4>
                <div className="space-y-4">
                  {comm.feedback.specific_examples.map((ex, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-xs text-gray-500">
                          {formatTimestamp(ex.timestamp)}
                        </span>
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                          {ex.issue}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 italic mb-3">"{ex.text}"</p>
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <span className="text-xs font-mono uppercase text-green-600 block mb-1">
                          Improvement
                        </span>
                        <p className="text-sm text-green-800">{ex.improvement}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instant Rewrites */}
      {comm.instant_rewrites.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection('rewrites')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-gray-900">Aristotelian Rewrites</span>
              <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                {comm.instant_rewrites.length}
              </span>
            </div>
            {expandedSections.has('rewrites') ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSections.has('rewrites') && (
            <div className="px-6 pb-6 space-y-6">
              {comm.instant_rewrites.map((rw, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-500">
                      {formatTimestamp(rw.timestamp)}
                    </span>
                  </div>

                  {/* Original */}
                  <div className="bg-red-50/50 rounded-xl p-4 border border-red-200">
                    <span className="text-xs font-mono uppercase text-red-600 block mb-2">
                      Original
                    </span>
                    <p className="text-sm text-gray-700 italic">"{rw.original}"</p>
                  </div>

                  {/* Improved */}
                  <div className="bg-green-50/50 rounded-xl p-4 border border-green-200">
                    <span className="text-xs font-mono uppercase text-green-600 block mb-2">
                      Improved
                    </span>
                    <p className="text-sm text-gray-800">"{rw.improved}"</p>
                  </div>

                  {/* Why */}
                  <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-200">
                    <span className="text-xs font-mono uppercase text-purple-600 block mb-2">
                      Why This Works
                    </span>
                    <p className="text-sm text-gray-700">{rw.why}</p>
                  </div>

                  {idx < comm.instant_rewrites.length - 1 && (
                    <hr className="border-gray-100 my-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper Components
function MetricCard({
  label,
  value,
  unit,
  icon,
  status
}: {
  label: string;
  value: string;
  unit?: string;
  icon: React.ReactNode;
  status: 'good' | 'warning';
}) {
  return (
    <div className={`rounded-xl p-4 border ${
      status === 'good' ? 'bg-green-50/50 border-green-100' : 'bg-amber-50/50 border-amber-100'
    }`}>
      <div className={`mb-2 ${status === 'good' ? 'text-green-600' : 'text-amber-600'}`}>
        {icon}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`font-mono text-2xl font-bold ${
          status === 'good' ? 'text-green-700' : 'text-amber-700'
        }`}>
          {value}
        </span>
        {unit && <span className="text-xs text-gray-500">{unit}</span>}
      </div>
      <div className="text-xs text-gray-600 mt-1">{label}</div>
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
  color: 'red' | 'green';
}) {
  const colorClasses = {
    red: 'bg-red-50/50 border-red-100',
    green: 'bg-green-50/50 border-green-100'
  };

  return (
    <div className={`rounded-2xl border p-6 ${colorClasses[color]}`}>
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
            <span className={color === 'green' ? 'text-green-500' : 'text-red-500'}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
