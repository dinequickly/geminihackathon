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
  Bot
} from 'lucide-react';
import { DynamicRenderer, ComponentSchema } from '../components/DynamicRenderer';
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
      <div className="rounded-2xl border border-[#f1e4d6] bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-amber-700 font-mono">
                Persona
              </div>
              <h3 className="font-sans font-semibold text-lg tracking-tight text-gray-900">Edit tone</h3>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowAiInput(!showAiInput)}
              className={`p-2 rounded-full border transition-colors ${
                showAiInput
                  ? 'bg-amber-100 border-amber-200 text-amber-800'
                  : 'bg-white border-[#f1e4d6] text-gray-600 hover:bg-amber-50'
              }`}
              title="Rewrite with AI"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button 
              onClick={() => { setIsEditing(false); setTempText(personality); }}
              className="p-2 bg-white border border-[#f1e4d6] text-gray-500 rounded-full hover:bg-amber-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <button 
              onClick={handleSave}
              className="p-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showAiInput && (
          <div className="mb-4 bg-white p-3 rounded-xl border border-amber-200 flex gap-2">
            <input 
              type="text" 
              value={aiInstruction}
              onChange={(e) => setAiInstruction(e.target.value)}
              placeholder="e.g., Make it friendlier, more strict..."
              className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-400 bg-transparent"
              onKeyDown={(e) => e.key === 'Enter' && handleRewrite()}
            />
            <button 
              onClick={handleRewrite}
              disabled={isRewriting || !aiInstruction}
              className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-full hover:bg-amber-600 disabled:opacity-50 font-semibold flex items-center gap-1"
            >
              {isRewriting ? '...' : <><Sparkles className="w-3 h-3" /> Rewrite</>}
            </button>
          </div>
        )}

        <textarea 
          value={tempText}
          onChange={(e) => setTempText(e.target.value)}
          className="w-full min-h-[120px] p-3 rounded-xl border border-[#f1e4d6] focus:border-amber-300 focus:ring-2 focus:ring-amber-100 outline-none resize-none text-sm text-gray-800 bg-white"
        />
      </div>
    );
  }

  return (
    <div className="group relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-sans font-semibold text-lg tracking-tight text-gray-900">Interviewer Persona</h3>
        <button
          onClick={() => { setIsEditing(true); setTempText(personality); }}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>
      <p className="text-gray-600 leading-relaxed text-sm">
        {personality}
      </p>
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

      // Start ElevenLabs interview and get session data
      const session = await api.startInterview(
        userId,
        fullConfig
      );

      // Build navigation state with all data needed for Interview page
      // This prevents Interview.tsx from calling startInterview again
      const navigationState = {
        conversationId: session.conversation_id,
        signedUrl: session.signed_url,
        userData: session.user_data,
        interviewConfig: session.interview_config
      };

      // Navigate to the appropriate interview page based on type
      // 'veritas' is the frontend branding for the 'tavus' backend implementation
      if (interviewType === 'veritas' || interviewType === 'tavus') {
        navigate('/live-avatar-interview', { state: navigationState });
      } else {
        navigate('/interview', { state: navigationState });
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
    <div className="space-y-8">
      <div>
        <div className="text-[11px] uppercase tracking-[0.24em] text-amber-700 font-mono">
          Step 1
        </div>
        <h2 className="font-sans font-semibold text-3xl tracking-tight text-gray-900 mt-3">
          Describe the interview you want to practice
        </h2>
        <p className="text-gray-600 mt-2 max-w-2xl">
          Share the role, company, and the skills you want the interviewer to test.
        </p>
      </div>

      <div className="rounded-2xl border border-[#f1e4d6] bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
        <label className="text-[11px] uppercase tracking-[0.24em] text-amber-700 font-mono">
          Your prompt
        </label>
        <textarea
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          placeholder="I want to practice a full-length interview for my Product Manager role at Google..."
          rows={5}
          className="mt-3 w-full rounded-xl border border-[#f1e4d6] bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-100 outline-none"
        />
        <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
          <span>{intent.length} / 10 characters minimum</span>
          {intent.length >= 10 && (
            <span className="text-emerald-600 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Ready
            </span>
          )}
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold text-gray-600 mb-2">
          Try a starter
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
              className="px-4 py-2 rounded-full border border-amber-100 bg-white text-sm text-gray-700 hover:border-amber-200 hover:bg-amber-50 transition"
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleIntentSubmit}
        disabled={intent.length < 10 || loading}
        className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${
          intent.length < 10 || loading
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-amber-500 text-white hover:bg-amber-600 shadow-[0_14px_30px_rgba(251,191,36,0.35)]'
        }`}
      >
        {!loading && <Sparkles className="w-4 h-4" />}
        {loading ? 'Analyzing...' : 'Next'}
      </button>
    </div>
  );

  const renderStep2 = () => {
    const duration = dynamicValues.duration || 8;
    const componentCount = dynamicTree.length;
    const interviewLabel = (interviewType === 'veritas' || interviewType === 'tavus') ? 'Video avatar' : 'Voice AI';

    return (
      <div className="space-y-8">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-amber-700 font-mono">
            Step 2
          </div>
          <h2 className="font-sans font-semibold text-3xl tracking-tight text-gray-900 mt-3">
            Shape the session flow
          </h2>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Adjust the length and preferences below. Everything stays within your guardrails.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.35fr_0.65fr] gap-6">
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#f1e4d6] bg-white/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] animate-fade-in">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-amber-700 font-mono">
                    Duration
                  </div>
                  <h3 className="font-sans font-semibold text-xl tracking-tight text-gray-900 mt-2">
                    Interview length
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Tune the pacing for quick checks or deeper dives.
                  </p>
                </div>
                <div className="rounded-2xl bg-amber-100 px-3 py-2 text-2xl font-semibold text-amber-800">
                  {duration}
                  <span className="text-base text-amber-400 ml-1">min</span>
                </div>
              </div>

              <input
                type="range"
                min={5}
                max={15}
                value={duration}
                onChange={(e) => setDynamicValues(prev => ({ ...prev, duration: Number(e.target.value) }))}
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between mt-3 text-[11px] font-semibold text-gray-500 uppercase tracking-[0.2em]">
                <span>Quick (5)</span>
                <span>Standard (10)</span>
                <span>Deep (15)</span>
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
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-[#f1e4d6] bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
              <div className="text-[11px] uppercase tracking-[0.24em] text-amber-700 font-mono">
                Session snapshot
              </div>
              <h3 className="font-sans font-semibold text-xl tracking-tight text-gray-900 mt-2">
                Ready when you are
              </h3>
              <div className="mt-4 space-y-3 text-sm text-gray-600 mb-6">
                <div className="flex items-center justify-between">
                  <span>Length</span>
                  <span className="font-semibold text-gray-900">{duration} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Modules</span>
                  <span className="font-semibold text-gray-900">
                    {componentCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Experience</span>
                  <span className="font-semibold text-gray-900">{interviewLabel}</span>
                </div>
              </div>

              {/* Start Interview Button moved to bottom */}
            </div>
          </div>
        </div>

        <button
          onClick={handleStartInterview}
          disabled={loading || dynamicTree.length === 0}
          className={`w-full inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-sans font-semibold text-lg transition-all duration-300 ${
            loading || dynamicTree.length === 0
              ? 'text-gray-400 cursor-not-allowed border border-gray-200'
              : 'text-black hover:bg-black hover:text-white border border-black'
          }`}
        >
          {!loading && ((interviewType === 'veritas' || interviewType === 'tavus') ? <Video size={20} /> : <Sparkles size={20} />)}
          {loading && dynamicTree.length === 0 ? 'Generating...' : 'Start Interview'}
        </button>
      </div>
    );
  };

  // Main Render

  return (
    <div className="min-h-screen bg-[#fef9f3] text-gray-900 relative overflow-hidden">
      <div className="absolute top-[-180px] right-[-120px] w-[420px] h-[420px] rounded-full bg-gradient-to-br from-amber-200/60 to-transparent blur-2xl" />
      <div className="absolute bottom-[-220px] left-[-140px] w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-teal-200/50 to-transparent blur-2xl" />

      <div className="relative max-w-6xl mx-auto px-4 py-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-amber-700 font-mono">
              InterviewPro
            </div>
            <h1 className="font-sans font-semibold text-3xl tracking-tight text-gray-900 mt-2">
              Interview setup
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end gap-2">
              <span className="text-[11px] uppercase tracking-[0.24em] text-gray-500 font-mono">
                Step {step} of 2
              </span>
              <div className="flex gap-2">
                {[1, 2].map((i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-10 rounded-full transition-colors ${
                      step >= i ? 'bg-amber-500' : 'bg-amber-100'
                    }`}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                if (step > 1) setStep(step - 1);
                else navigate('/dashboard');
              }}
              className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-amber-50 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </header>

        <div className="rounded-3xl border border-[#f1e4d6] bg-white/85 p-6 md:p-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)] relative min-h-[400px]">
          {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl flex items-start gap-3 border border-red-100">
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
