
export function LightLeakBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-white pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-pink-50/50" />

      {/* Blue Orb */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-300/20 blur-[100px] animate-pulse-slow"
        style={{ animationDuration: '10s' }}
      />

      {/* Pink Orb */}
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-pink-300/20 blur-[100px] animate-pulse-slow"
        style={{ animationDuration: '12s', animationDelay: '1s' }}
      />

      {/* Silver/Purple Orb */}
      <div 
        className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] rounded-full bg-purple-200/20 blur-[80px] animate-float-slow"
        style={{ animationDelay: '2s' }}
      />

      {/* Frosted Glass Overlay - very subtle texture if needed, but the glass cards will provide the main frosted effect. 
          Here we just ensure the background is subtle enough. */}
      <div className="absolute inset-0 bg-white/10" />
    </div>
  );
}
