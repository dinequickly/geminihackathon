import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from "remotion";

export type PerformanceViewProps = {
  animationStartFrame?: number;
};

export const PerformanceView: React.FC<PerformanceViewProps> = ({
  animationStartFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - animationStartFrame);

  // Staggered animations
  const headerOpacity = interpolate(f, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const scoreOpacity = interpolate(f, [10, 25], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const cardsOpacity = interpolate(f, [20, 35], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const statsOpacity = interpolate(f, [30, 45], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Animated score counter
  const scoreValue = interpolate(f, [15, 50], [0, 81], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const communicationScore = interpolate(f, [25, 55], [0, 70], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const presenceScore = interpolate(f, [30, 60], [0, 89], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const technicalScore = interpolate(f, [35, 65], [0, 70], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#fef7f0",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 32,
          width: "100%",
          maxWidth: 900,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        {/* Header */}
        <div
          style={{
            opacity: headerOpacity,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: 0 }}>Overall Performance</h1>
            <span
              style={{
                display: "inline-block",
                marginTop: 8,
                backgroundColor: "#d1fae5",
                color: "#059669",
                padding: "4px 12px",
                borderRadius: 16,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Strong
            </span>
            <p style={{ fontSize: 14, color: "#6b7280", margin: "12px 0 0 0" }}>
              You spoke at 728 WPM with 4 detected filler words.
            </p>
          </div>
          <div style={{ opacity: scoreOpacity, textAlign: "right" }}>
            <div style={{ fontSize: 64, fontWeight: 700, color: "#16a34a", lineHeight: 1 }}>
              {Math.round(scoreValue)}
            </div>
            <div style={{ fontSize: 14, color: "#9ca3af" }}>out of 100</div>
          </div>
        </div>

        {/* Score Cards */}
        <div
          style={{
            opacity: cardsOpacity,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <ScoreCard
            icon="🎙"
            iconBg="#fef3c7"
            label="Communication"
            score={Math.round(communicationScore)}
            color="#f97316"
          />
          <ScoreCard
            icon="✨"
            iconBg="#d1fae5"
            label="Executive Presence"
            score={Math.round(presenceScore)}
            color="#16a34a"
          />
          <ScoreCard
            icon="⚡"
            iconBg="#fef3c7"
            label="Technical Skills"
            score={Math.round(technicalScore)}
            color="#f97316"
          />
        </div>

        {/* Stats Row */}
        <div
          style={{
            opacity: statsOpacity,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <div
            style={{
              backgroundColor: "#f9fafb",
              borderRadius: 12,
              padding: 24,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 14, color: "#9ca3af", marginBottom: 8 }}>💬</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#111827" }}>4</div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>Filler Words</div>
          </div>
          <div
            style={{
              backgroundColor: "#f9fafb",
              borderRadius: 12,
              padding: 24,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 14, color: "#9ca3af", marginBottom: 8 }}>📈</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#111827" }}>728</div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>Words/Min</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

type ScoreCardProps = {
  icon: string;
  iconBg: string;
  label: string;
  score: number;
  color: string;
};

const ScoreCard: React.FC<ScoreCardProps> = ({ icon, iconBg, label, score, color }) => (
  <div
    style={{
      backgroundColor: "#f9fafb",
      borderRadius: 12,
      padding: 20,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
        }}
      >
        {icon}
      </div>
      <span style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>{label}</span>
    </div>
    <span style={{ fontSize: 28, fontWeight: 700, color }}>{score}</span>
  </div>
);
