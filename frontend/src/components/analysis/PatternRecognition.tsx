import { TrendingDown, TrendingUp, Lightbulb } from 'lucide-react';

interface PatternRecognitionProps {
  communicationPatterns?: {
    hesitation_triggers: string[];
    confidence_peaks: string[];
    rambling_moments: Array<{ timestamp: number; duration: number; reason: string }>;
  };
  emotionalPatterns?: {
    stress_triggers: string[];
    recovery_strategies: string[];
    authenticity_markers: string[];
  };
  bodyLanguagePatterns?: {
    nervous_habits: Array<{ habit: string; frequency: number }>;
    power_poses: Array<{ timestamp: number; type: string }>;
  };
}

export function PatternRecognition({
  communicationPatterns,
  emotionalPatterns,
  bodyLanguagePatterns
}: PatternRecognitionProps) {
  const hasPatterns =
    (communicationPatterns?.hesitation_triggers.length ?? 0) > 0 ||
    (communicationPatterns?.confidence_peaks.length ?? 0) > 0 ||
    (emotionalPatterns?.stress_triggers.length ?? 0) > 0 ||
    (bodyLanguagePatterns?.nervous_habits.length ?? 0) > 0;

  if (!hasPatterns) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8">
      <h2 className="font-sans font-semibold text-3xl tracking-tight text-black mb-6">
        Behavioral Patterns
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hesitation Triggers */}
        {communicationPatterns && communicationPatterns.hesitation_triggers.length > 0 && (
          <div className="bg-red-50/50 rounded-xl p-6 border border-red-100/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-lg text-red-900">Hesitation Triggers</h3>
            </div>
            <ul className="space-y-2">
              {communicationPatterns.hesitation_triggers.map((trigger, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-red-800">
                  <span className="text-red-400 flex-shrink-0">├─</span>
                  <span>{trigger}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Confidence Peaks */}
        {communicationPatterns && communicationPatterns.confidence_peaks.length > 0 && (
          <div className="bg-green-50/50 rounded-xl p-6 border border-green-100/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg text-green-900">Confidence Peaks</h3>
            </div>
            <ul className="space-y-2">
              {communicationPatterns.confidence_peaks.map((peak, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-green-800">
                  <span className="text-green-400 flex-shrink-0">├─</span>
                  <span>{peak}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Stress Triggers */}
        {emotionalPatterns && emotionalPatterns.stress_triggers.length > 0 && (
          <div className="bg-orange-50/50 rounded-xl p-6 border border-orange-100/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg text-orange-900">Stress Triggers</h3>
            </div>
            <ul className="space-y-2">
              {emotionalPatterns.stress_triggers.map((trigger, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-orange-800">
                  <span className="text-orange-400 flex-shrink-0">├─</span>
                  <span>{trigger}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recovery Strategies */}
        {emotionalPatterns && emotionalPatterns.recovery_strategies.length > 0 && (
          <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg text-blue-900">Recovery Strategies</h3>
            </div>
            <ul className="space-y-2">
              {emotionalPatterns.recovery_strategies.map((strategy, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                  <span className="text-blue-400 flex-shrink-0">├─</span>
                  <span>{strategy}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Nervous Habits */}
        {bodyLanguagePatterns && bodyLanguagePatterns.nervous_habits.length > 0 && (
          <div className="bg-purple-50/50 rounded-xl p-6 border border-purple-100/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg text-purple-900">Nervous Habits</h3>
            </div>
            <ul className="space-y-2">
              {bodyLanguagePatterns.nervous_habits.map((habit, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-purple-800">
                  <span className="text-purple-400 flex-shrink-0">├─</span>
                  <span>{habit.habit} <span className="text-purple-600 font-mono text-xs">({habit.frequency}x)</span></span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Power Moments */}
        {bodyLanguagePatterns && bodyLanguagePatterns.power_poses.length > 0 && (
          <div className="bg-indigo-50/50 rounded-xl p-6 border border-indigo-100/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-lg text-indigo-900">Power Moments</h3>
            </div>
            <ul className="space-y-2">
              {bodyLanguagePatterns.power_poses.slice(0, 3).map((pose, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-indigo-800">
                  <span className="text-indigo-400 flex-shrink-0">├─</span>
                  <span>{pose.type}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recommendation */}
      <div className="mt-6 bg-gray-50 rounded-xl p-6 border border-gray-100">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">RECOMMENDATION</h4>
            <p className="text-gray-700 leading-relaxed">
              {communicationPatterns && communicationPatterns.hesitation_triggers.length > 0
                ? 'Practice the "Metric First" framework: Lead with the number, then explain it. This reduces hesitation when quantifying results.'
                : 'Continue building on your confidence peaks. Record these moments and study what makes them effective.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
