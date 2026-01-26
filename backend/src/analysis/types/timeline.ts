/**
 * Timeline Builder Type Definitions
 *
 * Types for merging ElevenLabs transcripts with Hume emotion data
 * into 1-second buckets with linguistic analysis.
 */

// ============================================================
// INPUT TYPES
// ============================================================

/** ElevenLabs transcript entry from transcript_json */
export interface ElevenLabsTranscriptEntry {
  role: 'user' | 'agent';
  message: string;
  time_in_call_secs: number;
  tool_calls?: any;
  tool_results?: any;
  feedback?: any;
}

/** Hume emotion entry from emotion_timelines table */
export interface HumeEmotionEntry {
  id: string;
  conversation_id: string;
  model_type: 'face' | 'prosody' | 'language' | 'burst';
  start_timestamp_ms: number;
  end_timestamp_ms: number;
  emotions: Array<{ name: string; score: number }>;
  top_emotion_name: string;
  top_emotion_score: number;
  face_bounding_box?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

// ============================================================
// OUTPUT TYPES - Timeline Entry
// ============================================================

/** Aggregated emotion data for a 1-second bucket */
export interface EmotionBucket {
  top_3: Array<{ name: string; score: number }>;
  volatility: number;  // Standard deviation of top emotion scores within the second
  raw_count: number;   // Number of data points in this second
}

/** Aggregated prosody data for a 1-second bucket */
export interface ProsodyBucket {
  top_3: Array<{ name: string; score: number }>;
  avg_score: number;
  raw_count: number;
}

/** Filler words detected in a text segment */
export interface FillerWordResult {
  count: number;
  instances: string[];  // e.g., ['um', 'like', 'like']
}

/** Linguistic features from Python analysis */
export interface LinguisticFeatures {
  orality_score: number;  // From COAST - how "spoken-like" vs "written-like"
  parts_of_speech: {
    nouns: number;
    verbs: number;
    adjectives: number;
    adverbs: number;
    pronouns: number;
    prepositions: number;
    conjunctions: number;
    interjections: number;
  };
  discourse_markers: string[];  // e.g., ['well', 'so', 'anyway']
  readability_score: number;    // Primary readability metric (Flesch Reading Ease)
  readability_metrics?: {
    flesch_reading_ease: number;
    flesch_kincaid_grade: number;
    gunning_fog: number;
    smog_index: number;
    automated_readability_index: number;
    coleman_liau_index: number;
  };
  lingfeat_summary?: {
    lexical_diversity: number;
    avg_word_length: number;
    sentence_complexity: number;
  };
}

/** Single timeline entry representing 1 second of the conversation */
export interface TimelineEntry {
  timestamp: number;           // Second index (0, 1, 2, ...)
  timestamp_ms: number;        // Start millisecond (timestamp * 1000)
  speaker: 'user' | 'agent' | null;
  text: string;
  word_count: number;
  wpm: number;                 // Words per minute: (word_count / 1) * 60 = word_count * 60

  emotions: EmotionBucket | null;
  prosody: ProsodyBucket | null;

  filler_words: FillerWordResult;

  linguistic_features: LinguisticFeatures | null;
}

// ============================================================
// TIMELINE RESULT
// ============================================================

/** Summary statistics for the entire timeline */
export interface TimelineSummary {
  avg_wpm: number;
  total_filler_words: number;
  dominant_emotions: Array<{ name: string; frequency: number }>;
  avg_emotion_volatility: number;
  user_speaking_time_pct: number;
  agent_speaking_time_pct: number;
}

/** Metadata about the timeline build process */
export interface TimelineMetadata {
  built_at: string;  // ISO timestamp
  transcript_entries: number;
  emotion_datapoints: {
    face: number;
    prosody: number;
  };
  linguistic_analysis_ran: boolean;
  webhook_sent: boolean;
  webhook_response_status?: number;
}

/** Complete timeline result */
export interface TimelineResult {
  conversation_id: string;
  duration_seconds: number;
  total_entries: number;
  timeline: TimelineEntry[];
  summary: TimelineSummary;
  metadata: TimelineMetadata;
}

// ============================================================
// PYTHON SERVICE TYPES
// ============================================================

/** Input to the Python linguistic service */
export interface PythonAnalysisRequest {
  segments: Array<{
    segment_index: number;
    text: string;
  }>;
}

/** Output from the Python linguistic service */
export interface PythonAnalysisResponse {
  success: boolean;
  error?: string;
  results: Array<{
    segment_index: number;
    text: string;
    orality_score: number;
    parts_of_speech: LinguisticFeatures['parts_of_speech'];
    discourse_markers: string[];
    readability_score: number;
    readability_metrics: LinguisticFeatures['readability_metrics'];
    lingfeat_summary: LinguisticFeatures['lingfeat_summary'];
  }>;
}

// ============================================================
// BUILD OPTIONS
// ============================================================

/** Options for building the timeline */
export interface BuildTimelineOptions {
  conversationId: string;
  sendToWebhook?: boolean;           // Default: true
  runLinguisticAnalysis?: boolean;   // Default: true
  linguisticServiceUrl?: string;     // Override env var
  n8nWebhookUrl?: string;            // Override env var
}
