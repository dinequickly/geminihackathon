import { useState, useEffect } from 'react';
import { X, Sparkles, Crown, Zap } from 'lucide-react';
import { LiquidGlass } from './LiquidGlass';
import { LiquidButton } from './LiquidButton';

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
      <LiquidGlass className="p-6 max-w-sm animate-bounce-gentle relative">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute -top-3 -right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform border border-gray-200"
        >
          <X className="w-4 h-4 text-gray-700" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center flex-shrink-0 border border-white/30">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-lg font-bold text-black mb-1 flex items-center gap-2">
              Upgrade to Premium
              <Sparkles className="w-4 h-4 text-purple-500" />
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed font-light">
              Unlock custom packs, dynamic AI behavior, and advanced tracking.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2.5 mb-6 pb-6 border-b border-gray-200/50">
          <div className="flex items-center gap-3 text-gray-700 text-sm">
            <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Zap className="w-3 h-3 text-purple-600" />
            </div>
            <span className="font-medium">Unlimited custom packs</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700 text-sm">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3 h-3 text-blue-600" />
            </div>
            <span className="font-medium">Dynamic interviewer behavior</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700 text-sm">
            <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Crown className="w-3 h-3 text-purple-600" />
            </div>
            <span className="font-medium">Premium question packs</span>
          </div>
        </div>

        {/* CTA Button */}
        <LiquidButton
          onClick={handleOpenShop}
          variant="secondary"
          size="md"
          className="w-full"
          icon={<Sparkles size={16} />}
          iconPosition="left"
        >
          View Plans
        </LiquidButton>
      </LiquidGlass>
    </div>
  );
}
