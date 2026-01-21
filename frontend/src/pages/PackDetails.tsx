import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Mic,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { LiquidButton } from '../components/LiquidButton';
import { LiquidGlass } from '../components/LiquidGlass';
import { LightLeakBackground } from '../components/LightLeakBackground';
import { LoadingSpinner } from '../components/PlayfulUI';
import { api, InterviewPack, InterviewQuestion } from '../lib/api';

interface PackDetailsProps {
  userId: string;
}

export default function PackDetails({ userId: _userId }: PackDetailsProps) {
  const { packId } = useParams<{ packId: string }>();
  const navigate = useNavigate();

  const [pack, setPack] = useState<InterviewPack | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!packId) return;

    const loadPackDetails = async () => {
      try {
        setLoading(true);
        const data = await api.getPackDetails(packId);

        setPack({
          id: data.pack.id,
          name: data.pack.name,
          description: data.pack.description,
          category: data.pack.category,
          is_subscription_only: data.pack.is_subscription_only,
          required_plan: data.pack.required_plan,
          is_custom: data.pack.is_custom,
          created_by_user: false,
          question_count: data.question_count,
          created_at: data.pack.created_at,
          updated_at: data.pack.updated_at,
        });

        setQuestions(data.questions);
      } catch (err) {
        console.error('Failed to load pack details:', err);
        setError('Failed to load pack details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadPackDetails();
  }, [packId]);

  const handleFlashcardPractice = () => {
    navigate(`/pack/${packId}/flashcards`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  if (error || !pack) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white relative">
        <LightLeakBackground />
        <LiquidGlass className="max-w-md text-center p-8">
          <h2 className="font-serif text-3xl font-bold text-black mb-4">Unavailable</h2>
          <p className="text-gray-600 mb-8 font-light">{error || 'Pack not found'}</p>
          <LiquidButton onClick={() => navigate('/dashboard')} icon={<ArrowLeft size={16} />} variant="black">
            Back to Dashboard
          </LiquidButton>
        </LiquidGlass>
      </div>
    );
  }

  // Calculate difficulty distribution
  const difficultyCount = questions.reduce((acc, q) => {
    const diff = q.difficulty || 'medium';
    acc[diff] = (acc[diff] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate average duration
  const avgDuration = questions.reduce((sum, q) => sum + (q.expected_duration_seconds || 0), 0) / questions.length;
  const totalDuration = questions.reduce((sum, q) => sum + (q.expected_duration_seconds || 0), 0);

  return (
    <div className="min-h-screen relative overflow-hidden text-gray-900 font-sans selection:bg-pink-100">
      <LightLeakBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between border-b border-gray-200/50 bg-white/30 backdrop-blur-md">
        <div className="flex flex-col">
          <span className="font-serif text-xl font-bold tracking-tight text-black">TAVUS</span>
          <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Pack Details</span>
        </div>
        <LiquidButton
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          icon={<ArrowLeft size={16} />}
        >
          Back
        </LiquidButton>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-24 relative z-10">
        
        {/* Pack Info */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs text-black uppercase tracking-widest border border-gray-200 px-2 py-0.5 rounded">
              {pack.category}
            </span>
            {pack.is_subscription_only && (
              <span className="font-mono text-xs text-white bg-black uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-1">
                <Sparkles size={10} /> Premium
              </span>
            )}
            {pack.is_custom && (
              <span className="font-mono text-xs text-black border border-black uppercase tracking-widest px-2 py-0.5 rounded">
                Custom
              </span>
            )}
          </div>

          <h1 className="font-serif text-6xl text-black mb-6">{pack.name}</h1>
          
          <p className="text-xl text-gray-600 font-light max-w-3xl leading-relaxed mb-8">
            {pack.description || 'Practice interview questions with this pack.'}
          </p>

          <div className="flex items-center gap-8 text-sm text-gray-500 font-mono uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>{questions.length} questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>~{Math.round(totalDuration / 60)} min total</span>
            </div>
          </div>
        </div>

        {/* Practice Modes */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Flashcard Mode */}
          <div onClick={handleFlashcardPractice} className="cursor-pointer group">
            <LiquidGlass className="p-8 h-full flex flex-col justify-between hover:!border-black/20 transition-all">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-black">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-black transition-colors" />
                </div>

                <h3 className="font-serif text-3xl text-black mb-2">
                  Flashcards
                </h3>
                <p className="text-gray-600 font-light text-sm">
                  Review questions at your own pace. Perfect for quick prep.
                </p>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
                <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
                  ~{Math.round(avgDuration / 60)} min / q
                </span>
                <span className="font-mono text-xs text-black font-bold uppercase tracking-widest group-hover:underline">
                  Start Practice
                </span>
              </div>
            </LiquidGlass>
          </div>

          {/* Audio Mode - Coming Soon */}
          <LiquidGlass className="p-8 h-full flex flex-col justify-between opacity-60">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-400">
                  <Mic className="w-6 h-6" />
                </div>
                <span className="font-mono text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase tracking-widest">
                  Coming Soon
                </span>
              </div>

              <h3 className="font-serif text-3xl text-gray-400 mb-2">
                Audio Mode
              </h3>
              <p className="text-gray-500 font-light text-sm">
                Record and analyze your spoken responses with AI feedback.
              </p>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-100 flex items-center gap-2 text-gray-400">
              <Sparkles className="w-4 h-4" />
              <span className="font-mono text-xs uppercase tracking-widest">AI Analysis</span>
            </div>
          </LiquidGlass>
        </div>

        {/* Questions List */}
        <div className="mb-8">
          <div className="flex items-end justify-between mb-8 border-b border-gray-200/50 pb-4">
            <h2 className="font-serif text-3xl text-black">Questions</h2>
            <div className="flex gap-2">
              {Object.entries(difficultyCount).map(([difficulty, count]) => (
                <span key={difficulty} className="font-mono text-[10px] text-gray-500 uppercase tracking-widest border border-gray-200 px-2 py-0.5 rounded">
                  {difficulty}: {count}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((question, index) => (
              <LiquidGlass key={question.id} className="p-6 flex items-start gap-6 group">
                <div className="font-mono text-xl text-gray-300 font-bold w-8 group-hover:text-black transition-colors">
                  {(index + 1).toString().padStart(2, '0')}
                </div>

                <div className="flex-1">
                  <p className="text-lg text-gray-900 font-medium mb-3">
                    {question.question_text}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-mono text-gray-500 uppercase tracking-wider">
                    <span className="border-r border-gray-200 pr-4">{question.question_type}</span>
                    <span className={`border-r border-gray-200 pr-4 ${
                      question.difficulty === 'hard' ? 'text-red-500' : 
                      question.difficulty === 'easy' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {question.difficulty}
                    </span>
                    {question.expected_duration_seconds && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {Math.round(question.expected_duration_seconds / 60)} min
                      </span>
                    )}
                  </div>
                </div>
              </LiquidGlass>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}