-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  elevenlabs_conversation_id text UNIQUE,
  status text DEFAULT 'in_progress'::text CHECK (status = ANY (ARRAY['in_progress'::text, 'completed'::text, 'analyzing'::text, 'analyzed'::text, 'error'::text])),
  transcript text,
  transcript_json jsonb,
  duration_seconds integer,
  video_url text,
  video_storage_path text,
  started_at timestamp with time zone DEFAULT now(),
  ended_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  audio_url text,
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.emotion_analysis (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  url text,
  conversation_id_elevenlabs text,
  overall_score integer CHECK (overall_score >= 0 AND overall_score <= 100),
  overall_level text CHECK (overall_level = ANY (ARRAY['needs_work'::text, 'developing'::text, 'competent'::text, 'strong'::text, 'exceptional'::text])),
  overall_summary text,
  technical_score integer,
  technical_feedback text,
  eq_score integer,
  eq_feedback text,
  presence_score integer,
  presence_feedback text,
  culture_fit_score integer,
  culture_fit_feedback text,
  authenticity_score integer,
  authenticity_feedback text,
  filler_word_count integer,
  filler_words jsonb DEFAULT '[]'::jsonb,
  speaking_pace_wpm integer,
  confidence_score integer,
  top_improvements jsonb DEFAULT '[]'::jsonb,
  instant_rewrites jsonb DEFAULT '[]'::jsonb,
  question_breakdown jsonb DEFAULT '[]'::jsonb,
  full_analysis_json jsonb,
  CONSTRAINT emotion_analysis_pkey PRIMARY KEY (id),
  CONSTRAINT emotion_analysis_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id),
  CONSTRAINT emotion_analysis_conversation_id_elevenlabs_fkey FOREIGN KEY (conversation_id_elevenlabs) REFERENCES public.conversations(elevenlabs_conversation_id)
);
CREATE TABLE public.interview_packs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  is_subscription_only boolean DEFAULT false,
  required_plan text,
  created_by uuid,
  is_custom boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT interview_packs_pkey PRIMARY KEY (id),
  CONSTRAINT interview_packs_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.interview_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pack_id uuid,
  question_text text NOT NULL,
  question_type text NOT NULL,
  difficulty text,
  expected_duration_seconds integer,
  elevenlabs_conversation_id text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT interview_questions_pkey PRIMARY KEY (id),
  CONSTRAINT interview_questions_pack_id_fkey FOREIGN KEY (pack_id) REFERENCES public.interview_packs(id)
);
CREATE TABLE public.interviewer_mood_presets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  system_prompt_template text NOT NULL,
  elevenlabs_config jsonb,
  sort_order integer DEFAULT 0,
  CONSTRAINT interviewer_mood_presets_pkey PRIMARY KEY (id)
);
CREATE TABLE public.question_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid,
  question_id uuid,
  response_audio_url text,
  response_transcript text,
  analysis_result jsonb,
  completed_at timestamp without time zone DEFAULT now(),
  CONSTRAINT question_responses_pkey PRIMARY KEY (id),
  CONSTRAINT question_responses_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.user_interview_sessions(id),
  CONSTRAINT question_responses_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.interview_questions(id)
);
CREATE TABLE public.review_practice (
  highlighted_text text,
  conversation_id uuid,
  messages jsonb,
  type text,
  context text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT review_practice_pkey PRIMARY KEY (id),
  CONSTRAINT review_practice_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id)
);
CREATE TABLE public.transcript_highlights (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  conversation_id uuid NOT NULL,
  highlighted_sentence text NOT NULL,
  comment text,
  color text NOT NULL DEFAULT 'yellow'::text CHECK (color = ANY (ARRAY['yellow'::text, 'green'::text, 'blue'::text, 'pink'::text, 'orange'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transcript_highlights_pkey PRIMARY KEY (id),
  CONSTRAINT transcript_highlights_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id)
);
CREATE TABLE public.user_interview_agents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  agent_name text NOT NULL,
  system_prompt text NOT NULL,
  elevenlabs_agent_id text,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT user_interview_agents_pkey PRIMARY KEY (id),
  CONSTRAINT user_interview_agents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_interview_preferences (
  user_id uuid NOT NULL,
  use_dynamic_behavior boolean DEFAULT false,
  selected_mood_preset_id uuid,
  custom_agent_id uuid,
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT user_interview_preferences_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_interview_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_interview_preferences_selected_mood_preset_id_fkey FOREIGN KEY (selected_mood_preset_id) REFERENCES public.interviewer_mood_presets(id),
  CONSTRAINT user_interview_preferences_custom_agent_id_fkey FOREIGN KEY (custom_agent_id) REFERENCES public.user_interview_agents(id)
);
CREATE TABLE public.user_interview_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  pack_id uuid,
  session_type text NOT NULL,
  started_at timestamp without time zone DEFAULT now(),
  completed_at timestamp without time zone,
  status text DEFAULT 'in_progress'::text,
  CONSTRAINT user_interview_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT user_interview_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_interview_sessions_pack_id_fkey FOREIGN KEY (pack_id) REFERENCES public.interview_packs(id)
);
CREATE TABLE public.user_pack_access (
  user_id uuid NOT NULL,
  pack_id uuid NOT NULL,
  granted_at timestamp without time zone DEFAULT now(),
  CONSTRAINT user_pack_access_pkey PRIMARY KEY (user_id, pack_id),
  CONSTRAINT user_pack_access_pack_id_fkey FOREIGN KEY (pack_id) REFERENCES public.interview_packs(id),
  CONSTRAINT user_pack_access_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_progress_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id uuid,
  metric_type text NOT NULL,
  score numeric,
  measured_at timestamp without time zone DEFAULT now(),
  CONSTRAINT user_progress_metrics_pkey PRIMARY KEY (id),
  CONSTRAINT user_progress_metrics_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_progress_metrics_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.user_interview_sessions(id)
);
CREATE TABLE public.user_progress_summary (
  user_id uuid NOT NULL,
  category text NOT NULL,
  total_sessions integer DEFAULT 0,
  avg_score numeric,
  improvement_rate numeric,
  last_session_date timestamp without time zone,
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT user_progress_summary_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_progress_summary_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  stripe_subscription_id text NOT NULL UNIQUE,
  stripe_customer_id text NOT NULL,
  stripe_price_id text NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['active'::text, 'canceled'::text, 'incomplete'::text, 'incomplete_expired'::text, 'past_due'::text, 'trialing'::text, 'unpaid'::text])),
  current_period_start timestamp with time zone NOT NULL,
  current_period_end timestamp with time zone NOT NULL,
  plan_name text NOT NULL,
  canceled_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT user_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  linkedin_url text,
  formatted_resume text,
  job_description text,
  job_title text,
  company_name text,
  profile_status text DEFAULT 'pending'::text CHECK (profile_status = ANY (ARRAY['pending'::text, 'processing'::text, 'ready'::text, 'error'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  password text,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
