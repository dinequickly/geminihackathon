import { useState } from 'react';
import {
    Eye,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Lightbulb,
    Target,
    Sparkles,
    Shield,
    Zap,
    Award
} from 'lucide-react';
import { ZenoAnalysis as ZenoAnalysisType } from '../../lib/api';

interface ZenoAnalysisProps {
    analysis: ZenoAnalysisType;
    onTimeClick?: (timestamp: number) => void;
}

export function ZenoAnalysis({ analysis, onTimeClick }: ZenoAnalysisProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set(['metrics', 'comparison', 'feedback'])
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

    const presence = analysis.presence_analysis;
    const score = presence.score;

    // Score color based on 0-100 scale
    const getScoreColor = (s: number) => {
        if (s >= 80) return 'text-green-600';
        if (s >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBg = (s: number) => {
        if (s >= 80) return 'bg-green-50 border-green-200';
        if (s >= 60) return 'bg-yellow-50 border-yellow-200';
        return 'bg-red-50 border-red-200';
    };

    const getMetricStatus = (s: number) => {
        if (s >= 80) return 'excellent';
        if (s >= 60) return 'good';
        return 'warning';
    };

    return (
        <div className="space-y-6">
            {/* Header with Score */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-2xl">👁️</span>
                        </div>
                        <div>
                            <h2 className="font-sans font-semibold text-2xl tracking-tight text-black">
                                Zeno Analysis
                            </h2>
                            <p className="text-sm text-gray-500">Executive Presence & Visual Impact</p>
                        </div>
                    </div>
                </div>
                <div className={`px-6 py-4 rounded-2xl border ${getScoreBg(score)} text-center`}>
                    <div className={`font-mono text-4xl font-bold ${getScoreColor(score)}`}>
                        {score}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">/ 100</div>
                </div>
            </div>

            {/* Visual Metrics Grid */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button
                    onClick={() => toggleSection('metrics')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Eye className="w-5 h-5 text-indigo-600" />
                        <span className="font-semibold text-gray-900">Visual & Presence Metrics</span>
                    </div>
                    {expandedSections.has('metrics') ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                </button>

                {expandedSections.has('metrics') && (
                    <div className="px-6 pb-6 space-y-6">
                        {/* Visual Metrics */}
                        <div>
                            <h4 className="text-xs font-mono uppercase tracking-wider text-gray-500 mb-4">
                                Visual Metrics
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <PresenceMetric
                                    label="Eye Contact"
                                    value={presence.visual_metrics.eye_contact_score}
                                    icon={<Eye className="w-5 h-5" />}
                                    status={getMetricStatus(presence.visual_metrics.eye_contact_score)}
                                />
                                <PresenceMetric
                                    label="Posture"
                                    value={presence.visual_metrics.posture_score}
                                    icon={<TrendingUp className="w-5 h-5" />}
                                    status={getMetricStatus(presence.visual_metrics.posture_score)}
                                />
                                <PresenceMetric
                                    label="Gestures"
                                    value={presence.visual_metrics.gesture_effectiveness}
                                    icon={<Zap className="w-5 h-5" />}
                                    status={getMetricStatus(presence.visual_metrics.gesture_effectiveness)}
                                />
                                <PresenceMetric
                                    label="Expressiveness"
                                    value={presence.visual_metrics.facial_expressiveness}
                                    icon={<Sparkles className="w-5 h-5" />}
                                    status={getMetricStatus(presence.visual_metrics.facial_expressiveness)}
                                />
                                <PresenceMetric
                                    label="Energy Level"
                                    value={presence.visual_metrics.energy_level}
                                    icon={<Target className="w-5 h-5" />}
                                    status={getMetricStatus(presence.visual_metrics.energy_level)}
                                />
                            </div>
                        </div>

                        {/* Executive Presence Factors */}
                        <div>
                            <h4 className="text-xs font-mono uppercase tracking-wider text-gray-500 mb-4">
                                Executive Presence Factors
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <PresenceMetric
                                    label="Gravitas"
                                    value={presence.executive_presence_factors.gravitas}
                                    icon={<Award className="w-5 h-5" />}
                                    status={getMetricStatus(presence.executive_presence_factors.gravitas)}
                                />
                                <PresenceMetric
                                    label="Confidence"
                                    value={presence.executive_presence_factors.confidence_without_arrogance}
                                    icon={<Shield className="w-5 h-5" />}
                                    status={getMetricStatus(presence.executive_presence_factors.confidence_without_arrogance)}
                                />
                                <PresenceMetric
                                    label="Intellectual Honesty"
                                    value={presence.executive_presence_factors.intellectual_honesty}
                                    icon={<Lightbulb className="w-5 h-5" />}
                                    status={getMetricStatus(presence.executive_presence_factors.intellectual_honesty)}
                                />
                                <PresenceMetric
                                    label="Composure Under Pressure"
                                    value={presence.executive_presence_factors.composure_under_pressure}
                                    icon={<Target className="w-5 h-5" />}
                                    status={getMetricStatus(presence.executive_presence_factors.composure_under_pressure)}
                                />
                            </div>
                        </div>

                        {/* Body Language Patterns */}
                        <div>
                            <h4 className="text-xs font-mono uppercase tracking-wider text-gray-500 mb-4">
                                Body Language Consistency
                            </h4>
                            <div className={`rounded-xl p-4 border ${getScoreBg(presence.body_language_patterns.consistency_score)}`}>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">Consistency Score</span>
                                    <span className={`font-mono text-2xl font-bold ${getScoreColor(presence.body_language_patterns.consistency_score)}`}>
                                        {presence.body_language_patterns.consistency_score}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Nervous Habits */}
                        {presence.body_language_patterns.nervous_habits.length > 0 && (
                            <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-100">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-amber-600" />
                                    Nervous Habits Detected
                                </h4>
                                <ul className="space-y-2">
                                    {presence.body_language_patterns.nervous_habits.map((habit, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                            <span className="text-amber-500 mt-1">•</span>
                                            <span>{habit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Power Poses */}
                        {presence.body_language_patterns.power_poses.length > 0 && (
                            <div className="bg-green-50/50 rounded-xl p-5 border border-green-100">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                    Power Poses Identified
                                </h4>
                                <ul className="space-y-2">
                                    {presence.body_language_patterns.power_poses.map((pose, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                            <span className="text-green-500 mt-1">✓</span>
                                            <span>{pose}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Defensive Moments */}
                        {presence.body_language_patterns.defensive_moments.length > 0 && (
                            <div className="bg-red-50/50 rounded-xl p-5 border border-red-100">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <TrendingDown className="w-4 h-4 text-red-600" />
                                    Defensive Moments
                                </h4>
                                <ul className="space-y-2">
                                    {presence.body_language_patterns.defensive_moments.map((moment, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                            <span className="text-red-500 mt-1">•</span>
                                            <span>{moment}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Comparison to Top Performers */}
            {presence.comparison_to_top_performers.specific_gaps.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <button
                        onClick={() => toggleSection('comparison')}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-gray-900">Comparison to Top Performers</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${presence.comparison_to_top_performers.overall_delta >= 0
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                {presence.comparison_to_top_performers.overall_delta >= 0 ? '+' : ''}
                                {presence.comparison_to_top_performers.overall_delta} delta
                            </span>
                        </div>
                        {expandedSections.has('comparison') ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                    </button>

                    {expandedSections.has('comparison') && (
                        <div className="px-6 pb-6 space-y-4">
                            {presence.comparison_to_top_performers.specific_gaps.map((gap, idx) => (
                                <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                                    <div className="bg-gray-50 p-4 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-gray-900">{gap.area}</span>
                                            <div className="flex items-center gap-4">
                                                <div className="text-center">
                                                    <div className={`font-mono text-lg font-bold ${getScoreColor(gap.your_score)}`}>
                                                        {gap.your_score}
                                                    </div>
                                                    <div className="text-xs text-gray-500">You</div>
                                                </div>
                                                <div className="text-gray-300">vs</div>
                                                <div className="text-center">
                                                    <div className="font-mono text-lg font-bold text-green-600">
                                                        {gap.top_10_avg}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Top 10%</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-indigo-50/50">
                                        <span className="text-xs font-mono uppercase text-indigo-600 block mb-2">
                                            How to Improve
                                        </span>
                                        <p className="text-sm text-gray-700">{gap.improvement}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Feedback Section */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button
                    onClick={() => toggleSection('feedback')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Lightbulb className="w-5 h-5 text-indigo-600" />
                        <span className="font-semibold text-gray-900">Zeno's Insights</span>
                    </div>
                    {expandedSections.has('feedback') ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                </button>

                {expandedSections.has('feedback') && (
                    <div className="px-6 pb-6 space-y-6">
                        {/* What Works */}
                        {presence.feedback.what_works.length > 0 && (
                            <div>
                                <h4 className="text-sm font-mono uppercase tracking-wider text-green-600 mb-3">
                                    What Works
                                </h4>
                                <ul className="space-y-2">
                                    {presence.feedback.what_works.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                            <span className="text-green-500 mt-1">✓</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* What Needs Work */}
                        {presence.feedback.what_needs_work.length > 0 && (
                            <div>
                                <h4 className="text-sm font-mono uppercase tracking-wider text-amber-600 mb-3">
                                    What Needs Work
                                </h4>
                                <ul className="space-y-2">
                                    {presence.feedback.what_needs_work.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                            <span className="text-amber-500 mt-1">→</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Quick Wins */}
                        {presence.feedback.quick_wins.length > 0 && (
                            <div className="bg-green-50/50 rounded-xl p-5 border border-green-100">
                                <h4 className="text-sm font-mono uppercase tracking-wider text-green-600 mb-3 flex items-center gap-2">
                                    <Zap className="w-4 h-4" />
                                    Quick Wins
                                </h4>
                                <ul className="space-y-3">
                                    {presence.feedback.quick_wins.map((win, idx) => (
                                        <li key={idx} className="text-sm text-gray-700 leading-relaxed">
                                            {win}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Advanced Techniques */}
                        {presence.feedback.advanced_techniques.length > 0 && (
                            <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100">
                                <h4 className="text-sm font-mono uppercase tracking-wider text-indigo-600 mb-3 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Advanced Techniques
                                </h4>
                                <ul className="space-y-3">
                                    {presence.feedback.advanced_techniques.map((tech, idx) => (
                                        <li key={idx} className="text-sm text-gray-700 leading-relaxed">
                                            {tech}
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

// Helper Component
function PresenceMetric({
    label,
    value,
    icon,
    status
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    status: 'excellent' | 'good' | 'warning';
}) {
    const statusColors = {
        excellent: 'bg-green-50 border-green-100 text-green-600',
        good: 'bg-blue-50 border-blue-100 text-blue-600',
        warning: 'bg-amber-50 border-amber-100 text-amber-600'
    };

    const valueColors = {
        excellent: 'text-green-700',
        good: 'text-blue-700',
        warning: 'text-amber-700'
    };

    return (
        <div className={`rounded-xl p-4 border ${statusColors[status]}`}>
            <div className="mb-2">{icon}</div>
            <div className={`font-mono text-2xl font-bold ${valueColors[status]}`}>{value}</div>
            <div className="text-xs text-gray-600 mt-1">{label}</div>
        </div>
    );
}
