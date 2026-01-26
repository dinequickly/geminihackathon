/**
 * TIMELINE BUILDER
 *
 * Merges ElevenLabs conversation transcripts with Hume emotion data
 * into 1-second buckets. Calculates WPM, detects filler words,
 * performs linguistic analysis via Python service, and sends
 * enriched payload to n8n webhook for multi-agent LLM analysis.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  ElevenLabsTranscriptEntry,
  HumeEmotionEntry,
  TimelineEntry,
  TimelineResult,
  TimelineSummary,
  TimelineMetadata,
  EmotionBucket,
  ProsodyBucket,
  FillerWordResult,
  LinguisticFeatures,
  BuildTimelineOptions,
  PythonAnalysisRequest,
  PythonAnalysisResponse
} from './types/timeline.js';

// ============================================================
// CONFIGURATION (lazy initialization)
// ============================================================

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_KEY must be set');
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

function getN8nWebhookUrl(): string {
  return process.env.N8N_TIMELINE_WEBHOOK_URL || 'https://maxipad.app.n8n.cloud/webhook/fc8e82d1-cd60-4a3e-ad49-b0ee81a20fac';
}

function getLinguisticServiceUrl(): string {
  return process.env.LINGUISTIC_SERVICE_URL || '';
}

function getHumeApiKey(): string {
  return process.env.HUME_API_KEY || '';
}

// ============================================================
// HUME API (fetch predictions live)
// ============================================================

interface HumePrediction {
  time?: number;  // For face (single timestamp)
  time_begin?: number;  // For prosody (range)
  time_end?: number;
  emotions: Array<{ name: string; score: number }>;
  box?: { x: number; y: number; w: number; h: number };
}

/**
 * Fetch Hume predictions by job ID from the Hume API.
 */
async function fetchHumePredictions(jobId: string): Promise<HumeEmotionEntry[]> {
  const apiKey = getHumeApiKey();
  if (!apiKey) {
    console.warn('[TimelineBuilder] HUME_API_KEY not configured, skipping live Hume fetch');
    return [];
  }

  try {
    const response = await fetch(`https://api.hume.ai/v0/batch/jobs/${jobId}/predictions`, {
      headers: { 'X-Hume-Api-Key': apiKey }
    });

    if (!response.ok) {
      console.error(`[TimelineBuilder] Hume API returned ${response.status}`);
      return [];
    }

    const predictions = await response.json();
    const entries: HumeEmotionEntry[] = [];

    const pred = predictions?.[0]?.results?.predictions?.[0];
    if (!pred) return entries;

    // Process face predictions
    if (pred.models?.face?.grouped_predictions) {
      for (const group of pred.models.face.grouped_predictions) {
        for (const p of group.predictions || []) {
          const topEmotion = p.emotions?.reduce(
            (max: any, e: any) => (e.score > max.score ? e : max),
            { name: '', score: 0 }
          );
          entries.push({
            id: '',
            conversation_id: '',
            model_type: 'face',
            start_timestamp_ms: Math.round((p.time || 0) * 1000),
            end_timestamp_ms: Math.round((p.time || 0) * 1000) + 33,
            emotions: p.emotions || [],
            top_emotion_name: topEmotion?.name || '',
            top_emotion_score: topEmotion?.score || 0,
            face_bounding_box: p.box
          });
        }
      }
    }

    // Process prosody predictions
    if (pred.models?.prosody?.grouped_predictions) {
      for (const group of pred.models.prosody.grouped_predictions) {
        for (const p of group.predictions || []) {
          const topEmotion = p.emotions?.reduce(
            (max: any, e: any) => (e.score > max.score ? e : max),
            { name: '', score: 0 }
          );
          entries.push({
            id: '',
            conversation_id: '',
            model_type: 'prosody',
            start_timestamp_ms: Math.round((p.time?.begin || 0) * 1000),
            end_timestamp_ms: Math.round((p.time?.end || 0) * 1000),
            emotions: p.emotions || [],
            top_emotion_name: topEmotion?.name || '',
            top_emotion_score: topEmotion?.score || 0
          });
        }
      }
    }

    return entries;
  } catch (error: any) {
    console.error(`[TimelineBuilder] Hume fetch failed: ${error.message}`);
    return [];
  }
}

async function storeEmotionTimelines(
  supabase: SupabaseClient,
  conversationId: string,
  emotions: HumeEmotionEntry[]
): Promise<void> {
  if (emotions.length === 0) return;

  await supabase
    .from('emotion_timelines')
    .delete()
    .eq('conversation_id', conversationId);

  const records = emotions.map(e => ({
    conversation_id: conversationId,
    model_type: e.model_type,
    start_timestamp_ms: e.start_timestamp_ms,
    end_timestamp_ms: e.end_timestamp_ms,
    emotions: e.emotions,
    top_emotion_name: e.top_emotion_name || null,
    top_emotion_score: e.top_emotion_score || null,
    face_bounding_box: e.face_bounding_box || null
  }));

  for (let i = 0; i < records.length; i += 500) {
    const batch = records.slice(i, i + 500);
    const { error } = await supabase
      .from('emotion_timelines')
      .insert(batch);

    if (error) {
      console.error(`[TimelineBuilder:${conversationId}] Timeline insert error: ${error.message}`);
    }
  }
}

// Filler words to detect (case-insensitive)
const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'so', 'basically'];
const FILLER_REGEX = new RegExp(`\\b(${FILLER_WORDS.join('|')})\\b`, 'gi');

// ============================================================
// MAIN ENTRY POINT
// ============================================================

/**
 * Build a timeline for a conversation by merging transcript and emotion data.
 */
export async function buildTimeline(options: BuildTimelineOptions): Promise<TimelineResult> {
  const {
    conversationId,
    sendToWebhook = true,
    runLinguisticAnalysis = true,
    linguisticServiceUrl = getLinguisticServiceUrl(),
    n8nWebhookUrl = getN8nWebhookUrl()
  } = options;

  const supabase = getSupabase();

  console.log(`[TimelineBuilder:${conversationId}] Starting timeline build...`);

  try {
    // 1. Fetch conversation data
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      throw new Error(`Conversation not found: ${convError?.message}`);
    }

    // Normalize transcript_json - handle nested arrays from ElevenLabs
    let transcriptJson = conversation.transcript_json as ElevenLabsTranscriptEntry[] | null;
    if (Array.isArray(transcriptJson) && transcriptJson.length === 1 && Array.isArray(transcriptJson[0])) {
      // Unwrap nested array: [[...]] -> [...]
      transcriptJson = transcriptJson[0] as ElevenLabsTranscriptEntry[];
      console.log(`[TimelineBuilder:${conversationId}] Unwrapped nested transcript array`);
    }

    const durationSeconds = conversation.duration_seconds || 60;

    console.log(`[TimelineBuilder:${conversationId}] Duration: ${durationSeconds}s, Transcript entries: ${transcriptJson?.length || 0}`);

    // Debug: log first transcript entry structure
    if (transcriptJson && transcriptJson.length > 0) {
      const first = transcriptJson[0];
      console.log(`[TimelineBuilder:${conversationId}] First entry: role=${first.role}, time=${first.time_in_call_secs}, msg_len=${first.message?.length || 0}`);
    }

    // 2. Fetch emotion timeline data (try database first, then Hume API)
    let emotions: HumeEmotionEntry[] = [];

    // Try database first
    const { data: emotionData, error: emotionError } = await supabase
      .from('emotion_timelines')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('start_timestamp_ms', { ascending: true });

    if (emotionError) {
      console.warn(`[TimelineBuilder:${conversationId}] DB emotion fetch failed: ${emotionError.message}`);
    }

    emotions = (emotionData || []) as HumeEmotionEntry[];

    // If no data in DB, try fetching from Hume API using hume_job_id
    if (emotions.length === 0) {
      const expressionProgress = (conversation as any).expression_progress as { hume_job_id?: string } | null;
      const humeJobId = expressionProgress?.hume_job_id;

      if (humeJobId) {
        console.log(`[TimelineBuilder:${conversationId}] No DB data, fetching from Hume API (job: ${humeJobId})...`);
        emotions = await fetchHumePredictions(humeJobId);
        if (emotions.length > 0) {
          await storeEmotionTimelines(supabase, conversationId, emotions);
        }
        console.log(`[TimelineBuilder:${conversationId}] Fetched ${emotions.length} entries from Hume API`);
      } else {
        console.log(`[TimelineBuilder:${conversationId}] No hume_job_id found, skipping emotion data`);
      }
    }

    const faceEmotions = emotions.filter(e => e.model_type === 'face');
    const prosodyEmotions = emotions.filter(e => e.model_type === 'prosody');

    console.log(`[TimelineBuilder:${conversationId}] Emotion data: ${faceEmotions.length} face, ${prosodyEmotions.length} prosody`);

    // 3. Group data by second
    const transcriptBySecond = groupTranscriptBySecond(transcriptJson || [], durationSeconds);
    const faceBySecond = groupEmotionsBySecond(faceEmotions, durationSeconds);
    const prosodyBySecond = groupEmotionsBySecond(prosodyEmotions, durationSeconds);

    // 4. Build timeline entries (without linguistic features first)
    const timeline: TimelineEntry[] = [];

    for (let second = 0; second < durationSeconds; second++) {
      const transcriptSegment = transcriptBySecond.get(second);
      const faceSegment = faceBySecond.get(second);
      const prosodySegment = prosodyBySecond.get(second);

      const text = transcriptSegment?.text || '';
      const wordCount = countWords(text);
      const wpm = wordCount * 60; // Words per minute extrapolated from 1 second

      timeline.push({
        timestamp: second,
        timestamp_ms: second * 1000,
        speaker: transcriptSegment?.speaker || null,
        text,
        word_count: wordCount,
        wpm,
        emotions: faceSegment ? calculateEmotionBucket(faceSegment) : null,
        prosody: prosodySegment ? calculateProsodyBucket(prosodySegment) : null,
        filler_words: detectFillerWords(text),
        linguistic_features: null // Will be populated by Python service
      });
    }

    // 5. Run linguistic analysis (if enabled and service URL configured)
    if (runLinguisticAnalysis && linguisticServiceUrl) {
      console.log(`[TimelineBuilder:${conversationId}] Running linguistic analysis...`);
      await addLinguisticFeatures(timeline, linguisticServiceUrl, conversationId);
    } else if (runLinguisticAnalysis && !linguisticServiceUrl) {
      console.warn(`[TimelineBuilder:${conversationId}] Linguistic service URL not configured, skipping analysis`);
    }

    // 6. Calculate summary statistics
    const summary = calculateSummary(timeline, durationSeconds);

    // 7. Build metadata
    const metadata: TimelineMetadata = {
      built_at: new Date().toISOString(),
      transcript_entries: transcriptJson?.length || 0,
      emotion_datapoints: {
        face: faceEmotions.length,
        prosody: prosodyEmotions.length
      },
      linguistic_analysis_ran: runLinguisticAnalysis && !!linguisticServiceUrl,
      webhook_sent: false
    };

    // 8. Assemble result
    const result: TimelineResult = {
      conversation_id: conversationId,
      duration_seconds: durationSeconds,
      total_entries: timeline.length,
      timeline,
      summary,
      metadata
    };

    // 9. Send to n8n webhook (if enabled)
    if (sendToWebhook && n8nWebhookUrl) {
      console.log(`[TimelineBuilder:${conversationId}] Sending to n8n webhook...`);
      try {
        const webhookResponse = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result)
        });

        metadata.webhook_sent = true;
        metadata.webhook_response_status = webhookResponse.status;

        if (!webhookResponse.ok) {
          console.error(`[TimelineBuilder:${conversationId}] Webhook returned ${webhookResponse.status}`);
        } else {
          console.log(`[TimelineBuilder:${conversationId}] Webhook sent successfully`);
        }
      } catch (webhookError: any) {
        console.error(`[TimelineBuilder:${conversationId}] Webhook failed: ${webhookError.message}`);
        metadata.webhook_sent = false;
      }
    }

    console.log(`[TimelineBuilder:${conversationId}] Timeline build completed. ${timeline.length} entries.`);
    return result;

  } catch (error: any) {
    console.error(`[TimelineBuilder:${conversationId}] Build failed: ${error.message}`);
    throw error;
  }
}

// ============================================================
// GROUPING FUNCTIONS
// ============================================================

interface TranscriptSegment {
  text: string;
  speaker: 'user' | 'agent';
  wordCount: number;
}

/**
 * Group transcript entries by second, merging text from entries in the same second.
 */
function groupTranscriptBySecond(
  entries: ElevenLabsTranscriptEntry[],
  durationSeconds: number
): Map<number, TranscriptSegment> {
  const bySecond = new Map<number, TranscriptSegment>();

  for (const entry of entries) {
    const second = Math.floor(entry.time_in_call_secs);
    if (second < 0 || second >= durationSeconds) continue;

    const existing = bySecond.get(second);
    if (existing) {
      // Append text, keep most recent speaker
      existing.text += ' ' + (entry.message || '');
      existing.speaker = entry.role;
      existing.wordCount = countWords(existing.text);
    } else {
      bySecond.set(second, {
        text: entry.message || '',
        speaker: entry.role,
        wordCount: countWords(entry.message || '')
      });
    }
  }

  return bySecond;
}

/**
 * Group emotion entries by second.
 */
function groupEmotionsBySecond(
  entries: HumeEmotionEntry[],
  durationSeconds: number
): Map<number, HumeEmotionEntry[]> {
  const bySecond = new Map<number, HumeEmotionEntry[]>();

  for (const entry of entries) {
    const second = Math.floor(entry.start_timestamp_ms / 1000);
    if (second < 0 || second >= durationSeconds) continue;

    const existing = bySecond.get(second);
    if (existing) {
      existing.push(entry);
    } else {
      bySecond.set(second, [entry]);
    }
  }

  return bySecond;
}

// ============================================================
// EMOTION AGGREGATION
// ============================================================

/**
 * Calculate aggregated emotion bucket (top 3 + volatility) from multiple entries.
 */
function calculateEmotionBucket(entries: HumeEmotionEntry[]): EmotionBucket {
  if (entries.length === 0) {
    return { top_3: [], volatility: 0, raw_count: 0 };
  }

  // Aggregate all emotions across entries
  const emotionSums = new Map<string, { sum: number; count: number; scores: number[] }>();

  for (const entry of entries) {
    for (const emotion of entry.emotions || []) {
      const existing = emotionSums.get(emotion.name);
      if (existing) {
        existing.sum += emotion.score;
        existing.count++;
        existing.scores.push(emotion.score);
      } else {
        emotionSums.set(emotion.name, {
          sum: emotion.score,
          count: 1,
          scores: [emotion.score]
        });
      }
    }
  }

  // Calculate averages and sort by average score
  const averaged = Array.from(emotionSums.entries())
    .map(([name, data]) => ({
      name,
      score: data.sum / data.count,
      scores: data.scores
    }))
    .sort((a, b) => b.score - a.score);

  // Get top 3
  const top_3 = averaged.slice(0, 3).map(e => ({
    name: e.name,
    score: Math.round(e.score * 1000) / 1000
  }));

  // Calculate volatility (std dev of top emotion scores across entries)
  const topEmotionScores = entries.map(e => e.top_emotion_score);
  const volatility = calculateStdDev(topEmotionScores);

  return {
    top_3,
    volatility: Math.round(volatility * 1000) / 1000,
    raw_count: entries.length
  };
}

/**
 * Calculate aggregated prosody bucket from multiple entries.
 */
function calculateProsodyBucket(entries: HumeEmotionEntry[]): ProsodyBucket {
  if (entries.length === 0) {
    return { top_3: [], avg_score: 0, raw_count: 0 };
  }

  // Aggregate all emotions across entries
  const emotionSums = new Map<string, { sum: number; count: number }>();

  for (const entry of entries) {
    for (const emotion of entry.emotions || []) {
      const existing = emotionSums.get(emotion.name);
      if (existing) {
        existing.sum += emotion.score;
        existing.count++;
      } else {
        emotionSums.set(emotion.name, { sum: emotion.score, count: 1 });
      }
    }
  }

  // Calculate averages and sort
  const averaged = Array.from(emotionSums.entries())
    .map(([name, data]) => ({
      name,
      score: data.sum / data.count
    }))
    .sort((a, b) => b.score - a.score);

  const top_3 = averaged.slice(0, 3).map(e => ({
    name: e.name,
    score: Math.round(e.score * 1000) / 1000
  }));

  // Calculate average of top emotion scores
  const avgScore = entries.reduce((sum, e) => sum + e.top_emotion_score, 0) / entries.length;

  return {
    top_3,
    avg_score: Math.round(avgScore * 1000) / 1000,
    raw_count: entries.length
  };
}

// ============================================================
// FILLER WORD DETECTION
// ============================================================

/**
 * Detect filler words in text using pattern matching.
 */
function detectFillerWords(text: string): FillerWordResult {
  if (!text) {
    return { count: 0, instances: [] };
  }

  const matches = text.match(FILLER_REGEX) || [];
  return {
    count: matches.length,
    instances: matches.map(m => m.toLowerCase())
  };
}

// ============================================================
// LINGUISTIC ANALYSIS (Python Service)
// ============================================================

/**
 * Call the Python linguistic service to add linguistic features to timeline entries.
 */
async function addLinguisticFeatures(
  timeline: TimelineEntry[],
  serviceUrl: string,
  conversationId: string
): Promise<void> {
  // Prepare segments for analysis (only entries with text)
  const segments = timeline
    .filter(entry => entry.text.trim().length > 0)
    .map(entry => ({
      segment_index: entry.timestamp,
      text: entry.text
    }));

  if (segments.length === 0) {
    console.log(`[TimelineBuilder:${conversationId}] No text segments to analyze`);
    return;
  }

  try {
    const request: PythonAnalysisRequest = { segments };

    const response = await fetch(`${serviceUrl}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Linguistic service returned ${response.status}`);
    }

    const result: PythonAnalysisResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Unknown error from linguistic service');
    }

    // Map results back to timeline entries
    for (const analysisResult of result.results) {
      const entry = timeline[analysisResult.segment_index];
      if (entry) {
        entry.linguistic_features = {
          orality_score: analysisResult.orality_score,
          parts_of_speech: analysisResult.parts_of_speech,
          discourse_markers: analysisResult.discourse_markers,
          readability_score: analysisResult.readability_score,
          readability_metrics: analysisResult.readability_metrics,
          lingfeat_summary: analysisResult.lingfeat_summary
        };
      }
    }

    console.log(`[TimelineBuilder:${conversationId}] Linguistic analysis completed for ${result.results.length} segments`);

  } catch (error: any) {
    console.error(`[TimelineBuilder:${conversationId}] Linguistic analysis failed: ${error.message}`);
    // Don't throw - continue without linguistic features (graceful degradation)
  }
}

// ============================================================
// SUMMARY CALCULATION
// ============================================================

/**
 * Calculate summary statistics for the entire timeline.
 */
function calculateSummary(timeline: TimelineEntry[], durationSeconds: number): TimelineSummary {
  // Average WPM (only for entries with text)
  const entriesWithText = timeline.filter(e => e.word_count > 0);
  const avgWpm = entriesWithText.length > 0
    ? Math.round(entriesWithText.reduce((sum, e) => sum + e.wpm, 0) / entriesWithText.length)
    : 0;

  // Total filler words
  const totalFillerWords = timeline.reduce((sum, e) => sum + e.filler_words.count, 0);

  // Dominant emotions (count frequency)
  const emotionCounts = new Map<string, number>();
  for (const entry of timeline) {
    if (entry.emotions?.top_3?.[0]) {
      const name = entry.emotions.top_3[0].name;
      emotionCounts.set(name, (emotionCounts.get(name) || 0) + 1);
    }
  }

  const dominantEmotions = Array.from(emotionCounts.entries())
    .map(([name, count]) => ({
      name,
      frequency: Math.round((count / timeline.length) * 100)
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  // Average emotion volatility
  const entriesWithEmotions = timeline.filter(e => e.emotions);
  const avgVolatility = entriesWithEmotions.length > 0
    ? Math.round(entriesWithEmotions.reduce((sum, e) => sum + (e.emotions?.volatility || 0), 0) / entriesWithEmotions.length * 1000) / 1000
    : 0;

  // Speaking time percentages
  const userSeconds = timeline.filter(e => e.speaker === 'user').length;
  const agentSeconds = timeline.filter(e => e.speaker === 'agent').length;

  return {
    avg_wpm: avgWpm,
    total_filler_words: totalFillerWords,
    dominant_emotions: dominantEmotions,
    avg_emotion_volatility: avgVolatility,
    user_speaking_time_pct: Math.round((userSeconds / durationSeconds) * 100),
    agent_speaking_time_pct: Math.round((agentSeconds / durationSeconds) * 100)
  };
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Count words in a text string.
 */
function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Calculate standard deviation of an array of numbers.
 */
function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
}
