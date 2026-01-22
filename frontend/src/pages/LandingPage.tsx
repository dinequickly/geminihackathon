import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { LiquidButton } from '../components/LiquidButton';
import { LightLeakBackground } from '../components/LightLeakBackground';


export default function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0); // Phase 1: 0 to 1
  const [phase2Progress, setPhase2Progress] = useState(0); // Phase 2: 0 to 1
  const [phase3Progress, setPhase3Progress] = useState(0); // Phase 3: 0 to 1
  const [phase4Progress, setPhase4Progress] = useState(0); // Phase 4: 0 to 1
  const [phase5Progress, setPhase5Progress] = useState(0); // Phase 5: 0 to 1
  
  const canPhase2Ref = useRef(false);
  const isLock1Ref = useRef(false);
  const canPhase3Ref = useRef(false);
  const isLock2Ref = useRef(false);
  const canPhase4Ref = useRef(false);
  const isLock3Ref = useRef(false);
  const canPhase5Ref = useRef(false);
  const isLock4Ref = useRef(false);

  // Constants
  const PHASE_1_ZOOM = 1.8;
  const PHASE_2_ZOOM = 2.2;
  const PHASE_3_ZOOM = 2.4;
  const PHASE_4_ZOOM = 2.8;
  const PHASE_5_ZOOM = 1.5; // Zoom out slightly for finale

  useEffect(() => {
    const windowHeight = window.innerHeight;
    const p1Len = windowHeight * 0.8;
    const p2Len = windowHeight * 0.8;
    const p3Len = windowHeight * 0.8;
    const p4Len = windowHeight * 0.8;
    const p5Len = windowHeight * 0.8;

    const handleScroll = () => {
      const y = window.scrollY;

      // --- Phase 1 ---
      if (y <= p1Len) {
        setPhase2Progress(0);
        setPhase3Progress(0);
        setPhase4Progress(0);
        setPhase5Progress(0);
        
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
        setPhase4Progress(0);
        setPhase5Progress(0);

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
      else if (y <= p1Len + p2Len + p3Len) {
        setScrollProgress(1);
        setPhase2Progress(1);
        setPhase4Progress(0);
        setPhase5Progress(0);

        if (!canPhase3Ref.current) {
          window.scrollTo(0, p1Len + p2Len);
          return;
        }

        const p3Rel = y - p1Len - p2Len;
        if (p3Rel >= p3Len - 5 && !canPhase4Ref.current && !isLock3Ref.current) {
          isLock3Ref.current = true;
          window.scrollTo(0, p1Len + p2Len + p3Len);
          setPhase3Progress(1);
          setTimeout(() => {
            canPhase4Ref.current = true;
            isLock3Ref.current = false;
          }, 500);
          return;
        }
        setPhase3Progress(Math.min(p3Rel / p3Len, 1));
      }
      // --- Phase 4 ---
      else if (y <= p1Len + p2Len + p3Len + p4Len) {
        setScrollProgress(1);
        setPhase2Progress(1);
        setPhase3Progress(1);
        setPhase5Progress(0);

        if (!canPhase4Ref.current) {
          window.scrollTo(0, p1Len + p2Len + p3Len);
          return;
        }

        const p4Rel = y - p1Len - p2Len - p3Len;
        if (p4Rel >= p4Len - 5 && !canPhase5Ref.current && !isLock4Ref.current) {
          isLock4Ref.current = true;
          window.scrollTo(0, p1Len + p2Len + p3Len + p4Len);
          setPhase4Progress(1);
          setTimeout(() => {
            canPhase5Ref.current = true;
            isLock4Ref.current = false;
          }, 500);
          return;
        }
        setPhase4Progress(Math.min(p4Rel / p4Len, 1));
      }
      // --- Phase 5 ---
      else {
        setScrollProgress(1);
        setPhase2Progress(1);
        setPhase3Progress(1);
        setPhase4Progress(1);

        if (!canPhase5Ref.current) {
          window.scrollTo(0, p1Len + p2Len + p3Len + p4Len);
          return;
        }

        setPhase5Progress(Math.min((y - p1Len - p2Len - p3Len - p4Len) / p5Len, 1));
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (isLock1Ref.current || isLock2Ref.current || isLock3Ref.current || isLock4Ref.current) {
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

  // Phase 3 Target (Pythagoras)
  const o3X = 200;
  const o3Y = 850;

  // Phase 4 Target (Socrates)
  const o4X = 280;
  const o4Y = 420;

  // Phase 5 Target (Center Finale)
  const o5X = winW * 0.5;
  const o5Y = winH * 0.5;

  let currentScale, currentOriginX, currentOriginY;

  if (phase5Progress > 0) {
    // Interpolate Phase 4 -> Phase 5
    currentScale = PHASE_4_ZOOM + (phase5Progress * (PHASE_5_ZOOM - PHASE_4_ZOOM));
    currentOriginX = o4X + (phase5Progress * (o5X - o4X));
    currentOriginY = o4Y + (phase5Progress * (o5Y - o4Y));
  } else if (phase4Progress > 0) {
    // Interpolate Phase 3 -> Phase 4
    currentScale = PHASE_3_ZOOM + (phase4Progress * (PHASE_4_ZOOM - PHASE_3_ZOOM));
    currentOriginX = o3X + (phase4Progress * (o4X - o3X));
    currentOriginY = o3Y + (phase4Progress * (o4Y - o3Y));
  } else if (phase3Progress > 0) {
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

  return (
    <div className="min-h-screen relative overflow-hidden font-sans selection:bg-pink-100">
      <LightLeakBackground />

      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between border-b transition-all duration-500 ${
          phase5Progress > 0.1 
            ? 'bg-transparent border-transparent' 
            : 'border-gray-200/50 bg-white/30 backdrop-blur-md'
        }`}
      >
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
          Total Height = 100vh (view) + Phase 1-5 Scrolls
          Each phase is 0.8vh -> Total spacer needs to cover this.
      */}
        <div className="h-[580vh] pointer-events-none" />
      </section>

      {/* White content panel 1 - Right half - Slides up (P1), Flies out Up (P2) */}
      <div
        className={`fixed right-0 z-20 w-1/2 h-screen bg-white/90 backdrop-blur-md overflow-hidden transition-transform duration-100 ease-out`}
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-mono tracking-wider uppercase text-gray-500">
             ARISTOTLE
          </div>

          {/* Main Heading */}
          <h1 className="font-serif text-6xl md:text-8xl font-medium text-black mb-8 leading-[0.9] tracking-tight text-center">
            Ideas only matter if they <br />
            <span className="italic text-gray-800 text-center">land clearly in the moment.</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-800 font-light max-w-2xl mx-auto leading-relaxed text-center">
            Aristotle grounds abstract concepts in observable reality. 
            Hand gestures toward earth. Makes the complex accessible. 
            The crowd follows his logic.
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
              Start Practicing
            </LiquidButton>
          </div>
        </div>
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
        className="fixed left-0 z-20 w-1/2 h-screen bg-white/90 backdrop-blur-md overflow-hidden transition-transform duration-100 ease-out flex flex-col justify-end"
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
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-mono tracking-wider uppercase text-gray-500">
               EUCLID
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
                variant="secondary"
                size="xl"
                icon={<ArrowRight size={20} />}
                iconPosition="right"
              >
                Start Analysis
              </LiquidButton>
            </div>
          </div>
        </section>
      </div>

      {/* Third White Panel - Right half - Slides in from Right (P3), Flies out Right (P4) */}
      <div
        className="fixed right-0 z-20 w-1/2 h-screen bg-white/90 backdrop-blur-md overflow-hidden transition-transform duration-100 ease-out"
        style={{
          top: '95px',
          // Phase 3: Slide in from right ( 100% -> 0% )
          // Phase 4: Fly out right ( 0% -> 200% )
          transform: phase4Progress > 0
            ? `translateX(${phase4Progress * 200}%)`
            : `translateX(${100 - (phase3Progress * 100)}%)`
        }}
      >
        <section className="px-6 pt-40 pb-32 max-w-7xl mx-auto text-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-mono tracking-wider uppercase text-gray-500">
               PYTHAGORAS
            </div>

            <h2 className="font-serif text-6xl md:text-8xl font-medium text-black mb-8 leading-[0.9] tracking-tight">
              Self-awareness under pressure is what separates <br />
              <span className="italic text-gray-800">candidates who connect from those who perform.</span>
            </h2>

            <p className="text-xl text-gray-800 font-light max-w-2xl mx-auto leading-relaxed">
              Pythagoras sits apart. Observing. Reflecting. 
              The only figure who sees himself clearly while 
              the chaos of debate swirls around him.
            </p>

            <div className="flex items-center justify-center pt-8">
              <LiquidButton
                onClick={() => navigate('/onboarding')}
                variant="secondary"
                size="xl"
                icon={<ArrowRight size={20} />}
                iconPosition="right"
              >
                Analyze Yourself
              </LiquidButton>
            </div>
          </div>
        </section>
      </div>

      {/* Fourth White Panel - Left half - Slides in from Left during Phase 4, Flies out Left (P5) */}
      <div
        className="fixed left-0 z-20 w-1/2 h-screen bg-white/90 backdrop-blur-md overflow-hidden transition-transform duration-100 ease-out flex flex-col justify-center"
        style={{
          top: 0,
          // Phase 4: Slide in from left ( -100% -> 0% )
          // Phase 5: Fly out left ( 0% -> -150% )
          transform: phase5Progress > 0
            ? `translateX(${0 - phase5Progress * 150}%)`
            : `translateX(${-100 + (phase4Progress * 100)}%)`,
          opacity: phase5Progress > 0 ? Math.max(0, 1 - phase5Progress * 5) : 1
        }}
      >
        <section className="px-12 py-32 max-w-7xl mx-auto text-left">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-mono tracking-wider uppercase text-gray-500">
               SOCRATES
            </div>

            <h2 className="font-serif text-6xl md:text-7xl font-medium text-black leading-tight">
              Socrates commanded Athens through questions. <br />
              <span className="italic text-gray-700">Authority through intellectual honesty.</span>
            </h2>

            <p className="text-xl text-gray-600 font-light max-w-xl leading-relaxed">
              Made senators question their assumptions. 
              Real presence isn't about performance—it's about the depth 
              of your engagement and the clarity of your truth.
            </p>

            <div className="pt-10">
               <LiquidButton
                onClick={() => navigate('/onboarding')}
                variant="secondary"
                size="xl"
                icon={<ArrowRight size={20} />}
                iconPosition="right"
              >
                Find Your Voice
              </LiquidButton>
            </div>
          </div>
        </section>
      </div>

      {/* Fifth White Panel - Centered Modal Style - Slides down from Top during Phase 5 */}
      <div
        className="fixed z-30 bg-white/30 backdrop-blur-md overflow-hidden transition-transform duration-100 ease-out flex flex-col items-center justify-center text-center"
        style={{
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          // Phase 5: Slide down ( -100% -> 0% )
          transform: `translateY(${-100 + (phase5Progress * 100)}%)`,
          // T-shape: Full width for top 100px, then 250px margins on sides
          clipPath: `polygon(
            0% 0%, 
            100% 0%, 
            100% 100px, 
            calc(100% - 250px) 100px, 
            calc(100% - 250px) 100%, 
            250px 100%, 
            250px 100px, 
            0% 100px
          )`
        }}
      >
        <section className="w-full px-12 py-16 max-w-6xl mx-auto flex flex-col items-center mt-[100px]">
           <div className="space-y-10 w-full flex flex-col items-center">
            <div className="rounded-2xl overflow-hidden border border-gray-200/50 shadow-2xl bg-black/5" style={{ width: '850px', height: '650px' }}>
              <video 
                src="https://nlobsjnpcjxfabhnbvza.supabase.co/storage/v1/object/public/interview-videos/interviews/ProductDemo.mp4"
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            <div className="pt-8">
               <LiquidButton
                onClick={() => navigate('/onboarding')}
                variant="secondary"
                size="xl"
                icon={<ArrowRight size={24} />}
                iconPosition="right"
              >
                Enter the Platform
              </LiquidButton>
            </div>
           </div>
        </section>
      </div>
    </div>
  );
}
