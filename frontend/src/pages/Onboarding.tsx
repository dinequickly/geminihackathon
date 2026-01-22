import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { LiquidGlass } from '../components/LiquidGlass';
import { LiquidButton } from '../components/LiquidButton';
import { LightLeakBackground } from '../components/LightLeakBackground';

interface OnboardingProps {
  onComplete: (userId: string) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0: Email, 1: Profile (New), 2: Job
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    linkedinUrl: '',
    jobDescription: ''
  });

  const handleEmailSubmit = async () => {
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    if (!formData.password) {
        setError('Please enter a password');
        return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await api.checkUser(formData.email, formData.password);
      
      if (result.exists) {
        if (result.password_valid) {
            // Login successful
            onComplete(result.user!.id);
            navigate('/dashboard');
        } else if (result.password_valid === false) {
            setError('Incorrect password');
        } else {
            // Legacy user without password or something else?
            // For now treat as login success if backend didn't complain about validity (e.g. if we allowed no-pass login)
             if (result.user) {
                 onComplete(result.user.id);
                 navigate('/dashboard');
             }
        }
      } else {
        // New user - go to profile setup
        setIsNewUser(true);
        setStep(1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.jobDescription) {
      setError('Please provide a job description');
      return;
    }

    if (!formData.name && isNewUser) {
        setError('Name is missing');
        return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await api.onboardUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        linkedin_url: formData.linkedinUrl || undefined,
        job_description: formData.jobDescription
      });

      onComplete(result.user_id);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-sans selection:bg-pink-100">
      <LightLeakBackground />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex flex-col items-center justify-center">
              <span className="font-serif text-2xl font-bold tracking-tight text-black mb-2">TAVUS</span>
              <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Interview Onboarding</span>
            </div>
          </div>

          {/* Form Card */}
          <LiquidGlass className="p-12">
          {error && (
            <div className="mb-8 p-4 bg-red-50/50 border border-red-200/50 rounded-lg text-red-600 text-sm flex items-center gap-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {step === 0 && (
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-3xl text-black mb-2">Welcome</h2>
                <p className="text-gray-600 font-light">Enter your email to get started or sign in.</p>
              </div>

              <div>
                <label className="block text-sm font-mono text-gray-700 mb-3 uppercase tracking-widest">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-300 bg-white/50 focus:ring-2 focus:ring-black focus:border-transparent transition font-light"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-mono text-gray-700 mb-3 uppercase tracking-widest">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-300 bg-white/50 focus:ring-2 focus:ring-black focus:border-transparent transition font-light"
                  placeholder="••••••••"
                />
              </div>

              <LiquidButton
                onClick={handleEmailSubmit}
                disabled={isLoading}
                loading={isLoading}
                variant="black"
                size="lg"
                icon={!isLoading && <ArrowRight size={16} />}
                iconPosition="right"
              >
                {isLoading ? 'Checking...' : 'Continue'}
              </LiquidButton>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-3xl text-black mb-2">Create your profile</h2>
              </div>

              <div>
                <label className="block text-sm font-mono text-gray-700 mb-3 uppercase tracking-widest">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-300 bg-white/50 focus:ring-2 focus:ring-black focus:border-transparent transition font-light"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-mono text-gray-700 mb-3 uppercase tracking-widest">
                  LinkedIn Profile URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-300 bg-white/50 focus:ring-2 focus:ring-black focus:border-transparent transition font-light"
                  placeholder="https://linkedin.com/in/johndoe"
                />
                <p className="mt-3 text-xs text-gray-500 font-light">
                  We'll analyze your profile to personalize interview questions
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <LiquidButton
                  onClick={() => setStep(0)}
                  variant="secondary"
                  size="lg"
                >
                  Back
                </LiquidButton>
                <LiquidButton
                  onClick={() => {
                    if (formData.name) {
                      setStep(2);
                    } else {
                      setError('Please fill in your name');
                    }
                  }}
                  variant="black"
                  size="lg"
                  icon={<ArrowRight size={16} />}
                  iconPosition="right"
                >
                  Continue
                </LiquidButton>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-3xl text-black mb-2">Target Job Details</h2>
              </div>

              <div>
                <label className="block text-sm font-mono text-gray-700 mb-3 uppercase tracking-widest">
                  Job Description
                </label>
                <textarea
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-300 bg-white/50 focus:ring-2 focus:ring-black focus:border-transparent transition h-48 resize-none font-light"
                  placeholder="Paste the job description here...

Include:
- Job title and company
- Required skills and qualifications
- Responsibilities
- Any specific requirements"
                />
                <p className="mt-3 text-xs text-gray-500 font-light">
                  The more details you provide, the better we can tailor your interview
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <LiquidButton
                  onClick={() => setStep(isNewUser ? 1 : 0)}
                  variant="secondary"
                  size="lg"
                >
                  Back
                </LiquidButton>
                <LiquidButton
                  onClick={handleSubmit}
                  disabled={isLoading}
                  loading={isLoading}
                  variant="black"
                  size="lg"
                  icon={!isLoading && <ArrowRight size={16} />}
                  iconPosition="right"
                >
                  {isLoading ? 'Processing...' : 'Start Practicing'}
                </LiquidButton>
              </div>
            </div>
          )}
          </LiquidGlass>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 font-light mt-8">
            Your data is secure and used only to personalize your interview experience
          </p>
        </div>
      </div>
    </div>
  );
}