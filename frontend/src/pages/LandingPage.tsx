import { useNavigate } from 'react-router-dom';
import { ArrowRight, Brain, Heart, MessageCircle, Sparkles, Zap } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { LiquidGlass } from '../components/LiquidGlass';
import { LiquidButton } from '../components/LiquidButton';
import { LightLeakBackground } from '../components/LightLeakBackground';
import { IridescentSphere } from '../components/IridescentSphere';

export default function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0); // Phase 1: 0 to 1
  const [phase2Progress, setPhase2Progress] = useState(0); // Phase 2: 0 to 1
  const [phase3Progress, setPhase3Progress] = useState(0); // Phase 3: 0 to 1
  
  const canPhase2Ref = useRef(false);
  const isLock1Ref = useRef(false);
  const canPhase3Ref = useRef(false);
  const isLock2Ref = useRef(false);

  // Constants
  const PHASE_1_ZOOM = 1.8;
  const PHASE_2_ZOOM = 2.2;
  const PHASE_3_ZOOM = 2.4; // Deepest zoom

  useEffect(() => {
    const windowHeight = window.innerHeight;
    const p1Len = windowHeight * 0.8;
    const p2Len = windowHeight * 0.8;
    const p3Len = windowHeight * 0.8;

    const handleScroll = () => {
      const y = window.scrollY;

      // --- Phase 1 ---
      if (y <= p1Len) {
        setPhase2Progress(0);
        setPhase3Progress(0);
        
        if (y >= p1Len - 5 && !canPhase2Ref.current && !isLock1Ref.current) {
          isLock1Ref.current = true;
          window.scrollTo(0, p1Len);
          setScrollProgress(1);
          setTimeout(() => {
            canPhase2Ref.current = true;
            isLock1Ref.current = false;
          }, 500);
          return;
        }
        setScrollProgress(Math.min(y / p1Len, 1));
      } 
      // --- Phase 2 ---
      else if (y <= p1Len + p2Len) {
        setScrollProgress(1);
        setPhase3Progress(0);

        if (!canPhase2Ref.current) {
          window.scrollTo(0, p1Len);
          return;
        }

        const p2Rel = y - p1Len;
        if (p2Rel >= p2Len - 5 && !canPhase3Ref.current && !isLock2Ref.current) {
          isLock2Ref.current = true;
          window.scrollTo(0, p1Len + p2Len);
          setPhase2Progress(1);
          setTimeout(() => {
            canPhase3Ref.current = true;
            isLock2Ref.current = false;
          }, 500);
          return;
        }
        setPhase2Progress(Math.min(p2Rel / p2Len, 1));
      }
      // --- Phase 3 ---
      else {
        setScrollProgress(1);
        setPhase2Progress(1);

        if (!canPhase3Ref.current) {
          window.scrollTo(0, p1Len + p2Len);
          return;
        }

        setPhase3Progress(Math.min((y - p1Len - p2Len) / p3Len, 1));
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (isLock1Ref.current || isLock2Ref.current) {
        e.preventDefault();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: false });
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // --- Visual Calculations ---
  const winW = typeof window !== 'undefined' ? window.innerWidth : 1000;
  const winH = typeof window !== 'undefined' ? window.innerHeight : 800;
  
  // Phase 1 Target (Center/Philosophers)
  const o1X = (winW * 0.56) + 780;
  const o1Y = winH * 0.40;

  // Phase 2 Target (Bottom Right)
  const o2X = winW * 0.85;
  const o2Y = winH * 0.85;

  // Phase 3 Target (Requested: 650, 820)
  const o3X = 900;
  const o3Y = 820;

  let currentScale, currentOriginX, currentOriginY;

  if (phase3Progress > 0) {
    // Interpolate Phase 2 -> Phase 3
    currentScale = PHASE_2_ZOOM + (phase3Progress * (PHASE_3_ZOOM - PHASE_2_ZOOM));
    currentOriginX = o2X + (phase3Progress * (o3X - o2X));
    currentOriginY = o2Y + (phase3Progress * (o3Y - o2Y));
  } else if (phase2Progress > 0) {
    // Interpolate Phase 1 -> Phase 2
    currentScale = PHASE_1_ZOOM + (phase2Progress * (PHASE_2_ZOOM - PHASE_1_ZOOM));
    currentOriginX = o1X + (phase2Progress * (o2X - o1X));
    currentOriginY = o1Y + (phase2Progress * (o2Y - o1Y));
  } else {
    // Phase 1
    currentScale = 1 + (scrollProgress * (PHASE_1_ZOOM - 1));
    currentOriginX = o1X;
    currentOriginY = o1Y;
  }

  const zoomOrigin = `${currentOriginX}px ${currentOriginY}px`;

  const dimensions = [
    {
      icon: Brain,
      title: 'Technical Skills',
      description: 'Master the questions that matter with targeted practice across your domain.',
      delay: 0
    },
    {
      icon: Heart,
      title: 'Emotional Intelligence',
      description: 'Develop self-awareness and authentic responses that resonate.',
      delay: 0.1
    },
    {
      icon: MessageCircle,
      title: 'Communication',
      description: 'Articulate complex ideas clearly and confidently under pressure.',
      delay: 0.2
    },
    {
      icon: Sparkles,
      title: 'Executive Presence',
      description: 'Command the room with poise, energy, and authentic confidence.',
      delay: 0.3
    },
  ];

  const stats = [
    { value: '10k+', label: 'Interviews Completed' },
    { value: '94%', label: 'Success Rate' },
    { value: '4.9/5', label: 'User Rating' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden font-sans selection:bg-pink-100">
      <LightLeakBackground />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between border-b border-gray-200/50 bg-white/30 backdrop-blur-md">
        <div className="flex flex-col">
          <span className="font-serif text-xl font-bold tracking-tight text-black">TAVUS</span>
          <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Interview Intelligence</span>
        </div>

        <LiquidButton
          onClick={() => navigate('/onboarding')}
          variant="secondary"
          size="sm"
        >
          Sign In
        </LiquidButton>
      </nav>

      {/* School of Athens Zoom Section - Full Page Experience */}
      <section className="relative min-h-screen">
        <div className="fixed inset-0 w-full h-screen overflow-hidden flex items-center justify-center bg-[#fef9f3]">
          <div
            className="absolute inset-0 transition-transform duration-75 ease-linear will-change-transform"
            style={{
              transform: `scale(${currentScale})`,
              transformOrigin: zoomOrigin,
            }}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg/2880px-%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg"
              alt="The School of Athens"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Overlay text that fades out as you scroll */}
          <div
            className="relative z-10 text-center px-6 transition-opacity duration-500"
            style={{
              opacity: Math.max(0, 1 - scrollProgress * 2.5)
            }}
          >
            <h1 className="font-serif text-6xl md:text-8xl font-medium text-white mb-6 drop-shadow-2xl">
              Master the Art of<br />
              <span className="italic">Conversation</span>
            </h1>
            <p className="text-xl text-white/90 font-light max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
              Like the great philosophers, prepare to engage in meaningful dialogue
            </p>
          </div>
        </div>

      {/* Spacer to create scroll space. 
          Total Height = 100vh (view) + Phase 1 Scroll + Phase 2 Scroll + Phase 3 Scroll
          Each phase is 0.8vh -> Total spacer needs to cover this.
      */}
        <div className="h-[380vh] pointer-events-none" />
      </section>

      {/* White content panel 1 - Right half - Slides up (P1), Flies out Up (P2) */}
      <div
        className={`fixed right-0 z-20 w-1/2 h-screen bg-white overflow-hidden transition-transform duration-100 ease-out`}
        style={{
          top: '95px',
          transform: phase2Progress > 0 
            ? `translateY(${0 - phase2Progress * 150}%)` 
            : `translateY(${100 - scrollProgress * 100}%)`,
        }}
      >
        {/* Hero Section - Only appears after zoom complete */}
        <section ref={heroRef} className="px-6 pt-40 pb-32 max-w-7xl mx-auto text-center">
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/30 backdrop-blur-sm border border-white/40 text-xs font-mono tracking-wider uppercase text-gray-700">
             <Zap className="w-3 h-3 text-black" fill="currentColor" />
             AI-Powered Preparation
          </div>

          {/* Main Heading */}
          <h1 className="font-serif text-6xl md:text-8xl font-medium text-black mb-8 leading-[0.9] tracking-tight">
            Interviews are <br />
            <span className="italic text-gray-800">Complicated.</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-800 font-light max-w-2xl mx-auto leading-relaxed">
            But your preparation doesn't have to be. Master technical skills, emotional intelligence,
            communication, and executive presence.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <LiquidButton
              onClick={() => navigate('/onboarding')}
              variant="secondary"
              size="xl"
              icon={<ArrowRight size={20} />}
              iconPosition="right"
            >
              Start Practicing Free
            </LiquidButton>

            <LiquidButton
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              variant="secondary"
              size="xl"
            >
              See How It Works
            </LiquidButton>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-16">
            {stats.map((stat) => (
              <LiquidGlass
                key={stat.label}
                className="px-8 py-4 flex flex-col items-center min-w-[200px]"
              >
                <div className="font-serif text-3xl text-black">
                  {stat.value}
                </div>
                <div className="font-mono text-xs text-gray-600 uppercase tracking-widest mt-1">{stat.label}</div>
              </LiquidGlass>
            ))}
          </div>
        </div>

        {/* Decorative Spheres */}
        <div className="absolute top-20 right-[10%] opacity-50 pointer-events-none">
          <IridescentSphere size={150} color="blue" delay={0} />
        </div>
        <div className="absolute bottom-32 left-[10%] opacity-50 pointer-events-none">
          <IridescentSphere size={100} color="pink" delay={1} />
        </div>
      </section>

        {/* Features Section */}
        <section id="features" className="px-6 py-32 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="font-serif text-5xl text-black mb-6">
            Practice What <span className="italic text-gray-800">Matters</span>
          </h2>
          <p className="text-xl text-gray-800 font-light max-w-2xl mx-auto">
            Four key dimensions that separate good candidates from great ones.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {dimensions.map((dimension) => {
            const Icon = dimension.icon;
            return (
              <LiquidGlass
                key={dimension.title}
                className="p-10 flex flex-col h-full group cursor-pointer hover:!border-gray-400 transition-all"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-12 rounded-full border border-gray-900/10 flex items-center justify-center text-black">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                <h3 className="font-serif text-3xl text-black mb-4">
                  {dimension.title}
                </h3>

                <p className="text-gray-600 font-light leading-relaxed mb-8 flex-1">
                  {dimension.description}
                </p>

                <div className="flex items-center gap-2 text-black font-medium text-sm group-hover:gap-4 transition-all">
                  EXPLORE
                  <ArrowRight className="w-4 h-4" />
                </div>
              </LiquidGlass>
            );
          })}
        </div>
      </section>

        {/* How It Works / CTA */}
        <section className="px-6 py-32 max-w-5xl mx-auto text-center">
        <LiquidGlass className="p-16 md:p-24">
          <h2 className="font-serif text-5xl md:text-6xl text-black mb-8">
            Ready When <span className="italic text-gray-800">You Are</span>
          </h2>

          <p className="text-xl text-gray-800 font-light max-w-3xl mx-auto leading-relaxed mb-12">
            Jump into a practice interview in seconds. Get instant feedback on your performance.
            Track your growth across all dimensions.
          </p>

          <LiquidButton
            onClick={() => navigate('/onboarding')}
            variant="secondary"
            size="xl"
            icon={<ArrowRight size={20} />}
            iconPosition="right"
          >
            Get Started Now
          </LiquidButton>
        </LiquidGlass>
      </section>

        {/* Footer */}
        <footer className="px-6 py-12 border-t border-gray-200/50 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold tracking-tight text-black">TAVUS</span>
              <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Interview Intelligence</span>
            </div>

            <div className="text-sm text-gray-500 font-light">
              © 2024 Tavus. All rights reserved.
            </div>
          </div>
        </footer>
      </div>

      {/* Second White Panel - Left half - Slides down (P2), Flies out Down (P3) */}
      <div
        className="fixed left-0 z-20 w-1/2 h-screen bg-white overflow-hidden transition-transform duration-100 ease-out flex flex-col justify-end"
        style={{
          top: 0,
          // Phase 2: Slide down ( -100% -> 0% )
          // Phase 3: Fly out down ( 0% -> 200% )
          transform: phase3Progress > 0
            ? `translateY(${phase3Progress * 200}%)`
            : `translateY(${-100 + (phase2Progress * 100)}%)`
        }}
      >
        <section className="px-6 pb-32 pt-20 max-w-7xl mx-auto text-left">
          {/* ... existing P2 content ... */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-mono tracking-wider uppercase text-blue-700">
               <Brain className="w-3 h-3" />
               Structured Learning
            </div>
            
            <h2 className="font-serif text-5xl md:text-6xl font-medium text-black leading-tight">
              Deep Dive <br />
              <span className="italic text-gray-700">Analysis</span>
            </h2>
            
            <p className="text-lg text-gray-600 font-light max-w-xl leading-relaxed">
              Just as Euclid demonstrated geometry to his students, we break down complex
              interactions into measurable components. Understand the metrics behind your performance.
            </p>

            <div className="pt-8">
               <LiquidButton
                onClick={() => navigate('/onboarding')}
                variant="primary"
                size="lg"
                icon={<ArrowRight size={18} />}
                iconPosition="right"
              >
                Start Analysis
              </LiquidButton>
            </div>
          </div>
          
           {/* Decorative Sphere for this panel */}
          <div className="absolute top-1/4 right-10 opacity-30 pointer-events-none">
            <IridescentSphere size={200} color="purple" delay={0.5} />
          </div>
        </section>
      </div>

      {/* Third White Panel - Right half - Slides in from Right during Phase 3 */}
      <div
        className="fixed right-0 z-20 w-1/2 h-screen bg-white overflow-hidden transition-transform duration-100 ease-out"
        style={{
          top: '95px',
          // Phase 3: Slide in from right ( 100% -> 0% )
          transform: `translateX(${100 - (phase3Progress * 100)}%)`
        }}
      >
        <section className="px-6 pt-40 pb-32 max-w-7xl mx-auto text-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-xs font-mono tracking-wider uppercase text-orange-700">
               <Sparkles className="w-3 h-3" />
               Expert Mastery
            </div>

            <h2 className="font-serif text-6xl md:text-8xl font-medium text-black mb-8 leading-[0.9] tracking-tight">
              Refine Your <br />
              <span className="italic text-gray-800">Presence.</span>
            </h2>

            <p className="text-xl text-gray-800 font-light max-w-2xl mx-auto leading-relaxed">
              Achieve total clarity and confidence. Our advanced simulations push you
              to find your authentic voice and command every room you enter.
            </p>

            <div className="flex items-center justify-center pt-8">
              <LiquidButton
                onClick={() => navigate('/onboarding')}
                variant="secondary"
                size="xl"
                icon={<ArrowRight size={20} />}
                iconPosition="right"
              >
                Complete Your Training
              </LiquidButton>
            </div>
          </div>

          <div className="absolute bottom-20 left-10 opacity-40 pointer-events-none">
            <IridescentSphere size={180} color="blue" delay={0.2} />
          </div>
        </section>
      </div>
    </div>
  );
}
