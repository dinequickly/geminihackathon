import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  Brain,
  Heart,
  Users,
  Sparkles,
  TrendingUp,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Mic,
  AlertCircle
} from 'lucide-react';
import { api, Analysis, Conversation } from '../lib/api';
import { VideoEmotionPlayer, TranscriptViewer, VideoEmotionPlayerRef } from '../components';
import { PlayfulButton, PlayfulCard, LoadingSpinner } from '../components/PlayfulUI';

export default function Results() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'transcript', 'video', 'categories']));
  const [currentVideoTimeMs, setCurrentVideoTimeMs] = useState(0);
  const videoPlayerRef = useRef<VideoEmotionPlayerRef>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) {
      loadResults();
    }
  }, [conversationId]);

  // Poll for results if still processing
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
    // Expand transcript section if collapsed
    if (!expandedSections.has('transcript')) {
      setExpandedSections(prev => new Set([...prev, 'transcript']));
    }

    // Scroll to transcript after a brief delay to allow expansion
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
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
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
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4">
        <PlayfulCard variant="white" className="max-w-md w-full text-center animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to load results</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <PlayfulButton
            onClick={() => navigate('/dashboard')}
            variant="primary"
            size="lg"
            icon={ArrowLeft}
          >
            Back to Dashboard
          </PlayfulButton>
        </PlayfulCard>
      </div>
    );
  }

  // Show processing state
  if (!analysis) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4">
        <PlayfulCard variant="white" className="max-w-md w-full text-center animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-10 h-10 text-primary-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing your interview</h2>
          <p className="text-gray-600 mb-6">
            Our AI is reviewing your performance. This usually takes 1-2 minutes.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
            <div className="bg-primary-500 h-3 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
          <PlayfulButton
            onClick={() => navigate('/dashboard')}
            variant="secondary"
            size="md"
            icon={ArrowLeft}
          >
            Back to Dashboard
          </PlayfulButton>
        </PlayfulCard>
      </div>
    );
  }

  const categoryScores = [
    { key: 'communication', label: 'Communication', icon: Mic, score: analysis.communication_score, feedback: analysis.communication_feedback },
    { key: 'presence', label: 'Executive Presence', icon: Sparkles, score: analysis.presence_score, feedback: analysis.presence_feedback },
    { key: 'technical', label: 'Technical Skills', icon: Brain, score: analysis.technical_score, feedback: analysis.technical_feedback },
    { key: 'eq', label: 'Emotional Intelligence', icon: Heart, score: analysis.eq_score, feedback: analysis.eq_feedback },
    { key: 'culture', label: 'Culture Fit', icon: Users, score: analysis.culture_fit_score, feedback: analysis.culture_fit_feedback },
    { key: 'authenticity', label: 'Authenticity', icon: Award, score: analysis.authenticity_score, feedback: analysis.authenticity_feedback },
  ].filter(c => c.score !== undefined && c.score !== null);

  return (
    <div className="min-h-screen bg-cream-100 relative">
      {/* Playful background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] right-[10%] w-96 h-96 bg-sky-200/30 rounded-blob animate-float" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-[10%] left-[5%] w-[500px] h-[500px] bg-sunshine-200/30 rounded-blob-2 animate-float" style={{ animationDelay: '2s', animationDuration: '12s' }} />
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b-2 border-primary-100 sticky top-0 z-20 shadow-soft">
        <div className="px-6 py-5 max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-3 hover:bg-primary-50 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-primary-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-primary-500" />
              Interview Results
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">
              {conversation?.started_at && new Date(conversation.started_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      </header>

      <main className="px-6 py-8 max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Overall Score Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Overall Performance</h2>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getScoreBg(analysis.overall_score)} ${getScoreColor(analysis.overall_score)}`}>
                {getLevelLabel(analysis.overall_level)}
              </span>
            </div>
            <div className="text-right">
              <div className={`text-5xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                {analysis.overall_score}
              </div>
              <p className="text-sm text-gray-500">out of 100</p>
            </div>
          </div>

          {(analysis.feedback?.summary || analysis.overall_summary) && (
            <p className="mt-4 text-gray-600 leading-relaxed">
              {analysis.feedback?.summary || analysis.overall_summary}
            </p>
          )}

          {/* Category scores at top */}
          {categoryScores.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-4">
              {categoryScores.map(({ key, label, icon: Icon, score }) => (
                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${getScoreBg(score!)} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${getScoreColor(score!)}`} />
                    </div>
                    <span className="font-medium text-gray-900">{label}</span>
                  </div>
                  <span className={`text-2xl font-bold ${getScoreColor(score!)}`}>{score}</span>
                </div>
              ))}
            </div>
          )}

          {/* Quick stats */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <MessageSquare className="w-5 h-5 text-gray-400 mx-auto mb-1" />
              <p className="text-lg font-semibold text-gray-900">{analysis.filler_word_count || 0}</p>
              <p className="text-xs text-gray-500">Filler Words</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-gray-400 mx-auto mb-1" />
              <p className="text-lg font-semibold text-gray-900">{analysis.speaking_pace_wpm || '--'}</p>
              <p className="text-xs text-gray-500">Words/Min</p>
            </div>
          </div>
        </div>

        {/* Top Improvements */}
        {analysis.top_improvements && analysis.top_improvements.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleSection('improvements')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <h2 className="text-lg font-semibold text-gray-900">Top Improvements</h2>
              {expandedSections.has('improvements') ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections.has('improvements') && (
              <div className="px-4 pb-4 space-y-3">
                {analysis.top_improvements.map((imp: any, i: number) => (
                  <div key={i} className="flex gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{imp.area}</p>
                      <p className="text-sm text-gray-600 mt-1">{imp.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Instant Rewrites */}
        {analysis.instant_rewrites && analysis.instant_rewrites.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleSection('rewrites')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <h2 className="text-lg font-semibold text-gray-900">Answer Rewrites</h2>
              {expandedSections.has('rewrites') ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections.has('rewrites') && (
              <div className="px-4 pb-4 space-y-4">
                {analysis.instant_rewrites.map((rewrite: any, i: number) => (
                  <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="p-4 bg-red-50 border-b border-gray-200">
                      <p className="text-xs font-medium text-red-600 uppercase mb-1">Your Answer</p>
                      <p className="text-gray-700">{rewrite.original}</p>
                    </div>
                    <div className="p-4 bg-green-50">
                      <p className="text-xs font-medium text-green-600 uppercase mb-1">Improved Version</p>
                      <p className="text-gray-700">{rewrite.improved}</p>
                      {rewrite.explanation && (
                        <p className="text-sm text-gray-500 mt-2 italic">{rewrite.explanation}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Video with Emotion Analysis */}
        {conversationId && conversation?.video_url && (
          <div className="animate-fade-in">
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

        {/* Transcript Viewer */}
        {conversationId && (
          <div ref={transcriptRef} className="animate-fade-in">
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

        {/* Action Buttons */}
        <div className="flex gap-4">
          <PlayfulButton
            onClick={() => navigate('/interview')}
            variant="primary"
            size="lg"
            className="flex-1"
            icon={RefreshCw}
          >
            Practice Again
          </PlayfulButton>
          <PlayfulButton
            onClick={() => navigate('/dashboard')}
            variant="secondary"
            size="lg"
            className="flex-1"
            icon={ArrowLeft}
          >
            Back to Dashboard
          </PlayfulButton>
        </div>
      </main>
    </div>
  );
}
