import { LiquidGlass } from '../components/LiquidGlass';
import { LiquidButton } from '../components/LiquidButton';
import { IridescentSphere } from '../components/IridescentSphere';
import { LightLeakBackground } from '../components/LightLeakBackground';
import { ArrowRight, Activity, Smile, Globe, Zap } from 'lucide-react';

export default function DesignSystem() {
  return (
    <div className="min-h-screen relative overflow-hidden text-gray-900 font-sans selection:bg-pink-100">
      <LightLeakBackground />
      
      {/* Navigation / Header Area */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <span className="font-sans font-bold text-xl tracking-tight text-gray-800">TAVUS</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 relative z-10">
        
        {/* Hero Section */}
        <header className="mb-24 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-white/30 backdrop-blur-sm border border-white/40 text-xs font-mono tracking-wider uppercase text-gray-700">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            Design System 2.0
          </div>
          
          <h1 className="font-sans font-bold text-6xl md:text-8xl text-black mb-8 leading-[0.9] tracking-tight">
            Clarity in <br />
            <span className="italic text-gray-900">Motion.</span>
          </h1>
          
          <p className="text-xl text-gray-800 font-light max-w-2xl mx-auto leading-relaxed">
            An executive interface designed for high-signal candidates. 
            Blending data density with ethereal aesthetics.
          </p>
        </header>

        {/* AI Agents Section */}
        <section className="mb-32">
          <div className="flex items-end justify-between mb-12 border-b border-gray-200/50 pb-4">
            <h2 className="font-sans font-semibold text-4xl tracking-tight text-black">Core Intelligence</h2>
            <span className="font-mono text-xs text-gray-600 uppercase tracking-widest">Active Agents • 04</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <AgentCard 
              name="EQ" 
              role="Emotional Intelligence" 
              color="pink" 
              icon={<HeartIcon />}
              delay={0}
            />
            <AgentCard 
              name="Authenticity" 
              role="Verification & Trust" 
              color="blue" 
              icon={<ShieldIcon />}
              delay={1}
            />
            <AgentCard 
              name="Presence" 
              role="Engagement Metrics" 
              color="purple" 
              icon={<EyeIcon />}
              delay={2}
            />
            <AgentCard 
              name="Culture" 
              role="Fit Analysis" 
              color="silver" 
              icon={<GlobeIcon />}
              delay={3}
            />
          </div>
        </section>

        {/* UI Components Showcase */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Interactive Elements */}
          <div>
            <div className="flex items-end justify-between mb-8 border-b border-gray-200/50 pb-4">
              <h2 className="font-sans font-semibold text-3xl tracking-tight text-black">Interactive</h2>
              <span className="font-mono text-xs text-gray-600 uppercase tracking-widest">Touchpoints</span>
            </div>

            <div className="space-y-8">
              {/* Buttons */}
              <LiquidGlass className="p-8 space-y-6">
                <h3 className="font-mono text-sm text-gray-700 uppercase">Liquid Buttons</h3>
                <div className="flex flex-wrap gap-4">
                  <LiquidButton variant="black" icon={<ArrowRight size={18} />} iconPosition="right">
                    Start Interview
                  </LiquidButton>
                  <LiquidButton variant="black">
                    View Transcript
                  </LiquidButton>
                  <LiquidButton variant="black">
                    Skip
                  </LiquidButton>
                </div>
              </LiquidGlass>

              {/* Data Cards */}
              <LiquidGlass className="p-8">
                <h3 className="font-mono text-sm text-gray-700 uppercase mb-6">Analysis Result</h3>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-5xl font-mono text-black mb-1">94%</div>
                    <div className="text-sm text-gray-700 font-medium">Communication Score</div>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                    <Activity size={24} />
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <ProgressBar label="Clarity" value={92} />
                  <ProgressBar label="Pacing" value={88} />
                  <ProgressBar label="Tone" value={96} />
                </div>
              </LiquidGlass>
            </div>
          </div>

          {/* Typography & Glass Typography */}
          <div>
            <div className="flex items-end justify-between mb-8 border-b border-gray-200/50 pb-4">
              <h2 className="font-sans font-semibold text-3xl tracking-tight text-black">Typography</h2>
              <span className="font-mono text-xs text-gray-600 uppercase tracking-widest">Editorial</span>
            </div>

            <LiquidGlass variant="panel" className="space-y-8 min-h-[400px] flex flex-col justify-center">
              <div>
                <h1 className="font-sans font-bold text-5xl mb-4 text-black tracking-tight">The quick brown fox jumps over the lazy dog.</h1>
                <p className="font-mono text-xs text-gray-600">Jakarta Sans — Headers</p>
              </div>
              <div className="h-px w-full bg-gray-200/50" />
              <div>
                <p className="text-lg leading-relaxed text-gray-800">
                  Efficiency is the soul of every interview. We provide the tools to measure, analyze, and optimize the candidate experience with unprecedented precision.
                </p>
                <p className="font-mono text-xs text-gray-600 mt-4">Plus Jakarta Sans — Body</p>
              </div>
              <div className="h-px w-full bg-gray-200/50" />
              <div>
                <div className="font-mono text-sm bg-gray-900/10 p-4 rounded-lg border border-gray-900/20 text-black">
                  {`{ "score": 98, "status": "verified" }`}
                </div>
                <p className="font-mono text-xs text-gray-600 mt-4">JetBrains Mono — Data</p>
              </div>
            </LiquidGlass>
          </div>

        </section>

      </div>
    </div>
  );
}

// Sub-components for this page

function AgentCard({ name, role, color, icon, delay }: { name: string, role: string, color: any, icon: any, delay: number }) {
  return (
    <LiquidGlass className="h-full flex flex-col items-center text-center p-8 hover:!border-blue-300 transition-colors group">
      <div className="mb-6 relative">
        <IridescentSphere size={120} color={color} delay={delay} />
        <div className="absolute inset-0 flex items-center justify-center text-white mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          {icon}
        </div>
      </div>
      <h3 className="font-sans font-semibold text-2xl tracking-tight text-gray-900 mb-1">{name}</h3>
      <p className="font-mono text-xs text-gray-500 uppercase tracking-wider">{role}</p>
    </LiquidGlass>
  )
}

function ProgressBar({ label, value }: { label: string, value: number }) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-mono text-xs text-gray-500 w-16">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gray-900 rounded-full" 
          style={{ width: `${value}%` }} 
        />
      </div>
      <span className="font-mono text-xs font-bold text-gray-900">{value}%</span>
    </div>
  )
}

// Icons
function HeartIcon() {
  return <Smile size={32} />
}
function ShieldIcon() {
  return <Zap size={32} />
}
function EyeIcon() {
  return <Activity size={32} />
}
function GlobeIcon() {
  return <Globe size={32} />
}