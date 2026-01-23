import { useState } from 'react';
import { Users, ArrowRight, Lightbulb } from 'lucide-react';

interface ComparisonData {
  area: string;
  your_score: number;
  top_10_avg: number;
  improvement: string;
}

interface ComparisonModeProps {
  comparisons: ComparisonData[];
  overallDelta: number;
}

export function ComparisonMode({ comparisons, overallDelta }: ComparisonModeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!comparisons || comparisons.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-left">
            <h2 className="font-sans font-semibold text-2xl tracking-tight text-black">
              Compare to Top Performers
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {overallDelta >= 0
                ? `You're ${overallDelta}% above top 10% average`
                : `${Math.abs(overallDelta)}% gap to top 10% average`}
            </p>
          </div>
        </div>
        <div className={`text-2xl transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ↓
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-6 space-y-6">
          {comparisons.map((comparison, idx) => (
            <div key={idx} className="bg-gradient-to-br from-purple-50/60 to-indigo-50/40 rounded-xl p-6 border border-purple-100/50">
              {/* Area Header */}
              <h3 className="font-semibold text-lg text-purple-900 mb-4">{comparison.area}</h3>

              {/* Score Comparison */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Your Score */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">
                    YOUR SCORE
                  </div>
                  <div className={`text-3xl font-mono ${
                    comparison.your_score >= comparison.top_10_avg
                      ? 'text-green-600'
                      : 'text-orange-600'
                  }`}>
                    {comparison.your_score}
                  </div>
                </div>

                {/* Top 10% Average */}
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="text-xs font-mono uppercase tracking-widest text-purple-600 mb-2">
                    TOP 10% AVG
                  </div>
                  <div className="text-3xl font-mono text-purple-700">
                    {comparison.top_10_avg}
                  </div>
                </div>
              </div>

              {/* Visual Gap Indicator */}
              <div className="relative h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
                {/* Your progress */}
                <div
                  className={`absolute h-full rounded-full transition-all ${
                    comparison.your_score >= comparison.top_10_avg
                      ? 'bg-green-500'
                      : 'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min(100, comparison.your_score)}%` }}
                />
                {/* Top 10% marker */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-purple-600"
                  style={{ left: `${Math.min(100, comparison.top_10_avg)}%` }}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <span className="text-[10px] font-mono text-purple-600">TOP 10%</span>
                  </div>
                </div>
              </div>

              {/* Improvement Suggestion */}
              <div className="bg-white/80 rounded-lg p-4 border border-gray-200/50">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-1">
                      💡 HOW TO IMPROVE
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {comparison.improvement}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Overall Summary */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What This Means</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {overallDelta >= 0
                    ? `You're performing ${overallDelta}% above the top 10% of candidates. Focus on maintaining consistency and refining your strengths.`
                    : `Closing a ${Math.abs(overallDelta)}% gap is achievable with focused practice. Prioritize the highest-impact improvements first.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
