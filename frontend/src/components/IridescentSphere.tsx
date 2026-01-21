interface IridescentSphereProps {
  size?: number;
  color?: 'blue' | 'pink' | 'silver' | 'purple';
  delay?: number;
}

export function IridescentSphere({ 
  size = 100, 
  color = 'blue', 
  delay = 0 
}: IridescentSphereProps) {
  
  // Define gradient colors based on the prop
  const getGradient = () => {
    switch (color) {
      case 'pink':
        return {
          start: '#ff9a9e',
          end: '#fecfef',
          accent: '#a18cd1'
        };
      case 'silver':
        return {
          start: '#e0e0e0',
          end: '#ffffff',
          accent: '#bdc3c7'
        };
      case 'purple':
        return {
          start: '#a18cd1',
          end: '#fbc2eb',
          accent: '#8fd3f4'
        };
      case 'blue':
      default:
        return {
          start: '#8fd3f4',
          end: '#84fab0',
          accent: '#a18cd1'
        };
    }
  };

  const colors = getGradient();

  return (
    <div 
      className="relative rounded-full animate-float-slow"
      style={{
        width: size,
        height: size,
        animationDelay: `${delay}s`,
      }}
    >
      {/* Base Sphere */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05) 60%, rgba(255, 255, 255, 0) 80%)`,
          boxShadow: `inset -10px -10px 20px rgba(0, 0, 0, 0.1), inset 10px 10px 20px rgba(255, 255, 255, 0.2), 0 10px 20px rgba(0,0,0,0.1)`,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Iridescent Swirls (Simulated with gradients) */}
      <div 
        className="absolute inset-0 rounded-full opacity-60 mix-blend-overlay"
        style={{
          background: `linear-gradient(135deg, ${colors.start}, ${colors.end})`,
          animation: 'sphereSwirl 15s linear infinite',
        }}
      />
      
      {/* Highlight */}
      <div 
        className="absolute top-[15%] left-[15%] w-[20%] h-[15%] rounded-[50%] bg-white blur-[2px] opacity-80"
        style={{ transform: 'rotate(-45deg)' }}
      />
      
      {/* Secondary Highlight */}
      <div 
        className="absolute bottom-[20%] right-[20%] w-[10%] h-[8%] rounded-[50%] bg-white blur-[4px] opacity-40"
      />

      {/* Bubble rim */}
      <div 
        className="absolute inset-0 rounded-full border border-white/30 opacity-50"
      />
    </div>
  );
}
