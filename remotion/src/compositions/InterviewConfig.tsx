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
  const lengthCardOpacity = interpolate(f, [10, 25], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const personaCardOpacity = interpolate(f, [20, 35], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const multiChoiceOpacity = interpolate(f, [30, 45], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const sliderOpacity = interpolate(f, [40, 55], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const tagOpacity = interpolate(f, [50, 65], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const textInputOpacity = interpolate(f, [60, 75], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const buttonOpacity = interpolate(f, [70, 85], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Slider animations
  const lengthSliderValue = interpolate(f, [25, 50], [5, 8], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const techSliderValue = interpolate(f, [45, 70], [1, 5], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Persona typing
  const personaText = `I'll adopt a collaborative, curiosity-driven peer persona—supportive yet probing, focused on helping you showcase your product thinking and leadership. I'll ask insightful, scenario-based questions, provide constructive feedback, and keep the tone friendly and professional.`;
  const personaChars = interpolate(f, [35, 100], [0, personaText.length], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const displayedPersona = personaText.slice(0, Math.floor(personaChars));

  // Selection animations
  const styleSelected = f > 55;
  const tag1Selected = f > 70;
  const tag2Selected = f > 80;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#fef7f0",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: "hidden",
      }}
    >
      <div
        style={{
          transform: `translateY(${-scrollY}px)`,
          padding: "24px 32px",
        }}
      >
        {/* Back button and progress */}
        <div
          style={{
            opacity: headerOpacity,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 16,
              border: "none",
              backgroundColor: "#0ea5e9",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            ← Back
          </button>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#f97316" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#f97316" }} />
          </div>
        </div>

        {/* Main card */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: 28,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          {/* Header */}
          <div style={{ opacity: headerOpacity, marginBottom: 28 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: 0 }}>
              Configure Your Interview
            </h1>
            <p style={{ fontSize: 15, color: "#6b7280", margin: "8px 0 0 0" }}>
              We've tailored these settings based on your goal. Customize them as needed.
            </p>
          </div>

          {/* Interview Length Card - Primary/Sky gradient */}
          <div
            style={{
              opacity: lengthCardOpacity,
              background: "linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)",
              border: "2px solid #bfdbfe",
              borderRadius: 16,
              padding: 24,
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 18, color: "#fff" }}>⏱</span>
                </div>
                <span style={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>Interview Length</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: "#3b82f6" }}>{Math.round(lengthSliderValue)}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#93c5fd", marginLeft: 4 }}>min</span>
              </div>
            </div>
            <div style={{ position: "relative", height: 12, background: "linear-gradient(to right, #bfdbfe, #e0f2fe)", borderRadius: 6, marginBottom: 12 }}>
              <div
                style={{
                  position: "absolute",
                  left: `${((lengthSliderValue - 5) / 10) * 100}%`,
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 28,
                  height: 28,
                  background: "linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)",
                  borderRadius: "50%",
                  border: "4px solid #fff",
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
              <span>Quick (5 min)</span>
              <span>Standard (10 min)</span>
              <span>Deep (15 min)</span>
            </div>
          </div>

          {/* Interviewer Persona - InfoCard Tip variant (Mint) */}
          <div
            style={{
              opacity: personaCardOpacity,
              backgroundColor: "#ecfdf5",
              border: "2px solid #a7f3d0",
              borderRadius: 16,
              padding: 24,
              marginBottom: 20,
              display: "flex",
              gap: 16,
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#a7f3d0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 24, color: "#059669" }}>💡</span>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Interviewer Persona</div>
              <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>
                {displayedPersona}
                <span style={{ opacity: f % 30 < 15 ? 1 : 0, color: "#10b981" }}>|</span>
              </div>
            </div>
          </div>

          {/* Two column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            {/* MultiChoiceCard - Sky variant */}
            <div
              style={{
                opacity: multiChoiceOpacity,
                backgroundColor: "#f0f9ff",
                border: "2px solid #7dd3fc",
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #e0f2fe, #bae6fd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#0284c7" }}>M</div>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>What is your preferred interview style?</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["Conversational", "Formal", "Technical deep-dive", "Case-study focused"].map((style, i) => (
                  <div
                    key={style}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      borderRadius: 12,
                      border: styleSelected && i === 0 ? "2px solid #0ea5e9" : "2px solid #e2e8f0",
                      backgroundColor: styleSelected && i === 0 ? "#e0f2fe" : "#fff",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#374151",
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: styleSelected && i === 0 ? "6px solid #0ea5e9" : "2px solid #cbd5e1",
                        backgroundColor: "#fff",
                      }}
                    />
                    {style}
                  </div>
                ))}
              </div>
            </div>

            {/* SliderCard - Mint variant */}
            <div
              style={{
                opacity: sliderOpacity,
                backgroundColor: "#ecfdf5",
                border: "2px solid #6ee7b7",
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #d1fae5, #a7f3d0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#059669" }}>S</div>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>How technical should we go?</span>
              </div>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <span style={{ fontSize: 48, fontWeight: 900, color: "#10b981" }}>{Math.round(techSliderValue)}</span>
              </div>
              <div style={{ position: "relative", height: 12, backgroundColor: "#d1fae5", borderRadius: 6, marginBottom: 12 }}>
                <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${(techSliderValue / 10) * 100}%`, backgroundColor: "#10b981", borderRadius: 6 }} />
                <div
                  style={{
                    position: "absolute",
                    left: `${(techSliderValue / 10) * 100}%`,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 28,
                    height: 28,
                    backgroundColor: "#10b981",
                    borderRadius: "50%",
                    border: "4px solid #fff",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)",
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                <span>High-level<br/>overview</span>
                <span style={{ textAlign: "right" }}>In-depth<br/>technical</span>
              </div>
            </div>
          </div>

          {/* Two column layout continued */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            {/* TagSelector - Primary variant */}
            <div
              style={{
                opacity: tagOpacity,
                backgroundColor: "#fef3ff",
                border: "2px solid #e879f9",
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #fae8ff, #f5d0fe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#a855f7" }}>#</div>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Which topics to focus on?</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  { name: "Product Development", selected: tag1Selected },
                  { name: "Market Analysis", selected: tag2Selected },
                  { name: "Team Management", selected: false },
                  { name: "Data-Driven Decisions", selected: false },
                ].map((tag) => (
                  <div
                    key={tag.name}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 20,
                      fontSize: 13,
                      fontWeight: 700,
                      backgroundColor: tag.selected ? "#f472b6" : "#fff",
                      color: tag.selected ? "#fff" : "#374151",
                      border: tag.selected ? "2px solid #f472b6" : "2px solid #e5e7eb",
                      transform: tag.selected ? "translateY(-2px)" : "none",
                      boxShadow: tag.selected ? "0 4px 12px rgba(244, 114, 182, 0.3)" : "none",
                    }}
                  >
                    {tag.name}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 12, fontWeight: 600, textAlign: "right" }}>
                Selected: {(tag1Selected ? 1 : 0) + (tag2Selected ? 1 : 0)} / 4
              </div>
            </div>

            {/* TextInputCard - Sunshine variant */}
            <div
              style={{
                opacity: textInputOpacity,
                backgroundColor: "#fefce8",
                border: "2px solid #fde047",
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #fef9c3, #fde047)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#ca8a04" }}>T</div>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Any areas to avoid or specific interests?</span>
              </div>
              <div
                style={{
                  backgroundColor: "#fff",
                  border: "2px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 14,
                  fontSize: 14,
                  color: "#9ca3af",
                  minHeight: 60,
                }}
              >
                Enter your preferences or interests...
              </div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 8, fontWeight: 600, textAlign: "right" }}>0 / 100 characters</div>
            </div>
          </div>

          {/* Start Button - Sunshine style */}
          <div style={{ opacity: buttonOpacity, borderTop: "2px solid #f3f4f6", paddingTop: 24 }}>
            <button
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #f97316 0%, #fb923c 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 16,
                padding: "18px 24px",
                fontSize: 17,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                boxShadow: "0 8px 24px rgba(249, 115, 22, 0.35)",
              }}
            >
              <span style={{ fontSize: 20 }}>🎥</span> Start Interview
            </button>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
