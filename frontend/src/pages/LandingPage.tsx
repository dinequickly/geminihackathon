import { useNavigate } from 'react-router-dom';
import { ArrowRight, Brain, Heart, MessageCircle, Sparkles, Star, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const dimensions = [
    {
      icon: Brain,
      title: 'Technical Skills',
      description: 'Master the questions that matter with targeted practice across your domain.',
      gradient: 'from-blue-400/20 to-cyan-400/20',
      iconColor: 'text-blue-500',
      delay: '0ms'
    },
    {
      icon: Heart,
      title: 'Emotional Intelligence',
      description: 'Develop self-awareness and authentic responses that resonate.',
      gradient: 'from-pink-400/20 to-rose-400/20',
      iconColor: 'text-pink-500',
      delay: '100ms'
    },
    {
      icon: MessageCircle,
      title: 'Communication',
      description: 'Articulate complex ideas clearly and confidently under pressure.',
      gradient: 'from-purple-400/20 to-violet-400/20',
      iconColor: 'text-purple-500',
      delay: '200ms'
    },
    {
      icon: Sparkles,
      title: 'Executive Presence',
      description: 'Command the room with poise, energy, and authentic confidence.',
      gradient: 'from-indigo-400/20 to-blue-400/20',
      iconColor: 'text-indigo-500',
      delay: '300ms'
    },
  ];

  const stats = [
    { value: '10k+', label: 'Interviews Completed', delay: '0ms' },
    { value: '94%', label: 'Success Rate', delay: '100ms' },
    { value: '4.9/5', label: 'User Rating', delay: '200ms' },
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient Orbs */}
        <div
          className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[120px] opacity-30 animate-pulse-slow"
          style={{
            background: 'radial-gradient(circle, rgba(147,197,253,0.4) 0%, rgba(196,181,253,0.3) 50%, rgba(251,207,232,0.2) 100%)',
            animationDuration: '8s'
          }}
        />
        <div
          className="absolute bottom-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full blur-[100px] opacity-25 animate-pulse-slow"
          style={{
            background: 'radial-gradient(circle, rgba(251,207,232,0.4) 0%, rgba(196,181,253,0.3) 50%, rgba(147,197,253,0.2) 100%)',
            animationDuration: '10s',
            animationDelay: '2s'
          }}
        />
        <div
          className="absolute top-[40%] left-[50%] w-[600px] h-[600px] rounded-full blur-[90px] opacity-20 animate-pulse-slow"
          style={{
            background: 'radial-gradient(circle, rgba(196,181,253,0.5) 0%, rgba(147,197,253,0.3) 100%)',
            animationDuration: '12s',
            animationDelay: '4s'
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Star className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              InterviewPro
            </span>
          </div>

          <button
            onClick={() => navigate('/onboarding')}
            className="px-6 py-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-700 hover:bg-white hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300 font-medium"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 px-6 pt-20 pb-32 max-w-7xl mx-auto">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border border-purple-200/30 backdrop-blur-sm animate-fade-in-up shadow-lg shadow-purple-100/20"
            style={{ animationDelay: '0ms' }}
          >
            <Zap className="w-4 h-4 text-purple-500" fill="currentColor" />
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI-Powered Interview Preparation
            </span>
          </div>

          {/* Main Heading */}
          <h1
            className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight animate-fade-in-up"
            style={{
              animationDelay: '100ms',
              fontFamily: '"DM Serif Display", "Playfair Display", serif'
            }}
          >
            <span className="block text-gray-900">Interviews are</span>
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              complicated
            </span>
          </h1>

          {/* Subheading */}
          <p
            className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-up"
            style={{
              animationDelay: '200ms',
              fontFamily: '"Outfit", "Plus Jakarta Sans", sans-serif'
            }}
          >
            But your preparation doesn't have to be. Master technical skills, emotional intelligence,
            communication, and executive presence. Be ready to <span className="font-semibold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">impress</span>,
            not just answer.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            <button
              onClick={() => navigate('/onboarding')}
              className="group px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              Start Practicing Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-700 hover:bg-white hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300 font-semibold"
            >
              See How It Works
            </button>
          </div>

          {/* Stats */}
          <div
            className="flex flex-wrap items-center justify-center gap-8 pt-12 animate-fade-in-up"
            style={{ animationDelay: '400ms' }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass-card px-8 py-4 rounded-2xl animate-fade-in-up hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: stat.delay }}
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Elements */}
        <div
          className="absolute top-20 right-[10%] w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400/20 to-cyan-400/20 backdrop-blur-xl border border-white/20 shadow-xl animate-float-slow"
          style={{
            transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        <div
          className="absolute bottom-32 left-[15%] w-16 h-16 rounded-full bg-gradient-to-br from-pink-400/20 to-rose-400/20 backdrop-blur-xl border border-white/20 shadow-xl animate-float-slow"
          style={{
            transform: `translate(${mousePosition.x * -15}px, ${mousePosition.y * -15}px)`,
            transition: 'transform 0.3s ease-out',
            animationDelay: '1s'
          }}
        />
        <div
          className="absolute top-1/2 left-[8%] w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400/20 to-violet-400/20 backdrop-blur-xl border border-white/20 shadow-xl animate-float-slow"
          style={{
            transform: `translate(${mousePosition.x * 25}px, ${mousePosition.y * 25}px)`,
            transition: 'transform 0.3s ease-out',
            animationDelay: '2s'
          }}
        />
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-32 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            style={{ fontFamily: '"DM Serif Display", "Playfair Display", serif' }}
          >
            Practice What <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Matters</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Four key dimensions that separate good candidates from great ones
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {dimensions.map((dimension) => {
            const Icon = dimension.icon;
            return (
              <div
                key={dimension.title}
                className="group glass-card p-8 rounded-3xl hover:scale-[1.02] transition-all duration-500 cursor-pointer animate-fade-in-up"
                style={{ animationDelay: dimension.delay }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${dimension.gradient} backdrop-blur-xl border border-white/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                  <Icon className={`w-8 h-8 ${dimension.iconColor}`} />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {dimension.title}
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  {dimension.description}
                </p>

                <div className="mt-6 flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-3 transition-all">
                  Explore
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 px-6 py-32 max-w-7xl mx-auto">
        <div className="glass-card-large p-12 md:p-16 rounded-[3rem] text-center space-y-8">
          <h2
            className="text-5xl md:text-6xl font-bold text-gray-900"
            style={{ fontFamily: '"DM Serif Display", "Playfair Display", serif' }}
          >
            Ready When <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">You Are</span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Jump into a practice interview in seconds. Get instant feedback on your performance.
            Track your growth across all dimensions. No scheduling. No pressure. Just progress.
          </p>

          <div className="pt-8">
            <button
              onClick={() => navigate('/onboarding')}
              className="group px-10 py-5 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-lg font-semibold shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              Get Started Now
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-gray-200/50 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Star className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              InterviewPro
            </span>
          </div>

          <div className="text-sm text-gray-500">
            © 2024 InterviewPro. Built to help you succeed.
          </div>
        </div>
      </footer>
    </div>
  );
}
