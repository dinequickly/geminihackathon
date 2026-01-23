import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Flag,
  CheckCircle2
} from 'lucide-react';
import { LiquidButton } from '../components/LiquidButton';
import { LiquidGlass } from '../components/LiquidGlass';
import { LightLeakBackground } from '../components/LightLeakBackground';
import { LoadingSpinner } from '../components/PlayfulUI';
import { api, InterviewPack, InterviewQuestion } from '../lib/api';
import { posthog } from '../lib/posthog';

interface FlashcardPracticeProps {
  userId: string;
}

export default function FlashcardPractice({ userId: _userId }: FlashcardPracticeProps) {
  const { packId } = useParams<{ packId: string }>();
  const navigate = useNavigate();

  const [pack, setPack] = useState<InterviewPack | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [markedDifficult, setMarkedDifficult] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);

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

        posthog.capture('flashcard_practice_started', {
          pack_id: packId,
          pack_name: data.pack.name,
          question_count: data.questions.length,
          category: data.pack.category
        });
      } catch (err) {
        console.error('Failed to load pack details:', err);
        setError('Failed to load pack details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadPackDetails();
  }, [packId]);

  const currentQuestion = questions[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped && currentQuestion) {
      setCompleted(new Set([...completed, currentQuestion.id]));
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setShowSummary(true);
      posthog.capture('flashcard_practice_completed', {
        pack_id: packId,
        pack_name: pack?.name,
        questions_reviewed: completed.size,
        questions_marked_difficult: markedDifficult.size,
        total_questions: questions.length
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleMarkDifficult = () => {
    if (!currentQuestion) return;

    const newMarked = new Set(markedDifficult);
    if (newMarked.has(currentQuestion.id)) {
      newMarked.delete(currentQuestion.id);
    } else {
      newMarked.add(currentQuestion.id);
    }
    setMarkedDifficult(newMarked);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompleted(new Set());
    setShowSummary(false);
  };

  const handleReviewDifficult = () => {
    const difficultQuestions = questions.filter(q => markedDifficult.has(q.id));
    if (difficultQuestions.length > 0) {
      setQuestions(difficultQuestions);
      setMarkedDifficult(new Set());
      setCurrentIndex(0);
      setIsFlipped(false);
      setCompleted(new Set());
      setShowSummary(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  if (error || !pack || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white relative">
        <LightLeakBackground />
        <LiquidGlass className="max-w-md text-center p-8">
          <h2 className="font-sans font-bold text-3xl tracking-tight text-black mb-4">Error</h2>
          <p className="text-gray-600 mb-8 font-light">{error || 'No questions found'}</p>
          <LiquidButton onClick={() => navigate(`/pack/${packId}`)} icon={<ArrowLeft size={16} />} variant="black">
            Back to Pack
          </LiquidButton>
        </LiquidGlass>
      </div>
    );
  }

  // Summary View
  if (showSummary) {
    const difficultQuestions = questions.filter(q => markedDifficult.has(q.id));

    return (
      <div className="min-h-screen relative overflow-hidden font-sans selection:bg-pink-100">
        <LightLeakBackground />
        
        <div className="max-w-4xl mx-auto px-6 py-24 relative z-10">
          <LiquidGlass className="text-center p-16">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 text-green-600">
              <CheckCircle2 size={32} />
            </div>

            <h1 className="font-sans font-bold text-5xl tracking-tight text-black mb-4">
              Session Complete
            </h1>
            <p className="text-xl text-gray-600 font-light mb-12">
              You've reviewed all cards in <span className="font-medium text-black">{pack.name}</span>.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="p-6 border border-gray-100 rounded-2xl bg-white/50">
                <div className="font-mono text-4xl text-black mb-1">{questions.length}</div>
                <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Total Cards</div>
              </div>

              <div className="p-6 border border-gray-100 rounded-2xl bg-white/50">
                <div className="font-mono text-4xl text-black mb-1">{completed.size}</div>
                <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Flipped</div>
              </div>

              <div className="p-6 border border-gray-100 rounded-2xl bg-white/50">
                <div className="font-mono text-4xl text-black mb-1">{difficultQuestions.length}</div>
                <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Marked Difficult</div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <LiquidButton variant="ghost" onClick={() => navigate(`/pack/${packId}`)}>
                Back to Pack
              </LiquidButton>
              <LiquidButton variant="black" onClick={handleRestart} icon={<RotateCcw size={16} />}>
                Practice Again
              </LiquidButton>
              {difficultQuestions.length > 0 && (
                <LiquidButton variant="secondary" onClick={handleReviewDifficult}>
                  Review Difficult
                </LiquidButton>
              )}
            </div>
          </LiquidGlass>
        </div>
      </div>
    );
  }

  // Flashcard Practice View
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isDifficult = currentQuestion && markedDifficult.has(currentQuestion.id);

  return (
    <div className="min-h-screen relative overflow-hidden font-sans selection:bg-pink-100">
      <LightLeakBackground />

      <main className="max-w-4xl mx-auto px-6 py-12 relative z-10 flex flex-col min-h-screen justify-center">
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
           <LiquidButton variant="ghost" size="sm" onClick={() => navigate(`/pack/${packId}`)} icon={<ArrowLeft size={16} />}>
             Exit
           </LiquidButton>
           
           <div className="flex flex-col items-end">
             <span className="font-sans font-semibold text-lg tracking-tight text-black">{pack.name}</span>
             <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
               Card {currentIndex + 1} / {questions.length}
             </span>
           </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-200 rounded-full mb-12 overflow-hidden">
          <div 
            className="h-full bg-black transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Flashcard Area */}
        <div className="perspective-1000 mb-12 h-[500px] w-full relative">
          <div
            className={`w-full h-full transition-transform duration-700 transform-style-3d cursor-pointer ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
            onClick={handleFlip}
          >
            {/* Front */}
            <div className="absolute inset-0 backface-hidden">
              <LiquidGlass className="h-full flex flex-col items-center justify-center p-16 text-center border-2 !border-gray-100 shadow-xl">
                <span className="font-mono text-xs text-gray-400 uppercase tracking-widest mb-8 border border-gray-200 px-3 py-1 rounded-full">
                  Question
                </span>
                
                <h2 className="font-sans font-semibold text-4xl tracking-tight text-black leading-tight mb-8">
                  {currentQuestion?.question_text}
                </h2>

                <div className="flex gap-3">
                  {currentQuestion?.question_type && (
                     <span className="font-mono text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded uppercase tracking-widest">
                       {currentQuestion.question_type}
                     </span>
                  )}
                  {currentQuestion?.difficulty && (
                     <span className={`font-mono text-[10px] px-2 py-1 rounded uppercase tracking-widest ${
                       currentQuestion.difficulty === 'hard' ? 'bg-red-50 text-red-600' : 
                       currentQuestion.difficulty === 'easy' ? 'bg-green-50 text-green-600' : 
                       'bg-yellow-50 text-yellow-600'
                     }`}>
                       {currentQuestion.difficulty}
                     </span>
                  )}
                </div>
                
                <p className="mt-12 text-sm text-gray-400 font-light">Click card to reveal approach</p>
              </LiquidGlass>
            </div>

            {/* Back */}
            <div className="absolute inset-0 backface-hidden rotate-y-180">
              <LiquidGlass className="h-full flex flex-col p-16 !bg-white/60 border-2 !border-blue-100 shadow-xl">
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                     <CheckCircle2 size={16} />
                   </div>
                   <span className="font-mono text-xs text-blue-600 uppercase tracking-widest font-bold">
                     Recommended Approach
                   </span>
                </div>

                <div className="flex-1 space-y-6 text-gray-800 text-lg font-light leading-relaxed">
                   <p>
                     <strong className="font-sans font-semibold text-black block mb-2">Structure</strong>
                     Use the STAR method (Situation, Task, Action, Result) to keep your answer focused.
                   </p>
                   <p>
                     <strong className="font-sans font-semibold text-black block mb-2">Key Focus</strong>
                     Highlight your specific contribution and the impact on the business or team.
                   </p>
                </div>
                
                <p className="mt-8 text-sm text-gray-400 font-light text-center">Click card to see question</p>
              </LiquidGlass>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
           <LiquidButton 
             variant="ghost" 
             onClick={handlePrevious} 
             disabled={currentIndex === 0}
             icon={<ChevronLeft size={20} />}
           >
             Prev
           </LiquidButton>

           <button 
             onClick={handleMarkDifficult}
             className={`flex flex-col items-center gap-2 transition-colors ${isDifficult ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
           >
             <Flag size={24} fill={isDifficult ? "currentColor" : "none"} />
             <span className="text-[10px] font-mono uppercase tracking-widest">
               {isDifficult ? 'Flagged' : 'Flag'}
             </span>
           </button>

           <LiquidButton 
             variant="black" 
             onClick={handleNext}
             icon={currentIndex === questions.length - 1 ? <CheckCircle2 size={20} /> : <ChevronRight size={20} />}
             iconPosition="right"
           >
             {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
           </LiquidButton>
        </div>

      </main>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}