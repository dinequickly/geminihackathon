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
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll progress caps when white panel reaches top (panel at 0% translateY)
  // translateY = 100 - scrollProgress * 100, so scrollProgress = 1 means panel at top
  const maxScrollProgress = 1;

  useEffect(() => {
    const windowHeight = window.innerHeight;
    const scrollLength = windowHeight * 0.8; // Scroll distance to complete the animation

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const maxScrollPosition = scrollLength;

      // Cap at max
      if (scrollPosition >= maxScrollPosition) {
        window.scrollTo(0, maxScrollPosition);
        setScrollProgress(maxScrollProgress);
        return;
      }

      // Calculate progress from 0 to 1
      const progress = Math.min(scrollPosition / scrollLength, maxScrollProgress);
      setScrollProgress(progress);
    };

    // Block scroll past max
    const handleWheel = (e: WheelEvent) => {
      if (window.scrollY >= scrollLength && e.deltaY > 0) {
        e.preventDefault();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Zoom from scale 1 to 1.25 as user scrolls
  const maxZoom = 1.25;
  const finalScale = 1 + (scrollProgress * (maxZoom - 1));

  const zoomOrigin = 'calc(56% + 280px) 40%'; // Center on philosophers

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
            className="absolute inset-0 transition-transform duration-100 ease-out"
            style={{
              transform: `scale(${finalScale})`,
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

      {/* Spacer to create scroll space */}
        <div className="h-[180vh] pointer-events-none" />
      </section>

      {/* White content panel - Right half - Slides up from bottom, then exits */}
      <div
        className="fixed right-0 z-20 w-1/2 h-screen bg-white overflow-hidden transition-transform duration-100 ease-out"
        style={{
          top: '95px',
          transform: `translateY(${100 - scrollProgress * 100}%)`,
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
    </div>
  );
}
