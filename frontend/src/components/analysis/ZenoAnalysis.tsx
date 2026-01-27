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
    Award,
    MessageSquare
} from 'lucide-react';
import { ZenoAnalysis as ZenoAnalysisType } from '../../lib/api';

interface ZenoAnalysisProps {
    analysis: ZenoAnalysisType;
    onTimeClick?: (timestamp: number) => void;
}

export function ZenoAnalysis({ analysis }: ZenoAnalysisProps) {
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

    // Score color based on 0-10 scale - using Zeno's balanced palette
    const getScoreColor = (s: number) => {
        if (s >= 8) return 'text-zeno-700';
        if (s >= 6) return 'text-zeno-500';
        return 'text-warmGray-600';
    };

    const getScoreBg = (s: number) => {
        if (s >= 8) return 'bg-zeno-50 border-zeno-200';
        if (s >= 6) return 'bg-zeno-100 border-zeno-300';
        return 'bg-warmGray-100 border-warmGray-300';
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
                        <div className="w-12 h-12 rounded-full bg-zeno-200 flex items-center justify-center">
                            <span className="text-2xl">📹</span>
                        </div>
                        <div>
                            <h2 className="font-sans font-semibold text-2xl tracking-tight text-warmGray-900">
                                Zeno Analysis
                            </h2>
                            <p className="text-sm text-warmGray-500">Visual Presence & Body Language Mastery</p>
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

            {/* Visual Metrics Section */}
            <div className="bg-parchment-50 rounded-2xl border border-zeno-200/60 overflow-hidden">
                <button
                    onClick={() => toggleSection('metrics')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-zeno-50/50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Eye className="w-5 h-5 text-zeno-600" />
                        <span className="font-semibold text-warmGray-800">Visual Presence Metrics</span>
                    </div>
                    {expandedSections.has('metrics') ? (
                        <ChevronUp className="w-5 h-5 text-warmGray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-warmGray-400" />
                    )}
                </button>

                {expandedSections.has('metrics') && (
                    <div className="px-6 pb-6 space-y-6">
                        {/* Visual Metrics */}
                        <div>
                            <h4 className="text-xs font-mono uppercase tracking-wider text-warmGray-500 mb-4">
                                Visual Metrics
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <PresenceMetric
                                    label="Eye Contact"
                                    value={presence.visual_metrics.eye_contact_score.toFixed(1)}
                                    description="Direct gaze and engagement"
                                    icon={<Eye className="w-5 h-5" />}
                                    status={getMetricStatus(presence.visual_metrics.eye_contact_score)}
                                />
                                <PresenceMetric
                                    label="Posture"
                                    value={presence.visual_metrics.posture_score.toFixed(1)}
                                    description="Openness and confidence"
                                    icon={<TrendingUp className="w-5 h-5" />}
                                    status={getMetricStatus(presence.visual_metrics.posture_score)}
                                />
                                <PresenceMetric
                                    label="Gestures"
                                    value={presence.visual_metrics.gesture_effectiveness.toFixed(1)}
                                    description="Purposeful hand movements"
                                    icon={<Zap className="w-5 h-5" />}
                                    status={getMetricStatus(presence.visual_metrics.gesture_effectiveness)}
                                />
                                <PresenceMetric
                                    label="Expressiveness"
                                    value={presence.visual_metrics.facial_expressiveness.toFixed(1)}
                                    description="Range of emotions conveyed"
                                    icon={<Sparkles className="w-5 h-5" />}
                                    status={getMetricStatus(presence.visual_metrics.facial_expressiveness)}
                                />
                                <PresenceMetric
                                    label="Energy Level"
                                    value={presence.visual_metrics.energy_level.toFixed(1)}
                                    description="Enthusiasm and vitality"
                                    icon={<Target className="w-5 h-5" />}
                                    status={getMetricStatus(presence.visual_metrics.energy_level)}
                                />
                            </div>
                        </div>

                        {/* Executive Presence Factors */}
                        <div>
                            <h4 className="text-xs font-mono uppercase tracking-wider text-warmGray-500 mb-4">
                                Executive Presence Factors
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <PresenceMetric
                                    label="Gravitas"
                                    value={presence.executive_presence_factors.gravitas.toFixed(1)}
                                    description="Weight and seriousness"
                                    icon={<Award className="w-5 h-5" />}
                                    status={getMetricStatus(presence.executive_presence_factors.gravitas)}
                                />
                                <PresenceMetric
                                    label="Confidence"
                                    value={presence.executive_presence_factors.confidence_without_arrogance.toFixed(1)}
                                    description="Self-assurance and poise"
                                    icon={<Shield className="w-5 h-5" />}
                                    status={getMetricStatus(presence.executive_presence_factors.confidence_without_arrogance)}
                                />
                                <PresenceMetric
                                    label="Intellectual Honesty"
                                    value={presence.executive_presence_factors.intellectual_honesty.toFixed(1)}
                                    description="Integrity and transparency"
                                    icon={<Lightbulb className="w-5 h-5" />}
                                    status={getMetricStatus(presence.executive_presence_factors.intellectual_honesty)}
                                />
                                <PresenceMetric
                                    label="Composure Under Pressure"
                                    value={presence.executive_presence_factors.composure_under_pressure.toFixed(1)}
                                    description="Calmness in challenging situations"
                                    icon={<Target className="w-5 h-5" />}
                                    status={getMetricStatus(presence.executive_presence_factors.composure_under_pressure)}
                                />
                            </div>
                        </div>

                        {/* Body Language Patterns */}
                        <div>
                            <h4 className="text-xs font-mono uppercase tracking-wider text-warmGray-500 mb-4">
                                Body Language Consistency
                            </h4>
                            <div className={`rounded-xl p-4 border ${getScoreBg(presence.body_language_patterns.consistency_score)}`}>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-warmGray-700">Consistency Score</span>
                                    <span className={`font-mono text-2xl font-bold ${getScoreColor(presence.body_language_patterns.consistency_score)}`}>
                                        {presence.body_language_patterns.consistency_score}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Nervous Habits */}
                        {presence.body_language_patterns.nervous_habits.length > 0 && (
                            <div className="bg-aristotle-50/50 rounded-xl p-5 border border-aristotle-100">
                                <h4 className="text-sm font-semibold text-warmGray-800 mb-3 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-aristotle-600" />
                                    Nervous Habits Detected
                                </h4>
                                <ul className="space-y-2">
                                    {presence.body_language_patterns.nervous_habits.map((habit, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-warmGray-700">
                                            <span className="text-aristotle-500 mt-1">•</span>
                                            <span>{habit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Power Poses */}
                        {presence.body_language_patterns.power_poses.length > 0 && (
                            <div className="bg-zeno-50/50 rounded-xl p-5 border border-zeno-100">
                                <h4 className="text-sm font-semibold text-warmGray-800 mb-3 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-zeno-600" />
                                    Power Poses Identified
                                </h4>
                                <ul className="space-y-2">
                                    {presence.body_language_patterns.power_poses.map((pose, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-warmGray-700">
                                            <span className="text-zeno-500 mt-1">✓</span>
                                            <span>{pose}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Defensive Moments */}
                        {presence.body_language_patterns.defensive_moments.length > 0 && (
                            <div className="bg-aristotle-50/50 rounded-xl p-5 border border-aristotle-100">
                                <h4 className="text-sm font-semibold text-warmGray-800 mb-3 flex items-center gap-2">
                                    <TrendingDown className="w-4 h-4 text-aristotle-600" />
                                    Defensive Moments
                                </h4>
                                <ul className="space-y-2">
                                    {presence.body_language_patterns.defensive_moments.map((moment, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-warmGray-700">
                                            <span className="text-aristotle-500 mt-1">•</span>
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
                <div className="bg-parchment-50 rounded-2xl border border-zeno-200/60 overflow-hidden">
                    <button
                        onClick={() => toggleSection('comparison')}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-zeno-50/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-socrates-600" />
                            <span className="font-semibold text-warmGray-800">Comparison to Top Performers</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${presence.comparison_to_top_performers.overall_delta >= 0
                                ? 'bg-zeno-100 text-zeno-700'
                                : 'bg-aristotle-100 text-aristotle-700'
                                }`}>
                                {presence.comparison_to_top_performers.overall_delta >= 0 ? '+' : ''}
                                {presence.comparison_to_top_performers.overall_delta} delta
                            </span>
                        </div>
                        {expandedSections.has('comparison') ? (
                            <ChevronUp className="w-5 h-5 text-warmGray-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-warmGray-400" />
                        )}
                    </button>

                    {expandedSections.has('comparison') && (
                        <div className="px-6 pb-6">
                            <div className="mb-6 bg-zeno-50/50 rounded-xl p-4 border border-zeno-200">
                                <h4 className="text-sm font-mono uppercase tracking-wider text-zeno-600 mb-3">
                                    Overall Delta from Top Performers
                                </h4>
                                <div className="flex items-center gap-4">
                                    <span className={`font-mono text-3xl font-bold ${presence.comparison_to_top_performers.overall_delta >= 0 ? 'text-zeno-700' : 'text-aristotle-700'}`}>
                                        {presence.comparison_to_top_performers.overall_delta >= 0 ? '+' : ''}{presence.comparison_to_top_performers.overall_delta.toFixed(1)}
                                    </span>
                                    <span className="text-sm text-warmGray-500">points difference from top 10%</span>
                                </div>
                            </div>
                            {presence.comparison_to_top_performers.specific_gaps.map((gap, idx) => (
                                <div key={idx} className="border border-zeno-200 rounded-xl overflow-hidden">
                                    <div className="bg-zeno-50 p-4 border-b border-zeno-200">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-warmGray-800">{gap.area}</span>
                                            <div className="flex items-center gap-4">
                                                <div className="text-center">
                                                    <div className={`font-mono text-lg font-bold ${getScoreColor(gap.your_score)}`}>
                                                        {gap.your_score.toFixed(1)}
                                                    </div>
                                                    <div className="text-xs text-warmGray-500">You</div>
                                                </div>
                                                <div className="text-warmGray-300">vs</div>
                                                <div className="text-center">
                                                    <div className="font-mono text-lg font-bold text-zeno-600">
                                                        {gap.top_10_avg.toFixed(1)}
                                                    </div>
                                                    <div className="text-xs text-warmGray-500">Top 10%</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-parchment-100">
                                        <span className="text-xs font-mono uppercase text-zeno-600 block mb-2">
                                            How to Improve
                                        </span>
                                        <p className="text-sm text-warmGray-700">{gap.improvement}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Feedback Section */}
            <div className="bg-parchment-50 rounded-2xl border border-zeno-200/60 overflow-hidden">
                <button
                    onClick={() => toggleSection('feedback')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-zeno-50/50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-zeno-600" />
                        <span className="font-semibold text-warmGray-800">Zeno's Visual Insights</span>
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
                            <h4 className="text-sm font-mono uppercase tracking-wider text-zeno-600 mb-3">
                                Visual Strengths
                            </h4>
                            <ul className="space-y-2">
                                {presence.feedback.what_works.map((s, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-warmGray-700">
                                        <span className="text-zeno-500 mt-1">✓</span>
                                        <span>{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Areas for Improvement */}
                        <div>
                            <h4 className="text-sm font-mono uppercase tracking-wider text-aristotle-600 mb-3">
                                Areas for Improvement
                            </h4>
                            <ul className="space-y-2">
                                {presence.feedback.what_needs_work.map((a, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-warmGray-700">
                                        <span className="text-aristotle-500 mt-1">→</span>
                                        <span>{a}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Quick Fixes */}
                        {presence.feedback.quick_wins.length > 0 && (
                            <div className="bg-zeno-50/50 rounded-xl p-5 border border-zeno-200">
                                <h4 className="text-sm font-mono uppercase tracking-wider text-zeno-600 mb-3 flex items-center gap-2">
                                    <Zap className="w-4 h-4" />
                                    Quick Fixes
                                </h4>
                                <ul className="space-y-3">
                                    {presence.feedback.quick_wins.map((fix, idx) => (
                                        <li key={idx} className="text-sm text-warmGray-700 leading-relaxed">
                                            <strong className="text-zeno-700">{idx + 1}.</strong> {fix}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Advanced Techniques */}
                        {presence.feedback.advanced_techniques.length > 0 && (
                            <div className="bg-socrates-50/50 rounded-xl p-5 border border-socrates-100">
                                <h4 className="text-sm font-mono uppercase tracking-wider text-socrates-600 mb-3 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Advanced Techniques
                                </h4>
                                <ul className="space-y-3">
                                    {presence.feedback.advanced_techniques.map((tech, idx) => (
                                        <li key={idx} className="text-sm text-warmGray-700 leading-relaxed">
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

// Helper Components
function PresenceMetric({
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
        excellent: 'bg-zeno-50 border-zeno-200 text-zeno-600',
        good: 'bg-socrates-50 border-socrates-200 text-socrates-600',
        warning: 'bg-aristotle-50 border-aristotle-200 text-aristotle-600'
    };

    const valueColors = {
        excellent: 'text-zeno-700',
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
