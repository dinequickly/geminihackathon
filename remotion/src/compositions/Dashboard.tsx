import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

// Import fonts
import "@fontsource/dm-serif-display";
import "@fontsource/jetbrains-mono";
import "@fontsource/plus-jakarta-sans";

export type DashboardProps = {
  animationStartFrame?: number;
  showPulsingButton?: boolean;
};

export const Dashboard: React.FC<DashboardProps> = ({
  animationStartFrame = 0,
  showPulsingButton = true,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - animationStartFrame);

  // Staggered fade-in animations
  const headerOpacity = interpolate(f, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const statsOpacity = interpolate(f, [10, 25], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const cardsOpacity = interpolate(f, [20, 35], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const sessionsOpacity = interpolate(f, [30, 45], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Pulsing animation for Start Interview button
  const pulseScale = showPulsingButton && f > 50
    ? 1 + 0.03 * Math.sin(f * 0.15)
    : 1;
  const pulseGlow = showPulsingButton && f > 50
    ? 0.3 + 0.2 * Math.sin(f * 0.15)
    : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#ffffff",
        fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: 32,
        overflow: "hidden",
      }}
    >
      {/* LightLeakBackground - animated orbs */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", backgroundColor: "#ffffff" }}>
        {/* Base gradient */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom right, rgba(219, 234, 254, 0.5), #ffffff, rgba(253, 232, 208, 0.5))" }} />

        {/* Blue Orb */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "-10%",
            width: "60vw",
            height: "60vw",
            borderRadius: "50%",
            background: "rgba(147, 197, 253, 0.2)",
            filter: "blur(100px)",
            animation: "pulse-slow 10s ease-in-out infinite",
          }}
        />

        {/* Pink Orb */}
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "-10%",
            width: "60vw",
            height: "60vw",
            borderRadius: "50%",
            background: "rgba(251, 191, 36, 0.15)",
            filter: "blur(100px)",
            animation: "pulse-slow 12s ease-in-out infinite 1s",
          }}
        />
      </div>

      <div style={{ position: "relative", zIndex: 10 }}>
        {/* Header */}
        <div
          style={{
            opacity: headerOpacity,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 48,
            paddingTop: 32,
          }}
        >
          <div>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, fontWeight: 400, color: "#000000", margin: 0, letterSpacing: "-0.02em", textTransform: "uppercase" }}>TAVUS</h1>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: "#888888", margin: "2px 0 0 0", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 400 }}>Dashboard</p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {/* Shop Button */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 16px",
              borderRadius: 16,
              border: "1px solid rgba(255, 255, 255, 0.2)",
              backgroundColor: "rgba(255, 255, 255, 0.4)",
              backdropFilter: "blur(12px)",
              color: "#000000",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}>
              Shop
            </div>

            {/* Sign Out Button */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 16px",
              borderRadius: 16,
              border: "1px solid rgba(255, 255, 255, 0.2)",
              backgroundColor: "rgba(255, 255, 255, 0.4)",
              backdropFilter: "blur(12px)",
              color: "#000000",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}>
              Sign out
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div
          style={{
            opacity: statsOpacity,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
            marginBottom: 32,
          }}
        >
          <LiquidGlassCard icon="📹" label="Total Sessions" value="8" />
          <LiquidGlassCard icon="📈" label="Average Score" value="78" />
          <LiquidGlassCard icon="🏆" label="Best Score" value="83" />
        </div>

        {/* Action Cards */}
        <div
          style={{
            opacity: cardsOpacity,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
            marginBottom: 48,
          }}
        >
          {/* Start New Interview - with pulse */}
          <ActionCard
            emoji="▶"
            title="Start New Interview"
            subtitle="Practice with AI interviewer"
            scale={pulseScale}
            glow={pulseGlow}
          />

          {/* Practice with Packs */}
          <ActionCard
            emoji="📦"
            title="Practice with Packs"
            subtitle="Use curated question sets"
            scale={1}
            glow={0}
          />

          {/* Tavus Video Interview */}
          <ActionCard
            emoji="🎥"
            title="Tavus Video Interview"
            subtitle="AI video interviewer"
            badge="Premium"
            scale={1}
            glow={0}
          />
        </div>

        {/* Previous Sessions */}
        <div style={{ opacity: sessionsOpacity }}>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 32, fontWeight: 400, color: "#000000", margin: "0 0 32px 0", letterSpacing: "-0.02em" }}>Previous Sessions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SessionRow date="Jan 20, 10:46 PM" status="Processing" />
            <SessionRow date="Jan 20, 10:45 PM" status="In Progress" />
            <SessionRow date="Jan 20, 10:21 PM" status="Processing" />
            <SessionRow date="Jan 20, 12:56 PM" status="Processing" />
            <SessionRow date="Jan 12, 10:16 PM" status="Complete" score={83} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Liquid Glass Card Component
const LiquidGlassCard: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <div
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: 24,
      padding: 24,
      display: "flex",
      alignItems: "center",
      gap: 16,
      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.15), 0 0 20px rgba(255, 255, 255, 0.1)",
    }}
  >
    <div style={{ fontSize: 32 }}>{icon}</div>
    <div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, fontWeight: 400 }}>{label}</div>
      <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 32, fontWeight: 400, color: "#000000", letterSpacing: "-0.02em" }}>{value}</div>
    </div>
  </div>
);

// Action Card Component
const ActionCard: React.FC<{ emoji: string; title: string; subtitle: string; badge?: string; scale: number; glow: number }> = ({ emoji, title, subtitle, badge, scale, glow }) => (
  <div
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: 24,
      padding: 32,
      position: "relative",
      overflow: "hidden",
      transform: `scale(${scale})`,
      boxShadow: glow > 0 ? `0 0 ${30 * glow}px rgba(0, 0, 0, ${glow * 0.2}), 0 12px 40px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)` : "0 12px 40px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.15), 0 0 20px rgba(255, 255, 255, 0.1)",
      transition: "all 0.1s",
    }}
  >
    {badge && (
      <div style={{ position: "absolute", top: 16, right: 16, backgroundColor: "rgba(0, 0, 0, 0.2)", borderRadius: 8, padding: "4px 10px", fontSize: 9, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', letterSpacing: "0.08em", textTransform: "uppercase", color: "#000000" }}>
        {badge}
      </div>
    )}

    <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
      <div style={{ fontSize: 40, marginTop: 4 }}>{emoji}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, fontWeight: 400, color: "#000000", marginBottom: 8, letterSpacing: "-0.02em" }}>
          {title}
        </div>
        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, color: "#666666", fontWeight: 400, lineHeight: 1.4 }}>
          {subtitle}
        </div>
      </div>
      <div style={{ fontSize: 20, color: "#999999", marginTop: 6 }}>›</div>
    </div>
  </div>
);

// Session Row Component
const SessionRow: React.FC<{ date: string; status: "Processing" | "In Progress" | "Complete"; score?: number }> = ({ date, status, score }) => {
  const statusStyles = {
    Processing: { bg: "rgba(217, 119, 6, 0.15)", text: "#d97706" },
    "In Progress": { bg: "rgba(59, 130, 246, 0.15)", text: "#3b82f6" },
    Complete: { bg: "rgba(5, 150, 105, 0.15)", text: "#059669" },
  };

  const style = statusStyles[status];

  return (
    <div
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: 24,
        padding: 24,
        display: "flex",
        alignItems: "center",
        gap: 16,
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.15), 0 0 20px rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Icon */}
      <div style={{ fontSize: 28, flexShrink: 0 }}>🎥</div>

      {/* Left content */}
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, fontWeight: 400, color: "#000000", marginBottom: 6, letterSpacing: "-0.02em" }}>Interview Session</div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: "#999999", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 400 }}>⏱ {date}</div>
      </div>

      {/* Right content - score, status, arrow */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        {score && (
          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 32, fontWeight: 400, color: "#000000", marginRight: 4, letterSpacing: "-0.02em" }}>
            {score}
          </div>
        )}
        <div
          style={{
            backgroundColor: style.bg,
            color: style.text,
            padding: "8px 16px",
            borderRadius: 12,
            fontSize: 10,
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {status}
        </div>
        <span style={{ color: "#cccccc", fontSize: 20, marginLeft: 4 }}>›</span>
      </div>
    </div>
  );
};
