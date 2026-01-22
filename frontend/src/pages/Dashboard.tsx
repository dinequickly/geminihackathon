import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
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
    setShowPackModal(false);
    navigate(`/pack/${packId}`);
  };

  const handleCreateCustomPack = () => {
    alert('Custom pack creation chatbot coming soon!');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  const completedInterviews = conversations.filter(c => c.status === 'analyzed');
  const avgScore = completedInterviews.length > 0
    ? Math.round(completedInterviews.reduce((sum, c) => sum + (c.overall_score || 0), 0) / completedInterviews.length)
    : 0;
  const bestScore = completedInterviews.length > 0
    ? Math.max(...completedInterviews.map(c => c.overall_score || 0))
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fef9f3]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#fef9f3] font-sans text-gray-900 p-8">
      {/* Background decorations */}
      <div className="absolute top-[60px] right-[100px] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-[#fef3c7] to-[#fde68a] opacity-30 pointer-events-none" />
      <div className="absolute top-[200px] right-[200px] w-[200px] h-[200px] rounded-full bg-gradient-to-br from-[#dbeafe] to-[#bfdbfe] opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 animate-slide-down">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">InterviewPro</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome back, {userName}</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowShopModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-amber-400 text-amber-500 text-sm font-semibold hover:bg-amber-50 transition-colors"
            >
              <span>🛒</span> Shop
            </button>
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-gray-500 text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              <span>→</span> Sign out
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 animate-slide-up delay-100">
          <StatCard icon="📹" iconBg="bg-red-100" label="Total Sessions" value={conversations.length.toString()} />
          <StatCard icon="📈" iconBg="bg-emerald-100" label="Average Score" value={avgScore.toString()} />
          <StatCard icon="🏆" iconBg="bg-amber-100" label="Best Score" value={bestScore.toString()} />
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 animate-slide-up delay-200">
          {/* Start New Interview */}
          <div 
            onClick={() => navigate('/interview/setup')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 p-6 text-white cursor-pointer shadow-lg hover:shadow-orange-200 hover:scale-[1.02] transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                ▶
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold">Start New Interview</div>
                <div className="text-sm opacity-90">Practice with AI interviewer</div>
              </div>
              <span className="text-xl opacity-80 group-hover:translate-x-1 transition-transform">›</span>
            </div>
          </div>

          {/* Practice with Packs */}
          <div 
            onClick={() => setShowPackModal(true)}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 p-6 text-gray-900 cursor-pointer shadow-lg hover:shadow-amber-100 hover:scale-[1.02] transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/40 flex items-center justify-center text-2xl">
                📦
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold">Practice with Packs</div>
                <div className="text-sm opacity-80">Use curated question sets</div>
              </div>
              <span className="text-xl opacity-60 group-hover:translate-x-1 transition-transform">›</span>
            </div>
          </div>

          {/* Tavus Video Interview */}
          <div 
            onClick={() => navigate('/interview/setup?type=tavus')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 p-6 text-white cursor-pointer shadow-lg hover:shadow-teal-100 hover:scale-[1.02] transition-all duration-200"
          >
            <div className="absolute top-3 right-3 bg-white/20 rounded-lg px-2.5 py-1 text-[10px] font-bold">
              PREMIUM
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                🎥
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold">Tavus Video Interview</div>
                <div className="text-sm opacity-90">AI video interviewer</div>
              </div>
              <span className="text-xl opacity-80 group-hover:translate-x-1 transition-transform">›</span>
            </div>
          </div>
        </div>

        {/* Previous Sessions */}
        <div className="animate-slide-up delay-300">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Previous Sessions</h2>
          <div className="flex flex-col gap-3">
            {conversations.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center text-gray-500 shadow-sm">
                No sessions yet. Start a new interview to get feedback!
              </div>
            ) : (
              conversations.map((conv) => (
                <SessionRow 
                  key={conv.id}
                  date={formatDate(conv.started_at)}
                  status={conv.status}
                  score={conv.overall_score}
                  onClick={() => {
                     if (['completed', 'analyzing', 'analyzed'].includes(conv.status)) {
                      navigate(`/results/${conv.id}`);
                    }
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <PackSelectionModal
        isOpen={showPackModal}
        onClose={() => setShowPackModal(false)}
        userId={userId}
        onSelectPack={handleSelectPack}
        onCreateCustomPack={handleCreateCustomPack}
      />
      <ShopModal
        isOpen={showShopModal}
        onClose={() => setShowShopModal(false)}
        userId={userId}
      />
      <PromoPopup onOpenShop={() => setShowShopModal(true)} />
    </div>
  );
}

const StatCard = ({ icon, iconBg, label, value }: { icon: string; iconBg: string; label: string; value: string }) => (
  <div className="bg-white rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center text-2xl`}>
      {icon}
    </div>
    <div>
      <div className="text-xs text-gray-500 font-medium">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  </div>
);

const SessionRow = ({ date, status, score, onClick }: { date: string; status: string; score?: number, onClick: () => void }) => {
  const isClickable = ['completed', 'analyzing', 'analyzed'].includes(status);
  
  const getStatusStyle = (s: string) => {
    switch (s) {
      case 'analyzed': // Complete
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Complete' };
      case 'in_progress':
        return { bg: 'bg-blue-100', text: 'text-blue-600', label: 'In Progress' };
      case 'completed': // Processing
      case 'analyzing':
        return { bg: 'bg-amber-100', text: 'text-amber-600', label: 'Processing' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600', label: s };
    }
  };

  const style = getStatusStyle(status);

  return (
    <div 
      onClick={isClickable ? onClick : undefined}
      className={`bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm transition-all ${isClickable ? 'cursor-pointer hover:shadow-md hover:scale-[1.01]' : 'opacity-70'}`}
    >
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
        <span className="text-lg text-gray-400">🎥</span>
      </div>
      <div className="flex-1">
        <div className="text-[15px] font-semibold text-gray-900">Interview Session</div>
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <span>⏱ {date}</span>
        </div>
      </div>
      {score !== undefined && (
        <div className="text-xl font-bold text-emerald-600 mr-2">{score}</div>
      )}
      <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${style.bg} ${style.text}`}>
        {style.label}
      </div>
      {isClickable && <span className="text-gray-300 text-lg">›</span>}
    </div>
  );
};
