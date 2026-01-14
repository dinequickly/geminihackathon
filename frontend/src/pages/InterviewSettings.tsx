import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Settings,
  Zap,
  Users,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Lock,
  Sparkles
} from 'lucide-react';
import { api, UserInterviewAgent, InterviewerMoodPreset, UserInterviewPreferences, UserProgressSummary, UserSubscription } from '../lib/api';
import { PlayfulButton, PlayfulCard, Badge, LoadingSpinner } from '../components/PlayfulUI';

interface InterviewSettingsProps {
  userId: string;
}

type TabType = 'agents' | 'moods' | 'progress';

const MOOD_ICONS: Record<string, { color: string; desc: string }> = {
  'Supportive': { color: 'bg-mint-100 text-mint-700 border-mint-300', desc: 'Encouraging, patient, builds confidence' },
  'Challenging': { color: 'bg-coral-100 text-coral-700 border-coral-300', desc: 'Tough follow-ups, stress-tests answers' },
  'Neutral': { color: 'bg-gray-100 text-gray-700 border-gray-300', desc: 'Professional, balanced, standard interview' },
  'Fast-paced': { color: 'bg-primary-100 text-primary-700 border-primary-300', desc: 'Quick questions, time pressure' },
  'Detailed': { color: 'bg-sky-100 text-sky-700 border-sky-300', desc: 'Deep dives, probing questions' },
  'Stress-test': { color: 'bg-red-100 text-red-700 border-red-300', desc: 'High pressure, curveballs, interruptions' },
};

export default function InterviewSettings({ userId }: InterviewSettingsProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('agents');

  // Agents state
  const [agents, setAgents] = useState<UserInterviewAgent[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<UserInterviewAgent | null>(null);
  const [agentForm, setAgentForm] = useState({ agent_name: '', system_prompt: '' });

  // Moods state
  const [moods, setMoods] = useState<InterviewerMoodPreset[]>([]);
  const [isLoadingMoods, setIsLoadingMoods] = useState(true);

  // Preferences state
  const [preferences, setPreferences] = useState<UserInterviewPreferences | null>(null);
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(true);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  // Subscription state
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);

  // Progress state
  const [progressSummary, setProgressSummary] = useState<UserProgressSummary[]>([]);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  // Load data
  useEffect(() => {
    loadAllData();
  }, [userId]);

  const loadAllData = async () => {
    await Promise.all([
      loadAgents(),
      loadMoods(),
      loadPreferences(),
      loadSubscription(),
      loadProgress()
    ]);
  };

  const loadAgents = async () => {
    try {
      setIsLoadingAgents(true);
      const data = await api.getUserAgents(userId);
      setAgents(data.agents);
    } catch (err) {
      console.error('Failed to load agents:', err);
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const loadMoods = async () => {
    try {
      setIsLoadingMoods(true);
      const data = await api.getInterviewerMoods();
      setMoods(data.presets);
    } catch (err) {
      console.error('Failed to load moods:', err);
    } finally {
      setIsLoadingMoods(false);
    }
  };

  const loadPreferences = async () => {
    try {
      setIsLoadingPrefs(true);
      const data = await api.getInterviewPreferences(userId);
      setPreferences(data);
    } catch (err) {
      console.error('Failed to load preferences:', err);
    } finally {
      setIsLoadingPrefs(false);
    }
  };

  const loadSubscription = async () => {
    try {
      const data = await api.getUserSubscription(userId);
      setSubscription(data);
    } catch (err) {
      console.error('Failed to load subscription:', err);
    }
  };

  const loadProgress = async () => {
    try {
      setIsLoadingProgress(true);
      const data = await api.getUserProgressSummary(userId);
      setProgressSummary(data.summary);
    } catch (err) {
      console.error('Failed to load progress:', err);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  // Agent handlers
  const handleCreateAgent = async () => {
    if (!agentForm.agent_name || !agentForm.system_prompt) return;

    try {
      await api.createUserAgent(userId, agentForm);
      setAgentForm({ agent_name: '', system_prompt: '' });
      setShowAgentForm(false);
      loadAgents();
    } catch (err) {
      console.error('Failed to create agent:', err);
      alert('Failed to create agent');
    }
  };

  const handleUpdateAgent = async () => {
    if (!editingAgent) return;

    try {
      await api.updateUserAgent(userId, editingAgent.id, agentForm);
      setAgentForm({ agent_name: '', system_prompt: '' });
      setEditingAgent(null);
      loadAgents();
    } catch (err) {
      console.error('Failed to update agent:', err);
      alert('Failed to update agent');
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      await api.deleteUserAgent(userId, agentId);
      loadAgents();
    } catch (err) {
      console.error('Failed to delete agent:', err);
      alert('Failed to delete agent');
    }
  };

  const handleActivateAgent = async (agentId: string) => {
    try {
      // Deactivate all other agents
      await Promise.all(agents.map(a =>
        a.id !== agentId ? api.updateUserAgent(userId, a.id, { is_active: false }) : Promise.resolve()
      ));
      // Activate selected agent
      await api.updateUserAgent(userId, agentId, { is_active: true });
      await api.updateInterviewPreferences(userId, { custom_agent_id: agentId });
      loadAgents();
      loadPreferences();
    } catch (err) {
      console.error('Failed to activate agent:', err);
      alert('Failed to activate agent');
    }
  };

  const startEdit = (agent: UserInterviewAgent) => {
    setEditingAgent(agent);
    setAgentForm({ agent_name: agent.agent_name, system_prompt: agent.system_prompt });
    setShowAgentForm(true);
  };

  const cancelEdit = () => {
    setEditingAgent(null);
    setAgentForm({ agent_name: '', system_prompt: '' });
    setShowAgentForm(false);
  };

  // Mood handlers
  const handleSelectMood = async (presetId: string) => {
    try {
      setIsSavingPrefs(true);
      await api.updateInterviewPreferences(userId, { selected_mood_preset_id: presetId });
      loadPreferences();
    } catch (err) {
      console.error('Failed to select mood:', err);
      alert('Failed to select mood');
    } finally {
      setIsSavingPrefs(false);
    }
  };

  // Dynamic behavior toggle
  const handleToggleDynamic = async (value: boolean) => {
    if (value && !subscription?.has_subscription) {
      alert('Dynamic behavior is only available for subscribers');
      return;
    }

    try {
      setIsSavingPrefs(true);
      await api.updateInterviewPreferences(userId, { use_dynamic_behavior: value });
      loadPreferences();
    } catch (err) {
      console.error('Failed to toggle dynamic behavior:', err);
      alert('Failed to update preferences');
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <header className="bg-white border-b-2 border-primary-100 shadow-soft">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-3 hover:bg-primary-50 rounded-2xl transition-all duration-300 hover:scale-110"
          >
            <ArrowLeft className="w-5 h-5 text-primary-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-7 h-7 text-primary-500" />
              Interview Settings
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">
              Customize your interview experience
            </p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 mt-6">
        <div className="flex gap-2 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('agents')}
            className={`px-6 py-3 font-semibold transition-all duration-300 border-b-4 ${
              activeTab === 'agents'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Agent Setup
            </div>
          </button>
          <button
            onClick={() => setActiveTab('moods')}
            className={`px-6 py-3 font-semibold transition-all duration-300 border-b-4 ${
              activeTab === 'moods'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Interviewer Mood
            </div>
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-6 py-3 font-semibold transition-all duration-300 border-b-4 ${
              activeTab === 'progress'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Progress
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'agents' && (
          <div className="space-y-6">
            {/* Dynamic Behavior Toggle */}
            <PlayfulCard variant="white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">Dynamic Interview Behavior</h3>
                    {!subscription?.has_subscription && (
                      <Badge variant="primary">
                        <Lock className="w-3 h-3" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    AI adapts questioning style based on your responses in real-time
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences?.use_dynamic_behavior || false}
                    onChange={(e) => handleToggleDynamic(e.target.checked)}
                    disabled={isLoadingPrefs || isSavingPrefs}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </PlayfulCard>

            {/* Custom Agents */}
            <PlayfulCard variant="white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    Custom Interview Agents
                    <Sparkles className="w-5 h-5 text-primary-500" />
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Create personalized AI interviewers with custom prompts
                  </p>
                </div>
                {!showAgentForm && (
                  <PlayfulButton
                    onClick={() => setShowAgentForm(true)}
                    variant="primary"
                    size="sm"
                    icon={Plus}
                  >
                    New Agent
                  </PlayfulButton>
                )}
              </div>

              {/* Agent Form */}
              {showAgentForm && (
                <div className="mb-6 p-6 bg-cream-50 rounded-3xl border-2 border-primary-200">
                  <h4 className="font-bold text-gray-900 mb-4">
                    {editingAgent ? 'Edit Agent' : 'Create New Agent'}
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Agent Name
                      </label>
                      <input
                        type="text"
                        value={agentForm.agent_name}
                        onChange={(e) => setAgentForm({ ...agentForm, agent_name: e.target.value })}
                        placeholder="e.g., Friendly Goldman Sachs Interviewer"
                        className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        System Prompt (max 2000 chars)
                      </label>
                      <textarea
                        value={agentForm.system_prompt}
                        onChange={(e) => setAgentForm({ ...agentForm, system_prompt: e.target.value })}
                        placeholder="You are a Goldman Sachs interviewer for investment banking positions. Your tone is professional yet encouraging..."
                        className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition resize-none"
                        rows={6}
                        maxLength={2000}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {agentForm.system_prompt.length}/2000 characters
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <PlayfulButton
                        onClick={editingAgent ? handleUpdateAgent : handleCreateAgent}
                        variant="primary"
                        size="md"
                        icon={Check}
                        disabled={!agentForm.agent_name || !agentForm.system_prompt}
                      >
                        {editingAgent ? 'Update' : 'Create'} Agent
                      </PlayfulButton>
                      <PlayfulButton
                        onClick={cancelEdit}
                        variant="secondary"
                        size="md"
                        icon={X}
                      >
                        Cancel
                      </PlayfulButton>
                    </div>
                  </div>
                </div>
              )}

              {/* Agents List */}
              {isLoadingAgents ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" color="primary" />
                </div>
              ) : agents.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No custom agents yet</p>
                  <p className="text-sm text-gray-400">Create your first agent to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {agents.map((agent) => (
                    <div
                      key={agent.id}
                      className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                        agent.is_active
                          ? 'bg-primary-50 border-primary-300 shadow-soft'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-gray-900">{agent.agent_name}</h4>
                            {agent.is_active && (
                              <Badge variant="primary">Active</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {agent.system_prompt}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {!agent.is_active && (
                            <button
                              onClick={() => handleActivateAgent(agent.id)}
                              className="p-2 text-primary-600 hover:bg-primary-100 rounded-xl transition"
                              title="Activate"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => startEdit(agent)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAgent(agent.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </PlayfulCard>
          </div>
        )}

        {activeTab === 'moods' && (
          <div className="space-y-6">
            <PlayfulCard variant="white">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Select Interviewer Mood</h3>
              <p className="text-sm text-gray-600 mb-6">
                {preferences?.use_dynamic_behavior
                  ? 'Dynamic behavior is enabled. Mood presets are disabled.'
                  : 'Choose how the AI interviewer should behave during your practice sessions'}
              </p>

              {isLoadingMoods ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" color="primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {moods.map((mood) => {
                    const moodStyle = MOOD_ICONS[mood.name] || MOOD_ICONS['Neutral'];
                    const isSelected = preferences?.selected_mood_preset_id === mood.id;
                    const isDisabled = preferences?.use_dynamic_behavior || isSavingPrefs;

                    return (
                      <button
                        key={mood.id}
                        onClick={() => !isDisabled && handleSelectMood(mood.id)}
                        disabled={isDisabled}
                        className={`p-5 rounded-3xl border-2 text-left transition-all duration-300 ${
                          isDisabled
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:scale-105 hover:shadow-soft-lg'
                        } ${
                          isSelected
                            ? `${moodStyle.color} shadow-soft`
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-lg">{mood.name}</h4>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm opacity-80">
                          {mood.description || moodStyle.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </PlayfulCard>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6">
            <PlayfulCard variant="white">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Your Progress Summary</h3>
              <p className="text-sm text-gray-600 mb-6">
                Track your improvement across different interview categories
              </p>

              {isLoadingProgress ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" color="primary" />
                </div>
              ) : progressSummary.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No progress data yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Complete interviews to see your improvement over time
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {progressSummary.map((summary) => (
                    <div key={summary.category} className="p-6 bg-cream-50 rounded-3xl border-2 border-gray-200">
                      <h4 className="font-bold text-gray-900 capitalize mb-4">{summary.category}</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Average Score</span>
                          <span className={`text-2xl font-bold ${getScoreColor(summary.avg_score)}`}>
                            {summary.avg_score.toFixed(0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Total Sessions</span>
                          <span className="text-lg font-semibold text-gray-900">
                            {summary.total_sessions}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Improvement Rate</span>
                          <span className={`text-lg font-semibold ${
                            summary.improvement_rate > 0 ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {summary.improvement_rate > 0 ? '+' : ''}{summary.improvement_rate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </PlayfulCard>
          </div>
        )}
      </main>
    </div>
  );
}
