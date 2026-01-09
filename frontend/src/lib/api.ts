const API_BASE = import.meta.env.VITE_API_URL || '';

export interface User {
  id: string;
  name: string;
  email: string;
  linkedin_url?: string;
  formatted_resume?: string;
  job_description?: string;
  job_title?: string;
  profile_status: 'pending' | 'processing' | 'ready' | 'error';
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  elevenlabs_conversation_id?: string;
  status: 'in_progress' | 'completed' | 'analyzing' | 'analyzed' | 'error';
  transcript?: string;
  duration_seconds?: number;
  video_url?: string;
  started_at: string;
  ended_at?: string;
  has_analysis?: boolean;
  overall_score?: number;
  overall_level?: string;
}

export interface Analysis {
  id: string;
  conversation_id: string;
  overall_score: number;
  overall_level: string;
  overall_summary: string;
  technical_score?: number;
  technical_feedback?: string;
  eq_score?: number;
  eq_feedback?: string;
  presence_score?: number;
  presence_feedback?: string;
  culture_fit_score?: number;
  culture_fit_feedback?: string;
  authenticity_score?: number;
  authenticity_feedback?: string;
  filler_word_count?: number;
  filler_words?: string[];
  speaking_pace_wpm?: number;
  confidence_score?: number;
  eye_contact_score?: number;
  body_language_score?: number;
  top_improvements?: Array<{
    area: string;
    suggestion: string;
    priority: number;
  }>;
  instant_rewrites?: Array<{
    original: string;
    improved: string;
    explanation: string;
  }>;
  question_breakdown?: Array<{
    question: string;
    topic: string;
    score: number;
    feedback: string;
  }>;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // User endpoints
  async onboardUser(data: {
    name: string;
    email: string;
    password?: string;
    linkedin_url?: string;
    job_description: string;
  }): Promise<{ user_id: string; status: string; message: string }> {
    return this.request('/api/users/onboard', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async checkUser(email: string, password?: string): Promise<{ exists: boolean; user?: User; password_valid?: boolean }> {
    return this.request('/api/users/check', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getUser(userId: string): Promise<User> {
    return this.request(`/api/users/${userId}`);
  }

  async getUserStatus(userId: string): Promise<{
    user_id: string;
    status: string;
    has_resume: boolean;
  }> {
    return this.request(`/api/users/${userId}/status`);
  }

  // Interview endpoints
  async startInterview(userId: string): Promise<{
    conversation_id: string;
    agent_id: string;
    signed_url: string;
  }> {
    return this.request('/api/interviews/start', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async endInterview(
    conversationId: string,
    elevenlabsConversationId?: string
  ): Promise<{ status: string; conversation_id: string }> {
    const params = new URLSearchParams();
    if (elevenlabsConversationId) {
      params.set('elevenlabs_conversation_id', elevenlabsConversationId);
    }
    return this.request(`/api/interviews/${conversationId}/end?${params}`, {
      method: 'POST',
    });
  }

  // Conversation endpoints
  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.request(`/api/conversations/user/${userId}`);
  }

  async getConversation(conversationId: string): Promise<{
    conversation: Conversation;
    analysis: Analysis | null;
  }> {
    return this.request(`/api/conversations/${conversationId}`);
  }

  async getConversationStatus(conversationId: string): Promise<{
    conversation_id: string;
    status: string;
    has_analysis: boolean;
    overall_score?: number;
  }> {
    return this.request(`/api/conversations/${conversationId}/status`);
  }

  // Get signed URL for direct upload to Supabase (bypasses Vercel body limit)
  async getUploadUrl(
    conversationId: string,
    fileName = 'recording.webm',
    fileType = 'video/webm'
  ): Promise<{ uploadUrl: string; token: string; path: string; publicUrl: string }> {
    return this.request(`/api/conversations/${conversationId}/upload-url`, {
      method: 'POST',
      body: JSON.stringify({ fileName, fileType }),
    });
  }

  // Confirm upload completed
  async confirmUpload(
    conversationId: string,
    storagePath: string,
    publicUrl: string,
    type = 'video'
  ): Promise<{ success: boolean; conversation_id: string; video_url?: string }> {
    return this.request(`/api/conversations/${conversationId}/confirm-upload`, {
      method: 'POST',
      body: JSON.stringify({ storagePath, publicUrl, type }),
    });
  }

  // Upload video directly to Supabase (recommended for large files)
  async uploadVideo(
    conversationId: string,
    videoBlob: Blob
  ): Promise<{ video_url: string; storage_path: string }> {
    try {
      // Step 1: Get signed upload URL
      const { uploadUrl, path, publicUrl } = await this.getUploadUrl(
        conversationId,
        'recording.webm',
        videoBlob.type || 'video/webm'
      );

      // Step 2: Upload directly to Supabase Storage
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': videoBlob.type || 'video/webm',
        },
        body: videoBlob,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Direct upload failed: ${uploadResponse.status}`);
      }

      // Step 3: Confirm upload and update conversation
      await this.confirmUpload(conversationId, path, publicUrl, 'video');

      return {
        video_url: publicUrl,
        storage_path: path,
      };
    } catch (error) {
      console.error('Direct upload failed, trying legacy endpoint:', error);
      // Fallback to legacy endpoint for small files
      return this.uploadVideoLegacy(conversationId, videoBlob);
    }
  }

  // Legacy upload (may hit Vercel body limits for large files)
  private async uploadVideoLegacy(
    conversationId: string,
    videoBlob: Blob
  ): Promise<{ video_url: string; storage_path: string }> {
    const formData = new FormData();
    formData.append('video', videoBlob, 'recording.webm');

    const response = await fetch(
      `${API_BASE}/api/conversations/${conversationId}/video`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || error.error || 'Upload failed');
    }

    return response.json();
  }

  async analyzeAudio(audioBlob: Blob): Promise<any> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');

    const response = await fetch(`${API_BASE}/api/analysis/audio`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Audio analysis failed' }));
      throw new Error(error.detail);
    }

    return response.json();
  }

  // Expression analysis status
  async getAnalysisStatus(conversationId: string): Promise<{
    conversation_id: string;
    conversation_status: string;
    expression_analysis: {
      status: string;
      is_stuck: boolean;
      started_at?: string;
      completed_at?: string;
      error?: string;
      models_analyzed: string[];
      has_results: boolean;
      durations: {
        language_seconds?: number;
        video_seconds?: number;
        total_seconds?: number;
      };
    };
    results_preview?: {
      face_emotions: number;
      prosody_emotions: number;
      language_emotions: number;
    };
  }> {
    return this.request(`/api/conversations/${conversationId}/analysis-status`);
  }

  async retryAnalysis(conversationId: string): Promise<{ message: string; conversation_id: string }> {
    return this.request(`/api/conversations/${conversationId}/retry-analysis`, {
      method: 'POST'
    });
  }

  // Emotion timeline endpoints
  async getEmotionTimeline(conversationId: string, options?: {
    start_ms?: number;
    end_ms?: number;
    models?: string[];
  }): Promise<{
    conversation_id: string;
    total_records: number;
    timeline: {
      face: EmotionTimelineItem[];
      prosody: EmotionTimelineItem[];
      language: EmotionTimelineItem[];
      burst: EmotionTimelineItem[];
    };
  }> {
    const params = new URLSearchParams();
    if (options?.start_ms !== undefined) params.set('start_ms', options.start_ms.toString());
    if (options?.end_ms !== undefined) params.set('end_ms', options.end_ms.toString());
    if (options?.models) params.set('models', options.models.join(','));

    return this.request(`/api/conversations/${conversationId}/emotions/timeline?${params}`);
  }

  async getEmotionAtTime(conversationId: string, timeMs: number): Promise<{
    timestamp_ms: number;
    face?: {
      top_emotion: string;
      score: number;
      all_emotions: Array<{ name: string; score: number }>;
      bounding_box?: { x: number; y: number; w: number; h: number };
    };
    prosody?: {
      top_emotion: string;
      score: number;
      all_emotions: Array<{ name: string; score: number }>;
    };
  }> {
    return this.request(`/api/conversations/${conversationId}/emotions/at?time_ms=${timeMs}`);
  }

  async getAnnotatedTranscript(conversationId: string): Promise<{
    conversation_id: string;
    has_annotations: boolean;
    segments?: TranscriptSegment[];
    total_segments?: number;
    analyzed_at?: string;
    transcript?: string;
  }> {
    return this.request(`/api/conversations/${conversationId}/transcript/annotated`);
  }

  async getEmotionDistribution(conversationId: string, options?: {
    bucket_size_ms?: number;
    model?: 'face' | 'prosody';
  }): Promise<{
    conversation_id: string;
    model_type: string;
    bucket_size_ms: number;
    total_buckets: number;
    distribution: Array<{
      bucket_index: number;
      time_range_ms: { start: number; end: number };
      dominant_emotion: string | null;
      emotion_counts: Record<string, number>;
      sample_count: number;
    }>;
  }> {
    const params = new URLSearchParams();
    if (options?.bucket_size_ms) params.set('bucket_size_ms', options.bucket_size_ms.toString());
    if (options?.model) params.set('model', options.model);

    return this.request(`/api/conversations/${conversationId}/emotions/distribution?${params}`);
  }
}

// Emotion timeline types
export interface EmotionTimelineItem {
  id: string;
  conversation_id: string;
  model_type: 'face' | 'prosody' | 'language' | 'burst';
  start_timestamp_ms: number;
  end_timestamp_ms: number;
  emotions: Array<{ name: string; score: number }>;
  top_emotion_name: string;
  top_emotion_score: number;
  face_bounding_box?: { x: number; y: number; w: number; h: number };
}

export interface TranscriptSegment {
  id: string;
  text: string;
  start_index: number;
  end_index: number;
  start_time: number;
  end_time: number;
  speaker: string;
  emotions: Array<{ name: string; score: number }>;
  dominant_emotion: string;
  emotion_category: 'positive' | 'negative' | 'neutral' | 'surprise';
}

export const api = new ApiClient();

