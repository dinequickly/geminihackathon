import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export type ResultsViewProps = {
  animationStartFrame?: number;
  scrollY?: number;
};

export const ResultsView: React.FC<ResultsViewProps> = ({
  animationStartFrame = 0,
  scrollY = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - animationStartFrame);

  // Staggered animations
  const headerOpacity = interpolate(f, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const scoreOpacity = interpolate(f, [10, 25], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const cardsOpacity = interpolate(f, [20, 35], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const emotionsOpacity = interpolate(f, [15, 30], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const transcriptOpacity = interpolate(f, [30, 45], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const msg1Opacity = interpolate(f, [35, 50], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const msg2Opacity = interpolate(f, [45, 60], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const msg3Opacity = interpolate(f, [55, 70], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const msg4Opacity = interpolate(f, [65, 80], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Animated score counter
  const scoreValue = interpolate(f, [15, 50], [0, 81], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const communicationScore = interpolate(f, [25, 55], [0, 70], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const presenceScore = interpolate(f, [30, 60], [0, 89], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const technicalScore = interpolate(f, [35, 65], [0, 70], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Animated emotion bars
  const confusionBar = interpolate(f, [20, 50], [0, 77], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const calmnessBar = interpolate(f, [25, 55], [0, 29], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

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
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Top Row: Performance + Live Emotions */}
        <div style={{ display: "flex", gap: 16 }}>
          {/* Left Column - Performance */}
          <div style={{ width: 400, display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Header with Score */}
            <div
              style={{
                opacity: headerOpacity,
                backgroundColor: "#fff",
                borderRadius: 14,
                padding: 18,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h1 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0 }}>Overall Performance</h1>
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: 6,
                      backgroundColor: "#d1fae5",
                      color: "#059669",
                      padding: "3px 10px",
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    Strong
                  </span>
                </div>
                <div style={{ opacity: scoreOpacity, textAlign: "right" }}>
                  <div style={{ fontSize: 42, fontWeight: 700, color: "#16a34a", lineHeight: 1 }}>
                    {Math.round(scoreValue)}
                  </div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>out of 100</div>
                </div>
              </div>
              <p style={{ fontSize: 11, color: "#6b7280", margin: "8px 0 0 0" }}>
                728 WPM · 4 filler words detected
              </p>
            </div>

            {/* Score Cards */}
            <div style={{ opacity: cardsOpacity, display: "flex", flexDirection: "column", gap: 8 }}>
              <ScoreCard icon="🎙" iconBg="#fef3c7" label="Communication" score={Math.round(communicationScore)} color="#f97316" />
              <ScoreCard icon="✨" iconBg="#d1fae5" label="Executive Presence" score={Math.round(presenceScore)} color="#16a34a" />
              <ScoreCard icon="⚡" iconBg="#fef3c7" label="Technical Skills" score={Math.round(technicalScore)} color="#f97316" />
            </div>

            {/* Stats Row */}
            <div style={{ opacity: cardsOpacity, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <StatCard icon="💬" value="4" label="Filler Words" />
              <StatCard icon="📈" value="728" label="Words/Min" />
            </div>
          </div>

          {/* Right Column - Live Emotions */}
          <div style={{ flex: 1, opacity: emotionsOpacity }}>
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: 14,
                padding: 18,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                height: "100%",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: 0.5, marginBottom: 16 }}>
                LIVE EMOTIONS
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* Facial Expression */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", marginBottom: 8 }}>FACIAL EXPRESSION</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: "#8b5cf6" }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Confusion</span>
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "#f97316" }}>{Math.round(confusionBar)}%</span>
                  </div>
                  <div style={{ height: 6, backgroundColor: "#e5e7eb", borderRadius: 3, marginBottom: 12, overflow: "hidden" }}>
                    <div style={{ width: `${confusionBar}%`, height: "100%", backgroundColor: "#ec4899", borderRadius: 3 }} />
                  </div>
                  {[
                    { label: "Admiration", value: 6 },
                    { label: "Adoration", value: 5 },
                    { label: "Concentration", value: 8 },
                  ].map((e) => (
                    <div key={e.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <div style={{ width: 100, height: 3, backgroundColor: "#e5e7eb", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${e.value * 5}%`, height: "100%", backgroundColor: "#f472b6" }} />
                      </div>
                      <span style={{ fontSize: 10, color: "#6b7280", flex: 1 }}>{e.label}</span>
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>{e.value}%</span>
                    </div>
                  ))}
                </div>

                {/* Voice Prosody */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", marginBottom: 8 }}>VOICE PROSODY</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: "#06b6d4" }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Calmness</span>
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "#06b6d4" }}>{Math.round(calmnessBar)}%</span>
                  </div>
                  <div style={{ height: 6, backgroundColor: "#e5e7eb", borderRadius: 3, marginBottom: 12, overflow: "hidden" }}>
                    <div style={{ width: `${calmnessBar}%`, height: "100%", backgroundColor: "#ec4899", borderRadius: 3 }} />
                  </div>
                  {[
                    { label: "Confidence", value: 7 },
                    { label: "Enthusiasm", value: 4 },
                    { label: "Clarity", value: 6 },
                  ].map((e) => (
                    <div key={e.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <div style={{ width: 100, height: 3, backgroundColor: "#e5e7eb", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${e.value * 5}%`, height: "100%", backgroundColor: "#f472b6" }} />
                      </div>
                      <span style={{ fontSize: 10, color: "#6b7280", flex: 1 }}>{e.label}</span>
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>{e.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transcript Section */}
        <div style={{ opacity: transcriptOpacity }}>
          {/* Transcript Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 14,
              marginBottom: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <span style={{ fontSize: 18 }}>💬</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Conversation Transcript</span>
            <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
              <span style={{ backgroundColor: "#fef3c7", color: "#d97706", padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 500 }}>✨ with emotions</span>
            </div>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "#6b7280" }}>8 messages • 144 readings</span>
          </div>

          {/* Messages */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ opacity: msg1Opacity }}>
              <MessageCard type="interviewer" time="0:00" content="Hi there! What is your first & last name?" />
            </div>
            <div style={{ opacity: msg2Opacity }}>
              <MessageCard type="user" time="0:02" content="Maxwell Moroz." faceEmotion="Confusion" faceValue={58} />
            </div>
            <div style={{ opacity: msg3Opacity }}>
              <MessageCard
                type="interviewer"
                time="0:10"
                content="Alright Maxwell, thank you. I have your resume here, and I see you're applying for an Analyst position at Quantum Base. Let's dive right in. Could you tell me about a time you led a data-driven project?"
              />
            </div>
            <div style={{ opacity: msg4Opacity }}>
              <MessageCard
                type="user"
                time="0:19"
                content="Yeah, so I led a project where we analyzed market trends using quantitative models. We looked at it from a data-driven perspective and identified key opportunities for the fund..."
                faceEmotion="Concentration"
                faceValue={72}
                prosodyEmotion="Confidence"
                prosodyValue={65}
              />
            </div>
            <div style={{ opacity: msg4Opacity }}>
              <MessageCard
                type="interviewer"
                time="0:45"
                content="That's great. Can you walk me through the specific methodology you used for the quantitative analysis?"
              />
            </div>
            <div style={{ opacity: msg4Opacity }}>
              <MessageCard
                type="user"
                time="0:52"
                content="Absolutely. We used a combination of regression analysis and Monte Carlo simulations to model different market scenarios..."
                faceEmotion="Engagement"
                faceValue={81}
                prosodyEmotion="Enthusiasm"
                prosodyValue={74}
              />
            </div>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button
            style={{
              flex: 1,
              backgroundColor: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "14px 20px",
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            🔄 Practice Again
          </button>
          <button
            style={{
              flex: 1,
              backgroundColor: "#fff",
              color: "#374151",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: "14px 20px",
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            ← Back to Dashboard
          </button>
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
      backgroundColor: "#fff",
      borderRadius: 10,
      padding: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
        }}
      >
        {icon}
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{label}</span>
    </div>
    <span style={{ fontSize: 22, fontWeight: 700, color }}>{score}</span>
  </div>
);

type StatCardProps = {
  icon: string;
  value: string;
  label: string;
};

const StatCard: React.FC<StatCardProps> = ({ icon, value, label }) => (
  <div
    style={{
      backgroundColor: "#fff",
      borderRadius: 10,
      padding: 12,
      textAlign: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    }}
  >
    <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>{icon}</div>
    <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>{value}</div>
    <div style={{ fontSize: 10, color: "#6b7280" }}>{label}</div>
  </div>
);

type MessageCardProps = {
  type: "interviewer" | "user";
  time: string;
  content: string;
  faceEmotion?: string;
  faceValue?: number;
  prosodyEmotion?: string;
  prosodyValue?: number;
};

const MessageCard: React.FC<MessageCardProps> = ({
  type,
  time,
  content,
  faceEmotion,
  faceValue,
  prosodyEmotion,
  prosodyValue,
}) => {
  const isInterviewer = type === "interviewer";

  return (
    <div
      style={{
        backgroundColor: isInterviewer ? "#fff8f0" : "#fff",
        border: isInterviewer ? "1px solid #fed7aa" : "1px solid #e5e7eb",
        borderRadius: 10,
        padding: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 6,
            backgroundColor: isInterviewer ? "#fed7aa" : "#dbeafe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
          }}
        >
          {isInterviewer ? "🤖" : "👤"}
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: isInterviewer ? "#ea580c" : "#3b82f6" }}>
          {isInterviewer ? "Interviewer" : "You"}
        </span>
        <span style={{ fontSize: 10, color: "#9ca3af" }}>{time}</span>

        {faceEmotion && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10 }}>
              <span style={{ backgroundColor: "#d1fae5", padding: "2px 5px", borderRadius: 4, fontSize: 9 }}>FACE</span>
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#8b5cf6" }} />
              <span style={{ fontWeight: 600, color: "#374151" }}>{faceEmotion}</span>
              <span style={{ color: "#f97316", fontWeight: 600 }}>{faceValue}%</span>
            </div>
            {prosodyEmotion && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10 }}>
                <span style={{ backgroundColor: "#fef3c7", padding: "2px 5px", borderRadius: 4, fontSize: 9 }}>VOICE</span>
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#06b6d4" }} />
                <span style={{ fontWeight: 600, color: "#374151" }}>{prosodyEmotion}</span>
                <span style={{ color: "#06b6d4", fontWeight: 600 }}>{prosodyValue}%</span>
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>{content}</div>
    </div>
  );
};
