import { useState, useEffect } from 'react';
import { X, ShoppingBag, Check } from 'lucide-react';
import { api, StripeProduct, UserSubscriptionRecord } from '../lib/api';
import { LiquidButton } from './LiquidButton';
import { LiquidGlass } from './LiquidGlass';
import { LoadingSpinner } from './PlayfulUI';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function ShopModal({ isOpen, onClose, userId }: ShopModalProps) {
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscriptionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadData();
    }
  }, [isOpen, userId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [productsData, subscriptionsData] = await Promise.all([
        api.getStripeProducts(),
        api.getUserSubscriptions(userId)
      ]);

      setProducts(productsData.products);
      setSubscriptions(subscriptionsData.subscriptions);
    } catch (err) {
      console.error('Failed to load shop data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load shop data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (priceId: string, planName: string) => {
    try {
      setCheckoutLoading(priceId);
      const { url } = await api.createCheckoutSession(userId, priceId, planName);
      window.location.href = url;
    } catch (err) {
      console.error('Failed to create checkout session:', err);
      alert(err instanceof Error ? err.message : 'Failed to start checkout');
      setCheckoutLoading(null);
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const isSubscribed = (productId: string) => {
    return subscriptions.some(
      sub => sub.status === 'active' && products.find(p => p.id === productId)
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in font-sans">
      <LiquidGlass className="max-w-4xl w-full max-h-[90vh] overflow-hidden p-0 !bg-white/95">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-black">Marketplace</h2>
              <p className="text-sm text-gray-500 font-light">Upgrade your professional toolset</p>
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
              <p className="mt-4 text-gray-400 font-mono text-xs uppercase tracking-widest">Loading marketplace...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 font-medium mb-4">{error}</p>
              <LiquidButton onClick={loadData} variant="secondary" size="sm">Retry</LiquidButton>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Active Subscriptions Section */}
              {subscriptions.length > 0 && (
                <div>
                  <h3 className="font-serif text-lg text-black mb-4">Active Plan</h3>
                  <div className="space-y-3">
                    {subscriptions.map((sub) => (
                      <div
                        key={sub.id}
                        className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-serif text-xl text-black">{sub.plan_name}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs font-mono uppercase tracking-widest text-gray-500">
                             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> {sub.status}</span>
                             <span>Renews: {new Date(sub.current_period_end).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="bg-black text-white text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full">
                          Current
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Plans Section */}
              <div>
                <h3 className="font-serif text-lg text-black mb-6">Available Upgrades</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {products.map((product) => {
                    const productAny = product as any;
                    let price;

                    if (product.prices && product.prices.length > 0) {
                      price = product.prices[0];
                    } else if (productAny.price) {
                      price = productAny.price;
                    } else {
                      return null;
                    }

                    if (!price) return null;

                    const planName = product.name;
                    const subscribed = isSubscribed(product.id);
                    const loading = checkoutLoading === price.id;

                    return (
                      <div
                        key={product.id}
                        className={`
                          rounded-3xl p-8 border transition-all duration-300 flex flex-col h-full
                          ${subscribed
                            ? 'bg-gray-50 border-gray-200 opacity-60'
                            : 'bg-white border-gray-200 hover:border-black hover:shadow-lg'
                          }
                        `}
                      >
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-serif text-2xl text-black">{product.name}</h4>
                            {product.metadata.tier && (
                              <span className="font-mono text-[10px] uppercase tracking-widest border border-gray-200 px-2 py-1 rounded text-gray-500">
                                {product.metadata.tier}
                              </span>
                            )}
                          </div>

                          {product.description && (
                            <p className="text-sm text-gray-500 font-light mb-6">{product.description}</p>
                          )}

                          <div className="flex items-baseline gap-1 mb-8">
                            <span className="font-serif text-4xl text-black">
                              {formatPrice(price.unit_amount, price.currency)}
                            </span>
                            {price.recurring && (
                              <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
                                / {price.recurring.interval}
                              </span>
                            )}
                          </div>

                          {/* Features */}
                          {product.metadata.features && (
                            <ul className="space-y-3 mb-8">
                              {product.metadata.features.split(',').map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 font-light">
                                  <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                                  <span>{feature.trim()}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div className="mt-auto pt-6 border-t border-gray-100">
                          {subscribed ? (
                            <button disabled className="w-full py-3 bg-gray-100 text-gray-400 rounded-xl text-sm font-medium cursor-default">
                              Active Plan
                            </button>
                          ) : (
                            <LiquidButton
                              onClick={() => handleSubscribe(price.id, planName)}
                              variant="black"
                              size="md"
                              className="w-full justify-center"
                              loading={loading}
                            >
                              {loading ? 'Processing...' : 'Subscribe'}
                            </LiquidButton>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </LiquidGlass>
    </div>
  );
}