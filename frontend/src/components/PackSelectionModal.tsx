import { useState, useEffect } from 'react';
import { X, BookOpen, Plus, Sparkles, Lock, ChevronRight, Loader2, Package } from 'lucide-react';
import { api, InterviewPack, UserSubscription } from '../lib/api';
import { PlayfulButton, PlayfulCard, Badge, LoadingSpinner } from './PlayfulUI';

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
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
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
      setSubscription(subData);
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-soft-lg max-w-3xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between bg-cream-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {mode === 'choose' && 'Practice Interview'}
                {mode === 'existing' && 'Choose a Pack'}
                {mode === 'custom' && 'Create Custom Pack'}
              </h2>
              <p className="text-sm text-gray-600">
                {mode === 'choose' && 'Select how you want to practice'}
                {mode === 'existing' && `${packs.length} packs available`}
                {mode === 'custom' && 'Build your own interview pack'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-2xl transition-all duration-300 hover:scale-110"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner size="lg" color="primary" />
              <p className="mt-4 text-gray-600">Loading packs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-red-600 font-medium">{error}</p>
              <PlayfulButton
                onClick={loadData}
                variant="secondary"
                size="sm"
                className="mt-4"
              >
                Try Again
              </PlayfulButton>
            </div>
          ) : mode === 'choose' ? (
            // Initial choice screen
            <div className="space-y-4">
              {/* Practice with Existing Pack */}
              {hasPacks && (
                <button
                  onClick={() => setMode('existing')}
                  className="w-full bg-primary-50 hover:bg-primary-100 border-2 border-primary-200 rounded-3xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-soft-lg text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center">
                        <BookOpen className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          Practice with Existing Pack
                        </h3>
                        <p className="text-sm text-gray-600">
                          Choose from {packs.length} available interview packs
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-primary-600" />
                  </div>
                </button>
              )}

              {/* Create Custom Pack */}
              <button
                onClick={handleCreateCustom}
                className="w-full bg-sunshine-50 hover:bg-sunshine-100 border-2 border-sunshine-200 rounded-3xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-soft-lg text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-sunshine-400 flex items-center justify-center">
                      <Plus className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                        Create Custom Pack
                        <Sparkles className="w-5 h-5 text-sunshine-600" />
                      </h3>
                      <p className="text-sm text-gray-600">
                        Build your own personalized interview pack
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-sunshine-600" />
                </div>
              </button>

              {!hasPacks && (
                <div className="mt-6 p-4 bg-sky-50 border-2 border-sky-200 rounded-2xl">
                  <p className="text-sm text-sky-800 text-center">
                    You don't have any packs yet. Create a custom pack to get started!
                  </p>
                </div>
              )}
            </div>
          ) : mode === 'existing' ? (
            // Pack list view
            <div className="space-y-4">
              <button
                onClick={() => setMode('choose')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 mb-4"
              >
                ← Back to options
              </button>

              {packs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">No packs available</p>
                  <p className="text-sm text-gray-400 mt-1">Create a custom pack to get started</p>
                </div>
              ) : (
                packs.map((pack) => (
                  <button
                    key={pack.id}
                    onClick={() => handlePackClick(pack.id)}
                    className="w-full bg-white hover:bg-cream-50 border-2 border-gray-200 hover:border-primary-300 rounded-3xl p-5 transition-all duration-300 hover:shadow-soft-lg text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{pack.name}</h3>
                          {pack.is_custom && (
                            <Badge variant="sunshine">Custom</Badge>
                          )}
                          {pack.is_subscription_only && (
                            <Badge variant="primary">
                              <Lock className="w-3 h-3" />
                              Premium
                            </Badge>
                          )}
                        </div>
                        {pack.description && (
                          <p className="text-sm text-gray-600 mb-3">{pack.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">
                            <span className="font-semibold text-primary-600">{pack.question_count}</span> questions
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500 capitalize">{pack.category}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
