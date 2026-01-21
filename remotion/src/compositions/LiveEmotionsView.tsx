import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export type LiveEmotionsViewProps = {
  animationStartFrame?: number;
};

export const LiveEmotionsView: React.FC<LiveEmotionsViewProps> = ({
  animationStartFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - animationStartFrame);

  // Staggered animations
  const headerOpacity = interpolate(f, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const cardsOpacity = interpolate(f, [10, 25], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Animated bars
  const confusionBar = interpolate(f, [15, 45], [0, 77], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const calmnessBar = interpolate(f, [20, 50], [0, 29], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Live time counter
  const timeSeconds = interpolate(f, [0, 120], [0, 4], { extrapolateRight: "clamp" });
  const timeDisplay = `0:${String(Math.floor(timeSeconds)).padStart(2, "0")}`;

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
          maxWidth: 1000,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        {/* Header */}
        <div
          style={{
            opacity: headerOpacity,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>Live Emotions</h1>
            <span style={{ fontSize: 14, color: "#9ca3af" }}>at {timeDisplay}</span>
          </div>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 20,
              border: "1px solid #e5e7eb",
              backgroundColor: "#fff",
              color: "#374151",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            📄 Review Transcript
          </button>
        </div>

        {/* Emotion Cards */}
        <div
          style={{
            opacity: cardsOpacity,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
          }}
        >
          {/* Facial Expression Card */}
          <div
            style={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 24,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: 0.5, marginBottom: 16 }}>
              FACIAL EXPRESSION
            </div>

            {/* Main Emotion */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    backgroundColor: "#8b5cf6",
                  }}
                />
                <span style={{ fontSize: 18, fontWeight: 600, color: "#111827" }}>Confusion</span>
              </div>
              <span style={{ fontSize: 24, fontWeight: 700, color: "#f97316" }}>{Math.round(confusionBar)}%</span>
            </div>

            {/* Main bar */}
            <div style={{ height: 8, backgroundColor: "#e5e7eb", borderRadius: 4, marginBottom: 20, overflow: "hidden" }}>
              <div
                style={{
                  width: `${confusionBar}%`,
                  height: "100%",
                  backgroundColor: "#ec4899",
                  borderRadius: 4,
                }}
              />
            </div>

            {/* Secondary emotions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Admiration", value: 6, color: "#ec4899" },
                { label: "Adoration", value: 5, color: "#6b7280" },
                { label: "Aesthetic...", value: 5, color: "#6b7280" },
              ].map((emotion) => (
                <div key={emotion.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 200, height: 4, backgroundColor: "#e5e7eb", borderRadius: 2, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${emotion.value * 5}%`,
                        height: "100%",
                        backgroundColor: emotion.color,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 12, color: "#6b7280", flex: 1 }}>{emotion.label}</span>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>{emotion.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Voice Prosody Card */}
          <div
            style={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 24,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: 0.5, marginBottom: 16 }}>
              VOICE PROSODY
            </div>

            {/* Main Emotion */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    backgroundColor: "#06b6d4",
                  }}
                />
                <span style={{ fontSize: 18, fontWeight: 600, color: "#111827" }}>Calmness</span>
              </div>
              <span style={{ fontSize: 24, fontWeight: 700, color: "#06b6d4" }}>{Math.round(calmnessBar)}%</span>
            </div>

            {/* Main bar */}
            <div style={{ height: 8, backgroundColor: "#e5e7eb", borderRadius: 4, marginBottom: 20, overflow: "hidden" }}>
              <div
                style={{
                  width: `${calmnessBar}%`,
                  height: "100%",
                  backgroundColor: "#ec4899",
                  borderRadius: 4,
                }}
              />
            </div>

            {/* Secondary emotions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Admiration", value: 5, color: "#ec4899" },
                { label: "Adoration", value: 3, color: "#6b7280" },
                { label: "Aesthetic...", value: 3, color: "#6b7280" },
              ].map((emotion) => (
                <div key={emotion.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 200, height: 4, backgroundColor: "#e5e7eb", borderRadius: 2, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${emotion.value * 5}%`,
                        height: "100%",
                        backgroundColor: emotion.color,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 12, color: "#6b7280", flex: 1 }}>{emotion.label}</span>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>{emotion.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
