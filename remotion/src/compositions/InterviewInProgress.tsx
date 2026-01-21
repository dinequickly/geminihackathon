import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Video, staticFile } from "remotion";

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
      {/* Full screen interview video */}
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1f2937",
        }}
      >
        {/* Main interviewer video - full screen wide */}
        {interviewerVideoSrc ? (
          <Video
            src={staticFile(interviewerVideoSrc)}
            loop
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            muted
            volume={0}
          />
        ) : (
          <>
            {/* AI Avatar circle (fallback) */}
            <div
              style={{
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 40px rgba(59, 130, 246, 0.3)",
              }}
            >
              <span style={{ fontSize: 80 }}>🤖</span>
            </div>

            {/* Waveform visualization */}
            <div
              style={{
                position: "absolute",
                bottom: 60,
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

        {/* Timer - top center */}
        <div
          style={{
            position: "absolute",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            borderRadius: 20,
            padding: "8px 20px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            zIndex: 20,
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

        {/* User icon - top right */}
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: "50%",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            zIndex: 20,
          }}
        >
          {/* User avatar with silhouette */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #374151 0%, #4b5563 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: "#6b7280",
              }}
            />
          </div>
        </div>

        {/* AI label - bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: 24,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            borderRadius: 8,
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            zIndex: 20,
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

        {/* Leave Interview button - bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            right: 24,
            zIndex: 20,
          }}
        >
          <button
            style={{
              backgroundColor: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "12px 24px",
              fontSize: 14,
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
