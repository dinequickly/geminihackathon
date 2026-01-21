import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

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
        backgroundColor: "#fef9f3",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: 32,
        overflow: "hidden",
      }}
    >
      {/* Background decorations */}
      <div style={{ position: "absolute", top: 60, right: 100, width: 300, height: 300, borderRadius: "50%", background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", opacity: 0.3 }} />
      <div style={{ position: "absolute", top: 200, right: 200, width: 200, height: 200, borderRadius: "50%", background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", opacity: 0.3 }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div
          style={{
            opacity: headerOpacity,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 32,
          }}
        >
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: 0 }}>InterviewPro</h1>
            <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0 0 0" }}>Welcome back, Maxwell Moroz</p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, border: "2px solid #fbbf24", backgroundColor: "transparent", color: "#fbbf24", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              <span>🛒</span> Shop
            </button>
            <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, border: "none", backgroundColor: "transparent", color: "#6b7280", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
              <span>→</span> Sign out
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div
          style={{
            opacity: statsOpacity,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <StatCard icon="📹" iconBg="#fee2e2" label="Total Sessions" value="8" />
          <StatCard icon="📈" iconBg="#d1fae5" label="Average Score" value="78" />
          <StatCard icon="🏆" iconBg="#fef3c7" label="Best Score" value="83" />
        </div>

        {/* Action Cards */}
        <div
          style={{
            opacity: cardsOpacity,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            marginBottom: 32,
          }}
        >
          {/* Start New Interview - with pulse */}
          <div
            style={{
              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              borderRadius: 16,
              padding: 24,
              color: "#fff",
              position: "relative",
              overflow: "hidden",
              transform: `scale(${pulseScale})`,
              boxShadow: pulseGlow > 0 ? `0 0 ${30 * pulseGlow}px rgba(249, 115, 22, ${pulseGlow})` : "none",
              transition: "box-shadow 0.1s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 24 }}>▶</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Start New Interview</div>
                <div style={{ fontSize: 13, opacity: 0.9 }}>Practice with AI interviewer</div>
              </div>
              <span style={{ fontSize: 20, opacity: 0.8 }}>›</span>
            </div>
          </div>

          {/* Practice with Packs */}
          <div
            style={{
              background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
              borderRadius: 16,
              padding: 24,
              color: "#1f2937",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 24 }}>📦</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Practice with Packs</div>
                <div style={{ fontSize: 13, opacity: 0.8 }}>Use curated question sets</div>
              </div>
              <span style={{ fontSize: 20, opacity: 0.6 }}>›</span>
            </div>
          </div>

          {/* Tavus Video Interview */}
          <div
            style={{
              background: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
              borderRadius: 16,
              padding: 24,
              color: "#fff",
              position: "relative",
            }}
          >
            <div style={{ position: "absolute", top: 12, right: 12, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12, padding: "4px 10px", fontSize: 10, fontWeight: 700 }}>
              PREMIUM
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 24 }}>🎥</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Tavus Video Interview</div>
                <div style={{ fontSize: 13, opacity: 0.9 }}>AI video interviewer powered by Tavus</div>
              </div>
              <span style={{ fontSize: 20, opacity: 0.8 }}>›</span>
            </div>
          </div>
        </div>

        {/* Previous Sessions */}
        <div style={{ opacity: sessionsOpacity }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: "0 0 16px 0" }}>Previous Sessions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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

const StatCard: React.FC<{ icon: string; iconBg: string; label: string; value: string }> = ({ icon, iconBg, label, value }) => (
  <div
    style={{
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 20,
      display: "flex",
      alignItems: "center",
      gap: 16,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}
  >
    <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 13, color: "#6b7280" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>{value}</div>
    </div>
  </div>
);

const SessionRow: React.FC<{ date: string; status: "Processing" | "In Progress" | "Complete"; score?: number }> = ({ date, status, score }) => {
  const statusColors = {
    Processing: { bg: "#fef3c7", text: "#d97706" },
    "In Progress": { bg: "#dbeafe", text: "#3b82f6" },
    Complete: { bg: "#d1fae5", text: "#059669" },
  };

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        display: "flex",
        alignItems: "center",
        gap: 16,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 18, color: "#9ca3af" }}>🎥</span>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>Interview Session</div>
        <div style={{ fontSize: 13, color: "#9ca3af", display: "flex", alignItems: "center", gap: 8 }}>
          <span>⏱</span> --:-- <span style={{ marginLeft: 8 }}>{date}</span>
        </div>
      </div>
      {score && <div style={{ fontSize: 24, fontWeight: 700, color: "#059669", marginRight: 8 }}>{score}</div>}
      <div
        style={{
          backgroundColor: statusColors[status].bg,
          color: statusColors[status].text,
          padding: "6px 12px",
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {status}
      </div>
      <span style={{ color: "#d1d5db", fontSize: 18 }}>›</span>
    </div>
  );
};
