import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  Brain,
  Heart,
  Users,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Mic,
  AlertCircle,
  Rows,
  Columns
} from 'lucide-react';
import { api, Analysis, Conversation } from '../lib/api';
import { VideoEmotionPlayer, TranscriptViewer, VideoEmotionPlayerRef } from '../components';
import { LiquidButton } from '../components/LiquidButton';
import { LiquidGlass } from '../components/LiquidGlass';
import { LightLeakBackground } from '../components/LightLeakBackground';
import { LoadingSpinner } from '../components/PlayfulUI';

export default function Results() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'transcript', 'video', 'categories']));
  const [currentVideoTimeMs, setCurrentVideoTimeMs] = useState(0);
  const [displayMode, setDisplayMode] = useState<'review' | 'watch'>('review');
  const videoPlayerRef = useRef<VideoEmotionPlayerRef>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) {
      loadResults();
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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const scrollToTranscript = () => {
    if (!expandedSections.has('transcript')) {
      setExpandedSections(prev => new Set([...prev, 'transcript']));
    }
    setTimeout(() => {
      transcriptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
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
          <h2 className="font-serif text-2xl text-black mb-2">Analysis Failed</h2>
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
          <h2 className="font-serif text-3xl text-black mb-4">Processing Signal</h2>
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
    { key: 'communication', label: 'Communication', icon: Mic, score: analysis.communication_score },
    { key: 'presence', label: 'Presence', icon: Sparkles, score: analysis.presence_score },
    { key: 'technical', label: 'Technical', icon: Brain, score: analysis.technical_score },
    { key: 'eq', label: 'Emotional IQ', icon: Heart, score: analysis.eq_score },
    { key: 'culture', label: 'Culture', icon: Users, score: analysis.culture_fit_score },
    { key: 'authenticity', label: 'Authenticity', icon: Award, score: analysis.authenticity_score },
  ].filter(c => c.score !== undefined && c.score !== null);

  return (
    <div className="min-h-screen relative overflow-hidden font-sans selection:bg-pink-100">
      <LightLeakBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between border-b border-gray-200/50 bg-white/30 backdrop-blur-md">
        <div className="flex flex-col">
          <span className="font-serif text-xl font-bold tracking-tight text-black">TAVUS</span>
          <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Analysis Report</span>
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

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-24 relative z-10 space-y-8">
        
        {/* Overall Score Card */}
        <LiquidGlass className="p-10">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="font-serif text-4xl text-black mb-2">Performance Summary</h2>
              <span className={`inline-block px-3 py-1 rounded border text-xs font-mono uppercase tracking-widest ${getScoreBg(analysis.overall_score).replace('bg-', 'border-').replace('text-', 'text-')}`}>
                {getLevelLabel(analysis.overall_level)}
              </span>
            </div>
            <div className="text-right">
              <div className={`font-serif text-7xl ${getScoreColor(analysis.overall_score)}`}>
                {analysis.overall_score}
              </div>
              <p className="font-mono text-xs text-gray-400 uppercase tracking-widest mt-1">Score Index</p>
            </div>
          </div>

          {(analysis.feedback?.summary || analysis.overall_summary) && (
            <p className="text-xl text-gray-700 font-light leading-relaxed max-w-4xl border-l-2 border-gray-200 pl-6 my-8">
              {analysis.feedback?.summary || analysis.overall_summary}
            </p>
          )}

          {/* Category Grid + Quick Stats */}
          {(categoryScores.length > 0 || analysis.filler_word_count !== undefined || analysis.speaking_pace_wpm) && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-8 border-t border-gray-100 justify-items-center place-items-center w-full">
              {categoryScores.map(({ key, label, icon: Icon, score }) => (
                <div key={key} className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-white/40 transition-colors w-full max-w-[120px]">
                  <div className={`w-10 h-10 rounded-full mb-3 flex items-center justify-center border border-gray-100 bg-white`}>
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className={`font-serif text-2xl mb-1 ${getScoreColor(score!)}`}>{score}</span>
                  <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">{label}</span>
                </div>
              ))}

              {analysis.filler_word_count !== undefined && (
                <div className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-white/40 transition-colors w-full max-w-[120px]">
                  <div className="w-10 h-10 rounded-full mb-3 flex items-center justify-center border border-gray-100 bg-white">
                    <span className="text-gray-600 font-bold text-sm">φ</span>
                  </div>
                  <span className="font-serif text-2xl mb-1 text-black">{analysis.filler_word_count}</span>
                  <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Filler Words</span>
                </div>
              )}

              {analysis.speaking_pace_wpm && (
                <div className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-white/40 transition-colors w-full max-w-[120px]">
                  <div className="w-10 h-10 rounded-full mb-3 flex items-center justify-center border border-gray-100 bg-white">
                    <span className="text-gray-600 font-bold text-sm">⚡</span>
                  </div>
                  <span className="font-serif text-2xl mb-1 text-black">{analysis.speaking_pace_wpm}</span>
                  <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Words / Min</span>
                </div>
              )}
            </div>
          )}
        </LiquidGlass>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Improvements */}
          {analysis.top_improvements && analysis.top_improvements.length > 0 && (
            <LiquidGlass className="p-0 overflow-hidden">
              <button
                onClick={() => toggleSection('improvements')}
                className="w-full p-6 flex items-center justify-between bg-white/40 border-b border-gray-100"
              >
                <h2 className="font-serif text-2xl text-black">Key Improvements</h2>
                {expandedSections.has('improvements') ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
              </button>

              {expandedSections.has('improvements') && (
                <div className="p-6 space-y-4">
                  {analysis.top_improvements.map((imp: any, i: number) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-amber-50/50 border border-amber-100/50">
                      <span className="font-mono text-amber-900/40 font-bold text-xl">0{i + 1}</span>
                      <div>
                        <p className="font-medium text-gray-900 mb-1">{imp.area}</p>
                        <p className="text-sm text-gray-600 font-light leading-relaxed">{imp.suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </LiquidGlass>
          )}

          {/* Instant Rewrites */}
          {analysis.instant_rewrites && analysis.instant_rewrites.length > 0 && (
            <LiquidGlass className="p-0 overflow-hidden">
              <button
                onClick={() => toggleSection('rewrites')}
                className="w-full p-6 flex items-center justify-between bg-white/40 border-b border-gray-100"
              >
                <h2 className="font-serif text-2xl text-black">AI Rewrites</h2>
                {expandedSections.has('rewrites') ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
              </button>

              {expandedSections.has('rewrites') && (
                <div className="p-6 space-y-6">
                  {analysis.instant_rewrites.map((rewrite: any, i: number) => (
                    <div key={i} className="rounded-xl overflow-hidden border border-gray-100">
                      <div className="p-4 bg-red-50/30 border-b border-gray-100">
                        <p className="font-mono text-[10px] text-red-400 uppercase tracking-widest mb-2">Original</p>
                        <p className="text-sm text-gray-600 font-light">{rewrite.original}</p>
                      </div>
                      <div className="p-4 bg-green-50/30">
                        <p className="font-mono text-[10px] text-green-600 uppercase tracking-widest mb-2">Optimized</p>
                        <p className="text-sm text-gray-800">{rewrite.improved}</p>
                        {rewrite.explanation && (
                          <p className="text-xs text-gray-400 mt-3 italic pt-3 border-t border-green-100/50">{rewrite.explanation}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </LiquidGlass>
          )}
        </div>

        {/* Video & Transcript - Playback & Review */}
        <div className="space-y-4">
          {/* Mode Toggle Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-3xl text-black">Playback & Review</h2>
            <div className="flex items-center gap-8">
              <button
                onClick={() => setDisplayMode('review')}
                className={`font-serif text-lg transition-all ${
                  displayMode === 'review'
                    ? 'text-black'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Review mode: transcript only"
              >
                Review
              </button>
              <button
                onClick={() => setDisplayMode('watch')}
                className={`font-serif text-lg transition-all ${
                  displayMode === 'watch'
                    ? 'text-black'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Watch mode: video and transcript side-by-side"
              >
                Watch
              </button>
            </div>
          </div>

          {/* Review Mode: Transcript Only */}
          {displayMode === 'review' && conversationId && (
            <div ref={transcriptRef} className="rounded-3xl overflow-hidden shadow-soft border border-gray-100 bg-white h-[700px]">
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

          {/* Watch Mode: Video (left) + Transcript (right) */}
          {displayMode === 'watch' && (
            <div className="flex gap-[50px] h-[600px] -mx-6">
              {/* Video - Left side */}
              {conversationId && conversation?.video_url && (
                <div className="flex-1 rounded-3xl overflow-hidden shadow-soft border border-gray-100 bg-white ml-6">
                  <VideoEmotionPlayer
                    ref={videoPlayerRef}
                    conversationId={conversationId}
                    videoUrl={conversation.video_url}
                    audioUrl={conversation.audio_url}
                    humeJobId={analysis?.url}
                    onTimeUpdate={setCurrentVideoTimeMs}
                    onReviewTranscript={scrollToTranscript}
                  />
                </div>
              )}

              {/* Transcript - Right side */}
              {conversationId && (
                <div ref={transcriptRef} className="flex-1 rounded-3xl overflow-hidden shadow-soft border border-gray-100 bg-white mr-6">
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
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-center gap-6 pt-12">
          <LiquidButton
            onClick={() => navigate('/interview')}
            variant="secondary"
            size="lg"
            icon={<RefreshCw size={18} />}
          >
            Practice Again
          </LiquidButton>
          <LiquidButton
            onClick={() => navigate('/dashboard')}
            variant="secondary"
            size="lg"
          >
            Return to Dashboard
          </LiquidButton>
        </div>
      </main>
    </div>
  );
}
