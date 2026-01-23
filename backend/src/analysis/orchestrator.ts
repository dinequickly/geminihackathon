import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { analyzeCommunication, CommunicationAnalysis } from './communicationAgent';
import { analyzeEmotionalIntelligence, EmotionalAnalysis } from './emotionalAgent';
import { analyzeExecutivePresence, PresenceAnalysis } from './presenceAgent';
import { analyzeStrategicThinking, StrategicAnalysis } from './strategicAgent';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || 'placeholder';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface AnalysisResult {
  // Overall scores
  overall_score: number;
  overall_level: string;

  // Individual agent scores
  communication_score: number;
  emotional_score: number;
  presence_score: number;
  strategic_score: number;

  // Legacy fields for backwards compatibility
  speaking_pace_wpm: number;
  filler_word_count: number;

  // Detailed analysis from each agent
  communication_analysis: CommunicationAnalysis;
  emotional_analysis: EmotionalAnalysis;
  presence_analysis: PresenceAnalysis;
  strategic_analysis: StrategicAnalysis;

  // Aggregated insights
  key_insights: Array<{
    type: 'pattern' | 'strength' | 'focus_area';
    title: string;
    description: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
  }>;

  feedback: any;
}

export async function runFullAnalysis(conversationId: string): Promise<AnalysisResult> {
  console.log(`[${conversationId}] Starting 4-agent analysis orchestration...`);

  try {
    // 1. Fetch conversation data (transcript, video path)
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error || !conversation) {
      console.error(`[${conversationId}] Conversation not found:`, error?.message);
      throw new Error(`Conversation not found: ${error?.message}`);
    }

    console.log(`[${conversationId}] Found conversation, starting parallel agent analysis...`);

    const transcript = conversation.transcript || '';
    const transcriptJson = conversation.transcript_json;
    const durationSeconds = conversation.duration_seconds || 60;
    const videoUrl = conversation.video_url;

    // 2. Run all 4 agents in parallel for maximum efficiency
    console.log(`[${conversationId}] Launching 4 specialized agents...`);

    const [
      communicationAnalysis,
      emotionalAnalysis,
      presenceAnalysis,
      strategicAnalysis
    ] = await Promise.all([
      analyzeCommunication(transcript, transcriptJson, durationSeconds),
      analyzeEmotionalIntelligence(transcript, transcriptJson),
      analyzeExecutivePresence(transcript, transcriptJson, videoUrl),
      analyzeStrategicThinking(transcript, transcriptJson)
    ]);

    console.log(`[${conversationId}] All agents completed. Aggregating results...`);

    // 3. Calculate overall score (weighted average of all 4 agents)
    const overallScore = Math.round(
      communicationAnalysis.score * 0.25 +  // Communication: 25%
      emotionalAnalysis.score * 0.25 +      // Emotional IQ: 25%
      presenceAnalysis.score * 0.25 +       // Executive Presence: 25%
      strategicAnalysis.score * 0.25        // Strategic Thinking: 25%
    );

    let overallLevel = 'competent';
    if (overallScore >= 90) overallLevel = 'exceptional';
    else if (overallScore >= 80) overallLevel = 'strong';
    else if (overallScore >= 70) overallLevel = 'competent';
    else if (overallScore >= 60) overallLevel = 'developing';
    else overallLevel = 'needs_work';

    // 4. Generate key insights (aggregated from all agents)
    const keyInsights = generateKeyInsights(
      communicationAnalysis,
      emotionalAnalysis,
      presenceAnalysis,
      strategicAnalysis
    );

    const analysisResult: AnalysisResult = {
      overall_score: overallScore,
      overall_level: overallLevel,

      communication_score: communicationAnalysis.score,
      emotional_score: emotionalAnalysis.score,
      presence_score: presenceAnalysis.score,
      strategic_score: strategicAnalysis.score,

      speaking_pace_wpm: communicationAnalysis.metrics.speaking_pace_wpm,
      filler_word_count: communicationAnalysis.metrics.filler_word_count,

      communication_analysis: communicationAnalysis,
      emotional_analysis: emotionalAnalysis,
      presence_analysis: presenceAnalysis,
      strategic_analysis: strategicAnalysis,

      key_insights: keyInsights,

      feedback: {
        summary: generateOverallSummary(overallScore, communicationAnalysis, emotionalAnalysis, presenceAnalysis, strategicAnalysis),
        top_improvements: generateTopImprovements(communicationAnalysis, emotionalAnalysis, presenceAnalysis, strategicAnalysis)
      }
    };

    // 5. Save to Database
    // First, check if analysis already exists
    const { data: existingAnalysis } = await supabase
      .from('emotion_analysis')
      .select('id')
      .eq('conversation_id', conversationId)
      .single();

    let analysisError;
    if (existingAnalysis) {
      // Update existing analysis
      const { error } = await supabase
        .from('emotion_analysis')
        .update({
          overall_score: overallScore,
          overall_level: overallLevel,
          speaking_pace_wpm: analysisResult.speaking_pace_wpm,
          filler_word_count: analysisResult.filler_word_count,
          technical_score: communicationAnalysis.score,
          eq_score: emotionalAnalysis.score,
          presence_score: presenceAnalysis.score,
          // Store all agent results in full_analysis_json
          full_analysis_json: analysisResult
        })
        .eq('conversation_id', conversationId);
      analysisError = error;
    } else {
      // Insert new analysis
      const { error } = await supabase
        .from('emotion_analysis')
        .insert({
          conversation_id: conversationId,
          overall_score: overallScore,
          overall_level: overallLevel,
          speaking_pace_wpm: analysisResult.speaking_pace_wpm,
          filler_word_count: analysisResult.filler_word_count,
          technical_score: communicationAnalysis.score,
          eq_score: emotionalAnalysis.score,
          presence_score: presenceAnalysis.score,
          // Store all agent results in full_analysis_json
          full_analysis_json: analysisResult
        });
      analysisError = error;
    }

    if (analysisError) {
        console.error(`[${conversationId}] Error saving analysis:`, analysisError);
        throw analysisError;
    }

    // Update conversation status
    console.log(`[${conversationId}] Analysis saved successfully, updating status to analyzed`);
    await supabase
      .from('conversations')
      .update({ status: 'analyzed' })
      .eq('id', conversationId);

    console.log(`[${conversationId}] 4-agent analysis completed successfully`);
    return analysisResult;
  } catch (error: any) {
    console.error(`[${conversationId}] Analysis failed:`, error.message);

    // Update status to error
    await supabase
      .from('conversations')
      .update({ status: 'error' })
      .eq('id', conversationId);

    throw error;
  }
}

/**
 * Generate key insights by aggregating the most important findings from all agents
 */
function generateKeyInsights(
  communication: CommunicationAnalysis,
  emotional: EmotionalAnalysis,
  presence: PresenceAnalysis,
  strategic: StrategicAnalysis
): AnalysisResult['key_insights'] {
  const insights: AnalysisResult['key_insights'] = [];

  // PATTERN DETECTED: Communication patterns
  if (communication.patterns.hesitation_triggers.length > 0) {
    insights.push({
      type: 'pattern',
      title: 'Communication Pattern Detected',
      description: `You use filler words when ${communication.patterns.hesitation_triggers[0].toLowerCase()}`,
      action: 'Record yourself explaining the same concept 3 times back-to-back to build fluency',
      priority: 'high'
    });
  }

  // STRENGTH: Emotional regulation
  if (emotional.regulation_metrics.stress_recovery_time_avg < 20 && emotional.regulation_metrics.stress_recovery_time_avg > 0) {
    insights.push({
      type: 'strength',
      title: 'Excellent Stress Recovery',
      description: `You recover from confusion in ~${emotional.regulation_metrics.stress_recovery_time_avg}s - shows strong emotional regulation`,
      action: 'This is a key strength. Study these moments to understand your recovery process',
      priority: 'medium'
    });
  }

  // FOCUS AREA: Executive presence
  if (presence.comparison_to_top_performers.specific_gaps.length > 0) {
    const topGap = presence.comparison_to_top_performers.specific_gaps[0];
    insights.push({
      type: 'focus_area',
      title: `${topGap.area} Needs Work`,
      description: `Your score: ${topGap.your_score} | Top 10%: ${topGap.top_10_avg}`,
      action: topGap.improvement,
      priority: 'high'
    });
  }

  // FOCUS AREA: Strategic thinking
  if (strategic.thinking_patterns.depth_score < 70) {
    insights.push({
      type: 'focus_area',
      title: 'Increase Answer Depth',
      description: 'Your answers explain what you did but not why it mattered',
      action: 'Use the "So What?" framework: After every statement, ask yourself why it matters to the business',
      priority: 'high'
    });
  }

  // PATTERN: Metric usage
  if (strategic.response_framework_analysis.metric_usage < 60) {
    insights.push({
      type: 'pattern',
      title: 'Missing Quantifiable Results',
      description: 'You describe actions but rarely quantify outcomes',
      action: 'Prepare 3-5 key metrics for each project. Numbers make claims credible.',
      priority: 'high'
    });
  }

  // STRENGTH: Authenticity
  if (emotional.regulation_metrics.authenticity_score > 75) {
    insights.push({
      type: 'strength',
      title: 'Authentic Communication',
      description: 'Your emotional expression feels genuine - not over-rehearsed',
      action: 'Maintain this authenticity. It builds trust with interviewers.',
      priority: 'low'
    });
  }

  // FOCUS AREA: Questions
  if (strategic.question_analysis.questions_asked.length === 0) {
    insights.push({
      type: 'focus_area',
      title: 'Ask More Questions',
      description: 'You didn\'t ask any questions during the interview',
      action: 'Every complex question deserves 1 clarifying question. It shows engagement and precision.',
      priority: 'high'
    });
  }

  // Return top 5-6 insights, prioritized
  return insights
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 6);
}

/**
 * Generate overall summary incorporating all agent findings
 */
function generateOverallSummary(
  overallScore: number,
  communication: CommunicationAnalysis,
  emotional: EmotionalAnalysis,
  presence: PresenceAnalysis,
  strategic: StrategicAnalysis
): string {
  const parts: string[] = [];

  // Overall performance
  if (overallScore >= 80) {
    parts.push('Strong performance overall.');
  } else if (overallScore >= 70) {
    parts.push('Solid performance with clear areas for improvement.');
  } else {
    parts.push('Several key areas need focused practice.');
  }

  // Highlight top strength
  const scores = [
    { name: 'communication', score: communication.score },
    { name: 'emotional intelligence', score: emotional.score },
    { name: 'executive presence', score: presence.score },
    { name: 'strategic thinking', score: strategic.score }
  ].sort((a, b) => b.score - a.score);

  parts.push(`Your strongest area is ${scores[0].name} (${scores[0].score}/100).`);

  // Highlight area needing most work
  parts.push(`Focus on improving ${scores[3].name} (${scores[3].score}/100).`);

  // Communication specifics
  parts.push(`You spoke at ${communication.metrics.speaking_pace_wpm} WPM with ${communication.metrics.filler_word_count} filler words.`);

  return parts.join(' ');
}

/**
 * Generate top 3-5 improvements across all agents
 */
function generateTopImprovements(
  communication: CommunicationAnalysis,
  emotional: EmotionalAnalysis,
  presence: PresenceAnalysis,
  strategic: StrategicAnalysis
): Array<{ area: string; suggestion: string }> {
  const improvements: Array<{ area: string; suggestion: string; priority: number }> = [];

  // Communication improvements
  if (communication.feedback.areas_for_improvement.length > 0) {
    improvements.push({
      area: 'Communication',
      suggestion: communication.feedback.areas_for_improvement[0],
      priority: communication.score
    });
  }

  // Emotional improvements
  if (emotional.feedback.growth_areas.length > 0) {
    improvements.push({
      area: 'Emotional Intelligence',
      suggestion: emotional.feedback.growth_areas[0],
      priority: emotional.score
    });
  }

  // Presence improvements
  if (presence.feedback.what_needs_work.length > 0) {
    improvements.push({
      area: 'Executive Presence',
      suggestion: presence.feedback.what_needs_work[0],
      priority: presence.score
    });
  }

  // Strategic improvements
  if (strategic.feedback.thinking_blindspots.length > 0) {
    improvements.push({
      area: 'Strategic Thinking',
      suggestion: strategic.feedback.thinking_blindspots[0],
      priority: strategic.score
    });
  }

  // Add quick wins from presence agent
  if (presence.feedback.quick_wins.length > 0) {
    improvements.push({
      area: 'Quick Win',
      suggestion: presence.feedback.quick_wins[0],
      priority: 1000 // Always include quick wins
    });
  }

  // Sort by priority (lower score = higher priority for improvement)
  return improvements
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5)
    .map(({ area, suggestion }) => ({ area, suggestion }));
}
