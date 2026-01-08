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
    linkedin_url?: string;
    job_description: string;
  }): Promise<{ user_id: string; status: string; message: string }> {
    return this.request('/api/users/onboard', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async checkUser(email: string): Promise<{ exists: boolean; user?: User }> {
    return this.request('/api/users/check', {
      method: 'POST',
      body: JSON.stringify({ email }),
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

  async uploadVideo(
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
      throw new Error(error.detail);
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
}

export const api = new ApiClient();

