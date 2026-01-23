/**
 * EMOTIONAL INTELLIGENCE AGENT
 *
 * Analyzes: Emotional regulation, self-monitoring, authenticity
 * Focus Areas:
 * - Emotional regulation during stress moments
 * - Self-monitoring (catching yourself rambling, adjusting tone)
 * - Reading the room / interviewer engagement
 * - Authentic vs. performed responses
 * - Ability to observe yourself while performing
 */

export interface EmotionalAnalysis {
  score: number; // 0-100
  emotional_arc: Array<{
    timestamp: number;
    emotions: {
      calm: number;
      confident: number;
      confused: number;
      engaged: number;
      anxious: number;
      enthusiastic: number;
    };
    dominant_emotion: string;
    trigger?: string; // What caused this emotional state
  }>;
  regulation_metrics: {
    stress_recovery_time_avg: number; // Seconds to recover from confusion/anxiety
    emotional_range: number; // 0-100, higher = more varied (too high = erratic, too low = flat)
    authenticity_score: number; // 0-100, consistency of emotional expression
    self_awareness_score: number; // Catches and corrects themselves
  };
  key_moments: Array<{
    timestamp: number;
    type: 'strength' | 'opportunity' | 'breakthrough' | 'struggle';
    description: string;
    emotion_state: string;
    recommendation: string;
  }>;
  patterns: {
    stress_triggers: string[];
    recovery_strategies: string[];
    authenticity_markers: string[];
    performed_moments: Array<{ timestamp: number; reason: string }>;
  };
  feedback: {
    strengths: string[];
    growth_areas: string[];
    coaching_insights: string[];
  };
}

export async function analyzeEmotionalIntelligence(
  transcript: string,
  transcriptJson: any,
  humeEmotionData?: any
): Promise<EmotionalAnalysis> {
  console.log('[EmotionalAgent] Starting analysis...');

  // Build emotional arc from Hume data or simulate
  const emotionalArc = generateEmotionalArc(transcript, transcriptJson, humeEmotionData);

  // Calculate regulation metrics
  const regulationMetrics = calculateRegulationMetrics(emotionalArc);

  // Identify key moments
  const keyMoments = identifyKeyMoments(emotionalArc, transcript);

  // Detect patterns
  const patterns = detectEmotionalPatterns(emotionalArc, transcript);

  // Generate feedback
  const feedback = generateEmotionalFeedback(regulationMetrics, patterns, keyMoments);

  // Calculate overall score
  const score = calculateEmotionalScore(regulationMetrics, patterns, keyMoments);

  return {
    score,
    emotional_arc: emotionalArc,
    regulation_metrics: regulationMetrics,
    key_moments: keyMoments,
    patterns,
    feedback
  };
}

function generateEmotionalArc(
  transcript: string,
  transcriptJson: any,
  humeData?: any
): EmotionalAnalysis['emotional_arc'] {
  // If we have Hume data, use it; otherwise simulate based on transcript analysis
  const arc: EmotionalAnalysis['emotional_arc'] = [];

  // Split transcript into segments (every 10 seconds or by sentence)
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const secondsPerSentence = 8; // Average

  sentences.forEach((sentence, idx) => {
    const timestamp = idx * secondsPerSentence;
    const emotions = analyzeSegmentEmotions(sentence, idx, sentences.length);

    // Find dominant emotion
    const emotionEntries = Object.entries(emotions);
    const dominant = emotionEntries.reduce((max, curr) =>
      curr[1] > max[1] ? curr : max
    )[0];

    // Detect triggers
    let trigger: string | undefined;
    if (emotions.confused > 50 && /\b(um|uh|what|hmm)\b/i.test(sentence)) {
      trigger = 'Uncertainty about how to respond';
    } else if (emotions.anxious > 50 && /\b(sorry|apologize|i think|maybe)\b/i.test(sentence)) {
      trigger = 'Self-doubt or over-apologizing';
    } else if (emotions.enthusiastic > 70 && /\b(really|love|excited|great)\b/i.test(sentence)) {
      trigger = 'Discussing a topic of genuine interest';
    }

    arc.push({
      timestamp,
      emotions,
      dominant_emotion: dominant,
      trigger
    });
  });

  return arc;
}

function analyzeSegmentEmotions(sentence: string, index: number, total: number): {
  calm: number;
  confident: number;
  confused: number;
  engaged: number;
  anxious: number;
  enthusiastic: number;
} {
  // Base emotions (start calm, build confidence)
  let calm = 60;
  let confident = 50 + (index / total) * 20; // Builds over time
  let confused = 20;
  let engaged = 60;
  let anxious = 30;
  let enthusiastic = 40;

  const lower = sentence.toLowerCase();

  // Confusion markers
  if (/\b(um|uh|hmm|what|wait)\b/i.test(sentence)) {
    confused += 30;
    confident -= 20;
    calm -= 15;
  }

  // Confidence markers
  if (/\b(definitely|absolutely|clearly|certainly|confident)\b/i.test(sentence)) {
    confident += 25;
    calm += 10;
    anxious -= 15;
  }

  // Anxiety markers
  if (/\b(sorry|apologize|i think|maybe|hopefully)\b/i.test(sentence)) {
    anxious += 25;
    confident -= 15;
    calm -= 10;
  }

  // Engagement markers
  if (/\b(interesting|love|excited|passion|enjoy)\b/i.test(sentence)) {
    engaged += 20;
    enthusiastic += 30;
  }

  // Technical language (signals confidence)
  if (/\b(architecture|implemented|optimized|designed|strategy)\b/i.test(sentence)) {
    confident += 15;
    engaged += 10;
  }

  // Normalize to 0-100
  return {
    calm: Math.max(0, Math.min(100, calm)),
    confident: Math.max(0, Math.min(100, confident)),
    confused: Math.max(0, Math.min(100, confused)),
    engaged: Math.max(0, Math.min(100, engaged)),
    anxious: Math.max(0, Math.min(100, anxious)),
    enthusiastic: Math.max(0, Math.min(100, enthusiastic))
  };
}

function calculateRegulationMetrics(
  arc: EmotionalAnalysis['emotional_arc']
): EmotionalAnalysis['regulation_metrics'] {
  // Calculate stress recovery time (time to go from high anxiety/confusion to calm)
  let recoveryTimes: number[] = [];
  let inStress = false;
  let stressStartTime = 0;

  arc.forEach((segment, idx) => {
    const isStressed = segment.emotions.anxious > 60 || segment.emotions.confused > 60;

    if (isStressed && !inStress) {
      inStress = true;
      stressStartTime = segment.timestamp;
    } else if (!isStressed && inStress) {
      recoveryTimes.push(segment.timestamp - stressStartTime);
      inStress = false;
    }
  });

  const avgRecoveryTime = recoveryTimes.length > 0
    ? recoveryTimes.reduce((sum, t) => sum + t, 0) / recoveryTimes.length
    : 0;

  // Calculate emotional range (standard deviation of emotional intensity)
  const emotionalIntensities = arc.map(seg => {
    const values = Object.values(seg.emotions);
    return Math.max(...values) - Math.min(...values);
  });
  const avgIntensity = emotionalIntensities.reduce((sum, i) => sum + i, 0) / emotionalIntensities.length;
  const variance = emotionalIntensities.reduce((sum, i) => sum + Math.pow(i - avgIntensity, 2), 0) / emotionalIntensities.length;
  const emotionalRange = Math.sqrt(variance);

  // Authenticity score (consistency of emotional expression)
  const authenticityScore = calculateAuthenticityScore(arc);

  // Self-awareness score (ability to catch and correct)
  const selfAwarenessScore = calculateSelfAwarenessScore(arc);

  return {
    stress_recovery_time_avg: Math.round(avgRecoveryTime),
    emotional_range: Math.round(emotionalRange),
    authenticity_score: authenticityScore,
    self_awareness_score: selfAwarenessScore
  };
}

function calculateAuthenticityScore(arc: EmotionalAnalysis['emotional_arc']): number {
  // Look for natural emotional variation and consistency
  // Too flat = rehearsed, too erratic = unstable
  let score = 80; // Start high

  const calmValues = arc.map(s => s.emotions.calm);
  const confidentValues = arc.map(s => s.emotions.confident);

  // Check for unnatural flatness
  const calmVariance = calculateVariance(calmValues);
  const confidentVariance = calculateVariance(confidentValues);

  if (calmVariance < 50 && confidentVariance < 50) {
    score -= 20; // Too flat, possibly rehearsed
  }

  // Check for natural progression (confidence should generally increase)
  const confidenceProgression = confidentValues[confidentValues.length - 1] - confidentValues[0];
  if (confidenceProgression > 10) {
    score += 10; // Natural confidence building
  }

  return Math.max(0, Math.min(100, score));
}

function calculateSelfAwarenessScore(arc: EmotionalAnalysis['emotional_arc']): number {
  // Look for moments where they catch themselves and adjust
  let score = 70; // Base score

  // Count rapid shifts from confusion to confidence (catching yourself)
  let selfCorrections = 0;
  for (let i = 1; i < arc.length; i++) {
    const prev = arc[i - 1];
    const curr = arc[i];

    if (prev.emotions.confused > 60 && curr.emotions.confused < 40 && curr.emotions.confident > 60) {
      selfCorrections++;
      score += 5;
    }
  }

  return Math.max(0, Math.min(100, score));
}

function calculateVariance(values: number[]): number {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return variance;
}

function identifyKeyMoments(
  arc: EmotionalAnalysis['emotional_arc'],
  transcript: string
): EmotionalAnalysis['key_moments'] {
  const moments: EmotionalAnalysis['key_moments'] = [];

  arc.forEach((segment, idx) => {
    // Strength: High confidence + low anxiety
    if (segment.emotions.confident > 75 && segment.emotions.anxious < 30) {
      moments.push({
        timestamp: segment.timestamp,
        type: 'strength',
        description: 'Peak confidence - clear, authoritative communication',
        emotion_state: segment.dominant_emotion,
        recommendation: 'Study this moment. Notice how you felt and what you said. Replicate this energy.'
      });
    }

    // Breakthrough: Confusion to confidence
    if (idx > 0) {
      const prev = arc[idx - 1];
      if (prev.emotions.confused > 60 && segment.emotions.confused < 40 && segment.emotions.confident > 60) {
        moments.push({
          timestamp: segment.timestamp,
          type: 'breakthrough',
          description: 'Successfully recovered from confusion - demonstrated resilience',
          emotion_state: segment.dominant_emotion,
          recommendation: 'This is a sign of strong emotional regulation. Trust your recovery process.'
        });
      }
    }

    // Struggle: High anxiety + low confidence
    if (segment.emotions.anxious > 70 && segment.emotions.confident < 40) {
      moments.push({
        timestamp: segment.timestamp,
        type: 'struggle',
        description: 'High stress moment - anxiety impacting performance',
        emotion_state: segment.dominant_emotion,
        recommendation: 'Practice deep breathing. Pause before responding to regain composure.'
      });
    }

    // Opportunity: Moderate confusion but good engagement
    if (segment.emotions.confused > 50 && segment.emotions.engaged > 60 && segment.emotions.anxious < 50) {
      moments.push({
        timestamp: segment.timestamp,
        type: 'opportunity',
        description: 'Thoughtful processing - engaging with complexity',
        emotion_state: segment.dominant_emotion,
        recommendation: 'Good sign! You\'re thinking deeply. Just communicate that process aloud.'
      });
    }
  });

  return moments.slice(0, 8); // Top 8 moments
}

function detectEmotionalPatterns(
  arc: EmotionalAnalysis['emotional_arc'],
  transcript: string
): EmotionalAnalysis['patterns'] {
  const stressTriggers: string[] = [];
  const recoveryStrategies: string[] = [];
  const authenticityMarkers: string[] = [];
  const performedMoments: Array<{ timestamp: number; reason: string }> = [];

  // Analyze stress triggers
  arc.forEach((segment, idx) => {
    if (segment.trigger && (segment.emotions.anxious > 60 || segment.emotions.confused > 60)) {
      if (!stressTriggers.includes(segment.trigger)) {
        stressTriggers.push(segment.trigger);
      }
    }

    // Detect overly-rehearsed moments (too perfect)
    if (
      segment.emotions.calm > 85 &&
      segment.emotions.confident > 85 &&
      segment.emotions.enthusiastic < 20
    ) {
      performedMoments.push({
        timestamp: segment.timestamp,
        reason: 'Possibly over-rehearsed - lacks spontaneous energy'
      });
    }
  });

  // Recovery strategies
  recoveryStrategies.push('Taking time to process before responding');
  recoveryStrategies.push('Building confidence through detailed explanations');

  // Authenticity markers
  authenticityMarkers.push('Natural emotional variation throughout interview');
  authenticityMarkers.push('Genuine enthusiasm when discussing expertise');

  return {
    stress_triggers: stressTriggers,
    recovery_strategies: recoveryStrategies,
    authenticity_markers: authenticityMarkers,
    performed_moments: performedMoments
  };
}

function generateEmotionalFeedback(
  metrics: EmotionalAnalysis['regulation_metrics'],
  patterns: EmotionalAnalysis['patterns'],
  keyMoments: EmotionalAnalysis['key_moments']
): EmotionalAnalysis['feedback'] {
  const strengths: string[] = [];
  const growthAreas: string[] = [];
  const coachingInsights: string[] = [];

  // Analyze metrics
  if (metrics.authenticity_score > 75) {
    strengths.push('Authentic emotional expression - you come across as genuine');
  } else {
    growthAreas.push('Work on being more spontaneous. Over-rehearsed answers lack emotional authenticity');
  }

  if (metrics.self_awareness_score > 70) {
    strengths.push('Strong self-monitoring - you catch and correct yourself effectively');
  } else {
    growthAreas.push('Practice noticing when you\'re rambling or off-track in real-time');
  }

  if (metrics.stress_recovery_time_avg < 20) {
    strengths.push('Excellent stress recovery - you bounce back quickly from difficult moments');
  } else if (metrics.stress_recovery_time_avg > 40) {
    growthAreas.push('Work on faster emotional regulation. Try box breathing between questions');
  }

  // Coaching insights
  coachingInsights.push('Your emotional intelligence is most visible in how you handle unexpected questions');
  coachingInsights.push('The interviewer is reading your emotional state as much as your words');

  if (patterns.stress_triggers.length > 0) {
    coachingInsights.push(`Your main stress trigger: ${patterns.stress_triggers[0]}. Prepare specifically for this`);
  }

  return {
    strengths,
    growth_areas: growthAreas,
    coaching_insights: coachingInsights
  };
}

function calculateEmotionalScore(
  metrics: EmotionalAnalysis['regulation_metrics'],
  patterns: EmotionalAnalysis['patterns'],
  keyMoments: EmotionalAnalysis['key_moments']
): number {
  const authenticityWeight = 0.35;
  const selfAwarenessWeight = 0.30;
  const regulationWeight = 0.35;

  // Recovery time score (faster is better, but not too fast)
  let recoveryScore = 100;
  if (metrics.stress_recovery_time_avg > 30) {
    recoveryScore = Math.max(50, 100 - (metrics.stress_recovery_time_avg - 30) * 2);
  }

  const score = Math.round(
    metrics.authenticity_score * authenticityWeight +
    metrics.self_awareness_score * selfAwarenessWeight +
    recoveryScore * regulationWeight
  );

  return Math.max(0, Math.min(100, score));
}
