import { useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import {
  BarChart3,
  MessageSquare,
  Brain,
  Heart,
  Target,
  Clock,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Mic,
  Video
} from 'lucide-react';
import { api, Analysis, Conversation, AristotleAnalysis, PlatoAnalysis, SocratesAnalysis, ZenoAnalysis, DavinciSynthesis, TranscriptHighlight } from '../lib/api';
import { VideoEmotionPlayer } from '../components';

const ALLOWED_USER_IDS = new Set(['21557fe2-d7c9-492c-b99c-6e4b0d3c2044', 'c315372a-da40-4586-9451-44ceaaca15a7']);

// === UTILITY FUNCTIONS ===
const formatDuration = (seconds?: number) => {
  if (!seconds) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
};

const formatTimestamp = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
};

const getScoreLevel = (score: number, max: number = 5) => {
  const ratio = score / max;
  if (ratio >= 0.8) return { label: 'Excellent', color: 'text-emerald-700', bg: 'bg-emerald-100' };
  if (ratio >= 0.6) return { label: 'Good', color: 'text-amber-700', bg: 'bg-amber-100' };
  return { label: 'Developing', color: 'text-rose-700', bg: 'bg-rose-100' };
};

// === UI COMPONENTS ===

// Touch-friendly card component - earthy, not shiny
function InsightCard({ 
  children, 
  className = '', 
  onClick,
  accent = 'aristotle'
}: { 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
  accent?: 'aristotle' | 'plato' | 'socrates' | 'zeno' | 'neutral';
}) {
  const accentClasses = {
    aristotle: 'border-aristotle-200 hover:border-aristotle-300',
    plato: 'border-plato-200 hover:border-plato-300',
    socrates: 'border-socrates-200 hover:border-socrates-300',
    zeno: 'border-zeno-200 hover:border-zeno-300',
    neutral: 'border-warmGray-200 hover:border-warmGray-300'
  };

  return (
    <div 
      onClick={onClick}
      className={`
        bg-parchment-50 rounded-2xl border ${accentClasses[accent]}
        p-5 md:p-6
        transition-all duration-300 ease-out
        ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Metric tile - compact, touch-friendly
function MetricTile({ 
  label, 
  value, 
  unit,
  icon, 
  trend,
  accent = 'aristotle'
}: { 
  label: string; 
  value: string | number; 
  unit?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  accent?: 'aristotle' | 'plato' | 'socrates' | 'zeno';
}) {
  const accentBg = {
    aristotle: 'bg-aristotle-100/50 text-aristotle-700',
    plato: 'bg-plato-100/50 text-plato-700',
    socrates: 'bg-socrates-100/50 text-socrates-700',
    zeno: 'bg-zeno-100/50 text-zeno-700'
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50 border border-warmGray-100">
      <div className={`p-2.5 rounded-lg ${accentBg[accent]}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-warmGray-500 font-medium mb-0.5">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-semibold text-warmGray-800">{value}</span>
          {unit && <span className="text-xs text-warmGray-400">{unit}</span>}
        </div>
      </div>
      {trend && (
        <div className={`text-xs ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-warmGray-400'}`}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'}
        </div>
      )}
    </div>
  );
}

// Session overview header
function SessionHeader({ 
  conversation, 
  analysis 
}: { 
  conversation: Conversation | null; 
  analysis: Analysis | null;
}) {
  const score = analysis?.overall_score || 0;
  const scoreLevel = getScoreLevel(score, 100);

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-warmGray-500">
        <span>Session</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-warmGray-700 font-medium">{conversation?.id.slice(0, 8)}...</span>
      </div>

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-warmGray-900">
            Interview Session
          </h1>
          <p className="text-warmGray-500 mt-1">
            {conversation?.started_at ? formatDate(conversation.started_at) : '—'}
          </p>
        </div>

        {analysis && (
          <div className="flex items-center gap-4">
            <div className={`px-5 py-3 rounded-xl ${scoreLevel.bg} border border-warmGray-200`}>
              <p className={`text-xs font-medium uppercase tracking-wide ${scoreLevel.color}`}>
                {scoreLevel.label}
              </p>
              <p className="text-3xl font-bold text-warmGray-800">
                {score}<span className="text-lg text-warmGray-400">/100</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricTile 
          label="Duration"
          value={formatDuration(conversation?.duration_seconds)}
          icon={<Clock className="w-4 h-4" />}
          accent="aristotle"
        />
        <MetricTile 
          label="Speaking Pace"
          value={analysis?.speaking_pace_wpm || '—'}
          unit="WPM"
          icon={<Mic className="w-4 h-4" />}
          accent="socrates"
        />
        <MetricTile 
          label="Filler Words"
          value={analysis?.filler_word_count || 0}
          icon={<MessageSquare className="w-4 h-4" />}
          accent="plato"
        />
        <MetricTile 
          label="Confidence"
          value={analysis?.confidence_score || '—'}
          unit="/10"
          icon={<TrendingUp className="w-4 h-4" />}
          accent="zeno"
        />
      </div>
    </div>
  );
}

// Dimension Score Card (Communication, EQ, etc.)
function DimensionCard({ 
  title, 
  score, 
  feedback,
  icon,
  accent = 'aristotle'
}: { 
  title: string; 
  score?: number; 
  feedback?: string;
  icon: React.ReactNode;
  accent?: 'aristotle' | 'plato' | 'socrates' | 'zeno';
}) {
  const hasData = score !== undefined;

  const accentColors = {
    aristotle: { bg: 'bg-aristotle-50', border: 'border-aristotle-200', text: 'text-aristotle-700' },
    plato: { bg: 'bg-plato-50', border: 'border-plato-200', text: 'text-plato-700' },
    socrates: { bg: 'bg-socrates-50', border: 'border-socrates-200', text: 'text-socrates-700' },
    zeno: { bg: 'bg-zeno-50', border: 'border-zeno-200', text: 'text-zeno-700' }
  };

  const colors = accentColors[accent];

  return (
    <InsightCard accent={accent} className="h-full">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-lg ${colors.bg} ${colors.text}`}>
          {icon}
        </div>
        {hasData ? (
          <div className={`text-right`}>
            <p className={`text-2xl font-bold ${colors.text}`}>{score!.toFixed(1)}</p>
            <p className="text-xs text-warmGray-400">/ 10</p>
          </div>
        ) : (
          <div className="text-right">
            <p className="text-sm text-warmGray-400">No data</p>
          </div>
        )}
      </div>

      <h3 className="font-semibold text-warmGray-800 mb-2">{title}</h3>

      {feedback ? (
        <p className="text-sm text-warmGray-600 leading-relaxed line-clamp-3">
          {feedback}
        </p>
      ) : (
        <p className="text-sm text-warmGray-400 italic">Analysis pending...</p>
      )}

      {/* Score Bar */}
      {hasData && (
        <div className="mt-4">
          <div className="h-2 bg-warmGray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${colors.bg.replace('bg-', 'bg-').replace('50', '400')}`}
              style={{ width: `${(score! / 10) * 100}%` }}
            />
          </div>
        </div>
      )}
    </InsightCard>
  );
}

// Philosophical Analysis Card
function PhilosopherInsight({ 
  name, 
  score, 
  summary,
  accent,
  emoji,
  insights
}: { 
  name: string; 
  score?: number; 
  summary?: string;
  accent: 'aristotle' | 'plato' | 'socrates' | 'zeno';
  emoji: string;
  insights?: string[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const accentColors = {
    aristotle: { bg: 'bg-aristotle-50', border: 'border-aristotle-200', text: 'text-aristotle-700', soft: 'text-aristotle-600' },
    plato: { bg: 'bg-plato-50', border: 'border-plato-200', text: 'text-plato-700', soft: 'text-plato-600' },
    socrates: { bg: 'bg-socrates-50', border: 'border-socrates-200', text: 'text-socrates-700', soft: 'text-socrates-600' },
    zeno: { bg: 'bg-zeno-50', border: 'border-zeno-200', text: 'text-zeno-700', soft: 'text-zeno-600' }
  };

  const colors = accentColors[accent];

  return (
    <InsightCard accent={accent} className="overflow-hidden">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center text-xl`}>
            {emoji}
          </div>
          <div>
            <h3 className="font-semibold text-warmGray-800">{name}</h3>
            {score !== undefined && (
              <p className={`text-sm ${colors.soft}`}>Score: {score.toFixed(1)}/5</p>
            )}
          </div>
        </div>
        <ChevronRight 
          className={`w-5 h-5 text-warmGray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
        />
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-warmGray-100">
          {summary && (
            <p className="text-sm text-warmGray-600 leading-relaxed mb-4">
              {summary}
            </p>
          )}
          
          {insights && insights.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-warmGray-500 uppercase tracking-wide">Key Insights</p>
              {insights.slice(0, 3).map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-warmGray-700">
                  <span className={colors.text}>•</span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </InsightCard>
  );
}

// Transcript Segment Card
function TranscriptSegment({ 
  segment, 
  isUser 
}: { 
  segment: { speaker: string; text: string; start_time: number; dominant_emotion?: string };
  isUser: boolean;
}) {
  const emotionColors: Record<string, string> = {
    calm: 'bg-emerald-100 text-emerald-700',
    confident: 'bg-blue-100 text-blue-700',
    confused: 'bg-amber-100 text-amber-700',
    anxious: 'bg-rose-100 text-rose-700',
    engaged: 'bg-purple-100 text-purple-700',
    enthusiastic: 'bg-pink-100 text-pink-700'
  };

  return (
    <div className={`flex gap-3 ${isUser ? '' : 'opacity-80'}`}>
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-medium ${
        isUser ? 'bg-aristotle-200 text-aristotle-800' : 'bg-socrates-200 text-socrates-800'
      }`}>
        {isUser ? 'You' : 'AI'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-warmGray-400">{formatTimestamp(segment.start_time)}</span>
          {segment.dominant_emotion && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${emotionColors[segment.dominant_emotion] || 'bg-warmGray-100'}`}>
              {segment.dominant_emotion}
            </span>
          )}
        </div>
        <p className="text-sm text-warmGray-700 leading-relaxed">{segment.text}</p>
      </div>
    </div>
  );
}

// Video Player Section
function VideoSection({ 
  conversation 
}: { 
  conversation: Conversation | null;
}) {
  if (!conversation?.video_url) {
    return (
      <InsightCard className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-warmGray-100 flex items-center justify-center mb-4">
          <Video className="w-8 h-8 text-warmGray-400" />
        </div>
        <h3 className="font-semibold text-warmGray-700 mb-1">No Video Available</h3>
        <p className="text-sm text-warmGray-500">This session was audio-only</p>
      </InsightCard>
    );
  }

  return (
    <InsightCard className="p-0 overflow-hidden">
      <div className="p-4 border-b border-warmGray-100">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-warmGray-800 flex items-center gap-2">
            <Video className="w-4 h-4 text-aristotle-600" />
            Session Replay
          </h3>
          <span className="text-xs text-warmGray-500">With emotion analysis</span>
        </div>
      </div>
      <div className="aspect-video bg-warmGray-900">
        <VideoEmotionPlayer
          conversationId={conversation.id}
          videoUrl={conversation.video_url}
          audioUrl={conversation.audio_url}
          showLiveEmotions
        />
      </div>
    </InsightCard>
  );
}

// === MAIN COMPONENT ===
export default function CleanDesign({ userId }: { userId: string | null }) {
  const { conversationId } = useParams<{ conversationId: string }>();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [aristotle, setAristotle] = useState<AristotleAnalysis | null>(null);
  const [plato, setPlato] = useState<PlatoAnalysis | null>(null);
  const [socrates, setSocrates] = useState<SocratesAnalysis | null>(null);
  const [_zeno, setZeno] = useState<ZenoAnalysis | null>(null);
  const [_davinci, setDavinci] = useState<DavinciSynthesis | null>(null);
  const [transcript, setTranscript] = useState<any>(null);
  const [_highlights, setHighlights] = useState<TranscriptHighlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'transcript' | 'insights'>('overview');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!conversationId) return;
      setIsLoading(true);
      try {
        const [convResult, philosophers, transcriptData, highlightsResult] = await Promise.all([
          api.getConversation(conversationId),
          api.getAllPhilosophicalAnalyses(conversationId),
          api.getAnnotatedTranscript(conversationId),
          api.getHighlights(conversationId).catch(() => ({ highlights: [] }))
        ]);

        if (!isMounted) return;

        console.log('📊 Data loaded:', {
          conversation: convResult.conversation,
          analysis: convResult.analysis,
          philosophers: {
            aristotle: philosophers.aristotle,
            plato: philosophers.plato,
            socrates: philosophers.socrates,
            zeno: philosophers.zeno,
            davinci: philosophers.davinci
          },
          transcript: transcriptData,
          highlights: highlightsResult.highlights
        });

        setConversation(convResult.conversation);
        setAnalysis(convResult.analysis);
        setAristotle(philosophers.aristotle);
        setPlato(philosophers.plato);
        setSocrates(philosophers.socrates);
        setZeno(philosophers.zeno);
        setDavinci(philosophers.davinci);
        setTranscript(transcriptData);
        setHighlights(highlightsResult.highlights || []);
      } catch (err) {
        if (!isMounted) return;
        console.error('❌ Load error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load session data');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => { isMounted = false; };
  }, [conversationId]);

  // Extract insights from philosophical analyses
  const philosopherInsights = useMemo(() => {
    return {
      aristotle: {
        score: aristotle?.communication_analysis?.score,
        strengths: aristotle?.communication_analysis?.feedback?.strengths || [],
        improvements: aristotle?.communication_analysis?.feedback?.areas_for_improvement || []
      },
      plato: {
        score: plato?.emotional_analysis?.score,
        strengths: plato?.emotional_analysis?.feedback?.strengths || [],
        growthAreas: plato?.emotional_analysis?.feedback?.growth_areas || []
      },
      socrates: {
        score: socrates?.strategic_analysis?.score,
        strengths: socrates?.strategic_analysis?.feedback?.intellectual_strengths || [],
        blindspots: socrates?.strategic_analysis?.feedback?.thinking_blindspots || []
      }
    };
  }, [aristotle, plato, socrates]);

  if (!userId || !ALLOWED_USER_IDS.has(userId)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!conversationId) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-parchment-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-aristotle-200 border-t-aristotle-600 rounded-full animate-spin" />
          <p className="text-warmGray-600 text-sm">Loading session insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-parchment-100 flex items-center justify-center p-6">
        <InsightCard className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-rose-600" />
          </div>
          <h3 className="font-semibold text-warmGray-800 mb-2">Failed to Load</h3>
          <p className="text-sm text-warmGray-600">{error}</p>
        </InsightCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment-100">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-parchment-100/95 backdrop-blur border-b border-warmGray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.history.back()}
                className="p-2 rounded-lg hover:bg-warmGray-200/50 transition-colors"
              >
                <ChevronRight className="w-5 h-5 rotate-180 text-warmGray-600" />
              </button>
              <span className="font-semibold text-warmGray-800">Session Insights</span>
            </div>
            
            {/* Tab Navigation */}
            <nav className="flex items-center gap-1 bg-warmGray-100/50 p-1 rounded-xl">
              {(['overview', 'transcript', 'insights'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${activeTab === tab 
                      ? 'bg-white text-warmGray-800 shadow-sm' 
                      : 'text-warmGray-500 hover:text-warmGray-700'
                    }
                  `}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 pb-24">
        {/* Debug Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Debug: Data Status</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>Conversation: {conversation ? '✅' : '❌'}</p>
            <p>Analysis (emotion_analysis): {analysis ? '✅' : '❌'}</p>
            <p>Aristotle: {aristotle ? '✅' : '❌'}</p>
            <p>Plato: {plato ? '✅' : '❌'}</p>
            <p>Socrates: {socrates ? '✅' : '❌'}</p>
            <p>Transcript: {transcript ? '✅' : '❌'}</p>
          </div>
        </div>

        {/* Session Header */}
        <SessionHeader conversation={conversation} analysis={analysis} />

        {/* Tab Content */}
        <div className="mt-8 space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Dimension Scores */}
              <section>
                <h2 className="text-lg font-semibold text-warmGray-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-aristotle-600" />
                  Performance Dimensions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <DimensionCard 
                    title="Communication"
                    score={analysis?.communication_score}
                    feedback={analysis?.communication_feedback}
                    icon={<MessageSquare className="w-5 h-5" />}
                    accent="aristotle"
                  />
                  <DimensionCard 
                    title="Emotional Intelligence"
                    score={analysis?.eq_score}
                    feedback={analysis?.eq_feedback}
                    icon={<Heart className="w-5 h-5" />}
                    accent="plato"
                  />
                  <DimensionCard 
                    title="Executive Presence"
                    score={analysis?.presence_score}
                    feedback={analysis?.presence_feedback}
                    icon={<Target className="w-5 h-5" />}
                    accent="zeno"
                  />
                  <DimensionCard 
                    title="Technical"
                    score={analysis?.technical_score}
                    feedback={analysis?.technical_feedback}
                    icon={<Brain className="w-5 h-5" />}
                    accent="socrates"
                  />
                </div>
              </section>

              {/* Video Player */}
              <section>
                <VideoSection conversation={conversation} />
              </section>

              {/* Philosophical Insights */}
              <section>
                <h2 className="text-lg font-semibold text-warmGray-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-plato-600" />
                  AI Analysis
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <PhilosopherInsight
                    name="Aristotle"
                    emoji="🎭"
                    accent="aristotle"
                    score={philosopherInsights.aristotle.score}
                    insights={philosopherInsights.aristotle.strengths}
                  />
                  <PhilosopherInsight
                    name="Plato"
                    emoji="🧠"
                    accent="plato"
                    score={philosopherInsights.plato.score}
                    insights={philosopherInsights.plato.strengths}
                  />
                  <PhilosopherInsight
                    name="Socrates"
                    emoji="🏛️"
                    accent="socrates"
                    score={philosopherInsights.socrates.score}
                    insights={philosopherInsights.socrates.strengths}
                  />
                </div>
              </section>

              {/* Top Improvements */}
              {analysis?.top_improvements && analysis.top_improvements.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-warmGray-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-zeno-600" />
                    Top Improvements
                  </h2>
                  <InsightCard accent="zeno">
                    <div className="space-y-4">
                      {analysis.top_improvements.slice(0, 3).map((improvement, idx) => (
                        <div key={idx} className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-zeno-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-zeno-700">{idx + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-warmGray-800">{improvement.area}</h4>
                            <p className="text-sm text-warmGray-600 mt-1">{improvement.suggestion}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </InsightCard>
                </section>
              )}
            </>
          )}

          {activeTab === 'transcript' && (
            <section>
              <InsightCard>
                <h2 className="text-lg font-semibold text-warmGray-800 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-socrates-600" />
                  Conversation Transcript
                </h2>
                
                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                  {transcript?.segments?.map((segment: any, idx: number) => (
                    <TranscriptSegment 
                      key={idx}
                      segment={segment}
                      isUser={segment.speaker === 'user'}
                    />
                  )) || (
                    <p className="text-center text-warmGray-500 py-8">No transcript available</p>
                  )}
                </div>
              </InsightCard>
            </section>
          )}

          {activeTab === 'insights' && (
            <section className="space-y-6">
              {/* Detailed Philosophical Analysis */}
              <InsightCard accent="aristotle">
                <h3 className="font-semibold text-warmGray-800 mb-4">Aristotle: Communication Analysis</h3>
                {philosopherInsights.aristotle.improvements.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-warmGray-500 uppercase mb-2">Areas for Improvement</p>
                      <ul className="space-y-2">
                        {philosopherInsights.aristotle.improvements.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-warmGray-700">
                            <span className="text-aristotle-500">→</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-warmGray-500">Analysis pending...</p>
                )}
              </InsightCard>

              <InsightCard accent="plato">
                <h3 className="font-semibold text-warmGray-800 mb-4">Plato: Emotional Intelligence</h3>
                {philosopherInsights.plato.growthAreas.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-warmGray-500 uppercase mb-2">Growth Areas</p>
                      <ul className="space-y-2">
                        {philosopherInsights.plato.growthAreas.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-warmGray-700">
                            <span className="text-plato-500">→</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-warmGray-500">Analysis pending...</p>
                )}
              </InsightCard>

              <InsightCard accent="socrates">
                <h3 className="font-semibold text-warmGray-800 mb-4">Socrates: Strategic Thinking</h3>
                {philosopherInsights.socrates.blindspots.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-warmGray-500 uppercase mb-2">Thinking Blindspots</p>
                      <ul className="space-y-2">
                        {philosopherInsights.socrates.blindspots.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-warmGray-700">
                            <span className="text-socrates-500">⚠</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-warmGray-500">Analysis pending...</p>
                )}
              </InsightCard>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
