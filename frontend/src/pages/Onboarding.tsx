import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, User, Linkedin, ArrowRight, Loader2, Mail } from 'lucide-react';
import { api } from '../lib/api';

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
    linkedinUrl: '',
    jobDescription: ''
  });

  const handleEmailSubmit = async () => {
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await api.checkUser(formData.email);
      
      if (result.exists && result.user) {
        // Existing user - skip to job details
        setFormData(prev => ({
          ...prev,
          name: result.user!.name,
          linkedinUrl: result.user!.linkedin_url || '',
          jobDescription: result.user!.job_description || ''
        }));
        setStep(2);
      } else {
        // New user - go to profile setup
        setIsNewUser(true);
        setStep(1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify email');
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500 text-white mb-4">
            <Briefcase className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">InterviewPro</h1>
          <p className="text-gray-600 mt-2">AI-powered interview practice</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {step === 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Welcome</h2>
              <p className="text-gray-600">Enter your email to get started or sign in.</p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  placeholder="john@example.com"
                />
              </div>

              <button
                onClick={handleEmailSubmit}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition"
              >
                 {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Create your profile</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Linkedin className="w-4 h-4 inline mr-2" />
                  LinkedIn Profile URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  placeholder="https://linkedin.com/in/johndoe"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  We'll analyze your profile to personalize interview questions
                </p>
              </div>

              <div className="flex gap-3">
                 <button
                  onClick={() => setStep(0)}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
                >
                  Back
                </button>
                <button
                    onClick={() => {
                    if (formData.name) {
                        setStep(2);
                    } else {
                        setError('Please fill in your name');
                    }
                    }}
                    className="flex-1 py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition"
                >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Target Job Details</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="w-4 h-4 inline mr-2" />
                  Job Description *
                </label>
                <textarea
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition h-48 resize-none"
                  placeholder="Paste the job description here...

Include:
- Job title and company
- Required skills and qualifications
- Responsibilities
- Any specific requirements"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  The more details you provide, the better we can tailor your interview
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(isNewUser ? 1 : 0)}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Start Practicing
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Your data is secure and used only to personalize your interview experience
        </p>
      </div>
    </div>
  );
}