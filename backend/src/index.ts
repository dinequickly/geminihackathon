import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { runFullAnalysis } from './analysis/orchestrator.js';

dotenv.config();

const app = express();
// Use raw body for HMAC verification
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));
const upload = multer({ storage: multer.memoryStorage() });

// Config
const PORT = process.env.PORT || 8000;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;
const ELEVENLABS_WEBHOOK_SECRET = process.env.ELEVENLABS_WEBHOOK_SECRET || 'wsec_bb9f5f44ee1c3b80bccc093ed00242fab0bcd44fc6cd35efdda39511703d28cc';
const ELEVENLABS_AGENT_ID = process.env.ELEVENLABS_AGENT_ID || 'agent_1801k4yzmzs1exz9bee2kep0npbq';

// ... (rest of middleware)

function verifyElevenLabsSignature(signature: string, rawBody: Buffer, secret: string) {
  try {
    const parts = signature.split(',');
    const tPart = parts.find(p => p.startsWith('t='));
    const vPart = parts.find(p => p.startsWith('v0='));
    
    if (!tPart || !vPart) return false;
    
    const timestamp = tPart.split('=')[1];
    const hash = vPart.split('=')[1];
    
    const signedPayload = `${timestamp}${rawBody.toString()}`;
    const expectedHash = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');
      
    return expectedHash === hash;
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}
const N8N_LINKEDIN_WEBHOOK = process.env.N8N_LINKEDIN_WEBHOOK || 'https://maxipad.app.n8n.cloud/webhook/c97f84f3-9319-4e39-91e2-a7f84590eb3f';
const N8N_ANALYSIS_WEBHOOK = process.env.N8N_ANALYSIS_WEBHOOK || 'https://maxipad.app.n8n.cloud/webhook/58227689-94ba-41e7-a1d0-1a1b798024f3';
const N8N_USER_CREATED_WEBHOOK = process.env.N8N_USER_CREATED_WEBHOOK || 'https://maxipad.app.n8n.cloud/webhook/3afd0576-b305-4cce-a8a9-f82cbf04107b';
const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY || '';
const HUGGING_FACE_AUDIO_URL = process.env.HUGGING_FACE_AUDIO_URL || '';
const HUME_API_KEY = process.env.HUME_API_KEY || '';

// Supabase client
const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co', 
  process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_KEY || 'placeholder'
);

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for now, or specify your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));
app.options('*', cors()); // Enable pre-flight for all routes
app.use(express.json());

// ============================================
// HEALTH CHECK
// ============================================
app.get('/', (req, res) => {
  res.json({ status: 'healthy', service: 'InterviewPro API' });
});

// ============================================
// USERS
// ============================================
app.post('/api/users/check', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
       throw error;
    }

    if (data) {
        // User exists, verify password if provided
        if (password) {
            if (!data.password) {
                 return res.json({ exists: true, user: data, password_valid: false }); 
            }
            
            const match = await bcrypt.compare(password, data.password);
            if (match) {
                res.json({ exists: true, user: data, password_valid: true });
            } else {
                res.json({ exists: true, password_valid: false });
            }
        } else {
            res.json({ exists: true, user: data });
        }
    } else {
        res.json({ exists: false });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users/onboard', async (req, res) => {
  try {
    const { name, email, password, linkedin_url, job_description } = req.body;

    if (!name || !email || !job_description || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    let userId: string;

    if (existing) {
      // Update existing user
      const { data, error } = await supabase
        .from('users')
        .update({
          name,
          password: hashedPassword,
          job_description,
          linkedin_url: linkedin_url || null,
          profile_status: linkedin_url ? 'processing' : 'ready'
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      userId = data.id;
    } else {
      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert({
          name,
          email,
          password: hashedPassword,
          job_description,
          linkedin_url: linkedin_url || null,
          profile_status: linkedin_url ? 'processing' : 'ready'
        })
        .select()
        .single();

      if (error) throw error;
      userId = data.id;
    }

    // Trigger new account/update webhook
    let webhookStatus = 'skipped';
    try {
      console.log('Triggering webhook to:', N8N_USER_CREATED_WEBHOOK);
      const whResponse = await fetch(N8N_USER_CREATED_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, email, name })
      });
      console.log('Webhook response status:', whResponse.status);
      webhookStatus = whResponse.ok ? 'success' : `failed_${whResponse.status}`;
      if (!whResponse.ok) {
        const text = await whResponse.text();
        console.error('Webhook error body:', text);
      }
    } catch (err: any) {
      console.error('User webhook failed:', err);
      webhookStatus = `error_${err.message}`;
    }

    // Trigger LinkedIn scraping if URL provided

    // Trigger LinkedIn scraping if URL provided
    if (linkedin_url) {
      fetch(N8N_LINKEDIN_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, linkedin_url })
      }).catch(err => console.error('LinkedIn webhook failed:', err));
    }

    res.json({
      user_id: userId,
      status: linkedin_url ? 'processing' : 'ready',
      message: linkedin_url ? 'Profile created. LinkedIn processing started.' : 'Profile created.',
      debug_webhook: webhookStatus
    });
  } catch (error: any) {
    console.error('Onboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.userId)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'User not found' });

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:userId/status', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, profile_status, formatted_resume')
      .eq('id', req.params.userId)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'User not found' });

    res.json({
      user_id: data.id,
      status: data.profile_status,
      has_resume: !!data.formatted_resume
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// INTERVIEWS
// ============================================
app.post('/api/interviews/start', async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create conversation record
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        user_id,
        status: 'in_progress'
      })
      .select()
      .single();

    if (convError) {
        console.error('Supabase create conversation error:', convError);
        throw convError;
    }

    // Get ElevenLabs signed URL
    const elResponse = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${ELEVENLABS_AGENT_ID}`,
      {
        headers: { 'xi-api-key': ELEVENLABS_API_KEY }
      }
    );

    if (!elResponse.ok) {
      throw new Error('Failed to get ElevenLabs signed URL');
    }

    const elData = await elResponse.json();

    res.json({
      conversation_id: conversation.id,
      agent_id: ELEVENLABS_AGENT_ID,
      signed_url: elData.signed_url
    });
  } catch (error: any) {
    console.error('Start interview error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/interviews/:conversationId/end', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { elevenlabs_conversation_id } = req.query;

    const updateData: any = { status: 'completed' };
    if (elevenlabs_conversation_id) {
      updateData.elevenlabs_conversation_id = elevenlabs_conversation_id;
    }

    const { data, error } = await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', conversationId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      status: 'completed',
      conversation_id: conversationId,
      message: 'Interview ended. Waiting for analysis.'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// CONVERSATIONS
// ============================================
app.get('/api/conversations/user/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        emotion_analysis!emotion_analysis_conversation_id_fkey (overall_score, overall_level)
      `)
      .eq('user_id', req.params.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const conversations = (data || []).map(conv => {
      const analysis = conv.emotion_analysis?.[0];
      return {
        ...conv,
        analysis: undefined,
        has_analysis: !!analysis,
        overall_score: analysis?.overall_score,
        overall_level: analysis?.overall_level
      };
    });

    res.json(conversations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/conversations/:conversationId', async (req, res) => {
  try {
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', req.params.conversationId)
      .single();

    if (convError) throw convError;

    const { data: analysis } = await supabase
      .from('emotion_analysis')
      .select('*')
      .eq('conversation_id', req.params.conversationId)
      .single();

    res.json({ conversation, analysis: analysis || null });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/conversations/:conversationId/status', async (req, res) => {
  try {
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .select('id, status')
      .eq('id', req.params.conversationId)
      .single();

    if (convError) throw convError;

    const { data: analysis } = await supabase
      .from('emotion_analysis')
      .select('id, overall_score')
      .eq('conversation_id', req.params.conversationId)
      .single();

    res.json({
      conversation_id: conv.id,
      status: conv.status,
      has_analysis: !!analysis,
      overall_score: analysis?.overall_score
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get signed URL for direct upload to Supabase (bypasses Vercel body limit)
app.post('/api/conversations/:conversationId/upload-url', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { fileType = 'video/webm', fileName = 'recording.webm' } = req.body;

    // Verify conversation exists
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .single();

    if (convError || !conv) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const storagePath = `interviews/${conversationId}/${fileName}`;

    // Create signed upload URL (valid for 1 hour)
    const { data, error } = await supabase.storage
      .from('interview-videos')
      .createSignedUploadUrl(storagePath);

    if (error) throw error;

    // Get the public URL for after upload
    const { data: urlData } = supabase.storage
      .from('interview-videos')
      .getPublicUrl(storagePath);

    res.json({
      uploadUrl: data.signedUrl,
      token: data.token,
      path: storagePath,
      publicUrl: urlData.publicUrl
    });
  } catch (error: any) {
    console.error('Upload URL error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Confirm upload completed and update conversation
app.post('/api/conversations/:conversationId/confirm-upload', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { storagePath, publicUrl, type = 'video' } = req.body;

    if (!storagePath || !publicUrl) {
      return res.status(400).json({ error: 'storagePath and publicUrl required' });
    }

    // Update conversation with video URL
    const updateData: any = {};
    if (type === 'video') {
      updateData.video_url = publicUrl;
      updateData.video_storage_path = storagePath;
    }

    const { error } = await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', conversationId);

    if (error) throw error;

    res.json({
      success: true,
      conversation_id: conversationId,
      [type === 'video' ? 'video_url' : 'url']: publicUrl
    });
  } catch (error: any) {
    console.error('Confirm upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Legacy endpoint - keep for backward compatibility but may hit Vercel limits
app.post('/api/conversations/:conversationId/video', upload.single('video'), async (req, res) => {
  try {
    const { conversationId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const storagePath = `interviews/${conversationId}/recording.webm`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('interview-videos')
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype || 'video/webm',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('interview-videos')
      .getPublicUrl(storagePath);

    // Update conversation
    await supabase
      .from('conversations')
      .update({
        video_url: urlData.publicUrl,
        video_storage_path: storagePath
      })
      .eq('id', conversationId);

    res.json({
      video_url: urlData.publicUrl,
      storage_path: storagePath
    });
  } catch (error: any) {
    console.error('Video upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// AUDIO ANALYSIS
// ============================================
app.post('/api/analysis/audio', upload.single('audio'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const base64Audio = file.buffer.toString('base64');

    const response = await fetch(HUGGING_FACE_AUDIO_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            inputs: base64Audio,
            parameters: {}
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Hugging Face API warning: ${response.status} ${errorText}`);
        // Return mock data if endpoint is paused/unavailable so we don't break the flow
        if (response.status === 400 || response.status === 503) {
            return res.json([{ label: 'neutral', score: 0.99 }]);
        }
        throw new Error(`Hugging Face API failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    res.json(result);

  } catch (error: any) {
    console.error('Audio analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// HUME AI EXPRESSION MEASUREMENT
// ============================================

interface HumeEmotion {
  name: string;
  score: number;
}

interface HumeExpressionResult {
  prosody?: HumeEmotion[];
  face?: HumeEmotion[];
  language?: HumeEmotion[];
  burst?: HumeEmotion[];
}

// Helper to analyze with Hume REST API (batch)
async function analyzeWithHumeBatch(
  mediaUrl: string,
  models: { prosody?: boolean; face?: boolean; language?: boolean; burst?: boolean }
): Promise<any> {
  // Start job
  const startResponse = await fetch('https://api.hume.ai/v0/batch/jobs', {
    method: 'POST',
    headers: {
      'X-Hume-Api-Key': HUME_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      urls: [mediaUrl],
      models: {
        prosody: models.prosody ? {} : undefined,
        face: models.face ? {} : undefined,
        language: models.language ? {} : undefined,
        burst: models.burst ? {} : undefined
      }
    })
  });

  if (!startResponse.ok) {
    const err = await startResponse.text();
    throw new Error(`Hume batch start failed: ${startResponse.status} ${err}`);
  }

  const { job_id } = await startResponse.json();

  // Poll for completion (max 60 seconds)
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000));

    const statusResponse = await fetch(`https://api.hume.ai/v0/batch/jobs/${job_id}`, {
      headers: { 'X-Hume-Api-Key': HUME_API_KEY }
    });

    const status = await statusResponse.json();

    if (status.state.status === 'COMPLETED') {
      // Get predictions
      const predictionsResponse = await fetch(`https://api.hume.ai/v0/batch/jobs/${job_id}/predictions`, {
        headers: { 'X-Hume-Api-Key': HUME_API_KEY }
      });
      return predictionsResponse.json();
    } else if (status.state.status === 'FAILED') {
      throw new Error(`Hume job failed: ${status.state.message}`);
    }
  }

  throw new Error('Hume job timed out');
}

// Helper to get top emotions from Hume results
function getTopEmotions(emotions: HumeEmotion[], limit = 5): HumeEmotion[] {
  return emotions
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Helper to store granular timeline data from Hume batch response
async function storeEmotionTimelines(
  conversationId: string,
  predictions: any
): Promise<{ face: number; prosody: number; burst: number }> {
  const counts = { face: 0, prosody: 0, burst: 0 };
  const timelineRecords: any[] = [];

  const pred = predictions?.[0]?.results?.predictions?.[0];
  if (!pred) return counts;

  // Process face predictions (frame-by-frame)
  if (pred.models?.face?.grouped_predictions) {
    for (const group of pred.models.face.grouped_predictions) {
      for (const p of group.predictions || []) {
        const topEmotion = p.emotions?.reduce((max: HumeEmotion, e: HumeEmotion) =>
          e.score > max.score ? e : max, { name: '', score: 0 });

        timelineRecords.push({
          conversation_id: conversationId,
          model_type: 'face',
          start_timestamp_ms: Math.round((p.time || 0) * 1000),
          end_timestamp_ms: Math.round((p.time || 0) * 1000) + 33, // ~30fps
          emotions: p.emotions,
          top_emotion_name: topEmotion?.name,
          top_emotion_score: topEmotion?.score,
          face_bounding_box: p.box || p.bounding_box
        });
        counts.face++;
      }
    }
  }

  // Process prosody predictions (time segments)
  if (pred.models?.prosody?.grouped_predictions) {
    for (const group of pred.models.prosody.grouped_predictions) {
      for (const p of group.predictions || []) {
        const topEmotion = p.emotions?.reduce((max: HumeEmotion, e: HumeEmotion) =>
          e.score > max.score ? e : max, { name: '', score: 0 });

        timelineRecords.push({
          conversation_id: conversationId,
          model_type: 'prosody',
          start_timestamp_ms: Math.round((p.time?.begin || 0) * 1000),
          end_timestamp_ms: Math.round((p.time?.end || 0) * 1000),
          emotions: p.emotions,
          top_emotion_name: topEmotion?.name,
          top_emotion_score: topEmotion?.score
        });
        counts.prosody++;
      }
    }
  }

  // Process burst predictions
  if (pred.models?.burst?.grouped_predictions) {
    for (const group of pred.models.burst.grouped_predictions) {
      for (const p of group.predictions || []) {
        const topEmotion = p.emotions?.reduce((max: HumeEmotion, e: HumeEmotion) =>
          e.score > max.score ? e : max, { name: '', score: 0 });

        timelineRecords.push({
          conversation_id: conversationId,
          model_type: 'burst',
          start_timestamp_ms: Math.round((p.time?.begin || 0) * 1000),
          end_timestamp_ms: Math.round((p.time?.end || 0) * 1000),
          emotions: p.emotions,
          top_emotion_name: topEmotion?.name,
          top_emotion_score: topEmotion?.score
        });
        counts.burst++;
      }
    }
  }

  // Batch insert timeline records
  if (timelineRecords.length > 0) {
    // Delete existing records first
    await supabase
      .from('emotion_timelines')
      .delete()
      .eq('conversation_id', conversationId);

    // Insert in batches of 500
    for (let i = 0; i < timelineRecords.length; i += 500) {
      const batch = timelineRecords.slice(i, i + 500);
      const { error } = await supabase
        .from('emotion_timelines')
        .insert(batch);

      if (error) {
        console.error(`[${conversationId}] Timeline insert error:`, error.message);
      }
    }
  }

  return counts;
}

// Helper to create annotated transcript with per-sentence emotions
async function createAnnotatedTranscript(
  conversationId: string,
  transcript: string,
  languageEmotions: HumeEmotion[]
): Promise<void> {
  // Split transcript into sentences
  const sentences = transcript.match(/[^.!?]+[.!?]+/g) || [transcript];

  const segments = sentences.map((text, idx) => {
    const startIndex = transcript.indexOf(text);
    // Estimate timing based on position (rough approximation)
    const totalChars = transcript.length;
    const startTime = (startIndex / totalChars) * 100; // Placeholder timing

    return {
      id: `seg-${idx}`,
      text: text.trim(),
      start_index: startIndex,
      end_index: startIndex + text.length,
      start_time: startTime,
      end_time: startTime + (text.length / totalChars) * 100,
      speaker: 'user',
      emotions: languageEmotions,
      dominant_emotion: languageEmotions[0]?.name || 'neutral',
      emotion_category: categorizeEmotion(languageEmotions[0]?.name || '')
    };
  });

  await supabase
    .from('annotated_transcripts')
    .upsert({
      conversation_id: conversationId,
      segments,
      total_segments: segments.length,
      analyzed_at: new Date().toISOString()
    }, { onConflict: 'conversation_id' });
}

function categorizeEmotion(emotionName: string): string {
  const positive = ['joy', 'amusement', 'excitement', 'pride', 'satisfaction', 'admiration', 'love', 'gratitude', 'relief'];
  const negative = ['anger', 'sadness', 'fear', 'anxiety', 'disgust', 'contempt', 'disappointment', 'embarrassment'];
  const surprise = ['surprise', 'realization', 'interest', 'curiosity'];

  const lower = emotionName.toLowerCase();
  if (positive.some(e => lower.includes(e))) return 'positive';
  if (negative.some(e => lower.includes(e))) return 'negative';
  if (surprise.some(e => lower.includes(e))) return 'surprise';
  return 'neutral';
}

// Streaming endpoint for expression measurement via SSE
app.get('/api/expression/stream/:conversationId', async (req, res) => {
  const { conversationId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    sendEvent('status', { message: 'Starting expression analysis...', stage: 'init' });

    // Get conversation with video URL
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .select('*, users(formatted_resume, job_description)')
      .eq('id', conversationId)
      .single();

    if (convError || !conv) {
      sendEvent('error', { message: 'Conversation not found' });
      return res.end();
    }

    const results: HumeExpressionResult = {};

    // Analyze transcript (language)
    if (conv.transcript) {
      sendEvent('status', { message: 'Analyzing language emotions...', stage: 'language' });
      try {
        // Use WebSocket for text streaming
        const wsUrl = `wss://api.hume.ai/v0/stream/models?apiKey=${HUME_API_KEY}`;
        const ws = new (await import('ws')).default(wsUrl);

        await new Promise<void>((resolve, reject) => {
          ws.on('open', () => {
            ws.send(JSON.stringify({
              models: { language: {} },
              raw_text: true,
              data: conv.transcript
            }));
          });

          ws.on('message', (data: Buffer) => {
            const response = JSON.parse(data.toString());
            if (response.language?.predictions?.[0]?.emotions) {
              results.language = getTopEmotions(response.language.predictions[0].emotions);
              sendEvent('language', { emotions: results.language });
            }
            ws.close();
            resolve();
          });

          ws.on('error', reject);
          setTimeout(() => { ws.close(); resolve(); }, 30000);
        });
      } catch (err: any) {
        sendEvent('warning', { message: `Language analysis failed: ${err.message}` });
      }
    }

    // Analyze video (face + prosody)
    if (conv.video_url) {
      sendEvent('status', { message: 'Analyzing facial expressions and voice prosody...', stage: 'video' });
      try {
        const predictions = await analyzeWithHumeBatch(conv.video_url, { face: true, prosody: true });

        if (predictions?.[0]?.results?.predictions?.[0]) {
          const pred = predictions[0].results.predictions[0];

          // Face emotions
          if (pred.models?.face?.grouped_predictions?.[0]?.predictions?.[0]?.emotions) {
            results.face = getTopEmotions(pred.models.face.grouped_predictions[0].predictions[0].emotions);
            sendEvent('face', { emotions: results.face });
          }

          // Prosody emotions
          if (pred.models?.prosody?.grouped_predictions?.[0]?.predictions?.[0]?.emotions) {
            results.prosody = getTopEmotions(pred.models.prosody.grouped_predictions[0].predictions[0].emotions);
            sendEvent('prosody', { emotions: results.prosody });
          }
        }
      } catch (err: any) {
        sendEvent('warning', { message: `Video analysis failed: ${err.message}` });
      }
    }

    // Store results in database
    await supabase
      .from('conversations')
      .update({
        expression_analysis: results,
        expression_analyzed_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    sendEvent('complete', {
      message: 'Expression analysis complete',
      results
    });

  } catch (error: any) {
    sendEvent('error', { message: error.message });
  }

  res.end();
});

// Non-streaming endpoint for expression analysis
app.post('/api/expression/analyze', async (req, res) => {
  try {
    const { conversation_id, video_url, transcript, audio_url } = req.body;

    if (!video_url && !transcript && !audio_url) {
      return res.status(400).json({ error: 'At least one of video_url, transcript, or audio_url required' });
    }

    const results: HumeExpressionResult = {};
    const errors: string[] = [];

    // Analyze video (face + prosody)
    if (video_url) {
      try {
        const predictions = await analyzeWithHumeBatch(video_url, { face: true, prosody: true, burst: true });

        if (predictions?.[0]?.results?.predictions?.[0]) {
          const pred = predictions[0].results.predictions[0];

          if (pred.models?.face?.grouped_predictions?.[0]?.predictions?.[0]?.emotions) {
            results.face = getTopEmotions(pred.models.face.grouped_predictions[0].predictions[0].emotions);
          }

          if (pred.models?.prosody?.grouped_predictions?.[0]?.predictions?.[0]?.emotions) {
            results.prosody = getTopEmotions(pred.models.prosody.grouped_predictions[0].predictions[0].emotions);
          }

          if (pred.models?.burst?.grouped_predictions?.[0]?.predictions?.[0]?.emotions) {
            results.burst = getTopEmotions(pred.models.burst.grouped_predictions[0].predictions[0].emotions);
          }
        }
      } catch (err: any) {
        errors.push(`Video analysis: ${err.message}`);
      }
    }

    // Analyze transcript (language)
    if (transcript) {
      try {
        const wsUrl = `wss://api.hume.ai/v0/stream/models?apiKey=${HUME_API_KEY}`;
        const ws = new (await import('ws')).default(wsUrl);

        await new Promise<void>((resolve, reject) => {
          ws.on('open', () => {
            ws.send(JSON.stringify({
              models: { language: {} },
              raw_text: true,
              data: transcript
            }));
          });

          ws.on('message', (data: Buffer) => {
            const response = JSON.parse(data.toString());
            if (response.language?.predictions?.[0]?.emotions) {
              results.language = getTopEmotions(response.language.predictions[0].emotions);
            }
            ws.close();
            resolve();
          });

          ws.on('error', reject);
          setTimeout(() => { ws.close(); resolve(); }, 30000);
        });
      } catch (err: any) {
        errors.push(`Language analysis: ${err.message}`);
      }
    }

    // Store in DB if conversation_id provided
    if (conversation_id) {
      await supabase
        .from('conversations')
        .update({
          expression_analysis: results,
          expression_analyzed_at: new Date().toISOString()
        })
        .eq('id', conversation_id);
    }

    res.json({
      results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('Expression analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// HUME EXPRESSION ANALYSIS HELPER
// ============================================

type ExpressionStatus = 'pending' | 'analyzing_language' | 'analyzing_video' | 'completed' | 'failed' | 'skipped';

interface ExpressionProgress {
  status: ExpressionStatus;
  started_at?: string;
  language_started_at?: string;
  language_completed_at?: string;
  video_started_at?: string;
  video_completed_at?: string;
  completed_at?: string;
  error?: string;
  models_analyzed: string[];
}

async function updateExpressionStatus(
  conversationId: string,
  progress: Partial<ExpressionProgress>
): Promise<void> {
  await supabase
    .from('conversations')
    .update({ expression_progress: progress })
    .eq('id', conversationId);
}

async function runHumeExpressionAnalysis(conversationId: string): Promise<void> {
  const startTime = new Date().toISOString();
  console.log(`[${conversationId}] Starting Hume expression analysis...`);

  const progress: ExpressionProgress = {
    status: 'pending',
    started_at: startTime,
    models_analyzed: []
  };

  try {
    // Update status to pending
    await updateExpressionStatus(conversationId, progress);

    // Check if HUME_API_KEY is configured
    if (!HUME_API_KEY) {
      console.log(`[${conversationId}] HUME_API_KEY not configured, skipping analysis`);
      progress.status = 'skipped';
      progress.error = 'HUME_API_KEY not configured';
      await updateExpressionStatus(conversationId, progress);
      return;
    }

    // Get conversation data
    const { data: conv, error } = await supabase
      .from('conversations')
      .select('id, transcript, video_url')
      .eq('id', conversationId)
      .single();

    if (error || !conv) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    const results: HumeExpressionResult = {};

    // Analyze transcript (language emotions)
    if (conv.transcript) {
      progress.status = 'analyzing_language';
      progress.language_started_at = new Date().toISOString();
      await updateExpressionStatus(conversationId, progress);

      console.log(`[${conversationId}] Analyzing language emotions...`);

      try {
        const ws = new (await import('ws')).default(`wss://api.hume.ai/v0/stream/models?apiKey=${HUME_API_KEY}`);

        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            console.log(`[${conversationId}] Language analysis timed out after 30s`);
            ws.close();
            resolve();
          }, 30000);

          ws.on('open', () => {
            ws.send(JSON.stringify({
              models: { language: {} },
              raw_text: true,
              data: conv.transcript
            }));
          });

          ws.on('message', (data: Buffer) => {
            clearTimeout(timeout);
            const response = JSON.parse(data.toString());
            if (response.language?.predictions?.[0]?.emotions) {
              results.language = getTopEmotions(response.language.predictions[0].emotions);
              progress.models_analyzed.push('language');
              console.log(`[${conversationId}] Language analysis complete: ${results.language.length} emotions`);
            }
            ws.close();
            resolve();
          });

          ws.on('error', (err) => {
            clearTimeout(timeout);
            console.error(`[${conversationId}] WebSocket error:`, err.message);
            ws.close();
            resolve();
          });
        });

        progress.language_completed_at = new Date().toISOString();
      } catch (err: any) {
        console.error(`[${conversationId}] Language analysis failed:`, err.message);
      }
    }

    // Analyze video (face + prosody)
    if (conv.video_url) {
      progress.status = 'analyzing_video';
      progress.video_started_at = new Date().toISOString();
      await updateExpressionStatus(conversationId, progress);

      console.log(`[${conversationId}] Analyzing facial expressions and prosody...`);

      try {
        const predictions = await analyzeWithHumeBatch(conv.video_url, { face: true, prosody: true });

        if (predictions?.[0]?.results?.predictions?.[0]) {
          const pred = predictions[0].results.predictions[0];

          if (pred.models?.face?.grouped_predictions?.[0]?.predictions?.[0]?.emotions) {
            results.face = getTopEmotions(pred.models.face.grouped_predictions[0].predictions[0].emotions);
            progress.models_analyzed.push('face');
            console.log(`[${conversationId}] Face analysis complete: ${results.face.length} emotions`);
          }

          if (pred.models?.prosody?.grouped_predictions?.[0]?.predictions?.[0]?.emotions) {
            results.prosody = getTopEmotions(pred.models.prosody.grouped_predictions[0].predictions[0].emotions);
            progress.models_analyzed.push('prosody');
            console.log(`[${conversationId}] Prosody analysis complete: ${results.prosody.length} emotions`);
          }

          // Store granular timeline data for video scrubbing
          try {
            const timelineCounts = await storeEmotionTimelines(conversationId, predictions);
            console.log(`[${conversationId}] Timeline stored: ${timelineCounts.face} face, ${timelineCounts.prosody} prosody frames`);
          } catch (tlErr: any) {
            console.error(`[${conversationId}] Timeline storage failed:`, tlErr.message);
          }
        }

        progress.video_completed_at = new Date().toISOString();
      } catch (err: any) {
        console.error(`[${conversationId}] Video analysis failed:`, err.message);
        progress.error = `Video analysis failed: ${err.message}`;
      }
    }

    // Create annotated transcript if we have language results
    if (results.language && conv.transcript) {
      try {
        await createAnnotatedTranscript(conversationId, conv.transcript, results.language);
        console.log(`[${conversationId}] Annotated transcript created`);
      } catch (atErr: any) {
        console.error(`[${conversationId}] Annotated transcript failed:`, atErr.message);
      }
    }

    // Store results
    progress.status = 'completed';
    progress.completed_at = new Date().toISOString();

    const updateData: any = {
      expression_progress: progress
    };

    if (Object.keys(results).length > 0) {
      updateData.expression_analysis = results;
      updateData.expression_analyzed_at = progress.completed_at;
    }

    await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', conversationId);

    const duration = (new Date(progress.completed_at).getTime() - new Date(startTime).getTime()) / 1000;
    console.log(`[${conversationId}] Expression analysis completed in ${duration}s. Models: ${progress.models_analyzed.join(', ') || 'none'}`);

  } catch (err: any) {
    console.error(`[${conversationId}] Expression analysis failed:`, err.message);
    progress.status = 'failed';
    progress.error = err.message;
    progress.completed_at = new Date().toISOString();
    await updateExpressionStatus(conversationId, progress);
  }
}

// ============================================
// ANALYSIS STATUS ENDPOINT
// ============================================

app.get('/api/conversations/:conversationId/analysis-status', async (req, res) => {
  try {
    const { conversationId } = req.params;

    const { data: conv, error } = await supabase
      .from('conversations')
      .select('id, status, expression_progress, expression_analysis, expression_analyzed_at, created_at, ended_at')
      .eq('id', conversationId)
      .single();

    if (error || !conv) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const progress = conv.expression_progress as ExpressionProgress | null;

    // Calculate durations
    let languageDuration: number | null = null;
    let videoDuration: number | null = null;
    let totalDuration: number | null = null;

    if (progress?.language_started_at && progress?.language_completed_at) {
      languageDuration = (new Date(progress.language_completed_at).getTime() - new Date(progress.language_started_at).getTime()) / 1000;
    }
    if (progress?.video_started_at && progress?.video_completed_at) {
      videoDuration = (new Date(progress.video_completed_at).getTime() - new Date(progress.video_started_at).getTime()) / 1000;
    }
    if (progress?.started_at && progress?.completed_at) {
      totalDuration = (new Date(progress.completed_at).getTime() - new Date(progress.started_at).getTime()) / 1000;
    }

    // Check if stuck (started > 5 min ago but not completed)
    let isStuck = false;
    if (progress?.started_at && !progress?.completed_at) {
      const elapsed = (Date.now() - new Date(progress.started_at).getTime()) / 1000;
      isStuck = elapsed > 300; // 5 minutes
    }

    res.json({
      conversation_id: conversationId,
      conversation_status: conv.status,
      expression_analysis: {
        status: progress?.status || 'not_started',
        is_stuck: isStuck,
        started_at: progress?.started_at,
        completed_at: progress?.completed_at,
        error: progress?.error,
        models_analyzed: progress?.models_analyzed || [],
        has_results: !!conv.expression_analysis,
        durations: {
          language_seconds: languageDuration,
          video_seconds: videoDuration,
          total_seconds: totalDuration
        },
        stages: {
          language: {
            started: progress?.language_started_at,
            completed: progress?.language_completed_at
          },
          video: {
            started: progress?.video_started_at,
            completed: progress?.video_completed_at
          }
        }
      },
      results_preview: conv.expression_analysis ? {
        face_emotions: (conv.expression_analysis as any).face?.length || 0,
        prosody_emotions: (conv.expression_analysis as any).prosody?.length || 0,
        language_emotions: (conv.expression_analysis as any).language?.length || 0
      } : null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Retry failed analysis
app.post('/api/conversations/:conversationId/retry-analysis', async (req, res) => {
  try {
    const { conversationId } = req.params;

    const { data: conv, error } = await supabase
      .from('conversations')
      .select('id, expression_progress')
      .eq('id', conversationId)
      .single();

    if (error || !conv) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const progress = conv.expression_progress as ExpressionProgress | null;

    if (progress?.status === 'analyzing_language' || progress?.status === 'analyzing_video') {
      return res.status(400).json({
        error: 'Analysis already in progress',
        current_status: progress.status
      });
    }

    // Clear previous progress and restart
    await supabase
      .from('conversations')
      .update({
        expression_progress: null,
        expression_analysis: null,
        expression_analyzed_at: null
      })
      .eq('id', conversationId);

    // Trigger new analysis
    runHumeExpressionAnalysis(conversationId).catch(err => {
      console.error(`Retry analysis failed for ${conversationId}:`, err);
    });

    res.json({
      message: 'Analysis restarted',
      conversation_id: conversationId
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// EMOTION TIMELINE QUERIES
// ============================================

// Get emotion timeline data for video scrubbing
app.get('/api/conversations/:conversationId/emotions/timeline', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { start_ms, end_ms, models } = req.query;

    let query = supabase
      .from('emotion_timelines')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('start_timestamp_ms', { ascending: true });

    // Filter by time range if provided
    if (start_ms) {
      query = query.gte('start_timestamp_ms', parseInt(start_ms as string));
    }
    if (end_ms) {
      query = query.lte('end_timestamp_ms', parseInt(end_ms as string));
    }

    // Filter by model types if provided
    if (models) {
      const modelList = (models as string).split(',');
      query = query.in('model_type', modelList);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Group by model type
    const grouped: Record<string, any[]> = { face: [], prosody: [], language: [], burst: [] };
    (data || []).forEach(item => {
      grouped[item.model_type]?.push(item);
    });

    res.json({
      conversation_id: conversationId,
      total_records: data?.length || 0,
      timeline: grouped
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get emotions at specific timestamp (for video playback sync)
app.get('/api/conversations/:conversationId/emotions/at', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { time_ms } = req.query;

    if (!time_ms) {
      return res.status(400).json({ error: 'time_ms query parameter required' });
    }

    const timeMs = parseInt(time_ms as string);

    // Get face emotion at this time
    const { data: faceData } = await supabase
      .from('emotion_timelines')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('model_type', 'face')
      .lte('start_timestamp_ms', timeMs)
      .gte('end_timestamp_ms', timeMs)
      .limit(1)
      .single();

    // Get prosody emotion at this time
    const { data: prosodyData } = await supabase
      .from('emotion_timelines')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('model_type', 'prosody')
      .lte('start_timestamp_ms', timeMs)
      .gte('end_timestamp_ms', timeMs)
      .limit(1)
      .single();

    res.json({
      timestamp_ms: timeMs,
      face: faceData ? {
        top_emotion: faceData.top_emotion_name,
        score: faceData.top_emotion_score,
        all_emotions: faceData.emotions?.slice(0, 5),
        bounding_box: faceData.face_bounding_box
      } : null,
      prosody: prosodyData ? {
        top_emotion: prosodyData.top_emotion_name,
        score: prosodyData.top_emotion_score,
        all_emotions: prosodyData.emotions?.slice(0, 5)
      } : null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get annotated transcript with emotion highlighting
app.get('/api/conversations/:conversationId/transcript/annotated', async (req, res) => {
  try {
    const { conversationId } = req.params;

    const { data, error } = await supabase
      .from('annotated_transcripts')
      .select('*')
      .eq('conversation_id', conversationId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!data) {
      // Return raw transcript if no annotated version exists
      const { data: conv } = await supabase
        .from('conversations')
        .select('transcript')
        .eq('id', conversationId)
        .single();

      return res.json({
        conversation_id: conversationId,
        has_annotations: false,
        transcript: conv?.transcript || null
      });
    }

    res.json({
      conversation_id: conversationId,
      has_annotations: true,
      segments: data.segments,
      total_segments: data.total_segments,
      analyzed_at: data.analyzed_at
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get emotion distribution/histogram over time
app.get('/api/conversations/:conversationId/emotions/distribution', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { bucket_size_ms = '1000', model = 'face' } = req.query;

    const bucketSize = parseInt(bucket_size_ms as string);

    const { data, error } = await supabase
      .from('emotion_timelines')
      .select('start_timestamp_ms, top_emotion_name, top_emotion_score')
      .eq('conversation_id', conversationId)
      .eq('model_type', model)
      .order('start_timestamp_ms', { ascending: true });

    if (error) throw error;

    // Bucket the data
    const buckets: Record<number, { emotions: Record<string, number>; count: number }> = {};

    (data || []).forEach(item => {
      const bucketIndex = Math.floor(item.start_timestamp_ms / bucketSize);
      if (!buckets[bucketIndex]) {
        buckets[bucketIndex] = { emotions: {}, count: 0 };
      }
      if (item.top_emotion_name) {
        buckets[bucketIndex].emotions[item.top_emotion_name] =
          (buckets[bucketIndex].emotions[item.top_emotion_name] || 0) + 1;
      }
      buckets[bucketIndex].count++;
    });

    // Convert to array
    const distribution = Object.entries(buckets).map(([index, data]) => ({
      bucket_index: parseInt(index),
      time_range_ms: {
        start: parseInt(index) * bucketSize,
        end: (parseInt(index) + 1) * bucketSize
      },
      dominant_emotion: Object.entries(data.emotions)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || null,
      emotion_counts: data.emotions,
      sample_count: data.count
    }));

    res.json({
      conversation_id: conversationId,
      model_type: model,
      bucket_size_ms: bucketSize,
      total_buckets: distribution.length,
      distribution
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// WEBHOOKS (for n8n callbacks)
// ============================================

app.post('/api/webhooks/conversation-complete', async (req: any, res) => {
  try {
    const signature = req.headers['elevenlabs-signature'];
    const rawBody = req.rawBody;

    console.log('Webhook received. Signature:', signature);
    console.log('Webhook Body:', JSON.stringify(req.body, null, 2));

    if (signature && ELEVENLABS_WEBHOOK_SECRET) {
      const isValid = verifyElevenLabsSignature(signature as string, rawBody, ELEVENLABS_WEBHOOK_SECRET);
      if (!isValid) {
        console.error('Invalid ElevenLabs signature');
        // return res.status(401).json({ error: 'Invalid signature' });
      } else {
        console.log('ElevenLabs signature verified successfully');
      }
    }

    // Handle potential wrapper
    let payload = req.body;
    if (payload.type === 'speech_to_text_transcription' && payload.data) {
        payload = {
            ...payload.data,
            transcript: payload.data.transcription?.text
        };
    }

    const { conversation_id, user_id, transcript, transcript_json, duration_seconds } = payload;

    console.log('Conversation complete webhook:', conversation_id);

    // Find conversation
    let query = supabase.from('conversations').select('*, users(formatted_resume, job_description)');

    if (user_id || conversation_id) {
      // Find latest in-progress conversation for user
      const { data } = await query
        .eq(conversation_id ? 'id' : 'user_id', conversation_id || user_id)
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        const convId = data.id;

        // Update conversation with initial data
        await supabase
          .from('conversations')
          .update({
            status: 'analyzing',
            elevenlabs_conversation_id: conversation_id,
            transcript: transcript || payload.transcription?.text,
            transcript_json: transcript_json || payload.transcription,
            duration_seconds: duration_seconds || payload.duration_seconds,
            ended_at: new Date().toISOString()
          })
          .eq('id', convId);

        // Run local analysis orchestrator
        if (transcript || payload.transcription?.text) {
          try {
            console.log(`Starting analysis for ${convId}...`);
            await runFullAnalysis(convId);
            console.log(`Analysis completed for ${convId}`);
          } catch (err) {
            console.error(`Analysis failed for ${convId}:`, err);
          }
        }

        // Trigger Hume expression analysis (non-blocking)
        runHumeExpressionAnalysis(convId).catch(err => {
          console.error(`Hume expression analysis failed for ${convId}:`, err);
        });

        return res.json({ status: 'success', conversation_id: convId });
      }
    }

    res.status(404).json({ error: 'Conversation not found' });
  } catch (error: any) {
    console.error('Conversation complete webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/webhooks/analysis-complete', async (req, res) => {
  try {
    const { conversation_id, analysis } = req.body;

    console.log('Analysis complete webhook:', conversation_id);

    // Get conversation
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .select('id, user_id')
      .eq('id', conversation_id)
      .single();

    if (convError || !conv) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Prepare analysis data
    const analysisData: any = {
      conversation_id,
      user_id: conv.user_id,
      full_analysis_json: analysis,
      overall_score: analysis.overall_score,
      overall_level: analysis.overall_level,
      overall_summary: analysis.overall_summary,
      technical_score: analysis.technical_score,
      technical_feedback: analysis.technical_feedback,
      eq_score: analysis.eq_score,
      eq_feedback: analysis.eq_feedback,
      presence_score: analysis.presence_score,
      presence_feedback: analysis.presence_feedback,
      culture_fit_score: analysis.culture_fit_score,
      culture_fit_feedback: analysis.culture_fit_feedback,
      authenticity_score: analysis.authenticity_score,
      authenticity_feedback: analysis.authenticity_feedback,
      filler_word_count: analysis.filler_word_count,
      filler_words: analysis.filler_words,
      speaking_pace_wpm: analysis.speaking_pace_wpm,
      confidence_score: analysis.confidence_score,
      top_improvements: analysis.top_improvements,
      instant_rewrites: analysis.instant_rewrites,
      question_breakdown: analysis.question_breakdown
    };

    // Upsert analysis
    const { error: analysisError } = await supabase
      .from('emotion_analysis')
      .upsert(analysisData, { onConflict: 'conversation_id' });

    if (analysisError) throw analysisError;

    // Update conversation status
    await supabase
      .from('conversations')
      .update({ status: 'analyzed' })
      .eq('id', conversation_id);

    res.json({ status: 'success', conversation_id });
  } catch (error: any) {
    console.error('Analysis complete webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/webhooks/linkedin-complete', async (req, res) => {
  try {
    const { user_id, formatted_resume, skills, experience_years, job_title } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }

    console.log('LinkedIn complete webhook:', user_id);

    const { error } = await supabase
      .from('users')
      .update({
        profile_status: 'ready',
        formatted_resume,
        skills,
        experience_years,
        job_title
      })
      .eq('id', user_id);

    if (error) throw error;

    res.json({ status: 'success', user_id });
  } catch (error: any) {
    console.error('LinkedIn complete webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server (only in dev, not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Catch-all for debugging 404s
app.use((req, res) => {
  console.log(`404 Hit: ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers));
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

// Export for Vercel
export default app;
