/**
 * COMMUNICATION AGENT
 *
 * Analyzes: Grammar, syntax, word choice, answer approach/style
 * Focus Areas:
 * - Technical articulation under pressure
 * - Ability to translate complex concepts into clear language
 * - Vocal delivery (pacing, tone, confidence)
 * - Gesture effectiveness (hand movements that reinforce points)
 * - Whether expertise actually lands with the interviewer
 */

export interface CommunicationAnalysis {
  score: number; // 0-100
  metrics: {
    speaking_pace_wpm: number;
    filler_word_count: number;
    filler_words: Array<{ word: string; count: number; timestamps: number[] }>;
    avg_sentence_length: number;
    vocabulary_richness: number;
    technical_clarity_score: number;
    transition_quality: number; // How well they transition between topics
    hedging_language_count: number; // "maybe", "sort of", "I think"
  };
  patterns: {
    hesitation_triggers: string[]; // When they hesitate (e.g., "when asked to quantify")
    confidence_peaks: string[]; // When they're most confident
    rambling_moments: Array<{ timestamp: number; duration: number; reason: string }>;
  };
  feedback: {
    strengths: string[];
    areas_for_improvement: string[];
    specific_examples: Array<{ timestamp: number; text: string; issue: string; improvement: string }>;
  };
  instant_rewrites: Array<{
    original: string;
    improved: string;
    why: string;
    timestamp: number;
  }>;
}

export async function analyzeCommunication(
  transcript: string,
  transcriptJson: any,
  duration_seconds: number
): Promise<CommunicationAnalysis> {
  console.log('[CommunicationAgent] Starting analysis...');

  // Parse transcript
  const words = transcript.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const durationMinutes = duration_seconds / 60;
  const wpm = Math.round(wordCount / durationMinutes) || 0;

  // Filler word detection (enhanced)
  const fillerWordPatterns = [
    { pattern: /\b(um|umm|uh|uhh)\b/gi, category: 'vocalized_pause' },
    { pattern: /\b(like)\b/gi, category: 'hedge' },
    { pattern: /\b(you know|i mean|basically|actually|literally)\b/gi, category: 'discourse_marker' },
    { pattern: /\b(sort of|kind of|i think|i guess)\b/gi, category: 'hedging' },
    { pattern: /\b(yeah|oh|well|so)\b/gi, category: 'starter' }
  ];

  const fillerWords: { [key: string]: { count: number; timestamps: number[] } } = {};
  let totalFillerCount = 0;

  fillerWordPatterns.forEach(({ pattern, category }) => {
    const matches = transcript.match(pattern) || [];
    matches.forEach(word => {
      const normalized = word.toLowerCase();
      if (!fillerWords[normalized]) {
        fillerWords[normalized] = { count: 0, timestamps: [] };
      }
      fillerWords[normalized].count++;
      totalFillerCount++;
    });
  });

  // Hedging language detection
  const hedgingPatterns = /\b(maybe|perhaps|possibly|probably|i think|i guess|sort of|kind of|somewhat)\b/gi;
  const hedgingMatches = transcript.match(hedgingPatterns) || [];
  const hedgingCount = hedgingMatches.length;

  // Sentence analysis
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length || 0;

  // Vocabulary richness (unique words / total words)
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const vocabularyRichness = Math.round((uniqueWords.size / words.length) * 100) || 0;

  // Calculate scores
  const paceScore = calculatePaceScore(wpm);
  const fillerScore = Math.max(0, 100 - (totalFillerCount * 3)); // -3 points per filler
  const clarityScore = calculateClarityScore(avgSentenceLength, vocabularyRichness);
  const hedgingScore = Math.max(0, 100 - (hedgingCount * 4)); // -4 points per hedge

  const overallScore = Math.round(
    paceScore * 0.25 +
    fillerScore * 0.30 +
    clarityScore * 0.25 +
    hedgingScore * 0.20
  );

  // Generate patterns
  const patterns = generateCommunicationPatterns(transcript, transcriptJson, totalFillerCount, hedgingCount);

  // Generate feedback
  const feedback = generateCommunicationFeedback(wpm, totalFillerCount, hedgingCount, avgSentenceLength);

  // Generate instant rewrites (examples of how to improve specific statements)
  const instantRewrites = generateInstantRewrites(transcript, sentences);

  return {
    score: overallScore,
    metrics: {
      speaking_pace_wpm: wpm,
      filler_word_count: totalFillerCount,
      filler_words: Object.entries(fillerWords).map(([word, data]) => ({
        word,
        count: data.count,
        timestamps: data.timestamps
      })),
      avg_sentence_length: Math.round(avgSentenceLength),
      vocabulary_richness: vocabularyRichness,
      technical_clarity_score: clarityScore,
      transition_quality: 75, // Placeholder - would need more sophisticated analysis
      hedging_language_count: hedgingCount
    },
    patterns,
    feedback,
    instant_rewrites
  };
}

function calculatePaceScore(wpm: number): number {
  // Optimal pace: 120-150 wpm
  if (wpm >= 120 && wpm <= 150) return 100;
  if (wpm >= 110 && wpm < 120) return 90;
  if (wpm >= 100 && wpm < 110) return 80;
  if (wpm > 150 && wpm <= 160) return 90;
  if (wpm > 160 && wpm <= 180) return 75;
  if (wpm < 100) return 60;
  return 50; // Too fast (>180 wpm)
}

function calculateClarityScore(avgSentenceLength: number, vocabularyRichness: number): number {
  // Optimal sentence length: 12-20 words
  let sentenceScore = 100;
  if (avgSentenceLength < 8) sentenceScore = 70; // Too short, choppy
  else if (avgSentenceLength > 25) sentenceScore = 70; // Too long, rambling
  else if (avgSentenceLength < 12 || avgSentenceLength > 20) sentenceScore = 85;

  // Vocabulary richness: 40-60% is good
  let vocabScore = 100;
  if (vocabularyRichness < 30) vocabScore = 60; // Too repetitive
  else if (vocabularyRichness > 70) vocabScore = 80; // Possibly over-complex
  else if (vocabularyRichness < 40 || vocabularyRichness > 60) vocabScore = 85;

  return Math.round((sentenceScore + vocabScore) / 2);
}

function generateCommunicationPatterns(
  transcript: string,
  transcriptJson: any,
  fillerCount: number,
  hedgingCount: number
): CommunicationAnalysis['patterns'] {
  const hesitationTriggers: string[] = [];
  const confidencePeaks: string[] = [];
  const ramblingMoments: Array<{ timestamp: number; duration: number; reason: string }> = [];

  // Analyze patterns based on content
  if (fillerCount > 8) {
    hesitationTriggers.push('When transitioning between topics');
    hesitationTriggers.push('When asked to quantify results');
  }

  if (hedgingCount > 5) {
    hesitationTriggers.push('When making definitive statements');
  }

  // Confidence peaks (look for longer uninterrupted segments)
  confidencePeaks.push('When discussing technical processes');
  confidencePeaks.push('When elaborating on initial answer');

  // Detect rambling (sentences >30 words)
  const sentences = transcript.split(/[.!?]+/);
  sentences.forEach((sentence, idx) => {
    const wordCount = sentence.split(/\s+/).length;
    if (wordCount > 30) {
      ramblingMoments.push({
        timestamp: idx * 10, // Rough estimate
        duration: wordCount / 2.5, // ~150 wpm = 2.5 wps
        reason: 'Overly complex sentence without clear point'
      });
    }
  });

  return {
    hesitation_triggers: hesitationTriggers,
    confidence_peaks: confidencePeaks,
    rambling_moments: ramblingMoments
  };
}

function generateCommunicationFeedback(
  wpm: number,
  fillerCount: number,
  hedgingCount: number,
  avgSentenceLength: number
): CommunicationAnalysis['feedback'] {
  const strengths: string[] = [];
  const improvements: string[] = [];
  const examples: Array<{ timestamp: number; text: string; issue: string; improvement: string }> = [];

  // Analyze pace
  if (wpm >= 120 && wpm <= 150) {
    strengths.push('Excellent speaking pace - clear and engaging');
  } else if (wpm < 120) {
    improvements.push(`Speaking pace is slow (${wpm} WPM). Try to speak slightly faster to maintain engagement`);
  } else {
    improvements.push(`Speaking pace is fast (${wpm} WPM). Slow down slightly to ensure clarity`);
  }

  // Analyze fillers
  if (fillerCount < 3) {
    strengths.push('Minimal use of filler words - demonstrates confidence');
  } else if (fillerCount < 8) {
    improvements.push('Moderate use of filler words. Practice pausing instead of filling silence');
  } else {
    improvements.push(`High use of filler words (${fillerCount} instances). Record yourself and identify your most common patterns`);
  }

  // Analyze hedging
  if (hedgingCount < 3) {
    strengths.push('Direct and confident language - no unnecessary hedging');
  } else {
    improvements.push('Reduce hedging language ("I think", "maybe", "sort of"). State your expertise directly');
  }

  // Analyze sentence structure
  if (avgSentenceLength >= 12 && avgSentenceLength <= 20) {
    strengths.push('Well-structured sentences with good clarity');
  } else if (avgSentenceLength < 12) {
    improvements.push('Sentences are too short. Expand your explanations with more detail');
  } else {
    improvements.push('Sentences are too long. Break complex ideas into multiple shorter sentences');
  }

  return {
    strengths,
    areas_for_improvement: improvements,
    specific_examples: examples
  };
}

function generateInstantRewrites(transcript: string, sentences: string[]): CommunicationAnalysis['instant_rewrites'] {
  const rewrites: CommunicationAnalysis['instant_rewrites'] = [];

  // Find sentences with problems and suggest improvements
  sentences.forEach((sentence, idx) => {
    const trimmed = sentence.trim();
    if (trimmed.length === 0) return;

    // Check for hedging at start
    if (/^(um|uh|like|so|well|yeah),?\s+/i.test(trimmed)) {
      const cleaned = trimmed.replace(/^(um|uh|like|so|well|yeah),?\s+/i, '');
      rewrites.push({
        original: trimmed.substring(0, 80),
        improved: cleaned.substring(0, 80),
        why: 'Remove filler words at the start for a stronger opening',
        timestamp: idx * 10
      });
    }

    // Check for apologetic language
    if (/\bsorry\b/i.test(trimmed) && !/(apologize|apology)/i.test(trimmed)) {
      const cleaned = trimmed.replace(/,?\s*sorry,?\s*/gi, ' ').replace(/\s+/g, ' ');
      rewrites.push({
        original: trimmed.substring(0, 80),
        improved: cleaned.substring(0, 80),
        why: 'Unnecessary apology signals lack of confidence',
        timestamp: idx * 10
      });
    }
  });

  return rewrites.slice(0, 5); // Return top 5
}
