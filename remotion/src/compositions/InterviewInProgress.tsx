import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, OffthreadVideo, staticFile } from "remotion";

export type InterviewInProgressProps = {
  animationStartFrame?: number;
  interviewerVideoSrc?: string; // Path to screen recording for interviewer side
};

export const InterviewInProgress: React.FC<InterviewInProgressProps> = ({
  animationStartFrame = 0,
  interviewerVideoSrc,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - animationStartFrame);

  // Fade in animation
  const opacity = interpolate(f, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  // Timer animation (starts at 1:45, counts up)
  const seconds = Math.floor(f / 30) + 105; // Start at 1:45 (105 seconds)
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeDisplay = `${minutes}:${String(secs).padStart(2, "0")}`;

  // Waveform animation for AI (fallback if no video)
  const wavePhase = f * 0.15;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#111827",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        opacity,
      }}
    >
      {/* Main content */}
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 24,
        }}
      >
        {/* Timer */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: 20,
              padding: "8px 20px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#ef4444",
              }}
            />
            <span style={{ color: "#fff", fontSize: 16, fontWeight: 600, fontFamily: "monospace" }}>
              {timeDisplay}
            </span>
          </div>
        </div>

        {/* Video panels */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
        >
          {/* User video panel */}
          <div
            style={{
              backgroundColor: "#1f2937",
              borderRadius: 16,
              overflow: "hidden",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Simulated user silhouette */}
            <div
              style={{
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #374151 0%, #4b5563 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  backgroundColor: "#6b7280",
                  marginBottom: 60,
                }}
              />
            </div>
            {/* Shoulders */}
            <div
              style={{
                position: "absolute",
                bottom: 100,
                width: 280,
                height: 140,
                borderRadius: "50% 50% 0 0",
                background: "linear-gradient(135deg, #374151 0%, #4b5563 100%)",
              }}
            />

            {/* User label */}
            <div
              style={{
                position: "absolute",
                bottom: 16,
                left: 16,
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                borderRadius: 8,
                padding: "6px 12px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#22c55e",
                }}
              />
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>You</span>
            </div>
          </div>

          {/* AI Interviewer panel */}
          <div
            style={{
              backgroundColor: "#1f2937",
              borderRadius: 16,
              overflow: "hidden",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
            }}
          >
            {/* Video overlay if provided */}
            {interviewerVideoSrc ? (
              <OffthreadVideo
                src={staticFile(interviewerVideoSrc)}
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                muted
              />
            ) : (
              <>
                {/* AI Avatar circle (fallback) */}
                <div
                  style={{
                    width: 160,
                    height: 160,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 40px rgba(59, 130, 246, 0.3)",
                  }}
                >
                  <span style={{ fontSize: 64 }}>🤖</span>
                </div>

                {/* Waveform visualization */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    height: 60,
                  }}
                >
                  {Array.from({ length: 20 }).map((_, i) => {
                    const height = 20 + Math.sin(wavePhase + i * 0.5) * 15 + Math.random() * 10;
                    return (
                      <div
                        key={i}
                        style={{
                          width: 4,
                          height: Math.max(8, height),
                          backgroundColor: "#3b82f6",
                          borderRadius: 2,
                          opacity: 0.6 + Math.sin(wavePhase + i * 0.3) * 0.4,
                        }}
                      />
                    );
                  })}
                </div>
              </>
            )}

            {/* AI label */}
            <div
              style={{
                position: "absolute",
                bottom: 16,
                left: 16,
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                borderRadius: 8,
                padding: "6px 12px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                zIndex: 10,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#3b82f6",
                }}
              />
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>AI Interviewer</span>
            </div>
          </div>
        </div>

        {/* Bottom controls - simplified */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          {/* Leave Interview button (no emoji) */}
          <button
            style={{
              backgroundColor: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "14px 24px",
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Leave Interview
          </button>
        </div>
      </div>
    </AbsoluteFill>
  );
};
