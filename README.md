# InterviewPro - AI Interview Practice Platform

A professional interview practice platform with AI-powered feedback using ElevenLabs Conversational AI.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
│  Onboarding → Interview (Video + ElevenLabs) → Results          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend (FastAPI)                            │
│  /api/users  /api/interviews  /api/conversations  /api/webhooks │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │ Supabase │   │   n8n    │   │ElevenLabs│
        │(Database)│   │(Analysis)│   │  (Voice) │
        └──────────┘   └──────────┘   └──────────┘
```

## Quick Start

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to SQL Editor and run the contents of `supabase/schema.sql`
3. Go to Storage and create a bucket called `interview-videos`
4. Get your project URL and service role key from Settings > API

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Run the server
python main.py
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### 4. Configure n8n Webhooks

Your n8n workflows need to call back to the FastAPI webhooks:

| Event | Call This Endpoint |
|-------|-------------------|
| Conversation ended (from ElevenLabs) | `POST /api/webhooks/conversation-complete` |
| Analysis complete | `POST /api/webhooks/analysis-complete` |
| LinkedIn scraping complete | `POST /api/webhooks/linkedin-complete` |

## Environment Variables

### Backend (.env)

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key

# ElevenLabs
ELEVENLABS_API_KEY=your-elevenlabs-api-key
ELEVENLABS_AGENT_ID=agent_1801k4yzmzs1exz9bee2kep0npbq

# n8n Webhooks (your existing endpoints)
N8N_LINKEDIN_WEBHOOK=https://maxipad.app.n8n.cloud/webhook/c97f84f3-9319-4e39-91e2-a7f84590eb3f
N8N_ANALYSIS_WEBHOOK=https://maxipad.app.n8n.cloud/webhook/58227689-94ba-41e7-a1d0-1a1b798024f3

# Server
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## API Endpoints

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/onboard` | Create/update user profile |
| GET | `/api/users/{user_id}` | Get user details |
| PATCH | `/api/users/{user_id}` | Update user profile |
| GET | `/api/users/{user_id}/status` | Check profile processing status |

### Interviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interviews/start` | Start new interview session |
| POST | `/api/interviews/{id}/end` | End interview session |

### Conversations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations/user/{user_id}` | List user's conversations |
| GET | `/api/conversations/{id}` | Get conversation with analysis |
| GET | `/api/conversations/{id}/status` | Check analysis status |
| POST | `/api/conversations/{id}/video` | Upload video recording |

### Webhooks (for n8n)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/conversation-complete` | Called when ElevenLabs conversation ends |
| POST | `/api/webhooks/analysis-complete` | Called when n8n analysis is done |
| POST | `/api/webhooks/linkedin-complete` | Called when LinkedIn scraping is done |

## n8n Integration

### Payload: conversation-complete

When your n8n workflow receives the ElevenLabs conversation.ended webhook, forward to:

```json
POST /api/webhooks/conversation-complete
{
  "conversation_id": "el_conv_xxx",
  "user_id": "uuid",
  "transcript": "Full transcript text...",
  "duration_seconds": 300
}
```

### Payload: analysis-complete

When your 5-agent analysis pipeline completes:

```json
POST /api/webhooks/analysis-complete
{
  "conversation_id": "uuid",
  "analysis": {
    "overall_score": 75,
    "overall_level": "competent",
    "overall_summary": "...",
    "technical_score": 80,
    "technical_feedback": "...",
    "eq_score": 70,
    "eq_feedback": "...",
    "presence_score": 75,
    "presence_feedback": "...",
    "culture_fit_score": 72,
    "culture_fit_feedback": "...",
    "authenticity_score": 78,
    "authenticity_feedback": "...",
    "filler_word_count": 12,
    "speaking_pace_wpm": 145,
    "top_improvements": [
      {"area": "Eye Contact", "suggestion": "...", "priority": 1}
    ],
    "instant_rewrites": [
      {"original": "...", "improved": "...", "explanation": "..."}
    ]
  }
}
```

### Payload: linkedin-complete

When LinkedIn scraping finishes:

```json
POST /api/webhooks/linkedin-complete
{
  "user_id": "uuid",
  "formatted_resume": "...",
  "skills": ["python", "react"],
  "experience_years": 5,
  "job_title": "Software Engineer"
}
```

## Supabase Storage Setup

1. Create bucket: `interview-videos`
2. Set to private
3. Configure allowed MIME types: `video/webm`, `video/mp4`
4. Set max file size: 500MB

## Frontend Pages

- `/` - Onboarding (if no user) or redirect to dashboard
- `/onboarding` - User profile creation
- `/dashboard` - View past interviews, start new one
- `/interview` - Live interview with video recording
- `/results/:id` - View analysis results

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: FastAPI, Python 3.11+
- **Database**: Supabase (PostgreSQL)
- **Voice AI**: ElevenLabs Conversational AI
- **Analysis**: n8n workflows (existing)
- **Video**: Browser MediaRecorder API → Supabase Storage
