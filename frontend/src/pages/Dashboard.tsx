import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight } from 'lucide-react';
import { api, Conversation } from '../lib/api';
import { PackSelectionModal, ShopModal, PromoPopup } from '../components';
import { LiquidGlass } from '../components/LiquidGlass';
import { LiquidButton } from '../components/LiquidButton';
import { LightLeakBackground } from '../components/LightLeakBackground';

interface DashboardProps {
  userId: string;
  onLogout: () => void;
}

export default function Dashboard({ userId, onLogout }: DashboardProps) {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPackModal, setShowPackModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      const convs = await api.getUserConversations(userId);
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
      <div className="min-h-screen relative flex items-center justify-center bg-white overflow-hidden">
        <LightLeakBackground />
        <LiquidGlass className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
        </LiquidGlass>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden font-sans text-gray-900">
      <LightLeakBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-24">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div className="flex items-center gap-3">
            <span className="font-sans font-bold text-xl tracking-tight text-black">VERITAS</span>
          </div>
          <div className="flex items-center gap-4">
            <LiquidButton
              onClick={() => setShowShopModal(true)}
              variant="secondary"
              size="sm"
            >
              Shop
            </LiquidButton>
            <LiquidButton
              onClick={onLogout}
              variant="secondary"
              size="sm"
            >
              Sign out
            </LiquidButton>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <LiquidGlass className="p-6 flex items-center gap-4">
            <div>
              <div className="text-xs text-gray-500 font-mono uppercase tracking-widest">Total Sessions</div>
              <div className="font-mono text-3xl text-black">{conversations.length}</div>
            </div>
          </LiquidGlass>
          <LiquidGlass className="p-6 flex items-center gap-4">
            <div>
              <div className="text-xs text-gray-500 font-mono uppercase tracking-widest">Average Score</div>
              <div className="font-mono text-3xl text-black">{avgScore}</div>
            </div>
          </LiquidGlass>
          <LiquidGlass className="p-6 flex items-center gap-4">
            <div>
              <div className="text-xs text-gray-500 font-mono uppercase tracking-widest">Best Score</div>
              <div className="font-mono text-3xl text-black">{bestScore}</div>
            </div>
          </LiquidGlass>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Start New Interview */}
          <LiquidGlass
            onClick={() => navigate('/interview/setup')}
            className="p-8 group cursor-pointer hover:!border-gray-400 transition-all"
          >
            <h3 className="font-sans font-semibold text-2xl text-black mb-2">Start New Interview</h3>
            <p className="text-gray-600 font-light mb-6">Practice with AI interviewer</p>
            <div className="flex items-center gap-2 text-black font-medium text-sm group-hover:gap-4 transition-all">
              EXPLORE
              <ArrowRight className="w-4 h-4" />
            </div>
          </LiquidGlass>

          {/* Practice with Packs */}
          <LiquidGlass
            onClick={() => setShowPackModal(true)}
            className="p-8 group cursor-pointer hover:!border-gray-400 transition-all"
          >
            <h3 className="font-sans font-semibold text-2xl text-black mb-2">Practice with Packs</h3>
            <p className="text-gray-600 font-light mb-6">Use curated question sets</p>
            <div className="flex items-center gap-2 text-black font-medium text-sm group-hover:gap-4 transition-all">
              EXPLORE
              <ArrowRight className="w-4 h-4" />
            </div>
          </LiquidGlass>

          {/* Tavus Video Interview */}
            <button 
              onClick={() => navigate('/interview/setup?type=veritas')}
              className="w-full py-4 rounded-xl bg-black text-white font-sans font-semibold text-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group"
            >
            <div className="absolute bottom-4 right-4 bg-black text-white rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-widest shadow-md">
              Premium
            </div>
          <div className="flex-1 p-6 flex flex-col justify-between relative z-10">
            <div>
              <h3 className="font-sans font-semibold text-2xl text-black mb-2">Veritas Video Interview</h3>
              <p className="font-sans text-gray-700 leading-relaxed mb-4">
                Practice with a lifelike AI interviewer. Ideal for behavioral questions and communication skills.
              </p>
            <div className="flex items-center gap-2 text-black font-medium text-sm group-hover:gap-4 transition-all">
              EXPLORE
              <ArrowRight className="w-4 h-4" />
            </div>
          </LiquidGlass>
        </div>

        {/* Previous Sessions */}
        <div>
          <h2 className="font-sans font-semibold text-3xl text-black mb-8">Previous Sessions</h2>
          <div className="flex flex-col gap-4">
            {conversations.length === 0 ? (
              <LiquidGlass className="p-12 text-center">
                <p className="text-gray-600 font-light">No sessions yet. Start a new interview to get feedback!</p>
              </LiquidGlass>
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

const SessionRow = ({ date, status, score, onClick }: { date: string; status: string; score?: number, onClick: () => void }) => {
  const isClickable = ['completed', 'analyzing', 'analyzed'].includes(status);

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'analyzed':
        return 'Complete';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
      case 'analyzing':
        return 'Processing';
      default:
        return s;
    }
  };

  return (
    <LiquidGlass
      onClick={isClickable ? onClick : undefined}
      className={`p-6 flex items-center gap-4 ${isClickable ? 'cursor-pointer hover:!border-gray-400' : 'opacity-70'}`}
    >
      <div className="flex-1">
        <div className="font-sans font-semibold text-lg text-black">Interview Session</div>
        <div className="text-xs text-gray-500 font-mono uppercase tracking-widest mt-1">{date}</div>
      </div>
      {score !== undefined && (
        <div className="font-mono text-2xl text-black mr-4">{score}</div>
      )}
      <div className="px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-widest bg-black/20 text-black">
        {getStatusLabel(status)}
      </div>
      {isClickable && <ArrowRight className="w-4 h-4 text-gray-400" />}
    </LiquidGlass>
  );
};
