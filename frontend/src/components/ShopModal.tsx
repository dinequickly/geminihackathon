import { useState, useEffect } from 'react';
import { X, ShoppingBag, Check, Crown, Zap, Sparkles } from 'lucide-react';
import { api, StripeProduct, UserSubscriptionRecord } from '../lib/api';
import { PlayfulButton, Badge, LoadingSpinner } from './PlayfulUI';

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

      // Redirect to Stripe Checkout
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

  const getPlanIcon = (planName: string) => {
    const lower = planName.toLowerCase();
    if (lower.includes('premium')) return Crown;
    if (lower.includes('basic')) return Zap;
    return Sparkles;
  };

  const getPlanColor = (planName: string) => {
    const lower = planName.toLowerCase();
    if (lower.includes('premium')) return 'sunshine';
    if (lower.includes('basic')) return 'sky';
    return 'mint';
  };

  const isSubscribed = (productId: string) => {
    return subscriptions.some(
      sub => sub.status === 'active' && products.find(p => p.id === productId)
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-soft-lg max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between bg-gradient-to-r from-sunshine-50 to-primary-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sunshine-400 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Subscription Shop</h2>
              <p className="text-sm text-gray-600">Upgrade your interview practice experience</p>
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
              <p className="mt-4 text-gray-600">Loading plans...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-red-600 font-medium">{error}</p>
              <PlayfulButton onClick={loadData} variant="secondary" size="sm" className="mt-4">
                Try Again
              </PlayfulButton>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active Subscriptions Section */}
              {subscriptions.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    Your Active Subscriptions
                  </h3>
                  <div className="space-y-3">
                    {subscriptions.map((sub) => (
                      <div
                        key={sub.id}
                        className="bg-green-50 border-2 border-green-200 rounded-3xl p-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{sub.plan_name}</p>
                          <p className="text-sm text-gray-600">
                            Status: <span className="text-green-700 font-medium capitalize">{sub.status}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Renews: {new Date(sub.current_period_end).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="mint">
                          <Check className="w-4 h-4" />
                          Active
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Plans Section */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Available Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product) => {
                    const price = product.prices[0];
                    if (!price) return null;

                    const planName = product.name;
                    const Icon = getPlanIcon(planName);
                    const colorVariant = getPlanColor(planName);
                    const subscribed = isSubscribed(product.id);
                    const loading = checkoutLoading === price.id;

                    return (
                      <div
                        key={product.id}
                        className={`
                          rounded-3xl p-6 border-2 transition-all duration-300
                          ${subscribed
                            ? 'bg-green-50 border-green-300'
                            : 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-soft-lg'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-2xl bg-${colorVariant}-400 flex items-center justify-center`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-gray-900">{product.name}</h4>
                              {product.metadata.tier && (
                                <Badge variant={colorVariant as any}>
                                  {product.metadata.tier}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {product.description && (
                          <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                        )}

                        {/* Features */}
                        {product.metadata.features && (
                          <ul className="space-y-2 mb-4">
                            {product.metadata.features.split(',').map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>{feature.trim()}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        <div className="border-t-2 border-gray-100 pt-4 mt-4">
                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-3xl font-bold text-gray-900">
                              {formatPrice(price.unit_amount, price.currency)}
                            </span>
                            {price.recurring && (
                              <span className="text-sm text-gray-500">
                                / {price.recurring.interval}
                              </span>
                            )}
                          </div>

                          {subscribed ? (
                            <div className="flex items-center justify-center gap-2 py-3 px-4 bg-green-100 text-green-700 rounded-2xl font-semibold">
                              <Check className="w-5 h-5" />
                              Subscribed
                            </div>
                          ) : (
                            <PlayfulButton
                              onClick={() => handleSubscribe(price.id, planName)}
                              variant={colorVariant as any}
                              size="md"
                              disabled={loading}
                              className="w-full"
                            >
                              {loading ? (
                                <>
                                  <LoadingSpinner size="sm" color="primary" />
                                  Loading...
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="w-5 h-5" />
                                  Subscribe Now
                                </>
                              )}
                            </PlayfulButton>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {products.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">No plans available</p>
                    <p className="text-sm text-gray-400 mt-1">Check back later for new offerings</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
