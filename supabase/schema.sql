-- InterviewPro Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    linkedin_url TEXT,
    formatted_resume TEXT,
    job_description TEXT,
    job_title TEXT,
    company_name TEXT,
    skills JSONB DEFAULT '[]'::jsonb,
    experience_years INTEGER,
    profile_status TEXT DEFAULT 'pending' CHECK (profile_status IN ('pending', 'processing', 'ready', 'error')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_profile_status ON users(profile_status);

-- ============================================
-- CONVERSATIONS TABLE
-- ============================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    elevenlabs_conversation_id TEXT UNIQUE,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'analyzing', 'analyzed', 'error')),
    transcript TEXT,
    transcript_json JSONB,
    duration_seconds INTEGER,
    video_url TEXT,
    video_storage_path TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for conversation queries
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_elevenlabs_id ON conversations(elevenlabs_conversation_id);
CREATE INDEX idx_conversations_status ON conversations(status);

-- ============================================
-- ANALYSIS TABLE
-- ============================================
CREATE TABLE analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Overall scores
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    overall_level TEXT CHECK (overall_level IN ('needs_work', 'developing', 'competent', 'strong', 'exceptional')),
    overall_summary TEXT,

    -- Category scores (from your 5 agents)
    technical_score INTEGER,
    technical_feedback TEXT,
    eq_score INTEGER,
    eq_feedback TEXT,
    presence_score INTEGER,
    presence_feedback TEXT,
    culture_fit_score INTEGER,
    culture_fit_feedback TEXT,
    authenticity_score INTEGER,
    authenticity_feedback TEXT,

    -- Speech metrics
    filler_word_count INTEGER,
    filler_words JSONB DEFAULT '[]'::jsonb,
    speaking_pace_wpm INTEGER,
    pause_frequency FLOAT,
    confidence_score INTEGER,

    -- Video metrics (from Twelve Labs)
    eye_contact_score INTEGER,
    body_language_score INTEGER,
    facial_expression_notes TEXT,
    video_analysis_json JSONB,

    -- Detailed feedback
    top_improvements JSONB DEFAULT '[]'::jsonb,
    instant_rewrites JSONB DEFAULT '[]'::jsonb,
    practice_prompts JSONB DEFAULT '[]'::jsonb,
    question_breakdown JSONB DEFAULT '[]'::jsonb,

    -- Full raw analysis from n8n
    full_analysis_json JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analysis queries
CREATE INDEX idx_analysis_conversation_id ON analysis(conversation_id);
CREATE INDEX idx_analysis_user_id ON analysis(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations via service role (backend)
-- You can add more restrictive policies later for direct client access

CREATE POLICY "Allow all for service role" ON users
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON conversations
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON analysis
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- STORAGE BUCKET FOR VIDEOS
-- ============================================
-- Run this separately in Supabase Dashboard > Storage

-- Create bucket: interview-videos
-- Make it private (not public)
-- Set file size limit: 500MB
-- Allowed MIME types: video/webm, video/mp4

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analysis_updated_at
    BEFORE UPDATE ON analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPFUL VIEWS
-- ============================================

-- ============================================
-- EMOTION TIMELINES TABLE (Granular timestamped data)
-- ============================================
CREATE TABLE emotion_timelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    model_type TEXT NOT NULL CHECK (model_type IN ('face', 'prosody', 'language', 'burst')),

    -- Timestamp range for this emotion window (milliseconds)
    start_timestamp_ms BIGINT NOT NULL,
    end_timestamp_ms BIGINT NOT NULL,

    -- All emotions with scores (not just top 5)
    emotions JSONB NOT NULL,
    top_emotion_name TEXT,
    top_emotion_score FLOAT,

    -- Face-specific data
    face_bounding_box JSONB,

    -- Raw prediction data
    raw_prediction JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient timeline queries
CREATE INDEX idx_emotion_timelines_conversation ON emotion_timelines(conversation_id);
CREATE INDEX idx_emotion_timelines_model ON emotion_timelines(conversation_id, model_type);
CREATE INDEX idx_emotion_timelines_time ON emotion_timelines(conversation_id, start_timestamp_ms);

-- ============================================
-- ANNOTATED TRANSCRIPTS TABLE (Text with emotions)
-- ============================================
CREATE TABLE annotated_transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL UNIQUE REFERENCES conversations(id) ON DELETE CASCADE,

    -- Segments with emotion data
    segments JSONB NOT NULL,  -- Array of {id, text, start_index, end_index, start_time, end_time, speaker, emotions, dominant_emotion}

    -- Metadata
    total_segments INTEGER,
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_annotated_transcripts_conversation ON annotated_transcripts(conversation_id);

-- Add expression_progress column to conversations
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS expression_progress JSONB;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS expression_analysis JSONB;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS expression_analyzed_at TIMESTAMP WITH TIME ZONE;

-- RLS for new tables
ALTER TABLE emotion_timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotated_transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for service role" ON emotion_timelines
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON annotated_transcripts
    FOR ALL USING (true) WITH CHECK (true);

-- View for conversation list with analysis status
CREATE VIEW conversation_summaries AS
SELECT
    c.id,
    c.user_id,
    u.name as user_name,
    c.elevenlabs_conversation_id,
    c.status,
    c.duration_seconds,
    c.video_url,
    c.started_at,
    c.ended_at,
    a.overall_score,
    a.overall_level,
    CASE WHEN a.id IS NOT NULL THEN true ELSE false END as has_analysis
FROM conversations c
JOIN users u ON c.user_id = u.id
LEFT JOIN analysis a ON c.id = a.conversation_id
ORDER BY c.created_at DESC;
