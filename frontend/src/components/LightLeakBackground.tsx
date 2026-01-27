
export function LightLeakBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-parchment-100 pointer-events-none">
      {/* Base gradient - warm parchment tones */}
      <div className="absolute inset-0 bg-gradient-to-br from-aristotle-100/40 via-parchment-100 to-plato-100/40" />

      {/* Golden Ochre Orb (Aristotle) */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-aristotle-300/25 blur-[100px] animate-pulse-slow"
        style={{ animationDuration: '10s' }}
      />

      {/* Terracotta/Salmon Orb (Plato) */}
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-plato-300/25 blur-[100px] animate-pulse-slow"
        style={{ animationDuration: '12s', animationDelay: '1s' }}
      />

      {/* Sage/Olive Orb (Zeno) */}
      <div
        className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] rounded-full bg-zeno-300/20 blur-[80px] animate-float-slow"
        style={{ animationDelay: '2s' }}
      />

      {/* Subtle Cool Blue Accent (Socrates) - very subtle */}
      <div
        className="absolute top-[60%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-socrates-200/15 blur-[60px] animate-pulse-slow"
        style={{ animationDuration: '14s', animationDelay: '3s' }}
      />

      {/* Warm Parchment Overlay */}
      <div className="absolute inset-0 bg-parchment-50/30" />
    </div>
  );
}
