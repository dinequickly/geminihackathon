import { useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { api, Analysis, Conversation, AristotleAnalysis, PlatoAnalysis, SocratesAnalysis, ZenoAnalysis } from '../lib/api';
import { VideoEmotionPlayer } from '../components';
import { LightLeakBackground } from '../components/LightLeakBackground';
import { LiquidGlass } from '../components/LiquidGlass';
import { LoadingSpinner } from '../components/PlayfulUI';

const ALLOWED_USER_IDS = new Set(['21557fe2-d7c9-492c-b99c-6e4b0d3c2044']);

type FlatRow = { key: string; value: string };

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const flattenObject = (input: unknown, prefix = ''): FlatRow[] => {
  if (input === null || input === undefined) {
    return [{ key: prefix || 'value', value: '—' }];
  }

  if (Array.isArray(input)) {
    if (input.length === 0) return [{ key: prefix || 'value', value: '[]' }];
    const primitives = input.every(item => item === null || typeof item !== 'object');
    if (primitives) {
      return [{ key: prefix || 'value', value: input.map(formatValue).join(', ') }];
    }
    return [{ key: prefix || 'value', value: formatValue(input) }];
  }

  if (typeof input === 'object') {
    const rows: FlatRow[] = [];
    Object.entries(input as Record<string, unknown>).forEach(([key, value]) => {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        rows.push(...flattenObject(value, nextPrefix));
      } else {
        rows.push({ key: nextPrefix, value: formatValue(value) });
      }
    });
    return rows.length ? rows : [{ key: prefix || 'value', value: '—' }];
  }

  return [{ key: prefix || 'value', value: formatValue(input) }];
};

const TableSection = ({ title, rows }: { title: string; rows: FlatRow[] }) => (
  <LiquidGlass className="p-4 border border-emerald-100/70 bg-white/70 backdrop-blur">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-mono text-xs uppercase tracking-[0.35em] text-emerald-800">{title}</h3>
      <span className="text-[10px] font-mono text-emerald-500">{rows.length} rows</span>
    </div>
    <div className="overflow-auto max-h-[360px] rounded-md border border-emerald-100">
      <table className="w-full text-[12px]">
        <thead className="bg-emerald-50/80 sticky top-0">
          <tr className="text-left text-emerald-800">
            <th className="px-3 py-2 font-mono">Key</th>
            <th className="px-3 py-2 font-mono">Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.key} className="border-t border-emerald-100/70">
              <td className="px-3 py-2 align-top font-mono text-emerald-900 whitespace-nowrap">{row.key}</td>
              <td className="px-3 py-2 text-emerald-950 whitespace-pre-wrap break-words">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </LiquidGlass>
);

export default function MonitorTables({ userId }: { userId: string | null }) {
  const { conversationId } = useParams<{ conversationId: string }>();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [aristotle, setAristotle] = useState<AristotleAnalysis | null>(null);
  const [plato, setPlato] = useState<PlatoAnalysis | null>(null);
  const [socrates, setSocrates] = useState<SocratesAnalysis | null>(null);
  const [zeno, setZeno] = useState<ZenoAnalysis | null>(null);
  const [transcriptRows, setTranscriptRows] = useState<FlatRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!conversationId) return;
      setIsLoading(true);
      try {
        const [convResult, philosophers, transcript] = await Promise.all([
          api.getConversation(conversationId),
          api.getAllPhilosophicalAnalyses(conversationId),
          api.getAnnotatedTranscript(conversationId)
        ]);

        if (!isMounted) return;

        setConversation(convResult.conversation);
        setAnalysis(convResult.analysis);
        setAristotle(philosophers.aristotle);
        setPlato(philosophers.plato);
        setSocrates(philosophers.socrates);
        setZeno(philosophers.zeno);

        if (transcript.segments && transcript.segments.length > 0) {
          const rows = transcript.segments.map((segment, index) => ({
            key: `segment.${index}`,
            value: formatValue({
              speaker: segment.speaker,
              start_time: segment.start_time,
              end_time: segment.end_time,
              text: segment.text,
              dominant_emotion: segment.dominant_emotion,
              emotions: segment.emotions
            })
          }));
          setTranscriptRows(rows);
        } else if (transcript.transcript_json && transcript.transcript_json.length > 0) {
          const rows = transcript.transcript_json.map((entry, index) => ({
            key: `entry.${index}`,
            value: formatValue(entry)
          }));
          setTranscriptRows(rows);
        } else if (transcript.transcript) {
          setTranscriptRows([{ key: 'transcript', value: transcript.transcript }]);
        } else {
          setTranscriptRows([{ key: 'transcript', value: '—' }]);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load monitoring data');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [conversationId]);

  const overviewRows = useMemo(() => {
    const rows: FlatRow[] = [];
    if (conversation) {
      rows.push(...flattenObject({
        conversation_id: conversation.id,
        status: conversation.status,
        started_at: conversation.started_at,
        ended_at: conversation.ended_at,
        duration_seconds: conversation.duration_seconds,
        video_url: conversation.video_url,
        audio_url: conversation.audio_url
      }, 'conversation'));
    }
    if (analysis) {
      rows.push(...flattenObject({
        overall_score: analysis.overall_score,
        overall_level: analysis.overall_level,
        overall_summary: analysis.overall_summary,
        communication_score: analysis.communication_score,
        eq_score: analysis.eq_score,
        presence_score: analysis.presence_score,
        technical_score: analysis.technical_score
      }, 'analysis'));
    }
    return rows.length ? rows : [{ key: 'overview', value: '—' }];
  }, [conversation, analysis]);

  if (!userId || !ALLOWED_USER_IDS.has(userId)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!conversationId) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LiquidGlass className="p-6 max-w-lg text-center">
          <p className="text-red-600 font-mono text-sm">{error}</p>
        </LiquidGlass>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-cream-100">
      <LightLeakBackground />

      <div className="relative z-10 px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-emerald-700">CCTV Monitoring Console</p>
            <h1 className="text-2xl md:text-3xl font-semibold text-emerald-950 mt-2">All Signals, One Screen</h1>
            <p className="text-sm text-emerald-700 mt-1">Conversation {conversationId}</p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-emerald-600">Access</p>
            <p className="text-sm text-emerald-900 font-semibold">Restricted</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="space-y-6">
            <TableSection title="Overview" rows={overviewRows} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TableSection title="Aristotle" rows={flattenObject(aristotle, 'aristotle')} />
              <TableSection title="Plato" rows={flattenObject(plato, 'plato')} />
              <TableSection title="Socrates" rows={flattenObject(socrates, 'socrates')} />
              <TableSection title="Zeno" rows={flattenObject(zeno, 'zeno')} />
            </div>
            <TableSection title="Transcript" rows={transcriptRows} />
          </div>

          <div className="space-y-6">
            <LiquidGlass className="p-4 border border-emerald-100/70 bg-white/70 backdrop-blur">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-mono text-xs uppercase tracking-[0.35em] text-emerald-800">Emotions Feed</h3>
                <span className="text-[10px] font-mono text-emerald-500">Live View</span>
              </div>
              {conversation?.video_url ? (
                <VideoEmotionPlayer
                  conversationId={conversation.id}
                  videoUrl={conversation.video_url}
                  audioUrl={conversation.audio_url}
                  showLiveEmotions
                />
              ) : (
                <div className="text-sm text-emerald-700">No video available for this conversation.</div>
              )}
            </LiquidGlass>
          </div>
        </div>
      </div>
    </div>
  );
}
