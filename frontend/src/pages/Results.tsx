import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
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
  Activity,
  Mic
} from 'lucide-react';
import { api, Analysis, Conversation } from '../lib/api';
import { VideoEmotionPlayer, TranscriptViewer, VideoEmotionPlayerRef } from '../components';

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load results</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="py-3 px-6 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show processing state
  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analyzing your interview</h2>
          <p className="text-gray-600 mb-6">
            Our AI is reviewing your performance. This usually takes 1-2 minutes.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div className="bg-primary-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Interview Results</h1>
            <p className="text-sm text-gray-500">
              {conversation?.started_at && new Date(conversation.started_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      </header>

      <main className="px-6 py-8 space-y-6">
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

        {/* Video with Emotion Analysis & Transcript */}
        {conversationId && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {conversation?.video_url && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-[80vh] flex flex-col">
                <button
                  onClick={() => toggleSection('video')}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-900">Recording with Emotion Analysis</h2>
                  </div>
                  {expandedSections.has('video') ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {expandedSections.has('video') && (
                  <div className="p-4 flex-grow overflow-hidden">
                    <VideoEmotionPlayer
                      ref={videoPlayerRef}
                      conversationId={conversationId}
                      videoUrl={conversation.video_url}
                      audioUrl={conversation.audio_url}
                      humeJobId={analysis?.url}
                      onTimeUpdate={setCurrentVideoTimeMs}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Transcript Viewer */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-[80vh] flex flex-col">
              <button
                onClick={() => toggleSection('transcript')}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">Transcript</h2>
                </div>
                {expandedSections.has('transcript') ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedSections.has('transcript') && (
                <div className="p-4 flex-grow overflow-y-auto">
                  <TranscriptViewer
                    conversationId={conversationId}
                    currentTimeMs={currentVideoTimeMs}
                    humeJobId={analysis?.url}
                    onSegmentClick={(startTime) => {
                      setCurrentVideoTimeMs(startTime * 1000);
                      videoPlayerRef.current?.seekTo(startTime);
                      videoPlayerRef.current?.pause(); // Pause on highlight
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/interview')}
            className="flex-1 py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition"
          >
            Practice Again
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
