import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export type TranscriptViewProps = {
  animationStartFrame?: number;
  scrollY?: number;
};

export const TranscriptView: React.FC<TranscriptViewProps> = ({
  animationStartFrame = 0,
  scrollY = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - animationStartFrame);

  // Staggered animations
  const headerOpacity = interpolate(f, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const msg1Opacity = interpolate(f, [10, 25], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const msg2Opacity = interpolate(f, [20, 35], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const msg3Opacity = interpolate(f, [30, 45], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const msg4Opacity = interpolate(f, [40, 55], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const highlightOpacity = interpolate(f, [25, 40], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#fef7f0",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: 24,
        overflow: "hidden",
      }}
    >
      <div style={{ transform: `translateY(${-scrollY}px)`, display: "flex", gap: 24 }}>
        {/* Main Content */}
        <div style={{ flex: 1 }}>
          {/* Header */}
          <div
            style={{
              opacity: headerOpacity,
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 16,
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <span style={{ fontSize: 20 }}>💬</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>Conversation Transcript</span>
            <div style={{ display: "flex", gap: 8, marginLeft: 16 }}>
              <span style={{ backgroundColor: "#fef3c7", color: "#d97706", padding: "4px 12px", borderRadius: 16, fontSize: 12, fontWeight: 500 }}>✨ with emotions</span>
              <span style={{ backgroundColor: "#fef3c7", color: "#d97706", padding: "4px 12px", borderRadius: 16, fontSize: 12, fontWeight: 500 }}>✏️ 1 highlights</span>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "#6b7280" }}>8 messages • 144 emotion readings</span>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280" }}>
                <input type="checkbox" checked readOnly style={{ accentColor: "#3b82f6" }} /> Auto-scroll
              </label>
            </div>
          </div>

          {/* Messages */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Interviewer Message 1 */}
            <div style={{ opacity: msg1Opacity }}>
              <MessageCard
                type="interviewer"
                time="0:00"
                content="Hi there! What is your first & last name?"
              />
            </div>

            {/* User Message 1 */}
            <div style={{ opacity: msg2Opacity }}>
              <MessageCard
                type="user"
                time="0:02"
                content="Maxwell Moroz."
                faceEmotion="Confusion"
                faceValue={58}
                emotions={[
                  { label: "Admiration", value: 10 },
                  { label: "Adoration", value: 8 },
                  { label: "Aesthetic...", value: 7 },
                ]}
              />
            </div>

            {/* Interviewer Action */}
            <div style={{ opacity: msg3Opacity }}>
              <MessageCard
                type="interviewer"
                time="0:06"
                content=""
                action="Action: Get_User_Info"
              />
            </div>

            {/* Interviewer Message 2 */}
            <div style={{ opacity: msg4Opacity }}>
              <MessageCard
                type="interviewer"
                time="0:10"
                content="Alright Maxwell, thank you. I have your resume here, and I see you're applying for an Analyst position at Quantum Base, a quantum research fund. Well, let's dive right in. Could you start by telling me about a time you led a..."
              />
            </div>

            {/* User Message 2 */}
            <div style={{ opacity: msg4Opacity }}>
              <MessageCard
                type="user"
                time="0:19"
                content="Yeah."
                faceEmotion="Confusion"
                faceValue={59}
                prosodyEmotion="Calmness"
                prosodyValue={29}
                emotions={[
                  { label: "Admiration", value: 7 },
                  { label: "Adoration", value: 4 },
                  { label: "Aesthetic...", value: 6 },
                ]}
                voiceEmotions={[
                  { label: "Admiration", value: 5 },
                  { label: "Adoration", value: 3 },
                  { label: "Aesthetic...", value: 3 },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Highlights Panel */}
        <div
          style={{
            opacity: highlightOpacity,
            width: 280,
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 16,
            height: "fit-content",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>✏️</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>Highlights</span>
            <span style={{ marginLeft: "auto", backgroundColor: "#fef3c7", color: "#d97706", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>1</span>
          </div>
          <div
            style={{
              backgroundColor: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: 8,
              padding: 12,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: "#f97316", marginBottom: 8 }}>
              "And we wanted to look at it from a data-driven perspective while..."
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.4 }}>
              Great way to explain what you did, but it would help to go into more detail. You can not assume that the interviewers understand ANYTHING.
            </div>
            <div style={{ fontSize: 11, color: "#f97316", marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
              <span>●</span> 1/12/2026
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 24,
          right: 24,
          display: "flex",
          gap: 16,
        }}
      >
        <button
          style={{
            flex: 1,
            backgroundColor: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "14px 24px",
            fontSize: 15,
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
            padding: "14px 24px",
            fontSize: 15,
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
    </AbsoluteFill>
  );
};

type MessageCardProps = {
  type: "interviewer" | "user";
  time: string;
  content: string;
  action?: string;
  faceEmotion?: string;
  faceValue?: number;
  prosodyEmotion?: string;
  prosodyValue?: number;
  emotions?: { label: string; value: number }[];
  voiceEmotions?: { label: string; value: number }[];
};

const MessageCard: React.FC<MessageCardProps> = ({
  type,
  time,
  content,
  action,
  faceEmotion,
  faceValue,
  prosodyEmotion,
  prosodyValue,
  emotions,
  voiceEmotions,
}) => {
  const isInterviewer = type === "interviewer";

  return (
    <div
      style={{
        backgroundColor: isInterviewer ? "#fff8f0" : "#fff",
        border: isInterviewer ? "1px solid #fed7aa" : "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: content || action ? 10 : 0 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: isInterviewer ? "#fed7aa" : "#dbeafe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
          }}
        >
          {isInterviewer ? "🤖" : "👤"}
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: isInterviewer ? "#ea580c" : "#3b82f6" }}>
          {isInterviewer ? "Interviewer" : "You"}
        </span>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>{time}</span>

        {/* Emotion badges */}
        {faceEmotion && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
              <span style={{ backgroundColor: "#d1fae5", padding: "2px 6px", borderRadius: 4, fontSize: 10 }}>FACE</span>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#8b5cf6" }} />
              <span style={{ fontWeight: 600, color: "#374151" }}>{faceEmotion}</span>
              <span style={{ color: "#f97316", fontWeight: 600 }}>{faceValue}%</span>
            </div>
            {prosodyEmotion && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <span style={{ backgroundColor: "#fef3c7", padding: "2px 6px", borderRadius: 4, fontSize: 10 }}>PROSODY</span>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#06b6d4" }} />
                <span style={{ fontWeight: 600, color: "#374151" }}>{prosodyEmotion}</span>
                <span style={{ color: "#06b6d4", fontWeight: 600 }}>{prosodyValue}%</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action */}
      {action && (
        <div style={{ backgroundColor: "#f3f4f6", borderRadius: 6, padding: "8px 12px", fontSize: 12, color: "#6b7280", fontFamily: "monospace" }}>
          ⚡ {action}
        </div>
      )}

      {/* Content */}
      {content && (
        <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.5 }}>{content}</div>
      )}

      {/* Emotion bars */}
      {emotions && (
        <div style={{ marginTop: 12, display: "flex", gap: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6 }}>😊 Face</div>
            {emotions.map((e) => (
              <div key={e.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ width: 120, height: 4, backgroundColor: "#e5e7eb", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${e.value * 3}%`, height: "100%", backgroundColor: "#f472b6" }} />
                </div>
                <span style={{ fontSize: 11, color: "#6b7280", width: 70 }}>{e.label}</span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>{e.value}%</span>
              </div>
            ))}
          </div>
          {voiceEmotions && (
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6 }}>🎙 Voice</div>
              {voiceEmotions.map((e) => (
                <div key={e.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 120, height: 4, backgroundColor: "#e5e7eb", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${e.value * 3}%`, height: "100%", backgroundColor: "#f472b6" }} />
                  </div>
                  <span style={{ fontSize: 11, color: "#6b7280", width: 70 }}>{e.label}</span>
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>{e.value}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
