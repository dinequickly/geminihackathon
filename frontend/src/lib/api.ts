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

  async getDynamicComponents(intent: string, personalContext?: string): Promise<any[]> {
    // New endpoint for full component rendering
    // Webhook URL: https://maxipad.app.n8n.cloud/webhook/c79bfc8c-4bcc-42e0-b0f2-3f5b680ebd4b (using same for now)
    const N8N_WEBHOOK_URL = 'https://maxipad.app.n8n.cloud/webhook/c79bfc8c-4bcc-42e0-b0f2-3f5b680ebd4b';
    
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent,
          personal_context: personalContext,
          mode: 'component_tree' // Signal to webhook to return tree
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.tree)) return data.tree;
        if (Array.isArray(data)) return data;
      }
    } catch (e) {
      console.warn('Webhook failed, using mock catalog:', e);
    }

    // Mock catalog response based on intent (fallback)
    return [
      {
        type: 'InfoCard',
        id: 'info1',
        props: {
          title: 'Interview Context',
          message: `We've analyzed your request for "${intent}". Please configure the specifics below.`,
          variant: 'info'
        }
      },
      {
        type: 'MultiChoiceCard',
        id: 'role_level',
        props: {
          question: 'Target Role Level',
          options: ['Associate / Junior', 'Mid-Level', 'Senior', 'Staff / Principal', 'Executive']
        }
      },
      {
        type: 'TagSelector',
        id: 'focus_areas',
        props: {
          label: 'Key Focus Areas',
          availableTags: ['System Design', 'Behavioral', 'Live Coding', 'Product Sense', 'Leadership', 'Culture Fit'],
          maxSelections: 3
        }
      },
      {
        type: 'ScenarioCard',
        id: 'scenario_pressure',
        props: {
          title: 'Pressure Test Mode',
          description: 'Simulate a high-stakes environment with challenging follow-ups and shorter time limits.',
          includes: ['Rapid Fire', 'Deep Drill-down', 'Skeptical Interviewer']
        }
      },
      {
        type: 'SliderCard',
        id: 'duration',
        props: {
          label: 'Session Duration (Minutes)',
          min: 15,
          max: 60,
          unitLabels: ['Quick', 'Marathon']
        }
      },
      {
        type: 'TextInputCard',
        id: 'specific_topic',
        props: {
          label: 'Specific Topic to Drill (Optional)',
          placeholder: 'e.g., React Hooks, Distributed Caching, Conflict Resolution...',
          maxLength: 50
        }
      }
    ];
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
