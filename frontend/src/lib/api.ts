const API_BASE = import.meta.env.VITE_API_URL || '';
const withApiBase = (path: string) => {
  if (!API_BASE) return path;
  const trimmedBase = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  return `${trimmedBase}${path}`;
};

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
  audio_url?: string;
  started_at: string;
  ended_at?: string;
  created_at: string;
  updated_at?: string;
  has_analysis?: boolean;
  overall_score?: number;
  overall_level?: string;
}

export interface TranscriptHighlight {
  id: string;
  conversation_id: string;
  highlighted_sentence: string;
  comment: string | null;
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'orange';
  created_at: string;
  commenter?: 'aristotle' | 'plato' | 'socrates' | 'zeno' | null;
}

export interface Analysis {
  id: string;
  conversation_id: string;
  url?: string;
  overall_score: number;
  overall_level: string;
  overall_summary?: string;
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
  communication_score?: number;
  communication_feedback?: string;
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
  // From full_analysis_json
  feedback?: {
    summary?: string;
    top_improvements?: Array<{ area: string; suggestion: string }>;
  };
}

// Interview Pack types
export interface InterviewPack {
  id: string;
  name: string;
  description: string | null;
  category: string;
  is_subscription_only: boolean;
  required_plan: string | null;
  is_custom: boolean;
  created_by_user: boolean;
  question_count: number;
  created_at: string;
  updated_at: string;
}

export interface InterviewQuestion {
  id: string;
  pack_id: string;
  question_text: string;
  question_type: string;
  difficulty: string | null;
  expected_duration_seconds: number | null;
  elevenlabs_conversation_id: string | null;
  created_at: string;
}

export interface InterviewSession {
  id: string;
  pack: {
    id: string;
    name: string;
    description: string | null;
    category: string;
  };
  session_type: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  response_count: number;
}

export interface UserSubscription {
  user_id: string;
  has_subscription: boolean;
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  features: {
    can_create_custom_packs: boolean;
    max_custom_packs: number;
    access_premium_packs: boolean;
  };
}

// Interview Customization types
export interface InterviewerMoodPreset {
  id: string;
  name: string;
  description: string | null;
  system_prompt_template: string;
  elevenlabs_config: Record<string, any> | null;
  sort_order: number;
}

export interface UserInterviewAgent {
  id: string;
  user_id: string;
  agent_name: string;
  system_prompt: string;
  elevenlabs_agent_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserInterviewPreferences {
  user_id: string;
  use_dynamic_behavior: boolean;
  selected_mood_preset_id: string | null;
  custom_agent_id: string | null;
  updated_at?: string;
}

export interface UserProgressMetric {
  id: string;
  user_id: string;
  session_id: string | null;
  metric_type: string;
  score: number;
  measured_at: string;
}

export interface UserProgressSummary {
  user_id: string;
  category: string;
  total_sessions: number;
  avg_score: number;
  improvement_rate: number;
  last_session_date: string | null;
  updated_at: string;
}

// Stripe types
export interface StripePrice {
  id: string;
  product: string;
  unit_amount: number;
  currency: string;
  recurring: {
    interval: string;
    interval_count: number;
  } | null;
}

export interface StripeProduct {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  metadata: Record<string, string>;
  prices: StripePrice[];
}

export interface UserSubscriptionRecord {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  stripe_price_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  plan_name: string;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
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
      throw new Error(error.detail || error.error || error.message || `HTTP ${response.status}`);
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
  async startInterview(userId: string, interviewConfig?: any): Promise<{
    conversation_id: string;
    agent_id: string;
    signed_url: string;
    user_data: {
      formatted_resume: string;
      job_description: string;
      job_title: string;
      company_name: string;
      name: string;
    };
    interview_config: any | null;
  }> {
    return this.request('/api/interviews/start', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, interview_config: interviewConfig }),
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
    fallbackJobId?: string;
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

    type TimelineResponse = {
      conversation_id: string;
      total_records: number;
      timeline: {
        face: EmotionTimelineItem[];
        prosody: EmotionTimelineItem[];
        language: EmotionTimelineItem[];
        burst: EmotionTimelineItem[];
      };
    };

    try {
      const data = await this.request<TimelineResponse>(`/api/conversations/${conversationId}/emotions/timeline?${params}`);
      if (options?.fallbackJobId && data.total_records === 0) {
        try {
          return await this.getEmotionTimelineFromHume(conversationId, options.fallbackJobId, options.models);
        } catch (fallbackError) {
          console.warn('Hume fallback failed, returning empty timeline:', fallbackError);
          return data;
        }
      }
      return data;
    } catch (err) {
      if (options?.fallbackJobId) {
        try {
          return await this.getEmotionTimelineFromHume(conversationId, options.fallbackJobId, options.models);
        } catch (fallbackError) {
          console.warn('Hume fallback failed after timeline error:', fallbackError);
          throw err;
        }
      }
      throw err;
    }
  }

  async getHumePredictions(jobId: string): Promise<any> {
    return this.request(`/api/hume/jobs/${jobId}/predictions`);
  }

  async getHumePredictionsByConversation(conversationId: string): Promise<{
    predictions: any;
    conversation_id: string;
  }> {
    return this.request(`/api/conversations/${conversationId}/hume/predictions`);
  }

  private async getEmotionTimelineFromHume(
    conversationId: string,
    jobId: string,
    models?: string[]
  ): Promise<{
    conversation_id: string;
    total_records: number;
    timeline: {
      face: EmotionTimelineItem[];
      prosody: EmotionTimelineItem[];
      language: EmotionTimelineItem[];
      burst: EmotionTimelineItem[];
    };
  }> {
    const predictions = await this.getHumePredictions(jobId);
    return buildEmotionTimelineFromHumePredictions(conversationId, predictions, models);
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
    transcript_json?: any[];
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

  // Highlights API
  async getHighlights(conversationId: string): Promise<{
    conversation_id: string;
    highlights: TranscriptHighlight[];
  }> {
    return this.request(`/api/conversations/${conversationId}/highlights`);
  }

  async createHighlight(conversationId: string, data: {
    highlighted_sentence: string;
    comment?: string;
    color?: 'yellow' | 'green' | 'blue' | 'pink' | 'orange';
  }): Promise<TranscriptHighlight> {
    return this.request(`/api/conversations/${conversationId}/highlights`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateHighlight(conversationId: string, highlightId: string, data: {
    comment?: string;
    color?: 'yellow' | 'green' | 'blue' | 'pink' | 'orange';
  }): Promise<TranscriptHighlight> {
    return this.request(`/api/conversations/${conversationId}/highlights/${highlightId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteHighlight(conversationId: string, highlightId: string): Promise<{ success: boolean }> {
    return this.request(`/api/conversations/${conversationId}/highlights/${highlightId}`, {
      method: 'DELETE',
    });
  }

  // Interview Pack endpoints
  async getUserSubscription(userId: string): Promise<UserSubscription> {
    return this.request(`/api/users/${userId}/subscription`);
  }

  async getAvailablePacks(userId: string): Promise<{
    user_id: string;
    packs: InterviewPack[];
    total: number;
  }> {
    return this.request(`/api/users/${userId}/packs/available`);
  }

  async getPackDetails(packId: string): Promise<{
    pack: Omit<InterviewPack, 'created_by_user' | 'question_count'> & {
      created_by: string;
    };
    questions: InterviewQuestion[];
    question_count: number;
  }> {
    return this.request(`/api/packs/${packId}`);
  }

  async createPackSession(packId: string, userId: string, sessionType: string = 'practice'): Promise<{
    session_id: string;
    pack: {
      id: string;
      name: string;
      description: string | null;
    };
    questions: InterviewQuestion[];
    status: string;
  }> {
    return this.request(`/api/packs/${packId}/sessions`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, session_type: sessionType }),
    });
  }

  async getUserSessions(userId: string): Promise<{
    user_id: string;
    sessions: InterviewSession[];
    total: number;
  }> {
    return this.request(`/api/users/${userId}/sessions`);
  }

  // Interview Customization endpoints
  async getInterviewerMoods(): Promise<{
    presets: InterviewerMoodPreset[];
    total: number;
  }> {
    return this.request('/api/interviewer-moods');
  }

  async getUserAgents(userId: string): Promise<{
    user_id: string;
    agents: UserInterviewAgent[];
    total: number;
  }> {
    return this.request(`/api/users/${userId}/agents`);
  }

  async createUserAgent(userId: string, data: {
    agent_name: string;
    system_prompt: string;
    elevenlabs_agent_id?: string;
  }): Promise<{
    agent: UserInterviewAgent;
    message: string;
  }> {
    return this.request(`/api/users/${userId}/agents`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUserAgent(userId: string, agentId: string, data: Partial<{
    agent_name: string;
    system_prompt: string;
    elevenlabs_agent_id: string;
    is_active: boolean;
  }>): Promise<{
    agent: UserInterviewAgent;
  }> {
    return this.request(`/api/users/${userId}/agents/${agentId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteUserAgent(userId: string, agentId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request(`/api/users/${userId}/agents/${agentId}`, {
      method: 'DELETE',
    });
  }

  async getInterviewPreferences(userId: string): Promise<UserInterviewPreferences> {
    return this.request(`/api/users/${userId}/interview-preferences`);
  }

  async updateInterviewPreferences(userId: string, data: Partial<UserInterviewPreferences>): Promise<UserInterviewPreferences> {
    return this.request(`/api/users/${userId}/interview-preferences`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUserProgress(userId: string, options?: {
    metric_type?: string;
    days?: number;
  }): Promise<{
    user_id: string;
    metrics: UserProgressMetric[];
    total: number;
  }> {
    const params = new URLSearchParams();
    if (options?.metric_type) params.set('metric_type', options.metric_type);
    if (options?.days) params.set('days', options.days.toString());

    return this.request(`/api/users/${userId}/progress?${params}`);
  }

  async getUserProgressSummary(userId: string): Promise<{
    user_id: string;
    summary: UserProgressSummary[];
  }> {
    return this.request(`/api/users/${userId}/progress/summary`);
  }

  // Stripe endpoints
  async getStripeProducts(): Promise<{
    products: StripeProduct[];
  }> {
    return this.request('/api/stripe/products');
  }

  async createCheckoutSession(userId: string, priceId: string, planName: string): Promise<{
    sessionId: string;
    url: string;
  }> {
    return this.request('/api/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        price_id: priceId,
        plan_name: planName,
      }),
    });
  }

  async getUserSubscriptions(userId: string): Promise<{
    user_id: string;
    subscriptions: UserSubscriptionRecord[];
    total: number;
  }> {
    return this.request(`/api/users/${userId}/subscriptions`);
  }

  // Tavus video interview endpoints
  async createTavusConversation(
    userId: string,
    conversationPlan?: string
  ): Promise<{
    conversation_id: string | null;
    conversation_url: string;
  }> {
    return this.request('/api/tavus/conversations', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        conversation_plan: conversationPlan
      }),
    });
  }

  async endTavusConversation(conversationId: string): Promise<{
    status: string;
    conversation_id: string;
  }> {
    return this.request(`/api/tavus/conversations/${conversationId}/end`, {
      method: 'POST'
    });
  }

  // AI Generation Endpoints
  async generateInterviewConfig(intent: string, reworkFeedback?: string, previousConfig?: any): Promise<any> {
    return this.request('/api/ai/generate-interview-config', {
      method: 'POST',
      body: JSON.stringify({ intent, rework_feedback: reworkFeedback, previous_config: previousConfig })
    });
  }

  async getDynamicQuestions(intent: string, config: any, personalContext: string): Promise<any[]> {
    // Calling n8n webhook directly for dynamic questions as per requirements
    // Webhook URL: https://maxipad.app.n8n.cloud/webhook/c79bfc8c-4bcc-42e0-b0f2-3f5b680ebd4b
    const N8N_WEBHOOK_URL = 'https://maxipad.app.n8n.cloud/webhook/c79bfc8c-4bcc-42e0-b0f2-3f5b680ebd4b';

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent,
          interview_config: config,
          personal_context: personalContext
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get dynamic questions');
      }

      const data = await response.json();
      // Ensure we return an array of questions
      return Array.isArray(data.questions) ? data.questions : (Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('N8n webhook error:', error);
      // Fallback questions for testing/offline
      return [
        { id: 'q1', text: 'Do you want to focus on specific technical frameworks?', type: 'yes_no' },
        { id: 'q2', text: 'What is your preferred level of difficulty?', type: 'choice', options: ['Junior', 'Mid-Level', 'Senior'] }
      ];
    }
  }

  async streamDynamicComponents(intent: string, onUpdate: (components: any[]) => void): Promise<void> {
    const response = await fetch(withApiBase('/api/ai/dynamic-components'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent, mode: 'component_tree' })
    });

    if (!response.ok) {
      throw new Error('Request failed');
    }

    const accumulatedText = await response.text();

    // Parse the final accumulated JSON
    try {
      const jsonMatch = accumulatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsedTree = JSON.parse(jsonMatch[0]);

      // Convert json-render format to ComponentSchema format
      // json-render uses: { tree: { root: "container", elements: { key: {...}, ... } } }
      // We need: [ { type: "...", id: "...", props: {...} } ]
      if (parsedTree.tree && parsedTree.tree.elements) {
        const components = Object.entries(parsedTree.tree.elements)
          .filter(([_, element]: [string, any]) => {
            // Filter out root/container elements, only keep actual components
            return element.type && element.type !== 'container';
          })
          .map(([key, element]: [string, any]) => ({
            type: element.type,
            id: key,
            props: element.props || {},
            visible: element.visible !== false,
          }));

        onUpdate(components);
      } else {
        console.error('Invalid tree structure:', parsedTree);
        throw new Error('Invalid component tree structure');
      }
    } catch (e: any) {
      console.error('Final JSON parse failed:', e);
      throw new Error(`Failed to parse components: ${e.message}`);
    }
  }

  async streamPersonality(intent: string, onChunk: (text: string) => void): Promise<void> {
    const response = await fetch(withApiBase('/api/ai/personality'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent })
    });

    const reader = response.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      onChunk(decoder.decode(value, { stream: true }));
    }
  }

  async streamPersonalityRewrite(currentPersonality: string, instruction: string, onChunk: (text: string) => void): Promise<void> {
    const response = await fetch(withApiBase('/api/ai/rewrite-personality'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_personality: currentPersonality, instruction })
    });

    const reader = response.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      onChunk(decoder.decode(value, { stream: true }));
    }
  }

  async getDynamicComponents(intent: string, personalContext?: string): Promise<any[]> {
    // Call backend to generate dynamic components using Claude
    return this.request('/api/ai/dynamic-components', {
      method: 'POST',
      body: JSON.stringify({
        intent,
        personal_context: personalContext,
        mode: 'component_tree'
      })
    }).then((data: any) => {
      if (data && Array.isArray(data.tree)) return data.tree;
      if (Array.isArray(data)) return data;
      throw new Error('Invalid response format from backend');
    }).catch(e => {
      console.error('Failed to get dynamic components:', e);
      // Re-throw the error instead of returning mock data
      throw new Error(`Failed to generate interview configuration: ${e.message}`);
    });
  }

  // Philosophical Analysis Endpoints (Aristotle, Plato, etc.)
  async getAristotleAnalysis(conversationId: string): Promise<{
    conversation_id: string;
    analysis: AristotleAnalysis | null;
    created_at?: string;
    status: 'ready' | 'pending';
  }> {
    return this.request(`/api/conversations/${conversationId}/aristotle`);
  }

  async getPlatoAnalysis(conversationId: string): Promise<{
    conversation_id: string;
    analysis: PlatoAnalysis | null;
    created_at?: string;
    status: 'ready' | 'pending';
  }> {
    return this.request(`/api/conversations/${conversationId}/plato`);
  }

  async getSocratesAnalysis(conversationId: string): Promise<{
    conversation_id: string;
    analysis: SocratesAnalysis | null;
    created_at?: string;
    status: 'ready' | 'pending';
  }> {
    return this.request(`/api/conversations/${conversationId}/socrates`);
  }

  async getZenoAnalysis(conversationId: string): Promise<{
    conversation_id: string;
    analysis: ZenoAnalysis | null;
    created_at?: string;
    status: 'ready' | 'pending';
  }> {
    return this.request(`/api/conversations/${conversationId}/zeno`);
  }

  async getDavinciSynthesis(conversationId: string): Promise<{
    conversation_id: string;
    synthesis: DavinciSynthesis | null;
    created_at?: string;
    status: 'ready' | 'pending';
  }> {
    return this.request(`/api/conversations/${conversationId}/davinci`);
  }

  async getAllPhilosophicalAnalyses(conversationId: string): Promise<{
    conversation_id: string;
    aristotle: (AristotleAnalysis & { created_at: string }) | null;
    plato: (PlatoAnalysis & { created_at: string }) | null;
    socrates: (SocratesAnalysis & { created_at: string }) | null;
    zeno: (ZenoAnalysis & { created_at: string }) | null;
    davinci: (DavinciSynthesis & { created_at: string }) | null;
  }> {
    return this.request(`/api/conversations/${conversationId}/philosophical-analysis`);
  }
}

// Philosophical Analysis Types (Aristotle, Plato, etc.)
export interface AristotleAnalysis {
  communication_analysis: {
    score: number; // 0-5 scale
    metrics: {
      speaking_pace_wpm: number;
      filler_word_count: number;
      filler_words: Array<{ word: string; count: number; timestamps: number[] }>;
      avg_sentence_length: number;
      vocabulary_richness: number;
      technical_clarity_score: number;
      transition_quality: number;
      hedging_language_count: number;
    };
    patterns: {
      hesitation_triggers: string[];
      confidence_peaks: string[];
      rambling_moments: Array<{ timestamp: number; duration: number; reason: string }>;
    };
    feedback: {
      strengths: string[];
      areas_for_improvement: string[];
      specific_examples: Array<{ timestamp: number; text: string; issue: string; improvement: string }>;
    };
    instant_rewrites: Array<{ original: string; improved: string; why: string; timestamp: number }>;
  };
}

export interface PlatoAnalysis {
  emotional_analysis: {
    score: number; // 0-10 scale
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
      trigger?: string;
    }>;
    regulation_metrics: {
      stress_recovery_time_avg: number;
      emotional_range: number;
      authenticity_score: number;
      self_awareness_score: number;
    };
    key_moments: Array<{
      timestamp: number;
      type: string;
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
  };
}

export interface SocratesAnalysis {
  strategic_analysis: {
    score: number; // 0-5 scale
    thinking_patterns: {
      depth_score: number;
      curiosity_score: number;
      ambiguity_handling: number;
      strategic_framing: number;
      authenticity_vs_rehearsed: number;
    };
    question_analysis: {
      questions_asked: Array<{
        question: string;
        timestamp: number;
        quality_score: number;
        type: string;
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
      uses_structured_frameworks: boolean;
      answer_completeness: number;
      storytelling_quality: number;
      metric_usage: number;
      connects_to_business_impact: boolean;
    };
    intellectual_signals: {
      admits_knowledge_gaps: boolean;
      challenges_assumptions: boolean;
      shows_meta_awareness: boolean;
      demonstrates_learning_agility: boolean;
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
  };
}

export interface ZenoAnalysis {
  presence_analysis: {
    score: number; // 0-100 scale
    visual_metrics: {
      eye_contact_score: number;
      posture_score: number;
      gesture_effectiveness: number;
      facial_expressiveness: number;
      energy_level: number;
    };
    micro_expressions: Array<{
      timestamp: number;
      expression: string;
      significance: string;
    }>;
    body_language_patterns: {
      consistency_score: number;
      nervous_habits: string[];
      power_poses: string[];
      defensive_moments: string[];
    };
    executive_presence_factors: {
      gravitas: number;
      confidence_without_arrogance: number;
      intellectual_honesty: number;
      composure_under_pressure: number;
    };
    comparison_to_top_performers: {
      overall_delta: number;
      specific_gaps: Array<{
        area: string;
        your_score: number;
        top_10_avg: number;
        improvement: string;
      }>;
    };
    feedback: {
      what_works: string[];
      what_needs_work: string[];
      quick_wins: string[];
      advanced_techniques: string[];
    };
  };
}

export interface DavinciSynthesis {
  overall_performance: {
    score: number; // Overall interview performance score
    percentile: number;
    grade: string;
  };
  synthesis: {
    executive_summary: string;
    key_strengths: string[];
    critical_weaknesses: string[];
    interview_readiness: string;
  };
  comparative_analysis: {
    vs_industry_average: string;
    vs_top_performers: string;
    trajectory: string;
  };
  action_plan: {
    immediate_priorities: Array<{
      priority: number;
      action: string;
      why: string;
      how: string;
    }>;
    thirty_day_plan: string[];
    ninety_day_milestones: string[];
  };
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

const getTopEmotion = (emotions: Array<{ name: string; score: number }>) => {
  return emotions.reduce(
    (top, emotion) => (emotion.score > top.score ? emotion : top),
    { name: '', score: 0 }
  );
};

const buildEmotionTimelineFromHumePredictions = (
  conversationId: string,
  predictions: any,
  models?: string[]
): {
  conversation_id: string;
  total_records: number;
  timeline: {
    face: EmotionTimelineItem[];
    prosody: EmotionTimelineItem[];
    language: EmotionTimelineItem[];
    burst: EmotionTimelineItem[];
  };
} => {
  const modelFilter = models ? new Set(models) : null;
  const includeModel = (model: string) => !modelFilter || modelFilter.has(model);
  const timeline = { face: [], prosody: [], language: [], burst: [] } as {
    face: EmotionTimelineItem[];
    prosody: EmotionTimelineItem[];
    language: EmotionTimelineItem[];
    burst: EmotionTimelineItem[];
  };

  const pred = predictions?.[0]?.results?.predictions?.[0];
  if (!pred) {
    return { conversation_id: conversationId, total_records: 0, timeline };
  }

  let faceIndex = 0;
  let prosodyIndex = 0;
  let languageIndex = 0;
  let burstIndex = 0;

  if (includeModel('face')) {
    const groups = pred.models?.face?.grouped_predictions || [];
    for (const group of groups) {
      const groupPredictions = Array.isArray(group.predictions) ? group.predictions : [];
      for (const p of groupPredictions) {
        const emotions = Array.isArray(p.emotions) ? p.emotions : [];
        const top = getTopEmotion(emotions);
        const timeMs = Math.round((p.time || 0) * 1000);
        timeline.face.push({
          id: `${conversationId}-face-${faceIndex++}`,
          conversation_id: conversationId,
          model_type: 'face',
          start_timestamp_ms: timeMs,
          end_timestamp_ms: timeMs + 33,
          emotions,
          top_emotion_name: top.name,
          top_emotion_score: top.score,
          face_bounding_box: p.box || p.bounding_box
        });
      }
    }
  }

  if (includeModel('prosody')) {
    const groups = pred.models?.prosody?.grouped_predictions || [];
    for (const group of groups) {
      const groupPredictions = Array.isArray(group.predictions) ? group.predictions : [];
      for (const p of groupPredictions) {
        const emotions = Array.isArray(p.emotions) ? p.emotions : [];
        const top = getTopEmotion(emotions);
        const startMs = Math.round(((p.time?.begin ?? p.time?.start ?? 0) as number) * 1000);
        const endMs = Math.round(((p.time?.end ?? p.time?.finish ?? 0) as number) * 1000);
        timeline.prosody.push({
          id: `${conversationId}-prosody-${prosodyIndex++}`,
          conversation_id: conversationId,
          model_type: 'prosody',
          start_timestamp_ms: startMs,
          end_timestamp_ms: Math.max(endMs, startMs),
          emotions,
          top_emotion_name: top.name,
          top_emotion_score: top.score
        });
      }
    }
  }

  if (includeModel('language')) {
    const groups = pred.models?.language?.grouped_predictions || [];
    for (const group of groups) {
      const groupPredictions = Array.isArray(group.predictions) ? group.predictions : [];
      for (const p of groupPredictions) {
        const emotions = Array.isArray(p.emotions) ? p.emotions : [];
        const top = getTopEmotion(emotions);
        const startMs = Math.round(((p.time?.begin ?? p.time?.start ?? 0) as number) * 1000);
        const endMs = Math.round(((p.time?.end ?? p.time?.finish ?? 0) as number) * 1000);
        timeline.language.push({
          id: `${conversationId}-language-${languageIndex++}`,
          conversation_id: conversationId,
          model_type: 'language',
          start_timestamp_ms: startMs,
          end_timestamp_ms: Math.max(endMs, startMs),
          emotions,
          top_emotion_name: top.name,
          top_emotion_score: top.score
        });
      }
    }
  }

  if (includeModel('burst')) {
    const groups = pred.models?.burst?.grouped_predictions || [];
    for (const group of groups) {
      const groupPredictions = Array.isArray(group.predictions) ? group.predictions : [];
      for (const p of groupPredictions) {
        const emotions = Array.isArray(p.emotions) ? p.emotions : [];
        const top = getTopEmotion(emotions);
        const startMs = Math.round(((p.time?.begin ?? p.time?.start ?? 0) as number) * 1000);
        const endMs = Math.round(((p.time?.end ?? p.time?.finish ?? 0) as number) * 1000);
        timeline.burst.push({
          id: `${conversationId}-burst-${burstIndex++}`,
          conversation_id: conversationId,
          model_type: 'burst',
          start_timestamp_ms: startMs,
          end_timestamp_ms: Math.max(endMs, startMs),
          emotions,
          top_emotion_name: top.name,
          top_emotion_score: top.score
        });
      }
    }
  }

  timeline.face.sort((a, b) => a.start_timestamp_ms - b.start_timestamp_ms);
  for (let i = 0; i < timeline.face.length; i += 1) {
    const current = timeline.face[i];
    const next = timeline.face[i + 1];
    if (next) {
      current.end_timestamp_ms = Math.max(next.start_timestamp_ms, current.start_timestamp_ms);
    } else if (!current.end_timestamp_ms || current.end_timestamp_ms <= current.start_timestamp_ms) {
      current.end_timestamp_ms = current.start_timestamp_ms + 33;
    }
  }
  timeline.prosody.sort((a, b) => a.start_timestamp_ms - b.start_timestamp_ms);
  for (let i = 0; i < timeline.prosody.length; i += 1) {
    const current = timeline.prosody[i];
    const next = timeline.prosody[i + 1];
    if (next) {
      current.end_timestamp_ms = next.start_timestamp_ms;
    } else if (!current.end_timestamp_ms || current.end_timestamp_ms <= current.start_timestamp_ms) {
      current.end_timestamp_ms = current.start_timestamp_ms + 250;
    }
  }
  timeline.language.sort((a, b) => a.start_timestamp_ms - b.start_timestamp_ms);
  timeline.burst.sort((a, b) => a.start_timestamp_ms - b.start_timestamp_ms);

  const totalRecords =
    timeline.face.length +
    timeline.prosody.length +
    timeline.language.length +
    timeline.burst.length;

  return {
    conversation_id: conversationId,
    total_records: totalRecords,
    timeline
  };
};

export const api = new ApiClient();
