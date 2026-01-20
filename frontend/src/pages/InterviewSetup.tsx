import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  Clock, 
  Briefcase, 
  Building, 
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  PlayfulButton, 
  PlayfulCard, 
  Badge, 
  LoadingSpinner, 
  PlayfulCharacter 
} from '../components/PlayfulUI';
import { api } from '../lib/api';

// Types
interface InterviewConfig {
  interview_type: 'full_interview' | 'quick_practice' | 'specific_focus';
  duration_minutes: number;
  focus_areas: string[];
  company_context: string | null;
  role_context: string | null;
  interview_structure: {
    phase: string;
    duration_minutes: number;
  }[];
}

interface DynamicQuestion {
  id: string;
  text: string;
  type: 'yes_no' | 'choice';
  options?: string[];
}

export default function InterviewSetup() {
  const navigate = useNavigate();
  
  // Steps: 1=Intent, 2=ConfigReview, 3=Context, 4=DynamicQuestions, 5=Creating
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data
  const [intent, setIntent] = useState('');
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [reworkFeedback, setReworkFeedback] = useState('');
  const [showRework, setShowRework] = useState(false);
  const [personalContext, setPersonalContext] = useState('');
  const [dynamicQuestions, setDynamicQuestions] = useState<DynamicQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Handlers

  const handleIntentSubmit = async () => {
    if (intent.length < 20) return;
    setLoading(true);
    setError(null);
    
    try {
      const generatedConfig = await api.generateInterviewConfig(intent);
      setConfig(generatedConfig);
      setStep(2);
    } catch (err: any) {
      console.error('Config generation failed:', err);
      setError(err.message || 'Failed to generate interview plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReworkSubmit = async () => {
    if (!config) return;
    setLoading(true);
    setError(null);

    try {
      const newConfig = await api.generateInterviewConfig(intent, reworkFeedback, config);
      setConfig(newConfig);
      setShowRework(false);
      setReworkFeedback('');
    } catch (err: any) {
      console.error('Rework failed:', err);
      setError(err.message || 'Failed to update plan.');
    } finally {
      setLoading(false);
    }
  };

  const handleContextSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Send context to n8n to get dynamic questions
      const questions = await api.getDynamicQuestions(intent, config!, personalContext);
      setDynamicQuestions(questions);
      setStep(4);
    } catch (err: any) {
      console.error('Failed to get questions:', err);
      // If fails, we can skip to start or show error. Let's show error for now.
      setError(err.message || 'Failed to generate specific questions.');
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
        ...config,
        original_intent: intent,
        personal_context: personalContext,
        dynamic_answers: answers
      };

      // Create conversation
      const { conversation_url } = await api.createTavusConversation(
        'current-user-id', // TODO: Get from context or prop
        JSON.stringify(fullConfig) // Passing as plan for now, or need specific field
      );

      if (conversation_url) {
        // Navigate to the live interview page with the URL
        // We might need to pass state or just let the page fetch the active one
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
          Be specific about the role, company, or skills you want to target.
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
          <span>{intent.length} / 20 characters minimum</span>
          {intent.length >= 20 && (
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
        disabled={intent.length < 20 || loading}
        className="w-full"
        icon={loading ? undefined : Sparkles}
      >
        {loading ? 'Generating Plan...' : 'Generate Plan'}
      </PlayfulButton>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Interview Plan</h2>
        <p className="text-gray-600">Review and customize the structure before we begin.</p>
      </div>

      {config && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Summary Header */}
          <div className="p-6 bg-gradient-to-r from-primary-50 to-primary-100/50 border-b border-primary-100">
            <div className="flex flex-wrap gap-4 mb-4">
              <Badge variant="primary" icon={Clock}>
                {config.duration_minutes} min
              </Badge>
              {config.company_context && (
                <Badge variant="secondary" icon={Building}>
                  {config.company_context}
                </Badge>
              )}
              {config.role_context && (
                <Badge variant="secondary" icon={Briefcase}>
                  {config.role_context}
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {config.focus_areas.map((area) => (
                <span key={area} className="px-2 py-1 bg-white/60 rounded-md text-sm text-primary-700 font-medium">
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="p-6 space-y-4">
            {config.interview_structure.map((phase, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{phase.phase}</h4>
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  {phase.duration_minutes} min
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showRework ? (
        <div className="bg-gray-50 p-4 rounded-xl space-y-3 animate-fade-in">
          <textarea
            value={reworkFeedback}
            onChange={(e) => setReworkFeedback(e.target.value)}
            placeholder="e.g., Make it shorter, focus more on coding..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
            rows={3}
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowRework(false)}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <PlayfulButton
              variant="primary"
              size="sm"
              onClick={handleReworkSubmit}
              disabled={loading || !reworkFeedback}
            >
              {loading ? 'Updating...' : 'Update Plan'}
            </PlayfulButton>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={() => setShowRework(true)}
            className="flex-1 py-3 px-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Rework
          </button>
          <PlayfulButton
            variant="primary"
            onClick={() => setStep(3)}
            className="flex-1"
            icon={ChevronRight}
          >
            Next
          </PlayfulButton>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Context</h2>
        <p className="text-gray-600">
          Optional: Add background info to make the interview more realistic.
        </p>
      </div>

      <div className="space-y-4">
        <textarea
          value={personalContext}
          onChange={(e) => setPersonalContext(e.target.value)}
          placeholder="I have 5 years of experience in React... I recently led a project migrating to Next.js..."
          rows={6}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        
        <div className="text-sm text-gray-500 bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-1">Helpful details to include:</h4>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>Recent projects or achievements</li>
            <li>Specific skills you want to highlight</li>
            <li>Areas you're less confident in</li>
          </ul>
        </div>
      </div>

      <PlayfulButton
        variant="primary"
        size="lg"
        onClick={handleContextSubmit}
        disabled={loading}
        className="w-full"
        icon={loading ? undefined : ChevronRight}
      >
        {loading ? 'Preparing Questions...' : 'Continue'}
      </PlayfulButton>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Final Check</h2>
        <p className="text-gray-600">
          A few quick questions to tailor the interviewer's personality and focus.
        </p>
      </div>

      <div className="space-y-4">
        {dynamicQuestions.map((q) => (
          <PlayfulCard key={q.id} className="space-y-3">
            <h4 className="font-medium text-gray-900">{q.text}</h4>
            <div className="flex flex-wrap gap-2">
              {q.type === 'yes_no' ? (
                <>
                  <button
                    onClick={() => setAnswers(prev => ({ ...prev, [q.id]: 'Yes' }))}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      answers[q.id] === 'Yes'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setAnswers(prev => ({ ...prev, [q.id]: 'No' }))}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      answers[q.id] === 'No'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    No
                  </button>
                </>
              ) : (
                q.options?.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      answers[q.id] === opt
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))
              )}
            </div>
          </PlayfulCard>
        ))}
      </div>

      <PlayfulButton
        variant="sunshine"
        size="lg"
        onClick={handleStartInterview}
        disabled={loading || dynamicQuestions.some(q => !answers[q.id])}
        className="w-full"
        icon={loading ? undefined : Video}
      >
        {loading ? 'Starting Interview...' : 'Start Interview'}
      </PlayfulButton>
    </div>
  );

  // Main Render

  return (
    <div className="min-h-screen bg-cream-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <PlayfulButton
            variant="secondary"
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
            {[1, 2, 3, 4].map(i => (
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
        <PlayfulCard className="min-h-[400px] relative">
            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
        </PlayfulCard>
      </div>
    </div>
  );
}

// Icon for step 4
function Video(props: any) {
    return (
        <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        >
        <path d="m22 8-6 4 6 4V8Z" />
        <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
        </svg>
    )
}
