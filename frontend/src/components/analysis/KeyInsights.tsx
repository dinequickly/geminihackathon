import { AlertCircle, Sparkles, Target } from 'lucide-react';

export interface KeyInsight {
  type: 'pattern' | 'strength' | 'focus_area';
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

interface KeyInsightsProps {
  insights: KeyInsight[];
}

export function KeyInsights({ insights }: KeyInsightsProps) {
  if (!insights || insights.length === 0) {
    return null;
  }

  const getInsightIcon = (type: KeyInsight['type']) => {
    switch (type) {
      case 'pattern':
        return <AlertCircle className="w-5 h-5" />;
      case 'strength':
        return <Sparkles className="w-5 h-5" />;
      case 'focus_area':
        return <Target className="w-5 h-5" />;
    }
  };

  const getInsightColors = (type: KeyInsight['type']) => {
    switch (type) {
      case 'pattern':
        return {
          bg: 'bg-amber-50/80',
          border: 'border-amber-200/50',
          icon: 'text-amber-600',
          title: 'text-amber-900',
          label: 'bg-amber-100 text-amber-700'
        };
      case 'strength':
        return {
          bg: 'bg-green-50/80',
          border: 'border-green-200/50',
          icon: 'text-green-600',
          title: 'text-green-900',
          label: 'bg-green-100 text-green-700'
        };
      case 'focus_area':
        return {
          bg: 'bg-blue-50/80',
          border: 'border-blue-200/50',
          icon: 'text-blue-600',
          title: 'text-blue-900',
          label: 'bg-blue-100 text-blue-700'
        };
    }
  };

  const getTypeLabel = (type: KeyInsight['type']) => {
    switch (type) {
      case 'pattern':
        return '⚠️ PATTERN DETECTED';
      case 'strength':
        return '✅ STRENGTH IDENTIFIED';
      case 'focus_area':
        return '🎯 FOCUS AREA';
    }
  };

  return (
    <div className="space-y-4">
      {insights.map((insight, idx) => {
        const colors = getInsightColors(insight.type);
        const icon = getInsightIcon(insight.type);
        const label = getTypeLabel(insight.type);

        return (
          <div
            key={idx}
            className={`rounded-2xl ${colors.bg} p-6 border ${colors.border} transition-all hover:shadow-md`}
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 ${colors.icon}`}>
                {icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-mono uppercase tracking-widest font-semibold ${colors.label} px-2 py-1 rounded`}>
                    {label}
                  </span>
                  {insight.priority === 'high' && (
                    <span className="text-[10px] font-mono uppercase tracking-widest font-semibold bg-red-100 text-red-700 px-2 py-1 rounded">
                      HIGH PRIORITY
                    </span>
                  )}
                </div>
                <h3 className={`font-semibold text-lg ${colors.title} mb-2`}>
                  {insight.title}
                </h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {insight.description}
                </p>
                <div className="bg-white/60 rounded-lg p-3 border border-gray-200/50">
                  <span className="text-xs font-mono uppercase tracking-wider text-gray-500 block mb-1">
                    → Action
                  </span>
                  <p className="text-sm text-gray-800 font-medium">
                    {insight.action}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
