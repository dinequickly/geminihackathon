import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  Eye,
  Lightbulb
} from 'lucide-react';
import { api, Analysis, Conversation, AristotleAnalysis as AristotleType, PlatoAnalysis as PlatoType, SocratesAnalysis as SocratesType, ZenoAnalysis as ZenoType } from '../lib/api';
import { VideoEmotionPlayer, TranscriptViewer, VideoEmotionPlayerRef } from '../components';
import { LiquidButton } from '../components/LiquidButton';
import { LiquidGlass } from '../components/LiquidGlass';
import { LightLeakBackground } from '../components/LightLeakBackground';
import { LoadingSpinner } from '../components/PlayfulUI';
import {
  AristotleAIAnalysis,
  PlatoAnalysis,
  SocratesAnalysis,
  ZenoAnalysis
} from '../components/analysis';
import { AristotleTranscriptViewer } from '../components/analysis/AristotleTranscriptViewer';

type AnalysisView = 'default' | 'aristotle' | 'plato' | 'socrates' | 'zeno';

const DEMO_CONVERSATION_ID = '21557fe2-d7c9-492c-b99c-6e4b0d3c2044';

const DEMO_PLATO_ANALYSIS: PlatoType = {
  emotional_analysis: {
    score: 4.1,
    emotional_arc: [
      {
        timestamp: 2,
        emotions: {
          calm: 0.56,
          confident: 0.23,
          confused: 0.05,
          engaged: 0.08,
          anxious: 0.06,
          enthusiastic: 0.02
        },
        dominant_emotion: 'calm',
        trigger: 'Strong and clear name introduction.'
      },
      {
        timestamp: 10,
        emotions: {
          calm: 0.31,
          confident: 0.16,
          confused: 0.22,
          engaged: 0.14,
          anxious: 0.12,
          enthusiastic: 0.05
        },
        dominant_emotion: 'calm',
        trigger: 'The lead question started, but was interrupted before a full response.'
      },
      {
        timestamp: 19,
        emotions: {
          calm: 0.25,
          confident: 0.14,
          confused: 0.24,
          engaged: 0.12,
          anxious: 0.18,
          enthusiastic: 0.07
        },
        dominant_emotion: 'confused',
        trigger: 'Very short acknowledgement ("Yeah.") with no substantive follow-through.'
      }
    ],
    regulation_metrics: {
      stress_recovery_time_avg: 7.2,
      emotional_range: 0.38,
      authenticity_score: 6.2,
      self_awareness_score: 5.7
    },
    key_moments: [
      {
        timestamp: 2,
        type: 'EQ Strength',
        description: 'Introduced yourself directly and clearly under time pressure.',
        emotion_state: 'Calm baseline',
        recommendation: 'Keep this concise confidence, then transition immediately into a concrete example.'
      },
      {
        timestamp: 10,
        type: 'Authenticity Check',
        description: 'Question context changed mid-stream, which increased visible uncertainty.',
        emotion_state: 'Mildly unsettled',
        recommendation: 'When interrupted, pause and restate the question in your own words before answering.'
      },
      {
        timestamp: 19,
        type: 'Growth Opportunity',
        description: 'You acknowledged the prompt but did not provide a structured project example.',
        emotion_state: 'Hesitant',
        recommendation: 'Use a 20-second STAR outline as a default when leadership questions begin.'
      }
    ],
    patterns: {
      stress_triggers: [
        'Interviewer interruptions and partial prompts',
        'Ambiguous transition from setup to behavioral question'
      ],
      recovery_strategies: [
        'Use one-line clarification: "Happy to answer with a project example."',
        'Anchor to a prepared leadership story relevant to analyst work'
      ],
      authenticity_markers: [
        'Natural speaking tone during personal introduction',
        'No obvious over-scripted language in the captured segment'
      ],
      performed_moments: [
        {
          timestamp: 28,
          reason: 'Response initiation without substantive content reduced perceived confidence.'
        }
      ]
    },
    feedback: {
      strengths: [
        'Clear opener with stable tone',
        'No defensive language despite interruptions'
      ],
      growth_areas: [
        'Convert acknowledgements into direct answers faster',
        'Show emotional steadiness when prompts are cut off'
      ],
      coaching_insights: [
        'For hedge fund analyst interviews, pre-load two stories: one on ambiguity and one on high-stakes decision support.',
        'If the interviewer interrupts, treat it as signal to simplify, not abandon, your answer.'
      ]
    }
  }
};

const DEMO_SOCRATES_ANALYSIS: SocratesType = {
  strategic_analysis: {
    score: 2.6,
    thinking_patterns: {
      depth_score: 2.4,
      curiosity_score: 2.1,
      ambiguity_handling: 2.8,
      strategic_framing: 2.5,
      authenticity_vs_rehearsed: 3.4
    },
    question_analysis: {
      questions_asked: [],
      question_quality_avg: 0,
      missed_opportunities: [
        {
          timestamp: 10,
          context: 'Prompt requested a leadership example in an ambiguous setting.',
          what_to_ask: 'Would you like an example from AI integration work, or one focused on cross-functional execution?',
          why: 'A clarifying fork shows strategic communication and helps tailor signal to evaluator intent.'
        },
        {
          timestamp: 19,
          context: 'Short acknowledgement ("Yeah.") after interviewer reset the question.',
          what_to_ask: 'Should I prioritize decision process, team coordination, or measurable outcome in my answer?',
          why: 'This reframes the moment into an analyst-style approach: define objective, then respond precisely.'
        }
      ]
    },
    response_framework_analysis: {
      uses_structured_frameworks: false,
      answer_completeness: 1.9,
      storytelling_quality: 1.7,
      metric_usage: 1.2,
      connects_to_business_impact: false
    },
    intellectual_signals: {
      admits_knowledge_gaps: false,
      challenges_assumptions: false,
      shows_meta_awareness: false,
      demonstrates_learning_agility: true
    },
    comparison: {
      good_vs_great_analysis: [
        {
          your_approach: 'Acknowledged prompt and waited for more direction.',
          great_approach: 'Initiated a concise structure (Situation, decision, measurable result) and asked one precision clarifier.',
          gap: 'Insufficient strategic ownership of the response frame.',
          how_to_bridge: 'Start with a one-sentence thesis: "I will use a project where uncertainty changed our execution plan."'
        }
      ]
    },
    feedback: {
      intellectual_strengths: [
        'Stayed composed while the interviewer message was fragmented',
        'Did not overclaim experience in the captured segment'
      ],
      thinking_blindspots: [
        'Did not deploy a framework under ambiguity',
        'Did not convert prompt into a business-impact narrative'
      ],
      framework_recommendations: [
        'STAR: Situation, Task, Action, Result in 60-90 seconds.',
        'Decision Tree: State options, constraints, and expected upside/downside.',
        'Analyst Lens: Tie each action to signal quality, risk, and return.'
      ],
      advanced_strategies: [
        'Before answering, state the decision variable you optimized (speed, quality, or risk).',
        'Close each answer with one quantifiable effect, even if directional (for example, faster cycle time or lower error rate).'
      ]
    }
  }
};

const DEMO_ZENO_ANALYSIS: ZenoType = {
  presence_analysis: {
    score: 5.8,
    visual_metrics: {
      eye_contact_score: 64.2,
      posture_score: 61.7,
      gesture_effectiveness: 58.9,
      facial_expressiveness: 55.1,
      energy_level: 57.8
    },
    micro_expressions: [
      {
        timestamp: 10,
        expression: 'Brief brow tension',
        significance: 'Likely response planning under interrupted prompt.'
      },
      {
        timestamp: 19,
        expression: 'Short neutral reset',
        significance: 'Attempt to re-center before answering.'
      }
    ],
    body_language_patterns: {
      consistency_score: 62,
      nervous_habits: [
        'Energy drops during ambiguous transitions',
        'Reduced expressiveness when the question is restarted'
      ],
      power_poses: [
        'Centered posture during opening identification'
      ],
      defensive_moments: [
        'Compressed delivery immediately before speaking at 19s'
      ]
    },
    executive_presence_factors: {
      gravitas: 59.4,
      confidence_without_arrogance: 63.3,
      intellectual_honesty: 71.5,
      composure_under_pressure: 57.2
    },
    comparison_to_top_performers: {
      overall_delta: -17.8,
      specific_gaps: [
        {
          area: 'Composure During Interruptions',
          your_score: 57.2,
          top_10_avg: 82.4,
          improvement: 'Slow down first sentence after interruption and restate your answer plan.'
        },
        {
          area: 'Expressive Conviction',
          your_score: 55.1,
          top_10_avg: 79.6,
          improvement: 'Match voice emphasis to key claims and hold eye line on impact statements.'
        }
      ]
    },
    feedback: {
      what_works: [
        'Professional baseline posture',
        'Calm physical presence in the opening exchange'
      ],
      what_needs_work: [
        'Visible certainty drops when the prompt is incomplete',
        'Energy and expressiveness dip before substantive response'
      ],
      quick_wins: [
        'Use a 1-second pause, then begin with a structured answer label (for example, "One project that fits this is...").',
        'Keep shoulders open and maintain stable eye line through your first two sentences.'
      ],
      advanced_techniques: [
        'Practice interruption recovery drills: answer after random cut-ins while preserving pace and tone.',
        'Train with camera playback and score the first 15 seconds of each answer for conviction and clarity.'
      ]
    }
  }
};

export default function Results2() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentVideoTimeMs, setCurrentVideoTimeMs] = useState(0);
  const [analysisView, setAnalysisView] = useState<AnalysisView>('default');
  const [aristotleAnalysis, setAristotleAnalysis] = useState<AristotleType | null>(null);
  const [platoAnalysis, setPlatoAnalysis] = useState<PlatoType | null>(null);
  const [socratesAnalysis, setSocratesAnalysis] = useState<SocratesType | null>(null);
  const [zenoAnalysis, setZenoAnalysis] = useState<ZenoType | null>(null);
  const [philosophicalLoading, setPhilosophicalLoading] = useState(false);
  const videoPlayerRef = useRef<VideoEmotionPlayerRef>(null);
  const isDemoConversation = conversationId === DEMO_CONVERSATION_ID;
  const hideVideoInPhilosopherViews =
    isDemoConversation && (analysisView === 'plato' || analysisView === 'socrates' || analysisView === 'zeno');

  useEffect(() => {
    if (conversationId) {
      loadResults();
      loadPhilosophicalAnalyses();
    }
  }, [conversationId]);

  useEffect(() => {
    if (conversation && !analysis && conversation.status !== 'error') {
      const interval = setInterval(loadResults, 5000);
      return () => clearInterval(interval);
    }
  }, [conversation, analysis]);

  const loadResults = async () => {
    if (!conversationId) return;

    try {
      const data = await api.getConversation(conversationId);
      setConversation(data.conversation);
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load results');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPhilosophicalAnalyses = async () => {
    if (!conversationId) return;

    setPhilosophicalLoading(true);
    try {
      const data = await api.getAllPhilosophicalAnalyses(conversationId);
      if (data.aristotle) setAristotleAnalysis(data.aristotle);
      if (data.plato) setPlatoAnalysis(data.plato);
      if (data.socrates) setSocratesAnalysis(data.socrates);
      if (data.zeno) setZenoAnalysis(data.zeno);

      if (conversationId === DEMO_CONVERSATION_ID) {
        setPlatoAnalysis(DEMO_PLATO_ANALYSIS);
        setSocratesAnalysis(DEMO_SOCRATES_ANALYSIS);
        setZenoAnalysis(DEMO_ZENO_ANALYSIS);
      }
    } catch (err) {
      console.error('Failed to load philosophical analyses:', err);
      if (conversationId === DEMO_CONVERSATION_ID) {
        setPlatoAnalysis(DEMO_PLATO_ANALYSIS);
        setSocratesAnalysis(DEMO_SOCRATES_ANALYSIS);
        setZenoAnalysis(DEMO_ZENO_ANALYSIS);
      }
    } finally {
      setPhilosophicalLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 text-green-700';
    if (score >= 60) return 'bg-yellow-50 text-yellow-700';
    return 'bg-red-50 text-red-700';
  };

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      needs_work: 'Needs Work',
      developing: 'Developing',
      competent: 'Competent',
      strong: 'Strong',
      exceptional: 'Exceptional'
    };
    return labels[level] || level;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <LightLeakBackground />
        <LiquidGlass className="max-w-md w-full text-center p-8">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border border-red-100">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="font-sans font-semibold text-2xl tracking-tight text-black mb-2">Analysis Failed</h2>
          <p className="text-gray-600 mb-8 font-light">{error}</p>
          <LiquidButton
            onClick={() => navigate('/dashboard')}
            variant="black"
            icon={<ArrowLeft size={16} />}
          >
            Back to Dashboard
          </LiquidButton>
        </LiquidGlass>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <LightLeakBackground />
        <LiquidGlass className="max-w-md w-full text-center p-12">
          <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6 border border-gray-100">
            <RefreshCw className="w-10 h-10 text-gray-900 animate-spin" />
          </div>
          <h2 className="font-sans font-semibold text-3xl tracking-tight text-black mb-4">Processing Signal</h2>
          <p className="text-gray-600 mb-8 font-light">
            Our AI is analyzing your performance metrics. This typically takes 1-2 minutes.
          </p>
          <div className="w-full bg-gray-100 rounded-full h-1 mb-8 overflow-hidden">
            <div className="bg-black h-1 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
          <LiquidButton
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            icon={<ArrowLeft size={16} />}
          >
            Back to Dashboard
          </LiquidButton>
        </LiquidGlass>
      </div>
    );
  }

  const categoryScores = [
    { key: 'communication', label: 'Communication', icon: MessageSquare, score: analysis.communication_score },
    { key: 'emotional', label: 'Emotional IQ', icon: Heart, score: analysis.eq_score },
    { key: 'presence', label: 'Executive Presence', icon: Eye, score: analysis.presence_score },
    { key: 'strategic', label: 'Strategic Thinking', icon: Lightbulb, score: analysis.technical_score },
  ].filter(c => c.score !== undefined && c.score !== null);

  return (
    <div className="h-screen flex flex-col font-sans selection:bg-pink-100 overflow-hidden">
      <LightLeakBackground />

      {/* Header */}
      <header className="flex-shrink-0 px-8 py-4 flex items-center justify-between border-b border-gray-200/50 bg-white/80 backdrop-blur-md z-50">
        <div className="flex flex-col">
          <span className="font-sans font-bold text-xl tracking-tight text-black">VERITAS</span>
          <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Analysis Report</span>
        </div>

        {/* Analysis View Toggle */}
        <div className="flex items-center gap-2 bg-gray-100/80 rounded-full p-1">
          <button
            onClick={() => setAnalysisView('default')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${analysisView === 'default'
              ? 'bg-white text-black shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setAnalysisView('aristotle')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${analysisView === 'aristotle'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
            }`}
            disabled={!aristotleAnalysis && !philosophicalLoading}
          >
            <span>Aristotle</span>
            {philosophicalLoading && !aristotleAnalysis && <RefreshCw className="w-3 h-3 animate-spin" />}
          </button>
          <button
            onClick={() => setAnalysisView('plato')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${analysisView === 'plato'
              ? 'bg-purple-500 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
            }`}
            disabled={!platoAnalysis && !philosophicalLoading}
          >
            <span>Plato</span>
            {philosophicalLoading && !platoAnalysis && <RefreshCw className="w-3 h-3 animate-spin" />}
          </button>
          <button
            onClick={() => setAnalysisView('socrates')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${analysisView === 'socrates'
              ? 'bg-teal-500 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
            }`}
            disabled={!socratesAnalysis && !philosophicalLoading}
          >
            <span>Socrates</span>
            {philosophicalLoading && !socratesAnalysis && <RefreshCw className="w-3 h-3 animate-spin" />}
          </button>
          <button
            onClick={() => setAnalysisView('zeno')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${analysisView === 'zeno'
              ? 'bg-indigo-500 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
            }`}
            disabled={!zenoAnalysis && !philosophicalLoading}
          >
            <span>Zeno</span>
            {philosophicalLoading && !zenoAnalysis && <RefreshCw className="w-3 h-3 animate-spin" />}
          </button>
        </div>

        <LiquidButton
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          icon={<ArrowLeft size={16} />}
        >
          Back
        </LiquidButton>
      </header>

      {/* Main Content - Video Left, Transcript Right */}
      <main className="flex-1 flex min-h-0 relative z-10">
        {/* Left Panel - Video or Aristotle Transcript */}
        <div className="w-[45%] flex flex-col border-r border-gray-200/50">
          {analysisView === 'aristotle' && aristotleAnalysis ? (
            /* Aristotle Transcript View */
            <div className="flex-1 flex flex-col min-h-0">
              <AristotleTranscriptViewer
                conversationId={conversationId!}
                analysis={aristotleAnalysis}
                currentTimeMs={currentVideoTimeMs}
                onTimeClick={(timestamp) => {
                  setCurrentVideoTimeMs(timestamp * 1000);
                  videoPlayerRef.current?.seekTo(timestamp);
                }}
                onSegmentClick={(startTime) => {
                  setCurrentVideoTimeMs(startTime * 1000);
                  videoPlayerRef.current?.seekTo(startTime);
                  videoPlayerRef.current?.pause();
                }}
              />
            </div>
          ) : !hideVideoInPhilosopherViews && conversationId && conversation?.video_url ? (
            <div className="flex-1 flex flex-col">
              <VideoEmotionPlayer
                ref={videoPlayerRef}
                conversationId={conversationId}
                videoUrl={conversation.video_url}
                audioUrl={conversation.audio_url}
                humeJobId={analysis?.url}
                onTimeUpdate={setCurrentVideoTimeMs}
                showLiveEmotions={true}
              />
            </div>
          ) : hideVideoInPhilosopherViews ? (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center p-8 max-w-sm">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-700 font-medium mb-2">Video hidden in this view</p>
                <p className="text-sm text-gray-500">
                  Plato, Socrates, and Zeno tabs are in focused-analysis mode for this demo conversation.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No video available</p>
              </div>
            </div>
          )}

          {/* Score Summary Below Video (only in default view) */}
          {analysisView === 'default' && (
            <div className="flex-shrink-0 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200/50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className={`font-mono text-3xl ${getScoreColor(analysis.overall_score)}`}>
                    {analysis.overall_score}
                  </span>
                  <span className="text-gray-400 text-sm ml-2">/ 100</span>
                </div>
                <span className={`px-3 py-1 rounded text-xs font-mono uppercase ${getScoreBg(analysis.overall_score)}`}>
                  {getLevelLabel(analysis.overall_level)}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {categoryScores.map(({ key, label, icon: Icon, score }) => (
                  <div key={key} className="text-center p-2 rounded-lg bg-gray-50">
                    <Icon className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                    <div className={`font-mono text-lg ${getScoreColor(score!)}`}>{score}</div>
                    <div className="text-[10px] text-gray-500 uppercase">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Transcript or Analysis */}
        <div className="w-[55%] flex flex-col min-h-0">
          {analysisView === 'default' && conversationId && (
            <div className="flex-1 min-h-0 overflow-hidden bg-white">
              <TranscriptViewer
                conversationId={conversationId}
                currentTimeMs={currentVideoTimeMs}
                humeJobId={analysis?.url}
                onSegmentClick={(startTime) => {
                  setCurrentVideoTimeMs(startTime * 1000);
                  videoPlayerRef.current?.seekTo(startTime);
                  videoPlayerRef.current?.pause();
                }}
              />
            </div>
          )}

          {/* Aristotle Analysis View */}
          {analysisView === 'aristotle' && aristotleAnalysis && (
            <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-parchment-50">
              <AristotleAIAnalysis 
                analysis={aristotleAnalysis} 
                conversationId={conversationId!}
                onHighlightClick={(timestamp) => {
                  setCurrentVideoTimeMs(timestamp * 1000);
                  videoPlayerRef.current?.seekTo(timestamp);
                }}
              />
            </div>
          )}

          {/* Plato Analysis View */}
          {analysisView === 'plato' && platoAnalysis && (
            <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-white">
              <PlatoAnalysis
                analysis={platoAnalysis}
                duration={conversation?.duration_seconds}
                onTimeClick={(timestamp) => {
                  setCurrentVideoTimeMs(timestamp * 1000);
                  videoPlayerRef.current?.seekTo(timestamp);
                }}
              />
            </div>
          )}

          {/* Socrates Analysis View */}
          {analysisView === 'socrates' && socratesAnalysis && (
            <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-white">
              <SocratesAnalysis
                analysis={socratesAnalysis}
                onTimeClick={(timestamp) => {
                  setCurrentVideoTimeMs(timestamp * 1000);
                  videoPlayerRef.current?.seekTo(timestamp);
                }}
              />
            </div>
          )}

          {/* Zeno Analysis View */}
          {analysisView === 'zeno' && zenoAnalysis && (
            <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-white">
              <ZenoAnalysis
                analysis={zenoAnalysis}
                onTimeClick={(timestamp) => {
                  setCurrentVideoTimeMs(timestamp * 1000);
                  videoPlayerRef.current?.seekTo(timestamp);
                }}
              />
            </div>
          )}

          {/* Loading State for Philosophical Views */}
          {analysisView !== 'default' && philosophicalLoading && (
            <div className="flex-1 flex items-center justify-center bg-white">
              <LoadingSpinner size="lg" color="primary" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
