import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";

export type ResultsViewProps = {
  animationStartFrame?: number;
  scrollY?: number;
};

export const ResultsView: React.FC<ResultsViewProps> = ({
  animationStartFrame = 0,
  scrollY = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = Math.max(0, frame - animationStartFrame);

  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
  const easeOut = Easing.out(Easing.cubic);
  const fade = (start: number, end: number) =>
    interpolate(t, [start * fps, end * fps], [0, 1], {
      ...clamp,
      easing: easeOut,
    });
  const lift = (start: number, end: number, distance = 16) =>
    interpolate(t, [start * fps, end * fps], [distance, 0], {
      ...clamp,
      easing: easeOut,
    });

  const headerOpacity = fade(0, 0.4);
  const headerLift = lift(0, 0.4, 14);
  const summaryOpacity = fade(0.2, 0.7);
  const summaryLift = lift(0.2, 0.7, 18);
  const improvementsOpacity = fade(0.3, 0.8);
  const improvementsLift = lift(0.3, 0.8, 18);
  const playbackOpacity = fade(0.65, 1.1);
  const playbackLift = lift(0.65, 1.1, 16);
  const footerOpacity = fade(1.4, 1.8);
  const footerLift = lift(1.4, 1.8, 12);

  const scoreValue = interpolate(t, [0.35 * fps, 1.1 * fps], [0, 81], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#ffffff",
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        color: "#000000",
        overflow: "hidden",
      }}
    >
      {/* LightLeakBackground */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", backgroundColor: "#ffffff" }}>
        {/* Base gradient */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom right, rgba(219, 234, 254, 0.3), #ffffff, rgba(253, 232, 208, 0.3))" }} />

        {/* Blue Orb */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "-10%",
            width: "60%",
            height: "60%",
            borderRadius: "50%",
            background: "rgba(147, 197, 253, 0.15)",
            filter: "blur(100px)",
          }}
        />

        {/* Pink Orb */}
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "-10%",
            width: "60%",
            height: "60%",
            borderRadius: "50%",
            background: "rgba(251, 191, 36, 0.1)",
            filter: "blur(100px)",
          }}
        />
      </div>

      <div
        style={{
          transform: `translateY(${-scrollY}px)`,
          padding: 48,
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
          {/* Header */}
          <div
            style={{
              opacity: headerOpacity,
              transform: `translateY(${headerLift}px)`,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, fontWeight: 400, color: "#000000", letterSpacing: "-0.02em" }}>TAVUS</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 400 }}>Analysis Report</span>
            </div>
          </div>

          {/* Overall Score Card */}
          <div
            style={{
              opacity: summaryOpacity,
              transform: `translateY(${summaryLift}px)`,
            }}
          >
            <LiquidGlassCard>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
                <div>
                  <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 36, fontWeight: 400, color: "#000000", marginBottom: 8, letterSpacing: "-0.02em" }}>Performance Summary</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 400, padding: "4px 8px", backgroundColor: "rgba(0, 0, 0, 0.05)", borderRadius: 6, display: "inline-block" }}>
                    Strong
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 72, fontWeight: 400, color: "#000000", lineHeight: 1, letterSpacing: "-0.02em" }}>{Math.round(scoreValue)}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 4, fontWeight: 400 }}>Score Index</div>
                </div>
              </div>

              {/* Category Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16, justifyItems: "center" }}>
                <ScoreCategory icon="🎤" label="Communication" score={70} />
                <ScoreCategory icon="✨" label="Presence" score={89} />
                <ScoreCategory icon="🧠" label="Technical" score={70} />
                <ScoreCategory icon="φ" label="Filler Words" score={4} />
                <ScoreCategory icon="⚡" label="Words / Min" score={728} />
                <ScoreCategory icon="❤️" label="EQ" score={75} />
              </div>
            </LiquidGlassCard>
          </div>

          {/* Improvements Section */}
          <div
            style={{
              opacity: improvementsOpacity,
              transform: `translateY(${improvementsLift}px)`,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
            }}
          >
            {/* Top Improvements */}
            <LiquidGlassCard>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, fontWeight: 400, color: "#000000", marginBottom: 20, letterSpacing: "-0.02em" }}>Key Improvements</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <ImprovementItem number="01" area="Speaking Pace" suggestion="Consider slowing down your speech to allow for better comprehension." />
                <ImprovementItem number="02" area="Filler Words" suggestion="Reduce use of 'um' and 'uh' - practice strategic pauses instead." />
                <ImprovementItem number="03" area="Eye Contact" suggestion="Maintain more consistent eye contact with the camera." />
              </div>
            </LiquidGlassCard>

            {/* AI Rewrites */}
            <LiquidGlassCard>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, fontWeight: 400, color: "#000000", marginBottom: 20, letterSpacing: "-0.02em" }}>AI Rewrites</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <RewriteItem original="Um, I think we should probably look at the data, you know?" improved="I recommend we analyze the data to identify key trends." />
              </div>
            </LiquidGlassCard>
          </div>

          {/* Playback & Review */}
          <div
            style={{
              opacity: playbackOpacity,
              transform: `translateY(${playbackLift}px)`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, fontWeight: 400, color: "#000000", letterSpacing: "-0.02em" }}>Playback & Review</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "#f3f4f6", padding: "4px", borderRadius: 16 }}>
                <div style={{ padding: "8px 16px", backgroundColor: "#ffffff", borderRadius: 12, fontSize: 13, fontWeight: 500, color: "#000000" }}>Review</div>
                <div style={{ padding: "8px 16px", fontSize: 13, fontWeight: 500, color: "#666666" }}>Watch</div>
              </div>
            </div>
            <LiquidGlassCard>
              <div style={{ height: 300, backgroundColor: "rgba(0, 0, 0, 0.05)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: "#888888" }}>
                [Video & Transcript Player]
              </div>
            </LiquidGlassCard>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              opacity: footerOpacity,
              transform: `translateY(${footerLift}px)`,
              display: "flex",
              gap: 16,
              justifyContent: "center",
            }}
          >
            <LiquidButtonBlack>↻ Practice Again</LiquidButtonBlack>
            <LiquidButtonSecondary>← Return to Dashboard</LiquidButtonSecondary>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Liquid Glass Card Component
const LiquidGlassCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: 24,
      padding: 32,
      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.15), 0 0 20px rgba(255, 255, 255, 0.1)",
    }}
  >
    {children}
  </div>
);

// Score Category Component
const ScoreCategory: React.FC<{ icon: string; label: string; score: number }> = ({ icon, label, score }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
    <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
    <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, fontWeight: 400, color: "#000000", marginBottom: 4, letterSpacing: "-0.02em" }}>{score}</div>
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 400 }}>{label}</div>
  </div>
);

// Improvement Item Component
const ImprovementItem: React.FC<{ number: string; area: string; suggestion: string }> = ({ number, area, suggestion }) => (
  <div style={{ display: "flex", gap: 12, padding: 12, backgroundColor: "rgba(217, 119, 6, 0.1)", borderRadius: 12 }}>
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, color: "#d97706", opacity: 0.4 }}>0{number}</div>
    <div>
      <div style={{ fontWeight: 600, color: "#000000", marginBottom: 4 }}>{area}</div>
      <div style={{ fontSize: 13, color: "#666666", fontWeight: 400, lineHeight: 1.4 }}>{suggestion}</div>
    </div>
  </div>
);

// Rewrite Item Component
const RewriteItem: React.FC<{ original: string; improved: string }> = ({ original, improved }) => (
  <div style={{ borderRadius: 12, overflow: "hidden" }}>
    <div style={{ padding: 12, backgroundColor: "rgba(239, 68, 68, 0.1)", borderBottom: "1px solid rgba(0, 0, 0, 0.1)" }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: "#ef4444", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>Original</div>
      <div style={{ fontSize: 13, color: "#666666", fontWeight: 400 }}>{original}</div>
    </div>
    <div style={{ padding: 12, backgroundColor: "rgba(34, 197, 94, 0.1)" }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: "#22c55e", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>Optimized</div>
      <div style={{ fontSize: 13, color: "#000000", fontWeight: 400 }}>{improved}</div>
    </div>
  </div>
);

// Liquid Button Black
const LiquidButtonBlack: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: 20,
      padding: "14px 32px",
      color: "#000000",
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: 15,
      fontWeight: 600,
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      cursor: "pointer",
    }}
  >
    {children}
  </div>
);

// Liquid Button Secondary
const LiquidButtonSecondary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: 20,
      padding: "14px 32px",
      color: "#000000",
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: 15,
      fontWeight: 600,
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      cursor: "pointer",
    }}
  >
    {children}
  </div>
);
