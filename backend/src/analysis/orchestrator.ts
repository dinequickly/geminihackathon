import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || 'placeholder';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface AnalysisResult {
  communication_score: number;
  presence_score: number;
  overall_score: number;
  overall_level: string;
  speaking_pace_wpm: number;
  filler_word_count: number;
  feedback: any;
}

export async function runFullAnalysis(conversationId: string): Promise<AnalysisResult> {
  console.log(`[${conversationId}] Starting full analysis...`);

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

    console.log(`[${conversationId}] Found conversation, transcript length: ${conversation.transcript?.length || 0}`);

    // 2. Analyze Transcript (Simulated or via simple regex)
    // In a real python module, this would use NLP libraries.
    const transcript = conversation.transcript || '';
    const words = transcript.split(/\s+/);
    const wordCount = words.length;
    const durationMinutes = (conversation.duration_seconds || 60) / 60;
    const wpm = Math.round(wordCount / durationMinutes) || 0;

    // Simple filler word detection
    const fillerWords = ['um', 'uh', 'like', 'you know', 'sort of'];
    const fillerCount = words.filter((w: string) => fillerWords.includes(w.toLowerCase().replace(/[^a-z]/g, ''))).length;

    // Communication Score Calculation
    // Optimal pace: 120-150 wpm
    let paceScore = 100;
    if (wpm < 100) paceScore = 70;
    if (wpm < 80) paceScore = 50;
    if (wpm > 160) paceScore = 80;
    if (wpm > 180) paceScore = 60;

    const fillerScore = Math.max(0, 100 - (fillerCount * 5)); // Deduct 5 points per filler
    const communicationScore = Math.round((paceScore + fillerScore) / 2);

    // 3. Analyze Video (Simulated)
    // This would use the face-api.js logic or Python OpenCV.
    // For this orchestrator, we will simulate a "Presence Score" based on assumptions
    // or placeholders since we can't run heavy ML here easily without the python env.
    const presenceScore = Math.floor(Math.random() * (95 - 70) + 70); // Random score between 70-95 for prototype

    // 4. Composite Scoring
    // "Overall score (0-100): Weighted average of communication (40%) and presence (60%)"
    const overallScore = Math.round((communicationScore * 0.4) + (presenceScore * 0.6));

    let overallLevel = 'competent';
    if (overallScore >= 90) overallLevel = 'exceptional';
    else if (overallScore >= 80) overallLevel = 'strong';
    else if (overallScore < 60) overallLevel = 'needs_work';
    else if (overallScore < 70) overallLevel = 'developing';

    const analysisResult: AnalysisResult = {
      communication_score: communicationScore,
      presence_score: presenceScore,
      overall_score: overallScore,
      overall_level: overallLevel,
      speaking_pace_wpm: wpm,
      filler_word_count: fillerCount,
      feedback: {
        summary: `You spoke at ${wpm} WPM with ${fillerCount} detected filler words.`,
        top_improvements: wpm < 120 ? [{ area: "Pace", suggestion: "Try to speak a bit faster." }] : []
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
          speaking_pace_wpm: wpm,
          filler_word_count: fillerCount,
          technical_score: communicationScore,
          presence_score: presenceScore,
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
          user_id: conversation.user_id,
          overall_score: overallScore,
          overall_level: overallLevel,
          speaking_pace_wpm: wpm,
          filler_word_count: fillerCount,
          technical_score: communicationScore,
          presence_score: presenceScore,
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

    console.log(`[${conversationId}] Full analysis completed successfully`);
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
