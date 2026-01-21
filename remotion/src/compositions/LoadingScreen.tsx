import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export type LoadingScreenProps = {
  animationStartFrame?: number;
};

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  animationStartFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - animationStartFrame);

  // Fade in animation
  const opacity = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // Loading dots animation
  const dot1 = Math.sin(f * 0.2) > 0 ? 1 : 0.3;
  const dot2 = Math.sin(f * 0.2 - 1) > 0 ? 1 : 0.3;
  const dot3 = Math.sin(f * 0.2 - 2) > 0 ? 1 : 0.3;

  // Pulse animation for the logo
  const pulseScale = 1 + 0.05 * Math.sin(f * 0.1);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#fef7f0",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      {/* Logo/Icon */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 32,
          transform: `scale(${pulseScale})`,
          boxShadow: "0 10px 40px rgba(249, 115, 22, 0.3)",
        }}
      >
        <span style={{ fontSize: 40, color: "#fff" }}>🎥</span>
      </div>

      {/* Loading text */}
      <div
        style={{
          fontSize: 24,
          fontWeight: 600,
          color: "#111827",
          marginBottom: 16,
        }}
      >
        Starting your interview...
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: 15,
          color: "#6b7280",
          marginBottom: 32,
        }}
      >
        Preparing your AI interviewer
      </div>

      {/* Loading dots */}
      <div style={{ display: "flex", gap: 8 }}>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: "#f97316",
            opacity: dot1,
          }}
        />
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: "#f97316",
            opacity: dot2,
          }}
        />
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: "#f97316",
            opacity: dot3,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
