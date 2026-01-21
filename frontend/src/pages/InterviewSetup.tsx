import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Video,
  Pencil,
  X,
  Check,
  Bot,
  Clock
} from 'lucide-react';
import {
  PlayfulButton
} from '../components/PlayfulUI';
import { DynamicRenderer, ComponentSchema } from '../components/DynamicRenderer';
import { InfoCard } from '../components/DynamicComponents';
import { api } from '../lib/api';

interface InterviewSetupProps {
  userId: string;
}

// Editable Personality Component
const PersonalityEditor = ({ 
  personality, 
  setPersonality 
}: { 
  personality: string; 
  setPersonality: (val: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempText, setTempText] = useState(personality);
  const [showAiInput, setShowAiInput] = useState(false);
  const [aiInstruction, setAiInstruction] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);

  const handleSave = () => {
    setPersonality(tempText);
    setIsEditing(false);
    setShowAiInput(false);
  };

  const handleRewrite = async () => {
    if (!aiInstruction) return;
    setIsRewriting(true);
    setTempText(''); // Clear to show streaming
    
    try {
      await api.streamPersonalityRewrite(personality, aiInstruction, (chunk) => {
        setTempText(prev => prev + chunk);
      });
      setShowAiInput(false);
      setAiInstruction('');
    } catch (err) {
      console.error('Rewrite failed:', err);
    } finally {
      setIsRewriting(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-mint-50 border-2 border-mint-200 rounded-2xl p-6 relative animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-mint-800 font-bold">
            <Bot className="w-5 h-5" />
            <h3>Edit Persona</h3>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowAiInput(!showAiInput)}
              className={`p-2 rounded-lg transition-colors ${showAiInput ? 'bg-mint-200 text-mint-800' : 'bg-white text-mint-600 hover:bg-mint-100'}`}
              title="Rewrite with AI"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button 
              onClick={() => { setIsEditing(false); setTempText(personality); }}
              className="p-2 bg-white text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <button 
              onClick={handleSave}
              className="p-2 bg-mint-500 text-white rounded-lg hover:bg-mint-600 transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showAiInput && (
          <div className="mb-4 bg-white p-3 rounded-xl border border-mint-200 flex gap-2">
            <input 
              type="text" 
              value={aiInstruction}
              onChange={(e) => setAiInstruction(e.target.value)}
              placeholder="e.g., Make it friendlier, more strict..."
              className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-400"
              onKeyDown={(e) => e.key === 'Enter' && handleRewrite()}
            />
            <button 
              onClick={handleRewrite}
              disabled={isRewriting || !aiInstruction}
              className="text-xs bg-mint-500 text-white px-3 py-1.5 rounded-lg hover:bg-mint-600 disabled:opacity-50 font-bold flex items-center gap-1"
            >
              {isRewriting ? '...' : <><Sparkles className="w-3 h-3" /> Rewrite</>}
            </button>
          </div>
        )}

        <textarea 
          value={tempText}
          onChange={(e) => setTempText(e.target.value)}
          className="w-full h-24 p-3 rounded-xl border border-mint-200 focus:border-mint-400 focus:ring-2 focus:ring-mint-100 outline-none resize-none text-sm text-gray-800 bg-white/50"
        />
      </div>
    );
  }

  return (
    <div className="group relative">
      <InfoCard 
        title="Interviewer Persona" 
        message={personality} 
        variant="tip" 
      />
      <button 
        onClick={() => { setIsEditing(true); setTempText(personality); }}
        className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white text-mint-700 shadow-sm hover:shadow-md"
      >
        <Pencil className="w-4 h-4" />
      </button>
    </div>
  );
};

export default function InterviewSetup({ userId }: InterviewSetupProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const interviewType = searchParams.get('type') || 'elevenlabs'; // Default to elevenlabs

  // Steps: 1=Intent, 2=DynamicConfiguration
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data
  const [intent, setIntent] = useState('');
  const [dynamicTree, setDynamicTree] = useState<ComponentSchema[]>([]);
  const [dynamicValues, setDynamicValues] = useState<Record<string, any>>({});
  const [personality, setPersonality] = useState('');

  // Handlers

  const handleIntentSubmit = async () => {
    if (intent.length < 10) return;
    setLoading(true);
    setError(null);
    
    const initialTree: ComponentSchema[] = [];
    setDynamicTree(initialTree);
    setDynamicValues({ duration: 8 });
    
    setPersonality('');
    setStep(2); 
    
    try {
      // Start both streams in parallel
      const componentsPromise = api.streamDynamicComponents(intent, (components) => {
        // Filter out any AI-generated TimeSelectors to keep our dedicated slider at top
        const newComponents = components.filter(c => c.type !== 'TimeSelector');

        // Also init default values for new components
        const defaults: Record<string, any> = {};
        newComponents.forEach(comp => {
            if (comp.props.default !== undefined && dynamicValues[comp.id] === undefined) {
                defaults[comp.id] = comp.props.default;
            }
        });
        if (Object.keys(defaults).length > 0) {
            setDynamicValues(prevVals => ({ ...prevVals, ...defaults }));
        }

        setDynamicTree([...initialTree, ...newComponents]);
      });

      const personalityPromise = api.streamPersonality(intent, (chunk) => {
        setPersonality(prev => prev + chunk);
      });

      await Promise.all([componentsPromise, personalityPromise]);
      
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
        configuration: dynamicValues,
        personality: personality
      };

      // Start ElevenLabs interview
      await api.startInterview(
        userId,
        fullConfig
      );

      // Navigate to the appropriate interview page based on type
      if (interviewType === 'tavus') {
        navigate('/live-avatar-interview');
      } else {
        navigate('/interview');
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

      {/* Interview Length Slider */}
      <div className="bg-gradient-to-r from-primary-50 to-sky-50 border-2 border-primary-200 rounded-2xl p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-sky-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-display font-bold text-lg text-gray-900">Interview Length</h3>
          </div>
          <div className="text-right">
            <span className="text-3xl font-display font-black text-primary-600">
              {dynamicValues.duration || 8}
            </span>
            <span className="text-lg font-bold text-primary-400 ml-1">min</span>
          </div>
        </div>

        <div className="relative pt-2 pb-4">
          <input
            type="range"
            min={5}
            max={15}
            value={dynamicValues.duration || 8}
            onChange={(e) => setDynamicValues(prev => ({ ...prev, duration: Number(e.target.value) }))}
            className="w-full h-3 bg-gradient-to-r from-primary-200 to-sky-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-primary-500 [&::-webkit-slider-thumb]:to-sky-500 [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-95"
          />
          <div className="flex justify-between mt-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
            <span>Quick (5 min)</span>
            <span>Standard (10 min)</span>
            <span>Deep (15 min)</span>
          </div>
        </div>
      </div>

      {personality && (
        <div className="animate-fade-in">
            <PersonalityEditor
                personality={personality}
                setPersonality={setPersonality}
            />
        </div>
      )}

      <DynamicRenderer 
        tree={dynamicTree} 
        onValuesChange={setDynamicValues} 
        initialValues={dynamicValues}
      />

      {loading && dynamicTree.length === 0 && (
        <div className="text-center py-12 text-gray-500 animate-pulse">
            Analyzing your request...
        </div>
      )}

      <div className="pt-4 border-t border-gray-100">
        <PlayfulButton
          variant="sunshine"
          size="lg"
          onClick={handleStartInterview}
          disabled={loading || dynamicTree.length === 0}
          className="w-full"
          icon={loading ? undefined : Video}
        >
          {loading && dynamicTree.length === 0 ? 'Generating...' : 'Start Interview'}
        </PlayfulButton>
      </div>
    </div>
  );

  // Main Render

  return (
    <div className="min-h-screen bg-cream-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
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
