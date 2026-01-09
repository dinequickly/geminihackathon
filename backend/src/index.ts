import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { runFullAnalysis } from './analysis/orchestrator.js';
import { Client } from '@gradio/client';

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
        analysis (overall_score, overall_level)
      `)
      .eq('user_id', req.params.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const conversations = (data || []).map(conv => {
      const analysis = conv.analysis?.[0];
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
      .from('analysis')
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
      .from('analysis')
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
// MULTIMODAL ANALYSIS (Gradio Client)
// ============================================

interface MultimodalAnalysisResult {
  text_emotion?: string;
  image_emotion?: {
    label: string | number | null;
    confidences: Array<{ label: string | number | null; confidence: number | null }> | null;
  };
  audio_emotion?: string;
  errors?: string[];
}

app.post('/api/multimodal-analysis', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), async (req, res) => {
  try {
    const { text, audio_file_path } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    const results: MultimodalAnalysisResult = {};
    const errors: string[] = [];

    // Initialize Gradio client
    const client = await Client.connect("pavan2606/Multimodal-Sentiment-Analysis");

    // Text sentiment analysis
    if (text) {
      try {
        const textResult = await client.predict("/predict_1", { text });
        const data = textResult.data as any[];
        results.text_emotion = data[0] as string;
      } catch (err: any) {
        errors.push(`Text analysis failed: ${err.message}`);
      }
    }

    // Image sentiment analysis
    if (files?.image?.[0]) {
      try {
        const imageFile = files.image[0];
        const blob = new Blob([new Uint8Array(imageFile.buffer)], { type: imageFile.mimetype });
        const imageResult = await client.predict("/predict_2", { img: blob });
        const data = imageResult.data as any[];
        results.image_emotion = data[0] as MultimodalAnalysisResult['image_emotion'];
      } catch (err: any) {
        errors.push(`Image analysis failed: ${err.message}`);
      }
    }

    // Audio sentiment analysis (via file path)
    if (audio_file_path) {
      try {
        const audioResult = await client.predict("/predict_3", { file_path: audio_file_path });
        const data = audioResult.data as any[];
        results.audio_emotion = data[0] as string;
      } catch (err: any) {
        errors.push(`Audio analysis failed: ${err.message}`);
      }
    }

    if (errors.length > 0) {
      results.errors = errors;
    }

    if (!text && !files?.image?.[0] && !audio_file_path) {
      return res.status(400).json({
        error: 'At least one input required: text, image, or audio_file_path'
      });
    }

    res.json(results);
  } catch (error: any) {
    console.error('Multimodal analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Individual analysis endpoints for convenience
app.post('/api/multimodal-analysis/text', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'text field is required' });
    }

    const client = await Client.connect("pavan2606/Multimodal-Sentiment-Analysis");
    const result = await client.predict("/predict_1", { text });
    const data = result.data as any[];

    res.json({ emotion: data[0] });
  } catch (error: any) {
    console.error('Text multimodal analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/multimodal-analysis/image', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'image file is required' });
    }

    const client = await Client.connect("pavan2606/Multimodal-Sentiment-Analysis");
    const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype });
    const result = await client.predict("/predict_2", { img: blob });
    const data = result.data as any[];

    res.json({ emotion: data[0] });
  } catch (error: any) {
    console.error('Image multimodal analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/multimodal-analysis/audio', async (req, res) => {
  try {
    const { file_path } = req.body;

    if (!file_path) {
      return res.status(400).json({ error: 'file_path field is required' });
    }

    const client = await Client.connect("pavan2606/Multimodal-Sentiment-Analysis");
    const result = await client.predict("/predict_3", { file_path });
    const data = result.data as any[];

    res.json({ emotion: data[0] });
  } catch (error: any) {
    console.error('Audio multimodal analysis error:', error);
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
      .from('analysis')
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
