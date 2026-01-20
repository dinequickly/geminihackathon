import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Flag,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import {
  PlayfulButton,
  PlayfulCard,
  Badge,
  LoadingSpinner,
  PlayfulCharacter
} from '../components/PlayfulUI';
import { api, InterviewPack, InterviewQuestion } from '../lib/api';

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
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-sky-50 to-mint-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" color="primary" />
          <p className="text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (error || !pack || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-sky-50 to-mint-50 flex items-center justify-center p-4">
        <PlayfulCard className="max-w-md text-center">
          <PlayfulCharacter emotion="surprised" size={100} className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">
            {error || 'No questions found in this pack'}
          </p>
          <PlayfulButton onClick={() => navigate(`/pack/${packId}`)} icon={ArrowLeft}>
            Back to Pack
          </PlayfulButton>
        </PlayfulCard>
      </div>
    );
  }

  // Summary View
  if (showSummary) {
    const difficultQuestions = questions.filter(q => markedDifficult.has(q.id));

    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-sky-50 to-mint-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <PlayfulCard className="text-center">
            <PlayfulCharacter emotion="excited" size={120} className="mx-auto mb-6" />

            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Great Job!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              You've completed the {pack.name} flashcard practice
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-sky-50 p-6 rounded-2xl border-2 border-sky-200">
                <div className="text-4xl font-bold text-sky-600 mb-2">
                  {questions.length}
                </div>
                <div className="text-sm text-gray-600">Questions Reviewed</div>
              </div>

              <div className="bg-mint-50 p-6 rounded-2xl border-2 border-mint-200">
                <div className="text-4xl font-bold text-mint-600 mb-2">
                  {completed.size}
                </div>
                <div className="text-sm text-gray-600">Cards Flipped</div>
              </div>

              <div className="bg-coral-50 p-6 rounded-2xl border-2 border-coral-200">
                <div className="text-4xl font-bold text-coral-600 mb-2">
                  {difficultQuestions.length}
                </div>
                <div className="text-sm text-gray-600">Marked Difficult</div>
              </div>
            </div>

            {difficultQuestions.length > 0 && (
              <div className="mb-6 p-6 bg-sunshine-50 rounded-2xl border-2 border-sunshine-200 text-left">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Flag className="w-5 h-5 text-sunshine-600" />
                  Questions to Review
                </h3>
                <ul className="space-y-2">
                  {difficultQuestions.map((q, idx) => (
                    <li key={q.id} className="text-gray-700 text-sm">
                      {idx + 1}. {q.question_text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <PlayfulButton
                variant="secondary"
                icon={ArrowLeft}
                onClick={() => navigate(`/pack/${packId}`)}
              >
                Back to Pack
              </PlayfulButton>

              <PlayfulButton
                variant="sky"
                icon={RotateCcw}
                onClick={handleRestart}
              >
                Practice Again
              </PlayfulButton>

              {difficultQuestions.length > 0 && (
                <PlayfulButton
                  variant="sunshine"
                  icon={Flag}
                  onClick={handleReviewDifficult}
                >
                  Review Difficult
                </PlayfulButton>
              )}
            </div>
          </PlayfulCard>
        </div>
      </div>
    );
  }

  // Flashcard Practice View
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isDifficult = currentQuestion && markedDifficult.has(currentQuestion.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-sky-50 to-mint-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <PlayfulButton
              variant="secondary"
              size="sm"
              icon={ArrowLeft}
              onClick={() => navigate(`/pack/${packId}`)}
            >
              Exit Practice
            </PlayfulButton>

            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-900">{pack.name}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-mint-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-600 text-center">
              Question {currentIndex + 1} of {questions.length}
            </div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="perspective-1000 mb-6">
          <div
            className={`relative w-full transition-transform duration-500 transform-style-3d cursor-pointer ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
            onClick={handleFlip}
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front of Card */}
            <div
              className={`${isFlipped ? 'invisible' : 'visible'}`}
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <PlayfulCard
                variant="sky"
                className="min-h-[400px] flex flex-col items-center justify-center text-center p-12"
              >
                <div className="mb-6">
                  <Badge variant="sky" icon={BookOpen}>
                    Question
                  </Badge>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {currentQuestion?.question_text}
                </h2>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {currentQuestion?.question_type && (
                    <Badge variant="primary">
                      {currentQuestion.question_type}
                    </Badge>
                  )}
                  {currentQuestion?.difficulty && (
                    <Badge
                      variant={
                        currentQuestion.difficulty === 'easy' ? 'mint' :
                        currentQuestion.difficulty === 'hard' ? 'coral' :
                        'sunshine'
                      }
                    >
                      {currentQuestion.difficulty}
                    </Badge>
                  )}
                </div>

                <p className="text-gray-500 mt-8 text-sm">
                  Click to see tips and approach
                </p>
              </PlayfulCard>
            </div>

            {/* Back of Card */}
            <div
              className={`absolute inset-0 ${!isFlipped ? 'invisible' : 'visible'}`}
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <PlayfulCard
                variant="mint"
                className="min-h-[400px] flex flex-col p-12"
              >
                <div className="mb-6">
                  <Badge variant="mint" icon={CheckCircle2}>
                    Tips & Approach
                  </Badge>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    How to Answer:
                  </h3>

                  <div className="space-y-4 text-gray-700">
                    <p>
                      <strong>Structure:</strong> Use the STAR method (Situation, Task, Action, Result) for behavioral questions.
                    </p>
                    <p>
                      <strong>Key Points:</strong> Focus on specific examples from your experience.
                    </p>
                    <p>
                      <strong>Duration:</strong> {currentQuestion?.expected_duration_seconds
                        ? `Aim for ${Math.round(currentQuestion.expected_duration_seconds / 60)} minutes`
                        : 'Take your time to answer thoroughly'}
                    </p>
                  </div>
                </div>

                <p className="text-gray-500 mt-6 text-sm text-center">
                  Click to flip back to question
                </p>
              </PlayfulCard>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <PlayfulButton
            variant="secondary"
            icon={ChevronLeft}
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            Previous
          </PlayfulButton>

          <PlayfulButton
            variant={isDifficult ? 'sunshine' : 'secondary'}
            icon={Flag}
            onClick={handleMarkDifficult}
          >
            {isDifficult ? 'Marked Difficult' : 'Mark Difficult'}
          </PlayfulButton>

          <PlayfulButton
            variant="primary"
            icon={currentIndex === questions.length - 1 ? CheckCircle2 : ChevronRight}
            onClick={handleNext}
          >
            {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
          </PlayfulButton>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-2xl border-2 border-gray-100">
            <div className="text-2xl font-bold text-gray-900">{completed.size}</div>
            <div className="text-sm text-gray-600">Reviewed</div>
          </div>

          <div className="text-center p-4 bg-white rounded-2xl border-2 border-gray-100">
            <div className="text-2xl font-bold text-gray-900">
              {questions.length - currentIndex - 1}
            </div>
            <div className="text-sm text-gray-600">Remaining</div>
          </div>

          <div className="text-center p-4 bg-white rounded-2xl border-2 border-gray-100">
            <div className="text-2xl font-bold text-coral-600">{markedDifficult.size}</div>
            <div className="text-sm text-gray-600">Difficult</div>
          </div>
        </div>
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
