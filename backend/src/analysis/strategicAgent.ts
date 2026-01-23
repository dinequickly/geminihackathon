/**
 * STRATEGIC THINKING AGENT
 *
 * Analyzes: Question quality, critical thinking, intellectual depth
 * Focus Areas:
 * - Quality of questions you ask
 * - How you engage with ambiguity
 * - Intellectual curiosity signals
 * - Strategic framing of responses
 * - Authenticity vs. rehearsed answers
 * - Depth of critical thinking
 * - "Authority through intellectual honesty. Questions reveal character."
 */

export interface StrategicAnalysis {
  score: number; // 0-100
  thinking_patterns: {
    depth_score: number; // 0-100, surface vs. deep analysis
    curiosity_score: number; // 0-100, asks questions, explores edges
    ambiguity_handling: number; // 0-100, comfort with unclear questions
    strategic_framing: number; // 0-100, positions answers strategically
    authenticity_vs_rehearsed: number; // 0-100, higher = more authentic
  };
  question_analysis: {
    questions_asked: Array<{
      question: string;
      timestamp: number;
      quality_score: number; // 0-100
      type: 'clarifying' | 'strategic' | 'curious' | 'defensive';
      why_it_matters: string;
    }>;
    question_quality_avg: number;
    missed_opportunities: Array<{
      timestamp: number;
      context: string;
      what_to_ask: string;
      why: string;
    }>;
  };
  response_framework_analysis: {
    uses_structured_frameworks: boolean; // STAR, etc.
    answer_completeness: number; // 0-100, answers all parts of question
    storytelling_quality: number; // 0-100
    metric_usage: number; // 0-100, quantifies results
    connects_to_business_impact: boolean;
  };
  intellectual_signals: {
    admits_knowledge_gaps: boolean; // "I don't know" = strength
    challenges_assumptions: boolean; // Questions the question
    shows_meta_awareness: boolean; // Talks about their thinking process
    demonstrates_learning_agility: boolean; // Applies lessons across domains
  };
  comparison: {
    good_vs_great_analysis: Array<{
      your_approach: string;
      great_approach: string;
      gap: string;
      how_to_bridge: string;
    }>;
  };
  feedback: {
    intellectual_strengths: string[];
    thinking_blindspots: string[];
    framework_recommendations: string[];
    advanced_strategies: string[];
  };
}

export async function analyzeStrategicThinking(
  transcript: string,
  transcriptJson: any
): Promise<StrategicAnalysis> {
  console.log('[StrategicAgent] Starting analysis...');

  // Analyze thinking patterns
  const thinkingPatterns = analyzeThinkingPatterns(transcript);

  // Analyze questions asked
  const questionAnalysis = analyzeQuestions(transcript);

  // Analyze response frameworks
  const frameworkAnalysis = analyzeResponseFrameworks(transcript);

  // Detect intellectual signals
  const intellectualSignals = detectIntellectualSignals(transcript);

  // Compare good vs great
  const comparison = compareGoodVsGreat(transcript, thinkingPatterns, questionAnalysis);

  // Generate feedback
  const feedback = generateStrategicFeedback(
    thinkingPatterns,
    questionAnalysis,
    frameworkAnalysis,
    intellectualSignals
  );

  // Calculate overall score
  const score = calculateStrategicScore(thinkingPatterns, questionAnalysis, frameworkAnalysis, intellectualSignals);

  return {
    score,
    thinking_patterns: thinkingPatterns,
    question_analysis: questionAnalysis,
    response_framework_analysis: frameworkAnalysis,
    intellectual_signals: intellectualSignals,
    comparison,
    feedback
  };
}

function analyzeThinkingPatterns(transcript: string): StrategicAnalysis['thinking_patterns'] {
  const lower = transcript.toLowerCase();

  // Depth score: Look for deep vs surface analysis
  let depthScore = 60; // Base score

  // Depth indicators
  const depthIndicators = [
    /\b(because|therefore|consequently|as a result|this led to)\b/gi,
    /\b(consider|analyzed|evaluated|assessed|examined)\b/gi,
    /\b(trade-off|balance|pros and cons|on the other hand)\b/gi,
    /\b(root cause|underlying|fundamental|systemic)\b/gi
  ];

  depthIndicators.forEach(pattern => {
    const matches = (transcript.match(pattern) || []).length;
    depthScore += Math.min(10, matches * 3);
  });

  // Curiosity score: Look for questions and exploration
  let curiosityScore = 50;
  const questionMarks = (transcript.match(/\?/g) || []).length;
  curiosityScore += Math.min(25, questionMarks * 8);

  const curiosityIndicators = /\b(wonder|curious|interesting|what if|why|how)\b/gi;
  const curiosityMatches = (transcript.match(curiosityIndicators) || []).length;
  curiosityScore += Math.min(25, curiosityMatches * 3);

  // Ambiguity handling
  let ambiguityHandling = 70;
  const hasAmbiguityMarkers = /\b(depends|context|it varies|several factors|good question)\b/gi.test(transcript);
  if (hasAmbiguityMarkers) ambiguityHandling += 15;

  const hasCertaintyOverreach = /\b(always|never|definitely|absolutely certain|100%)\b/gi.test(transcript);
  if (hasCertaintyOverreach) ambiguityHandling -= 15;

  // Strategic framing
  let strategicFraming = 65;
  const hasStrategicLanguage = /\b(aligned with|strategic|priority|impact|value|objectives)\b/gi.test(transcript);
  if (hasStrategicLanguage) strategicFraming += 20;

  const hasBusinessContext = /\b(revenue|customers|users|market|business|ROI|growth)\b/gi.test(transcript);
  if (hasBusinessContext) strategicFraming += 15;

  // Authenticity vs rehearsed
  let authenticity = 70;

  // Rehearsed indicators (negative)
  const rehearsedPhrases = /\b(passion for|excited to|opportunity to|great question)\b/gi;
  const rehearsedCount = (transcript.match(rehearsedPhrases) || []).length;
  if (rehearsedCount > 4) authenticity -= 20;

  // Authentic indicators (positive)
  const authenticMarkers = [
    /\b(honestly|to be frank|i don't know|not sure|haven't thought about)\b/gi,
    /\b(struggled with|challenged by|learned that|realized)\b/gi,
    /\b(um|uh)\b/gi // Some hesitation = authentic
  ];

  authenticMarkers.forEach(pattern => {
    if (pattern.test(transcript)) authenticity += 5;
  });

  return {
    depth_score: Math.max(0, Math.min(100, depthScore)),
    curiosity_score: Math.max(0, Math.min(100, curiosityScore)),
    ambiguity_handling: Math.max(0, Math.min(100, ambiguityHandling)),
    strategic_framing: Math.max(0, Math.min(100, strategicFraming)),
    authenticity_vs_rehearsed: Math.max(0, Math.min(100, authenticity))
  };
}

function analyzeQuestions(transcript: string): StrategicAnalysis['question_analysis'] {
  const questionsAsked: StrategicAnalysis['question_analysis']['questions_asked'] = [];
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);

  sentences.forEach((sentence, idx) => {
    if (sentence.includes('?')) {
      const question = sentence.trim();
      const timestamp = idx * 8;

      // Determine question type and quality
      let type: 'clarifying' | 'strategic' | 'curious' | 'defensive' = 'clarifying';
      let qualityScore = 60;
      let whyItMatters = '';

      const lower = question.toLowerCase();

      // Clarifying questions
      if (/\b(what do you mean|could you clarify|what does|how do you define)\b/i.test(lower)) {
        type = 'clarifying';
        qualityScore = 70;
        whyItMatters = 'Ensures you understand the question correctly - shows attention to detail';
      }

      // Strategic questions
      if (/\b(what's the priority|what matters most|how do you measure|what's the goal)\b/i.test(lower)) {
        type = 'strategic';
        qualityScore = 90;
        whyItMatters = 'Demonstrates strategic thinking and alignment with business objectives';
      }

      // Curious questions
      if (/\b(why|how come|what led to|interesting|curious about)\b/i.test(lower)) {
        type = 'curious';
        qualityScore = 85;
        whyItMatters = 'Shows intellectual curiosity and desire to understand deeply';
      }

      // Defensive questions
      if (/\b(what do you want me to|am i supposed to|is that what you're asking)\b/i.test(lower)) {
        type = 'defensive';
        qualityScore = 40;
        whyItMatters = 'Sounds defensive. Reframe to show confidence, not insecurity';
      }

      questionsAsked.push({
        question,
        timestamp,
        quality_score: qualityScore,
        type,
        why_it_matters: whyItMatters
      });
    }
  });

  // Calculate average question quality
  const questionQualityAvg = questionsAsked.length > 0
    ? Math.round(questionsAsked.reduce((sum, q) => sum + q.quality_score, 0) / questionsAsked.length)
    : 0;

  // Identify missed opportunities
  const missedOpportunities: StrategicAnalysis['question_analysis']['missed_opportunities'] = [];

  // Look for vague questions that should have been clarified
  sentences.forEach((sentence, idx) => {
    const lower = sentence.toLowerCase();

    // If they encounter ambiguous situations but don't ask
    if (/\b(depends|various|several|different|many)\b/i.test(sentence) && !sentence.includes('?')) {
      missedOpportunities.push({
        timestamp: idx * 8,
        context: sentence.substring(0, 80),
        what_to_ask: 'What specific context should I focus on?',
        why: 'Clarifying ambiguity shows precision and prevents wasted effort'
      });
    }
  });

  return {
    questions_asked: questionsAsked,
    question_quality_avg: questionQualityAvg,
    missed_opportunities: missedOpportunities.slice(0, 3) // Top 3
  };
}

function analyzeResponseFrameworks(transcript: string): StrategicAnalysis['response_framework_analysis'] {
  const lower = transcript.toLowerCase();

  // Check for STAR framework (Situation, Task, Action, Result)
  const hasSTAR = /\b(situation|task|action|result|outcome)\b/gi.test(transcript);

  // Check for answer completeness (addresses all parts)
  let completeness = 70;
  const hasContext = /\b(background|context|situation|at the time)\b/gi.test(transcript);
  const hasAction = /\b(i did|i implemented|i created|i led|i developed)\b/gi.test(transcript);
  const hasResults = /\b(result|outcome|impact|increased|decreased|improved)\b/gi.test(transcript);

  if (hasContext) completeness += 10;
  if (hasAction) completeness += 10;
  if (hasResults) completeness += 10;

  // Storytelling quality
  let storytelling = 60;
  const hasNarrative = /\b(first|then|next|finally|eventually|after that)\b/gi.test(transcript);
  if (hasNarrative) storytelling += 20;

  const hasConflict = /\b(challenge|problem|obstacle|difficult|struggle)\b/gi.test(transcript);
  if (hasConflict) storytelling += 10;

  const hasResolution = /\b(solved|resolved|overcame|achieved|accomplished)\b/gi.test(transcript);
  if (hasResolution) storytelling += 10;

  // Metric usage (quantifies results)
  let metricUsage = 50;
  const numberPattern = /\b\d+(\.\d+)?(%|x|percent|times|million|thousand|billion)\b/gi;
  const metrics = (transcript.match(numberPattern) || []).length;
  metricUsage += Math.min(50, metrics * 15);

  // Business impact connection
  const connectsToBusinessImpact = /\b(revenue|customers|users|growth|efficiency|cost|ROI|conversion|retention)\b/gi.test(transcript);

  return {
    uses_structured_frameworks: hasSTAR,
    answer_completeness: Math.max(0, Math.min(100, completeness)),
    storytelling_quality: Math.max(0, Math.min(100, storytelling)),
    metric_usage: Math.max(0, Math.min(100, metricUsage)),
    connects_to_business_impact: connectsToBusinessImpact
  };
}

function detectIntellectualSignals(transcript: string): StrategicAnalysis['intellectual_signals'] {
  const lower = transcript.toLowerCase();

  // Admits knowledge gaps - STRENGTH, not weakness
  const admitsGaps = /\b(i don't know|not sure|haven't worked with|unfamiliar|need to learn|good question)\b/i.test(transcript);

  // Challenges assumptions
  const challengesAssumptions = /\b(depends on|assuming|if we're talking about|what do you mean by|context)\b/i.test(transcript);

  // Shows meta-awareness (talks about thinking process)
  const showsMetaAwareness = /\b(my approach|the way i think about|i like to|i tend to|my process)\b/i.test(transcript);

  // Learning agility (applies lessons across domains)
  const demonstratesLearningAgility = /\b(learned|applied|adapted|similar to|reminds me of|like when)\b/i.test(transcript);

  return {
    admits_knowledge_gaps: admitsGaps,
    challenges_assumptions: challengesAssumptions,
    shows_meta_awareness: showsMetaAwareness,
    demonstrates_learning_agility: demonstratesLearningAgility
  };
}

function compareGoodVsGreat(
  transcript: string,
  thinkingPatterns: StrategicAnalysis['thinking_patterns'],
  questionAnalysis: StrategicAnalysis['question_analysis']
): StrategicAnalysis['comparison'] {
  const comparisons: StrategicAnalysis['comparison']['good_vs_great_analysis'] = [];

  // Depth comparison
  if (thinkingPatterns.depth_score < 80) {
    comparisons.push({
      your_approach: 'Surface-level explanation: "I implemented a caching solution"',
      great_approach: 'Deep analysis: "I implemented Redis caching because our DB queries were the bottleneck. This reduced p95 latency from 800ms to 120ms, improving conversion by 12%"',
      gap: 'Missing: Root cause identification + quantified impact',
      how_to_bridge: 'Always answer: Why this solution? What was the alternative? What did the metrics show?'
    });
  }

  // Question quality comparison
  if (questionAnalysis.questions_asked.length === 0) {
    comparisons.push({
      your_approach: 'No questions asked - just answer and wait',
      great_approach: 'Asks 2-3 strategic questions: "What\'s the scale we\'re talking about?" or "How does the team currently measure success?"',
      gap: 'Missing: Curiosity and context-gathering',
      how_to_bridge: 'Every complex question deserves 1 clarifying question. It\'s not a test of memory - it\'s a conversation.'
    });
  } else if (questionAnalysis.question_quality_avg < 70) {
    comparisons.push({
      your_approach: 'Asks basic clarifying questions only',
      great_approach: 'Asks strategic questions that reveal deeper thinking about priorities and trade-offs',
      gap: 'Missing: Strategic framing in your questions',
      how_to_bridge: 'Move from "What do you mean?" to "What\'s the most important constraint here?"'
    });
  }

  // Metric usage comparison
  if (thinkingPatterns.strategic_framing < 70) {
    comparisons.push({
      your_approach: 'Describes what you did without business context',
      great_approach: 'Connects every action to business impact: "This freed up 20 eng hours/week, letting us ship the new dashboard 3 weeks early"',
      gap: 'Missing: Translation from engineering work to business value',
      how_to_bridge: 'After every answer, ask yourself: "So what? Why did this matter to the business?"'
    });
  }

  // Authenticity comparison
  if (thinkingPatterns.authenticity_vs_rehearsed < 65) {
    comparisons.push({
      your_approach: 'Polished but generic responses that sound rehearsed',
      great_approach: 'Authentic stories with specific details, including what you learned from mistakes',
      gap: 'Missing: Vulnerability and specificity',
      how_to_bridge: 'Great answers include one thing you\'d do differently. Perfection is boring. Growth is memorable.'
    });
  }

  return {
    good_vs_great_analysis: comparisons
  };
}

function generateStrategicFeedback(
  thinkingPatterns: StrategicAnalysis['thinking_patterns'],
  questionAnalysis: StrategicAnalysis['question_analysis'],
  frameworkAnalysis: StrategicAnalysis['response_framework_analysis'],
  intellectualSignals: StrategicAnalysis['intellectual_signals']
): StrategicAnalysis['feedback'] {
  const intellectualStrengths: string[] = [];
  const thinkingBlindspots: string[] = [];
  const frameworkRecommendations: string[] = [];
  const advancedStrategies: string[] = [];

  // Analyze strengths
  if (thinkingPatterns.depth_score > 75) {
    intellectualStrengths.push('Deep analytical thinking - you go beyond surface explanations');
  }
  if (intellectualSignals.admits_knowledge_gaps) {
    intellectualStrengths.push('Intellectual honesty - comfortable saying "I don\'t know" (this is a strength)');
  }
  if (questionAnalysis.question_quality_avg > 75) {
    intellectualStrengths.push('High-quality questions that reveal strategic thinking');
  }
  if (frameworkAnalysis.metric_usage > 75) {
    intellectualStrengths.push('Strong quantitative thinking - you back claims with numbers');
  }

  // Identify blindspots
  if (thinkingPatterns.curiosity_score < 60) {
    thinkingBlindspots.push('Low curiosity signals - ask more questions to demonstrate intellectual engagement');
  }
  if (frameworkAnalysis.metric_usage < 60) {
    thinkingBlindspots.push('Lack of metrics - quantify your impact. Numbers make claims credible.');
  }
  if (!frameworkAnalysis.connects_to_business_impact) {
    thinkingBlindspots.push('Missing business context - translate technical work into business value');
  }
  if (!intellectualSignals.challenges_assumptions) {
    thinkingBlindspots.push('Taking questions at face value - great candidates clarify assumptions');
  }

  // Framework recommendations
  if (!frameworkAnalysis.uses_structured_frameworks) {
    frameworkRecommendations.push('Use STAR framework: Situation → Task → Action → Result');
  }
  frameworkRecommendations.push('The "Metric First" approach: Lead with the number, then explain it');
  frameworkRecommendations.push('The "So What?" test: After every statement, ask yourself why it matters');

  // Advanced strategies
  advancedStrategies.push('The "Disagree and Commit" story: Show you can challenge ideas respectfully');
  advancedStrategies.push('The "Constraint Reframe": When asked about approach, first ask about constraints');
  advancedStrategies.push('The "Teaching Moment": Explain complex ideas so clearly that you elevate the interviewer');

  return {
    intellectual_strengths: intellectualStrengths,
    thinking_blindspots: thinkingBlindspots,
    framework_recommendations: frameworkRecommendations,
    advanced_strategies: advancedStrategies
  };
}

function calculateStrategicScore(
  thinkingPatterns: StrategicAnalysis['thinking_patterns'],
  questionAnalysis: StrategicAnalysis['question_analysis'],
  frameworkAnalysis: StrategicAnalysis['response_framework_analysis'],
  intellectualSignals: StrategicAnalysis['intellectual_signals']
): number {
  // Thinking patterns (40%)
  const thinkingScore = (
    thinkingPatterns.depth_score * 0.30 +
    thinkingPatterns.curiosity_score * 0.25 +
    thinkingPatterns.ambiguity_handling * 0.20 +
    thinkingPatterns.strategic_framing * 0.25
  );

  // Framework usage (30%)
  const frameworkScore = (
    frameworkAnalysis.answer_completeness * 0.30 +
    frameworkAnalysis.storytelling_quality * 0.25 +
    frameworkAnalysis.metric_usage * 0.45
  );

  // Question quality (20%)
  const questionScore = questionAnalysis.question_quality_avg || 50;

  // Intellectual signals (10%)
  let signalScore = 50;
  if (intellectualSignals.admits_knowledge_gaps) signalScore += 15;
  if (intellectualSignals.challenges_assumptions) signalScore += 15;
  if (intellectualSignals.shows_meta_awareness) signalScore += 10;
  if (intellectualSignals.demonstrates_learning_agility) signalScore += 10;

  const overallScore = Math.round(
    thinkingScore * 0.40 +
    frameworkScore * 0.30 +
    questionScore * 0.20 +
    signalScore * 0.10
  );

  return Math.max(0, Math.min(100, overallScore));
}
