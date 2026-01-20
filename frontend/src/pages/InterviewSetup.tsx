import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2,
  AlertCircle,
  Video
} from 'lucide-react';
import { 
  PlayfulButton, 
  PlayfulCard
} from '../components/PlayfulUI';
import { DynamicRenderer, ComponentSchema } from '../components/DynamicRenderer';
import { api } from '../lib/api';

export default function InterviewSetup() {
  const navigate = useNavigate();
  
  // Steps: 1=Intent, 2=DynamicConfiguration
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data
  const [intent, setIntent] = useState('');
  const [dynamicTree, setDynamicTree] = useState<ComponentSchema[]>([]);
  const [dynamicValues, setDynamicValues] = useState<Record<string, any>>({});

  // Handlers

  const handleIntentSubmit = async () => {
    if (intent.length < 10) return; // Lowered limit slightly for testing
    setLoading(true);
    setError(null);
    
    try {
      // Fetch dynamic components based on intent
      const tree = await api.getDynamicComponents(intent);
      setDynamicTree(tree);
      
      // Initialize default values if needed (optional)
      const defaults: Record<string, any> = {};
      tree.forEach(comp => {
        if (comp.props.default !== undefined) {
          defaults[comp.id] = comp.props.default;
        }
      });
      setDynamicValues(defaults);
      
      setStep(2);
    } catch (err: any) {
      console.error('Failed to get dynamic components:', err);
      setError(err.message || 'Failed to generate interview configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create the full bundle
      const fullConfig = {
        original_intent: intent,
        configuration: dynamicValues
      };

      // Create conversation
      const { conversation_url } = await api.createTavusConversation(
        'current-user-id', // TODO: Get from context or prop if needed, though api.ts might handle it if we pass userId to component
        JSON.stringify(fullConfig) 
      );

      if (conversation_url) {
        navigate('/live-avatar-interview');
      } else {
        throw new Error('No conversation URL returned');
      }
    } catch (err: any) {
      console.error('Failed to start:', err);
      setError(err.message || 'Failed to start interview session.');
    } finally {
      setLoading(false);
    }
  };

  // Render Helpers

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">What do you want to practice?</h2>
        <p className="text-gray-600">
          Describe the role, company, or specific skills you want to target.
        </p>
      </div>

      <div className="space-y-4">
        <textarea
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          placeholder="I want to practice a full-length interview for my Product Manager role at Google..."
          rows={5}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
        />
        
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>{intent.length} / 10 characters minimum</span>
          {intent.length >= 10 && (
            <span className="text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Ready
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            "Product Manager at Google",
            "System Design for Senior Eng",
            "Behavioral questions for Consulting"
          ].map((example) => (
            <button
              key={example}
              onClick={() => setIntent(example)}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition"
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>

      <PlayfulButton
        variant="primary"
        size="lg"
        onClick={handleIntentSubmit}
        disabled={intent.length < 10 || loading}
        className="w-full"
        icon={loading ? undefined : Sparkles}
      >
        {loading ? 'Analyzing...' : 'Next'}
      </PlayfulButton>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Configure Your Interview</h2>
        <p className="text-gray-600">
          We've tailored these settings based on your goal. Customize them as needed.
        </p>
      </div>

      <DynamicRenderer 
        tree={dynamicTree} 
        onValuesChange={setDynamicValues} 
        initialValues={dynamicValues}
      />

      <div className="pt-4 border-t border-gray-100">
        <PlayfulButton
          variant="sunshine"
          size="lg"
          onClick={handleStartInterview}
          disabled={loading}
          className="w-full"
          icon={loading ? undefined : Video}
        >
          {loading ? 'Starting Interview...' : 'Start Interview'}
        </PlayfulButton>
      </div>
    </div>
  );

  // Main Render

  return (
    <div className="min-h-screen bg-cream-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <PlayfulButton
            variant="sky"
            size="sm"
            icon={ArrowLeft}
            onClick={() => {
                if (step > 1) setStep(step - 1);
                else navigate('/dashboard');
            }}
          >
            Back
          </PlayfulButton>
          
          <div className="flex gap-2">
            {[1, 2].map(i => (
              <div 
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  step >= i ? 'bg-primary-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-soft p-6 md:p-8 relative min-h-[400px]">
            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
        </div>
      </div>
    </div>
  );
}