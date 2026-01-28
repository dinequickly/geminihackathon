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
  AristotleAnalysis,
  PlatoAnalysis,
  SocratesAnalysis,
  ZenoAnalysis
} from '../components/analysis';
import { AristotleTranscriptViewer } from '../components/analysis/AristotleTranscriptViewer';

type AnalysisView = 'default' | 'aristotle' | 'plato' | 'socrates' | 'zeno';

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
    } catch (err) {
      console.error('Failed to load philosophical analyses:', err);
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
          ) : conversationId && conversation?.video_url ? (
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
            <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-white">
              <AristotleAnalysis analysis={aristotleAnalysis} />
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
