import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export type InterviewConfigProps = {
  animationStartFrame?: number;
  scrollY?: number;
};

export const InterviewConfig: React.FC<InterviewConfigProps> = ({
  animationStartFrame = 0,
  scrollY = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - animationStartFrame);

  // Staggered animations
  const headerOpacity = interpolate(f, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const stepOpacity = interpolate(f, [5, 20], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const durationOpacity = interpolate(f, [15, 30], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const personaOpacity = interpolate(f, [25, 40], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const behavioralOpacity = interpolate(f, [35, 50], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const dialOpacity = interpolate(f, [45, 60], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const focusOpacity = interpolate(f, [55, 70], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const responseOpacity = interpolate(f, [65, 80], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const styleOpacity = interpolate(f, [75, 90], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const buttonOpacity = interpolate(f, [85, 100], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const autoScrollY = interpolate(f, [40, 160], [0, 320], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const pressScale = interpolate(f, [180, 186, 194], [1, 0.96, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Slider animations
  const lengthSliderValue = interpolate(f, [25, 50], [5, 8], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const emphasisSliderValue = interpolate(f, [50, 75], [2, 5], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  const tag1Selected = f > 65;
  const tag2Selected = f > 75;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#ffffff",
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        overflow: "hidden",
      }}
    >
      {/* LightLeakBackground */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", backgroundColor: "#ffffff" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom right, rgba(219, 234, 254, 0.3), #ffffff, rgba(253, 232, 208, 0.3))" }} />
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
          transform: `translateY(${-scrollY - autoScrollY}px)`,
          padding: "48px 32px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Header */}
          <div style={{ opacity: headerOpacity, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 36, fontWeight: 400, color: "#000000", margin: 0, letterSpacing: "-0.02em" }}>
              Interview setup
            </h1>
            <button style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13, fontWeight: 600, color: "#666666", backgroundColor: "transparent", border: "none", cursor: "pointer" }}>
              ← Back
            </button>
          </div>

          {/* Step Indicator */}
          <div style={{ opacity: stepOpacity, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 400 }}>Step 2</span>
            <div style={{ width: 40, height: 2, backgroundColor: "#fbbf24" }} />
          </div>

          {/* Main Content Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>
            {/* Left Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Title */}
              <div style={{ opacity: stepOpacity }}>
                <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 32, fontWeight: 400, color: "#000000", margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>
                  Shape the session flow
                </h2>
                <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, color: "#666666", margin: 0, fontWeight: 400 }}>
                  Adjust the length and preferences below. Everything stays within your guardrails.
                </p>
              </div>

              {/* Duration Section */}
              <div style={{ opacity: durationOpacity }}>
                <LiquidGlassCard>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 400, marginBottom: 16 }}>
                    Duration
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, fontWeight: 400, color: "#000000", margin: 0, letterSpacing: "-0.02em" }}>
                      Interview length
                    </h3>
                    <div style={{ backgroundColor: "#fef3c7", padding: "8px 16px", borderRadius: 12, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, fontWeight: 400, color: "#d97706" }}>
                        {Math.round(lengthSliderValue)}
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: "#d97706", fontWeight: 600 }}>min</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: "#666666", marginBottom: 16, fontWeight: 400 }}>
                    Tune the pacing for quick checks or deeper dives.
                  </p>
                  <div style={{ position: "relative", height: 8, background: "linear-gradient(to right, #ddd, #bbb)", borderRadius: 999, marginBottom: 12 }}>
                    <div
                      style={{
                        position: "absolute",
                        left: `${((lengthSliderValue - 5) / 10) * 100}%`,
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 24,
                        height: 24,
                        background: "#f97316",
                        borderRadius: "50%",
                        border: "3px solid #fff",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: "#888888", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 600 }}>
                    <span>Quick (5)</span>
                    <span>Standard (10)</span>
                    <span>Deep (15)</span>
                  </div>
                </LiquidGlassCard>
              </div>

              {/* Interviewer Persona */}
              <div style={{ opacity: personaOpacity }}>
                <LiquidGlassCard>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 400, marginBottom: 12 }}>
                    Interviewer Persona
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 32, height: 32, backgroundColor: "#e8f5e9", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16 }}>
                      💡
                    </div>
                    <p style={{ fontSize: 13, color: "#555555", fontWeight: 400, lineHeight: 1.6, margin: 0 }}>
                      Warm and encouraging. The interviewer actively listens and asks thoughtful follow-up questions to draw out deeper insights, while maintaining a supportive and approachable tone.
                    </p>
                  </div>
                </LiquidGlassCard>
              </div>

              {/* Behavioral Questions */}
              <div style={{ opacity: behavioralOpacity }}>
                <LiquidGlassCard>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 400, marginBottom: 16 }}>
                    Single Pick
                  </div>
                  <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, fontWeight: 400, color: "#000000", margin: "0 0 16px 0", letterSpacing: "-0.02em" }}>
                    What type of behavioral questions would you like to focus on?
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <RadioOption label="Team management" selected={false} />
                    <RadioOption label="Client communication" selected={false} />
                    <RadioOption label="Problem-solving" selected={false} />
                    <RadioOption label="Leadership" selected={false} />
                    <RadioOption label="Time management" selected={false} />
                  </div>
                </LiquidGlassCard>
              </div>

              {/* Dial It In */}
              <div style={{ opacity: dialOpacity }}>
                <LiquidGlassCard>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 400, marginBottom: 16 }}>
                    Dial It In
                  </div>
                  <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, fontWeight: 400, color: "#000000", margin: "0 0 16px 0", letterSpacing: "-0.02em" }}>
                    How much emphasis on past experiences?
                  </h3>
                  <div style={{ position: "relative", height: 8, background: "linear-gradient(to right, #ddd, #bbb)", borderRadius: 999, marginBottom: 12 }}>
                    <div
                      style={{
                        position: "absolute",
                        left: `${((emphasisSliderValue - 1) / 9) * 100}%`,
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 24,
                        height: 24,
                        background: "#f97316",
                        borderRadius: "50%",
                        border: "3px solid #fff",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: "#888888", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 600 }}>
                    <span>Theoretical</span>
                    <span>Practical</span>
                  </div>
                </LiquidGlassCard>
              </div>

              {/* Pick Focus */}
              <div style={{ opacity: focusOpacity }}>
                <LiquidGlassCard>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 400, marginBottom: 16 }}>
                    Pick Focus
                  </div>
                  <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, fontWeight: 400, color: "#000000", margin: "0 0 16px 0", letterSpacing: "-0.02em" }}>
                    Select relevant consulting areas
                  </h3>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <TagButton label="Strategy" selected={tag1Selected} />
                    <TagButton label="Operations" selected={false} />
                    <TagButton label="Finance" selected={tag2Selected} />
                    <TagButton label="HR" selected={false} />
                    <TagButton label="Marketing" selected={false} />
                  </div>
                  <p style={{ fontSize: 11, color: "#888888", marginTop: 12, margin: "12px 0 0 0", fontWeight: 400 }}>
                    Selected: 2 / 5
                  </p>
                </LiquidGlassCard>
              </div>

              {/* Free Response */}
              <div style={{ opacity: responseOpacity }}>
                <LiquidGlassCard>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 400, marginBottom: 16 }}>
                    Free Response
                  </div>
                  <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, fontWeight: 400, color: "#000000", margin: "0 0 16px 0", letterSpacing: "-0.02em" }}>
                    Any specific industries or sectors to focus on?
                  </h3>
                  <input
                    type="text"
                    placeholder="e.g. Healthcare, Finance, Technology"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: 12,
                      border: "1px solid #ddd",
                      backgroundColor: "#f9f9f9",
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                      fontSize: 13,
                      color: "#666666",
                      boxSizing: "border-box",
                    }}
                  />
                  <p style={{ fontSize: 11, color: "#888888", marginTop: 8, fontWeight: 400 }}>
                    0 / 100 characters
                  </p>
                </LiquidGlassCard>
              </div>

              {/* Interview Style */}
              <div style={{ opacity: styleOpacity }}>
                <LiquidGlassCard>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 400, marginBottom: 16 }}>
                    Single Pick
                  </div>
                  <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, fontWeight: 400, color: "#000000", margin: "0 0 16px 0", letterSpacing: "-0.02em" }}>
                    What is your preferred interview style for behavioral questions?
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <RadioOption label="Conversational" selected={false} />
                    <RadioOption label="Formal" selected={false} />
                    <RadioOption label="Case study" selected={false} />
                  </div>
                </LiquidGlassCard>
              </div>
            </div>

            {/* Right Column - Session Snapshot */}
            <div style={{ opacity: durationOpacity }}>
              <LiquidGlassCard>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 400, marginBottom: 16 }}>
                  Session Snapshot
                </div>
                <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, fontWeight: 400, color: "#000000", margin: "0 0 20px 0", letterSpacing: "-0.02em" }}>
                  Ready when you are
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <SnapshotItem label="Length" value={`${Math.round(lengthSliderValue)} min`} />
                  <SnapshotItem label="Modules" value="5" />
                  <SnapshotItem label="Experience" value="Video avatar" />
                </div>
              </LiquidGlassCard>
            </div>
          </div>

          {/* Start Interview Button */}
          <div style={{ opacity: buttonOpacity, display: "flex", justifyContent: "flex-end" }}>
            <button
              style={{
                backgroundColor: "#f97316",
                color: "#fff",
                border: "none",
                borderRadius: 20,
                padding: "12px 32px",
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transform: `scale(${pressScale})`,
              }}
            >
              ▶ Start Interview
            </button>
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
      borderRadius: 20,
      padding: 24,
      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.15), 0 0 20px rgba(255, 255, 255, 0.1)",
    }}
  >
    {children}
  </div>
);

// Radio Option Component
const RadioOption: React.FC<{ label: string; selected: boolean }> = ({ label, selected }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", backgroundColor: "rgba(0, 0, 0, 0.02)", borderRadius: 10 }}>
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        border: `2px solid ${selected ? "#f97316" : "#ddd"}`,
        backgroundColor: selected ? "#f97316" : "transparent",
      }}
    />
    <span style={{ fontSize: 13, color: "#333333", fontWeight: 400 }}>{label}</span>
  </div>
);

// Tag Button Component
const TagButton: React.FC<{ label: string; selected: boolean }> = ({ label, selected }) => (
  <div
    style={{
      padding: "8px 14px",
      borderRadius: 12,
      backgroundColor: selected ? "#f97316" : "#f0f0f0",
      color: selected ? "#fff" : "#666666",
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: 12,
      fontWeight: 500,
      cursor: "pointer",
    }}
  >
    {label}
  </div>
);

// Snapshot Item Component
const SnapshotItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: "1px solid rgba(0, 0, 0, 0.1)" }}>
    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: "#888888", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 600 }}>
      {label}
    </span>
    <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16, fontWeight: 400, color: "#000000" }}>
      {value}
    </span>
  </div>
);
