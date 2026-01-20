import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Video,
  Clock,
  TrendingUp,
  Award,
  LogOut,
  ChevronRight,
  Loader2,
  Package,
  ShoppingBag
} from 'lucide-react';
import { api, Conversation } from '../lib/api';
import { PackSelectionModal, ShopModal, PromoPopup } from '../components';

interface DashboardProps {
  userId: string;
  onLogout: () => void;
}

export default function Dashboard({ userId, onLogout }: DashboardProps) {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [showPackModal, setShowPackModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      const [user, convs] = await Promise.all([
        api.getUser(userId),
        api.getUserConversations(userId)
      ]);
      setUserName(user.name);
      setConversations(convs);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPack = async (packId: string) => {
    // Navigate to pack details page
    setShowPackModal(false);
    navigate(`/pack/${packId}`);
  };

  const handleCreateCustomPack = () => {
    // TODO: Navigate to custom pack creation flow
    console.log('Create custom pack');
    // For now, just show an alert
    alert('Custom pack creation chatbot coming soon!');
  };

  const getScoreColor = (score: number | undefined) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Progress' },
      completed: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Processing' },
      analyzing: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Analyzing' },
      analyzed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Complete' },
      error: { bg: 'bg-red-100', text: 'text-red-700', label: 'Error' }
    };
    const config = statusConfig[status] || statusConfig.error;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate stats
  const completedInterviews = conversations.filter(c => c.status === 'analyzed');
  const avgScore = completedInterviews.length > 0
    ? Math.round(completedInterviews.reduce((sum, c) => sum + (c.overall_score || 0), 0) / completedInterviews.length)
    : 0;
  const bestScore = completedInterviews.length > 0
    ? Math.max(...completedInterviews.map(c => c.overall_score || 0))
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">InterviewPro</h1>
            <p className="text-sm text-gray-500">Welcome back, {userName}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowShopModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sunshine-600 hover:bg-sunshine-50 rounded-xl transition border-2 border-sunshine-200"
            >
              <ShoppingBag className="w-4 h-4" />
              Shop
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                <Video className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{conversations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{avgScore || '--'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Best Score</p>
                <p className="text-2xl font-bold text-gray-900">{bestScore || '--'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Start New Interview */}
          <button
            onClick={() => navigate('/interview')}
            className="bg-primary-500 hover:bg-primary-600 text-white rounded-xl p-6 flex items-center justify-between transition shadow-lg shadow-primary-500/20"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Play className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold">Start New Interview</h3>
                <p className="text-primary-100 text-sm">Practice with AI interviewer</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Practice with Packs */}
          <button
            onClick={() => setShowPackModal(true)}
            className="bg-sunshine-400 hover:bg-sunshine-500 text-gray-900 rounded-xl p-6 flex items-center justify-between transition shadow-lg shadow-sunshine-400/20"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/30 flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold">Practice with Packs</h3>
                <p className="text-gray-700 text-sm">Use curated question sets</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Video Call Interview */}
          <button
            onClick={() => navigate('/interview/setup')}
            className="bg-gradient-to-br from-sky-500 to-mint-500 hover:from-sky-600 hover:to-mint-600 text-white rounded-xl p-6 flex items-center justify-between transition shadow-lg shadow-sky-500/20 relative overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Video className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold">Tavus Video Interview</h3>
                  <span className="px-2 py-0.5 bg-sunshine-400 text-gray-900 text-xs font-bold rounded-full">
                    PREMIUM
                  </span>
                </div>
                <p className="text-sky-100 text-sm">AI video interviewer powered by Tavus</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Previous Sessions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Previous Sessions</h2>

          {conversations.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
              <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No interview sessions yet</p>
              <p className="text-sm text-gray-400 mt-1">Start your first practice session above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    // Allow clicking on completed, analyzing, or analyzed conversations
                    if (['completed', 'analyzing', 'analyzed'].includes(conv.status)) {
                      navigate(`/results/${conv.id}`);
                    }
                  }}
                  disabled={conv.status === 'in_progress' || conv.status === 'error'}
                  className={`w-full bg-white rounded-xl p-4 flex items-center justify-between border border-gray-200 transition ${
                    ['completed', 'analyzing', 'analyzed'].includes(conv.status) ? 'hover:border-primary-300 hover:shadow-md cursor-pointer' : 'opacity-75 cursor-default'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Video className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">
                        Interview Session
                      </p>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(conv.duration_seconds)}
                        </span>
                        <span>{formatDate(conv.started_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {conv.overall_score !== undefined && conv.overall_score !== null && (
                      <span className={`text-2xl font-bold ${getScoreColor(conv.overall_score)}`}>
                        {conv.overall_score}
                      </span>
                    )}
                    {getStatusBadge(conv.status)}
                    {['completed', 'analyzing', 'analyzed'].includes(conv.status) && (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Pack Selection Modal */}
      <PackSelectionModal
        isOpen={showPackModal}
        onClose={() => setShowPackModal(false)}
        userId={userId}
        onSelectPack={handleSelectPack}
        onCreateCustomPack={handleCreateCustomPack}
      />

      {/* Shop Modal */}
      <ShopModal
        isOpen={showShopModal}
        onClose={() => setShowShopModal(false)}
        userId={userId}
      />

      {/* Promotional Popup */}
      <PromoPopup onOpenShop={() => setShowShopModal(true)} />
    </div>
  );
}
