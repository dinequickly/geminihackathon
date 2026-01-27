import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Code } from 'lucide-react';
import { LiquidButton } from '../components/LiquidButton';
import { LiquidGlass } from '../components/LiquidGlass';
import { LightLeakBackground } from '../components/LightLeakBackground';
import {
  JsonRenderer,
  componentSchemas,
  type TreeNode,
} from '../json-render';

export default function ComponentCollection() {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionLog, setActionLog] = useState<string[]>([]);

  const handleAction = (action: string, payload?: any) => {
    const logEntry = `Action: ${action}${payload ? ` | Payload: ${JSON.stringify(payload)}` : ''}`;
    setActionLog(prev => [...prev.slice(-4), logEntry]);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const componentEntries = Object.entries(componentSchemas);

  return (
    <div className="min-h-screen relative overflow-hidden font-sans selection:bg-pink-100">
      <LightLeakBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between border-b border-gray-200/50 bg-white/30 backdrop-blur-md">
        <div className="flex flex-col">
          <span className="font-sans font-bold text-xl tracking-tight text-black">VERITAS</span>
          <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Component Collection</span>
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

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-24 relative z-10 space-y-12">
        {/* Intro */}
        <LiquidGlass className="p-8">
          <h1 className="font-sans font-semibold text-4xl tracking-tight text-black mb-4">
            JSON-Render Component Collection
          </h1>
          <p className="text-gray-600 leading-relaxed max-w-3xl">
            This collection showcases all components available in the json-render system.
            Each component can be used directly as React components OR rendered via JSON tree structures.
          </p>

          {/* Action Log */}
          {actionLog.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="font-mono text-xs text-gray-500 uppercase tracking-wide mb-2">Action Log</div>
              <div className="space-y-1">
                {actionLog.map((log, i) => (
                  <div key={i} className="font-mono text-sm text-gray-700">{log}</div>
                ))}
              </div>
            </div>
          )}
        </LiquidGlass>

        {/* Component Cards */}
        {componentEntries.map(([name, schema]) => (
          <ComponentShowcase
            key={name}
            name={name}
            description={schema.description}
            examples={schema.examples}
            onAction={handleAction}
            copiedId={copiedId}
            onCopy={copyToClipboard}
          />
        ))}
      </main>
    </div>
  );
}

interface ComponentShowcaseProps {
  name: string;
  description: string;
  examples: TreeNode[];
  onAction: (action: string, payload?: any) => void;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}

function ComponentShowcase({
  name,
  description,
  examples,
  onAction,
  copiedId,
  onCopy
}: ComponentShowcaseProps) {
  const [showCode, setShowCode] = useState(false);

  return (
    <LiquidGlass className="overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-sans font-semibold text-2xl tracking-tight text-black">{name}</h2>
            <p className="text-gray-500 text-sm mt-1">{description}</p>
          </div>
          <button
            onClick={() => setShowCode(!showCode)}
            className={`p-2 rounded-lg transition-colors ${
              showCode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Code size={18} />
          </button>
        </div>
      </div>

      {/* Examples */}
      <div className="p-6 space-y-6">
        {examples.map((example, index) => (
          <div key={index} className="space-y-4">
            {/* Rendered Component */}
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="font-mono text-[10px] text-gray-400 uppercase tracking-wide mb-3">
                Live Preview
              </div>
              <JsonRenderer tree={example} onAction={onAction} />
            </div>

            {/* Code */}
            {showCode && (
              <div className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <button
                    onClick={() => onCopy(JSON.stringify(example, null, 2), `${name}-${index}`)}
                    className="p-2 bg-white/80 backdrop-blur rounded-lg border border-gray-200 hover:bg-white transition-colors"
                  >
                    {copiedId === `${name}-${index}` ? (
                      <Check size={14} className="text-green-600" />
                    ) : (
                      <Copy size={14} className="text-gray-600" />
                    )}
                  </button>
                </div>
                <pre className="p-4 bg-gray-900 rounded-xl text-gray-100 text-sm overflow-x-auto">
                  <code>{JSON.stringify(example, null, 2)}</code>
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Props Documentation */}
      <div className="p-6 bg-gray-50/50 border-t border-gray-100">
        <div className="font-mono text-[10px] text-gray-400 uppercase tracking-wide mb-3">Props</div>
        <div className="flex flex-wrap gap-2">
          {Object.keys(componentSchemas[name]?.props.shape || {}).map(propName => (
            <span
              key={propName}
              className="px-2 py-1 bg-white rounded border border-gray-200 text-xs font-mono text-gray-700"
            >
              {propName}
            </span>
          ))}
        </div>
      </div>
    </LiquidGlass>
  );
}
