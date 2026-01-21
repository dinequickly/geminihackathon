import { useState, useEffect } from 'react';
import { X, Sparkles, Package, BookOpen, ChevronRight, Lock, ArrowLeft } from 'lucide-react';
import { api, InterviewPack, UserSubscription } from '../lib/api';
import { LiquidButton } from './LiquidButton';
import { LiquidGlass } from './LiquidGlass';
import { LoadingSpinner } from './PlayfulUI'; // Keep loader or create new one? Keeping for now.

interface PackSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSelectPack: (packId: string) => void;
  onCreateCustomPack: () => void;
}

export default function PackSelectionModal({
  isOpen,
  onClose,
  userId,
  onSelectPack,
  onCreateCustomPack
}: PackSelectionModalProps) {
  const [mode, setMode] = useState<'choose' | 'existing' | 'custom'>('choose');
  const [packs, setPacks] = useState<InterviewPack[]>([]);
  const [_subscription, _setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadData();
    }
  }, [isOpen, userId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [packsData, subData] = await Promise.all([
        api.getAvailablePacks(userId),
        api.getUserSubscription(userId)
      ]);

      setPacks(packsData.packs);
      _setSubscription(subData);
    } catch (err) {
      console.error('Failed to load packs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load packs');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePackClick = (packId: string) => {
    onSelectPack(packId);
    onClose();
  };

  const handleCreateCustom = () => {
    onCreateCustomPack();
    onClose();
  };

  if (!isOpen) return null;

  const hasPacks = packs.length > 0;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in font-sans">
      <LiquidGlass className="max-w-3xl w-full max-h-[90vh] overflow-hidden p-0 !bg-white/90">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-black">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-black">
                {mode === 'choose' && 'Select Context'}
                {mode === 'existing' && 'Available Packs'}
                {mode === 'custom' && 'Initialize Custom Pack'}
              </h2>
              <p className="text-sm text-gray-500 font-light">
                {mode === 'choose' && 'Choose your practice environment'}
                {mode === 'existing' && `${packs.length} curated scenarios available`}
                {mode === 'custom' && 'Design a targeted interview scenario'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner size="lg" color="primary" />
              <p className="mt-4 text-gray-400 font-mono text-xs uppercase tracking-widest">Loading assets...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 font-medium mb-4">{error}</p>
              <LiquidButton onClick={loadData} variant="secondary" size="sm">
                Retry
              </LiquidButton>
            </div>
          ) : mode === 'choose' ? (
            // Initial choice screen
            <div className="grid md:grid-cols-2 gap-6">
              {/* Practice with Existing Pack */}
              {hasPacks && (
                <button
                  onClick={() => setMode('existing')}
                  className="group relative overflow-hidden bg-white border border-gray-200 hover:border-black/20 p-8 rounded-3xl text-left transition-all hover:shadow-lg"
                >
                  <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mb-6">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl text-black mb-2">Standard Packs</h3>
                  <p className="text-sm text-gray-500 font-light mb-6">
                    Access {packs.length} curated question sets designed by experts.
                  </p>
                  <div className="flex items-center text-xs font-mono uppercase tracking-widest text-black group-hover:underline">
                    Browse Library <ChevronRight size={14} className="ml-1" />
                  </div>
                </button>
              )}

              {/* Create Custom Pack */}
              <button
                onClick={handleCreateCustom}
                className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-black/20 p-8 rounded-3xl text-left transition-all hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-full bg-white border border-gray-100 text-black flex items-center justify-center mb-6">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl text-black mb-2">Custom Scenario</h3>
                <p className="text-sm text-gray-500 font-light mb-6">
                   Generate a tailored interview pack based on specific job descriptions.
                </p>
                <div className="flex items-center text-xs font-mono uppercase tracking-widest text-black group-hover:underline">
                  Start Generation <ChevronRight size={14} className="ml-1" />
                </div>
              </button>

              {!hasPacks && (
                <div className="col-span-2 p-6 border border-gray-200 rounded-2xl bg-gray-50 text-center">
                  <p className="text-gray-500 text-sm">Library empty. Create a custom scenario to begin.</p>
                </div>
              )}
            </div>
          ) : mode === 'existing' ? (
            // Pack list view
            <div className="space-y-4">
              <button
                onClick={() => setMode('choose')}
                className="text-xs font-mono uppercase tracking-widest text-gray-400 hover:text-black mb-6 flex items-center gap-2"
              >
                <ArrowLeft size={12} /> Return to selection
              </button>

              {packs.length === 0 ? (
                <p className="text-center text-gray-500">No packs found.</p>
              ) : (
                packs.map((pack) => (
                  <button
                    key={pack.id}
                    onClick={() => handlePackClick(pack.id)}
                    className="w-full group bg-white border border-gray-100 hover:border-black/20 p-6 rounded-2xl transition-all text-left flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-serif text-lg text-black">{pack.name}</h3>
                        {pack.is_custom && (
                          <span className="text-[10px] font-mono uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded text-gray-600">Custom</span>
                        )}
                        {pack.is_subscription_only && (
                          <span className="text-[10px] font-mono uppercase tracking-widest bg-black text-white px-2 py-0.5 rounded flex items-center gap-1">
                            <Lock size={8} /> Premium
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs font-mono text-gray-400 uppercase tracking-widest">
                         <span>{pack.question_count} Questions</span>
                         <span>•</span>
                         <span>{pack.category}</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={14} className="text-black" />
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>
      </LiquidGlass>
    </div>
  );
}