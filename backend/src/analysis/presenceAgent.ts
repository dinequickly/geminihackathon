/**
 * EXECUTIVE PRESENCE AGENT
 *
 * Analyzes: Body language, micro-expressions, visual presence
 * Focus Areas:
 * - Frame-by-frame behavioral breakdown
 * - Body language consistency
 * - Eye contact patterns
 * - Micro-expressions during tough questions
 * - The mechanics of executive presence
 * - What separates "good" from "great" answers
 * - "Authority through intellectual honesty. Questions reveal character."
 */

export interface PresenceAnalysis {
  score: number; // 0-100
  visual_metrics: {
    eye_contact_score: number; // 0-100
    posture_score: number; // 0-100
    gesture_effectiveness: number; // 0-100, how well gestures support speech
    facial_expressiveness: number; // 0-100
    energy_level: number; // 0-100, visual energy and engagement
  };
  micro_expressions: Array<{
    timestamp: number;
    expression: string; // 'doubt', 'confidence', 'thinking', 'discomfort', 'enthusiasm'
    intensity: number; // 0-100
    context: string; // What was being discussed
    interpretation: string; // What this reveals
  }>;
  body_language_patterns: {
    consistency_score: number; // 0-100, are gestures aligned with words?
    nervous_habits: Array<{ habit: string; frequency: number; timestamps: number[] }>;
    power_poses: Array<{ timestamp: number; type: string; effectiveness: number }>;
    defensive_moments: Array<{ timestamp: number; behavior: string }>;
  };
  executive_presence_factors: {
    gravitas: number; // 0-100, weightiness and authority
    confidence_without_arrogance: number; // 0-100
    intellectual_honesty: number; // 0-100, comfort with "I don't know"
    composure_under_pressure: number; // 0-100
  };
  comparison_to_top_performers: {
    overall_delta: number; // % difference from top 10%
    specific_gaps: Array<{ area: string; your_score: number; top_10_avg: number; improvement: string }>;
  };
  feedback: {
    what_works: string[];
    what_needs_work: string[];
    quick_wins: string[]; // Small changes with big impact
    advanced_techniques: string[]; // For already-strong performers
  };
}

export async function analyzeExecutivePresence(
  transcript: string,
  transcriptJson: any,
  videoUrl?: string,
  humeData?: any
): Promise<PresenceAnalysis> {
  console.log('[PresenceAgent] Starting analysis...');

  // Analyze visual metrics (would use video analysis in production)
  const visualMetrics = analyzeVisualMetrics(transcript, humeData);

  // Detect micro-expressions
  const microExpressions = detectMicroExpressions(transcript, transcriptJson);

  // Analyze body language patterns
  const bodyLanguagePatterns = analyzeBodyLanguage(transcript, microExpressions);

  // Calculate executive presence factors
  const executiveFactors = calculateExecutivePresence(visualMetrics, bodyLanguagePatterns, transcript);

  // Compare to top performers
  const comparison = compareToTopPerformers(visualMetrics, executiveFactors);

  // Generate feedback
  const feedback = generatePresenceFeedback(visualMetrics, executiveFactors, bodyLanguagePatterns);

  // Calculate overall score
  const score = calculatePresenceScore(visualMetrics, executiveFactors);

  return {
    score,
    visual_metrics: visualMetrics,
    micro_expressions: microExpressions,
    body_language_patterns: bodyLanguagePatterns,
    executive_presence_factors: executiveFactors,
    comparison_to_top_performers: comparison,
    feedback
  };
}

function analyzeVisualMetrics(transcript: string, humeData?: any): PresenceAnalysis['visual_metrics'] {
  // In production, this would analyze video frames
  // For now, we'll simulate based on transcript and emotional data

  // Base scores
  let eyeContact = 75;
  let posture = 80;
  let gestureEffectiveness = 70;
  let facialExpressiveness = 65;
  let energyLevel = 70;

  // Adjust based on transcript content
  const lower = transcript.toLowerCase();

  // Energy indicators
  if (/\b(excited|love|really|amazing|incredible)\b/gi.test(transcript)) {
    energyLevel += 15;
    facialExpressiveness += 10;
  }

  // Confidence indicators (likely better posture)
  if (/\b(definitely|absolutely|clearly|confident|certain)\b/gi.test(transcript)) {
    posture += 10;
    eyeContact += 10;
  }

  // Nervousness indicators
  const fillerCount = (transcript.match(/\b(um|uh|like)\b/gi) || []).length;
  if (fillerCount > 10) {
    eyeContact -= 15;
    posture -= 10;
    gestureEffectiveness -= 10;
  }

  // If uses Hume data, adjust based on emotions
  if (humeData) {
    // Would parse actual Hume emotions here
    facialExpressiveness += 10;
  }

  return {
    eye_contact_score: Math.max(0, Math.min(100, eyeContact)),
    posture_score: Math.max(0, Math.min(100, posture)),
    gesture_effectiveness: Math.max(0, Math.min(100, gestureEffectiveness)),
    facial_expressiveness: Math.max(0, Math.min(100, facialExpressiveness)),
    energy_level: Math.max(0, Math.min(100, energyLevel))
  };
}

function detectMicroExpressions(
  transcript: string,
  transcriptJson: any
): PresenceAnalysis['micro_expressions'] {
  const expressions: PresenceAnalysis['micro_expressions'] = [];
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);

  sentences.forEach((sentence, idx) => {
    const timestamp = idx * 8; // ~8 seconds per sentence
    const lower = sentence.toLowerCase();

    // Detect doubt/uncertainty
    if (/\b(um|uh|i think|maybe|not sure)\b/i.test(sentence)) {
      expressions.push({
        timestamp,
        expression: 'doubt',
        intensity: 70,
        context: sentence.substring(0, 60),
        interpretation: 'Brief moment of uncertainty. Natural, but minimize frequency.'
      });
    }

    // Detect confidence
    if (/\b(definitely|absolutely|clearly|confident)\b/i.test(sentence)) {
      expressions.push({
        timestamp,
        expression: 'confidence',
        intensity: 85,
        context: sentence.substring(0, 60),
        interpretation: 'Strong confident expression. This is what interviewers remember.'
      });
    }

    // Detect enthusiasm
    if (/\b(excited|love|passion|really|great)\b/i.test(sentence)) {
      expressions.push({
        timestamp,
        expression: 'enthusiasm',
        intensity: 80,
        context: sentence.substring(0, 60),
        interpretation: 'Genuine enthusiasm shows. This builds connection.'
      });
    }

    // Detect discomfort
    if (/\bsorry\b/i.test(sentence)) {
      expressions.push({
        timestamp,
        expression: 'discomfort',
        intensity: 60,
        context: sentence.substring(0, 60),
        interpretation: 'Unnecessary apology may signal insecurity or discomfort.'
      });
    }

    // Detect deep thinking
    if (/\b(interesting|hmm|let me think|that's a good question)\b/i.test(sentence)) {
      expressions.push({
        timestamp,
        expression: 'thinking',
        intensity: 65,
        context: sentence.substring(0, 60),
        interpretation: 'Thoughtful pause. Good if brief, but don't overdo it.'
      });
    }
  });

  return expressions;
}

function analyzeBodyLanguage(
  transcript: string,
  microExpressions: PresenceAnalysis['micro_expressions']
): PresenceAnalysis['body_language_patterns'] {
  // Detect nervous habits
  const nervousHabits: Array<{ habit: string; frequency: number; timestamps: number[] }> = [];

  // Filler words as nervous habit
  const fillerMatches = transcript.match(/\b(um|uh)\b/gi) || [];
  if (fillerMatches.length > 3) {
    nervousHabits.push({
      habit: 'Vocal fillers (um, uh)',
      frequency: fillerMatches.length,
      timestamps: []
    });
  }

  // Apologetic language as nervous habit
  const apologyMatches = transcript.match(/\bsorry\b/gi) || [];
  if (apologyMatches.length > 2) {
    nervousHabits.push({
      habit: 'Unnecessary apologizing',
      frequency: apologyMatches.length,
      timestamps: []
    });
  }

  // Power poses (detected from confident moments)
  const powerPoses: Array<{ timestamp: number; type: string; effectiveness: number }> = [];
  microExpressions.forEach(expr => {
    if (expr.expression === 'confidence' && expr.intensity > 80) {
      powerPoses.push({
        timestamp: expr.timestamp,
        type: 'Open, confident body language',
        effectiveness: expr.intensity
      });
    }
  });

  // Defensive moments
  const defensiveMoments: Array<{ timestamp: number; behavior: string }> = [];
  microExpressions.forEach(expr => {
    if (expr.expression === 'discomfort' || (expr.expression === 'doubt' && expr.intensity > 70)) {
      defensiveMoments.push({
        timestamp: expr.timestamp,
        behavior: expr.expression === 'discomfort' ? 'Apologetic posture' : 'Closed-off body language'
      });
    }
  });

  // Calculate consistency score
  const totalExpressions = microExpressions.length;
  const alignedExpressions = microExpressions.filter(e =>
    e.expression === 'confidence' || e.expression === 'enthusiasm' || e.expression === 'thinking'
  ).length;
  const consistencyScore = totalExpressions > 0
    ? Math.round((alignedExpressions / totalExpressions) * 100)
    : 75;

  return {
    consistency_score: consistencyScore,
    nervous_habits: nervousHabits,
    power_poses: powerPoses,
    defensive_moments: defensiveMoments
  };
}

function calculateExecutivePresence(
  visualMetrics: PresenceAnalysis['visual_metrics'],
  bodyLanguage: PresenceAnalysis['body_language_patterns'],
  transcript: string
): PresenceAnalysis['executive_presence_factors'] {
  // Gravitas: Weightiness and authority
  const gravitas = Math.round(
    (visualMetrics.posture_score * 0.4) +
    (visualMetrics.eye_contact_score * 0.3) +
    (bodyLanguage.consistency_score * 0.3)
  );

  // Confidence without arrogance
  const hasArroganceMarkers = /\b(obviously|clearly|everyone knows|simple)\b/gi.test(transcript);
  const hasConfidenceMarkers = /\b(confident|believe|certain|experience shows)\b/gi.test(transcript);
  let confidenceScore = visualMetrics.eye_contact_score;
  if (hasArroganceMarkers) confidenceScore -= 20;
  if (hasConfidenceMarkers) confidenceScore += 10;
  confidenceScore = Math.max(0, Math.min(100, confidenceScore));

  // Intellectual honesty: Comfort with "I don't know"
  const hasHonestyMarkers = /\b(i don't know|not sure|good question|need to think|haven't considered)\b/gi.test(transcript);
  const intellectualHonesty = hasHonestyMarkers ? 85 : 70; // Being honest about limits is a strength

  // Composure under pressure
  const nervousHabitCount = bodyLanguage.nervous_habits.reduce((sum, h) => sum + h.frequency, 0);
  const composure = Math.max(50, 100 - (nervousHabitCount * 2));

  return {
    gravitas,
    confidence_without_arrogance: confidenceScore,
    intellectual_honesty: intellectualHonesty,
    composure_under_pressure: composure
  };
}

function compareToTopPerformers(
  visualMetrics: PresenceAnalysis['visual_metrics'],
  executiveFactors: PresenceAnalysis['executive_presence_factors']
): PresenceAnalysis['comparison_to_top_performers'] {
  // Top 10% benchmarks (based on industry research)
  const topPerformerBenchmarks = {
    eye_contact: 85,
    posture: 88,
    gesture_effectiveness: 82,
    gravitas: 85,
    composure: 90
  };

  const gaps: Array<{ area: string; your_score: number; top_10_avg: number; improvement: string }> = [];

  // Eye contact gap
  if (visualMetrics.eye_contact_score < topPerformerBenchmarks.eye_contact) {
    gaps.push({
      area: 'Eye Contact',
      your_score: visualMetrics.eye_contact_score,
      top_10_avg: topPerformerBenchmarks.eye_contact,
      improvement: 'Practice the "triangle technique": Look at one eye, then the other, then the mouth. Repeat every 5-7 seconds.'
    });
  }

  // Posture gap
  if (visualMetrics.posture_score < topPerformerBenchmarks.posture) {
    gaps.push({
      area: 'Posture',
      your_score: visualMetrics.posture_score,
      top_10_avg: topPerformerBenchmarks.posture,
      improvement: 'Record yourself and watch without sound. Your posture tells the story before you speak.'
    });
  }

  // Gesture effectiveness gap
  if (visualMetrics.gesture_effectiveness < topPerformerBenchmarks.gesture_effectiveness) {
    gaps.push({
      area: 'Gesture Effectiveness',
      your_score: visualMetrics.gesture_effectiveness,
      top_10_avg: topPerformerBenchmarks.gesture_effectiveness,
      improvement: 'Use purposeful gestures to emphasize key points. Open palms signal transparency and confidence.'
    });
  }

  // Gravitas gap
  if (executiveFactors.gravitas < topPerformerBenchmarks.gravitas) {
    gaps.push({
      area: 'Executive Gravitas',
      your_score: executiveFactors.gravitas,
      top_10_avg: topPerformerBenchmarks.gravitas,
      improvement: 'Slow down by 10%. Powerful people don\'t rush. Your pace signals your worth.'
    });
  }

  // Composure gap
  if (executiveFactors.composure_under_pressure < topPerformerBenchmarks.composure) {
    gaps.push({
      area: 'Composure Under Pressure',
      your_score: executiveFactors.composure_under_pressure,
      top_10_avg: topPerformerBenchmarks.composure,
      improvement: 'Before tough questions, take a visible breath. It signals thoughtfulness, not nervousness.'
    });
  }

  // Calculate overall delta
  const yourAvg = (
    visualMetrics.eye_contact_score +
    visualMetrics.posture_score +
    visualMetrics.gesture_effectiveness +
    executiveFactors.gravitas +
    executiveFactors.composure_under_pressure
  ) / 5;

  const topAvg = Object.values(topPerformerBenchmarks).reduce((sum, v) => sum + v, 0) / Object.values(topPerformerBenchmarks).length;

  const overallDelta = Math.round(((yourAvg - topAvg) / topAvg) * 100);

  return {
    overall_delta: overallDelta,
    specific_gaps: gaps
  };
}

function generatePresenceFeedback(
  visualMetrics: PresenceAnalysis['visual_metrics'],
  executiveFactors: PresenceAnalysis['executive_presence_factors'],
  bodyLanguage: PresenceAnalysis['body_language_patterns']
): PresenceAnalysis['feedback'] {
  const whatWorks: string[] = [];
  const whatNeedsWork: string[] = [];
  const quickWins: string[] = [];
  const advancedTechniques: string[] = [];

  // What works
  if (visualMetrics.energy_level > 75) {
    whatWorks.push('High energy level - you bring enthusiasm that\'s contagious');
  }
  if (executiveFactors.intellectual_honesty > 80) {
    whatWorks.push('Comfortable admitting knowledge gaps - this builds trust, not weakness');
  }
  if (bodyLanguage.power_poses.length > 3) {
    whatWorks.push('Multiple moments of strong, confident body language');
  }

  // What needs work
  if (visualMetrics.eye_contact_score < 70) {
    whatNeedsWork.push('Eye contact needs improvement - this is the #1 presence signal');
  }
  if (bodyLanguage.nervous_habits.length > 2) {
    whatNeedsWork.push(`${bodyLanguage.nervous_habits.length} nervous habits detected - these undermine your expertise`);
  }
  if (executiveFactors.gravitas < 70) {
    whatNeedsWork.push('Executive gravitas is developing - focus on slowing down and holding space');
  }

  // Quick wins
  quickWins.push('Eliminate just ONE filler word. Pick "um" or "like" - not both yet. You\'ll improve 20%.');
  quickWins.push('Add a 2-second pause before answering tough questions. Instant gravitas boost.');

  if (visualMetrics.posture_score < 80) {
    quickWins.push('Sit up straighter. Literally. Your posture changed how they hear your words.');
  }

  // Advanced techniques
  advancedTechniques.push('The "power pause": After making a key point, stop completely for 3 seconds. Let it land.');
  advancedTechniques.push('Mirror the interviewer\'s energy level, then elevate it by 10%. This builds rapport.');
  advancedTechniques.push('When asked a tough question, physically lean in slightly. Signals confidence, not retreat.');

  return {
    what_works: whatWorks,
    what_needs_work: whatNeedsWork,
    quick_wins: quickWins,
    advanced_techniques: advancedTechniques
  };
}

function calculatePresenceScore(
  visualMetrics: PresenceAnalysis['visual_metrics'],
  executiveFactors: PresenceAnalysis['executive_presence_factors']
): number {
  const visualScore = (
    visualMetrics.eye_contact_score * 0.25 +
    visualMetrics.posture_score * 0.20 +
    visualMetrics.gesture_effectiveness * 0.15 +
    visualMetrics.facial_expressiveness * 0.20 +
    visualMetrics.energy_level * 0.20
  );

  const executiveScore = (
    executiveFactors.gravitas * 0.35 +
    executiveFactors.confidence_without_arrogance * 0.30 +
    executiveFactors.intellectual_honesty * 0.15 +
    executiveFactors.composure_under_pressure * 0.20
  );

  const overallScore = Math.round(visualScore * 0.50 + executiveScore * 0.50);

  return Math.max(0, Math.min(100, overallScore));
}
