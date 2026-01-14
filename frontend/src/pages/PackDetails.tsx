import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Mic,
  Clock,
  BarChart3,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import {
  PlayfulButton,
  PlayfulCard,
  Badge,
  LoadingSpinner,
  PlayfulCharacter
} from '../components/PlayfulUI';
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

        // Transform the pack data
        setPack({
          id: data.pack.id,
          name: data.pack.name,
          description: data.pack.description,
          category: data.pack.category,
          is_subscription_only: data.pack.is_subscription_only,
          required_plan: data.pack.required_plan,
          is_custom: data.pack.is_custom,
          created_by_user: false, // Will be set by backend if needed
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
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-sky-50 to-mint-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" color="primary" />
          <p className="text-gray-600">Loading pack details...</p>
        </div>
      </div>
    );
  }

  if (error || !pack) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-sky-50 to-mint-50 flex items-center justify-center p-4">
        <PlayfulCard className="max-w-md text-center">
          <PlayfulCharacter emotion="surprised" size={100} className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error || 'Pack not found'}</p>
          <PlayfulButton onClick={() => navigate('/dashboard')} icon={ArrowLeft}>
            Back to Dashboard
          </PlayfulButton>
        </PlayfulCard>
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
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-sky-50 to-mint-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <PlayfulButton
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            Back to Dashboard
          </PlayfulButton>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-bold text-gray-900">{pack.name}</h1>
                {pack.is_subscription_only && (
                  <Badge variant="sunshine" icon={Sparkles}>
                    Premium
                  </Badge>
                )}
                {pack.is_custom && (
                  <Badge variant="mint">
                    Custom
                  </Badge>
                )}
              </div>

              <p className="text-lg text-gray-600 mb-4">
                {pack.description || 'Practice interview questions with this pack.'}
              </p>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{questions.length} questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>~{Math.round(totalDuration / 60)} min total</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="capitalize">{pack.category}</span>
                </div>
              </div>
            </div>

            <PlayfulCharacter emotion="excited" size={100} />
          </div>
        </div>

        {/* Practice Mode Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Flashcard Mode */}
          <div onClick={handleFlashcardPractice}>
            <PlayfulCard variant="sky" hover className="cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-sky-500 text-white p-3 rounded-2xl">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Flashcard Practice
              </h3>
              <p className="text-gray-600 mb-4">
                Review questions at your own pace. Perfect for quick prep and memorization.
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>~{Math.round(avgDuration / 60)} min per question</span>
                </div>
                <ChevronRight className="w-5 h-5 text-sky-600" />
              </div>
            </PlayfulCard>
          </div>

          {/* Audio Mode - Coming Soon */}
          <PlayfulCard variant="sunshine" className="opacity-75 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <Badge variant="coral">
                Coming Soon
              </Badge>
            </div>

            <div className="flex items-start justify-between mb-4">
              <div className="bg-sunshine-500 text-white p-3 rounded-2xl">
                <Mic className="w-6 h-6" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Audio Practice
            </h3>
            <p className="text-gray-600 mb-4">
              Record and analyze your spoken responses. Get detailed feedback on delivery.
            </p>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Sparkles className="w-4 h-4" />
              <span>AI-powered speech analysis</span>
            </div>
          </PlayfulCard>
        </div>

        {/* Questions List */}
        <PlayfulCard className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Questions in this Pack
            </h2>

            {/* Difficulty Distribution */}
            <div className="flex items-center gap-2">
              {Object.entries(difficultyCount).map(([difficulty, count]) => {
                const colors = {
                  easy: 'mint',
                  medium: 'sunshine',
                  hard: 'coral',
                } as const;

                return (
                  <Badge
                    key={difficulty}
                    variant={colors[difficulty as keyof typeof colors] || 'primary'}
                  >
                    {difficulty}: {count}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <p className="text-gray-900 font-medium mb-2">
                      {question.question_text}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="capitalize">{question.question_type}</span>
                      {question.difficulty && (
                        <Badge
                          variant={
                            question.difficulty === 'easy' ? 'mint' :
                            question.difficulty === 'hard' ? 'coral' :
                            'sunshine'
                          }
                        >
                          {question.difficulty}
                        </Badge>
                      )}
                      {question.expected_duration_seconds && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.round(question.expected_duration_seconds / 60)} min
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PlayfulCard>
      </div>
    </div>
  );
}
