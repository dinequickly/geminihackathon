import { useState, useEffect } from 'react';
import { X, Sparkles, Crown, Zap } from 'lucide-react';
import { PlayfulButton } from './PlayfulUI';

interface PromoPopupProps {
  onOpenShop: () => void;
}

export default function PromoPopup({ onOpenShop }: PromoPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Don't show if user manually dismissed
    if (isDismissed) return;

    // Initial delay before first popup (5 seconds after mount)
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    return () => clearTimeout(initialTimer);
  }, [isDismissed]);

  useEffect(() => {
    if (!isVisible || isDismissed) return;

    // Hide after 10 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 10000);

    return () => clearTimeout(hideTimer);
  }, [isVisible, isDismissed]);

  useEffect(() => {
    if (isVisible || isDismissed) return;

    // Show again after 30 seconds from when it was hidden
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 30000);

    return () => clearTimeout(showTimer);
  }, [isVisible, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  const handleOpenShop = () => {
    onOpenShop();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-slide-up">
      <div className="bg-gradient-to-br from-sunshine-400 to-primary-500 rounded-3xl shadow-2xl p-5 max-w-sm border-2 border-white/50 animate-bounce-gentle">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
              Upgrade to Premium
              <Sparkles className="w-5 h-5" />
            </h3>
            <p className="text-white/90 text-sm leading-relaxed">
              Unlock custom interview packs, dynamic AI behavior, and advanced progress tracking!
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <Zap className="w-4 h-4 flex-shrink-0" />
            <span>Create unlimited custom packs</span>
          </div>
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>Dynamic interviewer behavior</span>
          </div>
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <Crown className="w-4 h-4 flex-shrink-0" />
            <span>Premium question packs</span>
          </div>
        </div>

        {/* CTA Button */}
        <PlayfulButton
          onClick={handleOpenShop}
          variant="secondary"
          size="sm"
          className="w-full"
        >
          <Sparkles className="w-4 h-4" />
          View Plans
        </PlayfulButton>
      </div>
    </div>
  );
}
