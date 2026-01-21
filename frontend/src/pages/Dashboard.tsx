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
  ShoppingBag,
  Activity,
  ArrowRight
} from 'lucide-react';
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

  const getScoreColor = (score: number | undefined) => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-black';
    if (score >= 60) return 'text-gray-800';
    return 'text-gray-700';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string }> = {
      in_progress: { label: 'In Progress' },
      completed: { label: 'Processing' },
      analyzing: { label: 'Analyzing' },
      analyzed: { label: 'Complete' },
      error: { label: 'Error' }
    };
    const config = statusConfig[status] || statusConfig.error;
    return (
      <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500 border border-gray-200 px-2 py-0.5 rounded">
        {config.label}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden text-gray-900 font-sans selection:bg-pink-100">
      <LightLeakBackground />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between border-b border-gray-200/50 bg-white/30 backdrop-blur-md">
        <div className="flex flex-col">
          <span className="font-serif text-xl font-bold tracking-tight text-black">TAVUS</span>
          <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Executive Dashboard</span>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setShowShopModal(true)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black transition"
          >
            <ShoppingBag className="w-4 h-4" />
            Marketplace
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black transition"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-24 relative z-10">
        
        {/* Welcome Section */}
        <div className="mb-16">
          <h1 className="font-serif text-5xl text-black mb-2">Welcome, {userName}</h1>
          <p className="text-gray-600 font-light text-lg italic">Refining your professional signal.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <StatCard label="Total Sessions" value={conversations.length} icon={<Activity size={20} />} />
          <StatCard label="Average Score" value={avgScore || '--'} icon={<TrendingUp size={20} />} />
          <StatCard label="Highest Mark" value={bestScore || '--'} icon={<Award size={20} />} />
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <ActionCard 
            title="Standard Interview" 
            desc="Practice with our elite AI interviewer."
            onClick={() => navigate('/interview/setup')}
            icon={<Play size={24} />}
            variant="glass"
          />
          <ActionCard 
            title="Question Packs" 
            desc="Focused practice with curated sets."
            onClick={() => setShowPackModal(true)}
            icon={<Package size={24} />}
            variant="glass"
          />
          <ActionCard 
            title="Tavus Premium" 
            desc="AI Video avatars for ultimate realism."
            onClick={() => navigate('/interview/setup?type=tavus')}
            icon={<Video size={24} />}
            variant="glass"
            tag="PREMIUM"
          />
        </div>

        {/* History Section */}
        <section>
          <div className="flex items-end justify-between mb-8 border-b border-gray-200/50 pb-4">
            <h2 className="font-serif text-3xl text-black">Session History</h2>
            <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">Archived Data</span>
          </div>

          {conversations.length === 0 ? (
            <LiquidGlass className="p-16 text-center">
              <Video className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="font-serif text-xl text-gray-800">No signals recorded yet.</p>
              <p className="text-sm text-gray-500 mt-2">Initiate your first session to begin analysis.</p>
            </LiquidGlass>
          ) : (
            <div className="grid gap-4">
              {conversations.map((conv) => (
                <HistoryItem 
                  key={conv.id}
                  conv={conv}
                  onClick={() => {
                    if (['completed', 'analyzing', 'analyzed'].includes(conv.status)) {
                      navigate(`/results/${conv.id}`);
                    }
                  }}
                  formatDuration={formatDuration}
                  formatDate={formatDate}
                  getStatusBadge={getStatusBadge}
                  getScoreColor={getScoreColor}
                />
              ))}
            </div>
          )}
        </section>
      </main>

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

function StatCard({ label, value, icon }: { label: string, value: string | number, icon: any }) {
  return (
    <LiquidGlass className="p-8 flex flex-col justify-between h-40">
      <div className="flex justify-between items-start">
        <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">{label}</span>
        <div className="text-gray-400">{icon}</div>
      </div>
      <div className="font-serif text-4xl text-black">{value}</div>
    </LiquidGlass>
  );
}

function ActionCard({ title, desc, onClick, icon, variant, tag }: { title: string, desc: string, onClick: () => void, icon: any, variant: 'black' | 'glass', tag?: string }) {
  if (variant === 'black') {
    return (
      <LiquidButton 
        variant="black" 
        size="xl" 
        className="w-full h-full flex flex-col !items-start !justify-between p-8 text-left group"
        onClick={onClick}
      >
        <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-12">
          {icon}
        </div>
        <div>
          <h3 className="font-serif text-2xl mb-2 flex items-center gap-2">
            {title} <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
          </h3>
          <p className="text-sm text-gray-400 font-light">{desc}</p>
        </div>
      </LiquidButton>
    )
  }

  return (
    <LiquidGlass 
      className="p-8 flex flex-col h-full justify-between cursor-pointer hover:!border-gray-400 transition-colors group"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-12">
        <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-600">
          {icon}
        </div>
        {tag && <span className="font-mono text-[10px] bg-black text-white px-2 py-0.5 rounded">{tag}</span>}
      </div>
      <div>
        <h3 className="font-serif text-2xl text-black mb-2 flex items-center gap-2">
          {title} <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
        </h3>
        <p className="text-sm text-gray-600 font-light">{desc}</p>
      </div>
    </LiquidGlass>
  )
}

function HistoryItem({ conv, onClick, formatDuration, formatDate, getStatusBadge, getScoreColor }: any) {
  const isClickable = ['completed', 'analyzing', 'analyzed'].includes(conv.status);
  
  return (
    <LiquidGlass 
      className={`p-6 flex items-center justify-between group ${isClickable ? 'cursor-pointer hover:!border-gray-400' : 'opacity-70'}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-6">
        <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-400">
          <Activity size={20} />
        </div>
        <div>
          <h4 className="font-serif text-xl text-black">Session Archive</h4>
          <div className="flex items-center gap-4 mt-1">
            <span className="font-mono text-[10px] text-gray-500 uppercase">{formatDate(conv.started_at)}</span>
            <span className="font-mono text-[10px] text-gray-500 uppercase">{formatDuration(conv.duration_seconds)}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-8">
        {conv.overall_score !== undefined && conv.overall_score !== null && (
          <div className="text-right">
            <div className={`font-serif text-3xl ${getScoreColor(conv.overall_score)}`}>{conv.overall_score}</div>
            <div className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">Score</div>
          </div>
        )}
        <div className="flex flex-col items-end gap-2">
          {getStatusBadge(conv.status)}
          {isClickable && <ArrowRight size={16} className="text-gray-300 group-hover:text-black transition-colors" />}
        </div>
      </div>
    </LiquidGlass>
  )
}