
export function LightLeakBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-parchment-100 pointer-events-none">
      {/* Base gradient - warm parchment tones */}
      <div className="absolute inset-0 bg-gradient-to-br from-aristotle-50/25 via-parchment-100 to-plato-50/25" />

      {/* Golden Ochre Orb (Aristotle) - subtle */}
      <div
        className="absolute top-[-15%] left-[-15%] w-[55vw] h-[55vw] rounded-full bg-aristotle-200/15 blur-[120px] animate-pulse-slow"
        style={{ animationDuration: '12s' }}
      />

      {/* Terracotta/Salmon Orb (Plato) - subtle */}
      <div
        className="absolute bottom-[-15%] right-[-15%] w-[55vw] h-[55vw] rounded-full bg-plato-200/15 blur-[120px] animate-pulse-slow"
        style={{ animationDuration: '14s', animationDelay: '1s' }}
      />

      {/* Sage/Olive Orb (Zeno) - very subtle */}
      <div
        className="absolute top-[35%] left-[35%] w-[35vw] h-[35vw] rounded-full bg-zeno-200/12 blur-[100px] animate-float-slow"
        style={{ animationDelay: '2s' }}
      />

      {/* Subtle Cool Blue Accent (Socrates) - very subtle */}
      <div
        className="absolute top-[60%] right-[20%] w-[25vw] h-[25vw] rounded-full bg-socrates-100/10 blur-[80px] animate-pulse-slow"
        style={{ animationDuration: '16s', animationDelay: '3s' }}
      />

      {/* Warm Parchment Overlay - lighter */}
      <div className="absolute inset-0 bg-parchment-50/15" />
    </div>
  );
}
