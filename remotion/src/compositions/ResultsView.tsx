import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";

export type ResultsViewProps = {
  animationStartFrame?: number;
  scrollY?: number;
};

const titleFont =
  '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, serif';
const bodyFont = '"Avenir Next", Avenir, "Trebuchet MS", sans-serif';

const palette = {
  bg: "#fef9f3",
  ink: "#1f2937",
  muted: "#6b7280",
  line: "#f1e4d6",
  card: "#fffaf5",
  cardBright: "#ffffff",
  accent: "#f97316",
  accentSoft: "#ffe7cf",
  teal: "#0f766e",
  tealSoft: "#ccfbf1",
  gold: "#d97706",
};

export const ResultsView: React.FC<ResultsViewProps> = ({
  animationStartFrame = 0,
  scrollY = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = Math.max(0, frame - animationStartFrame);

  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
  const easeOut = Easing.out(Easing.cubic);
  const fade = (start: number, end: number) =>
    interpolate(t, [start * fps, end * fps], [0, 1], {
      ...clamp,
      easing: easeOut,
    });
  const lift = (start: number, end: number, distance = 16) =>
    interpolate(t, [start * fps, end * fps], [distance, 0], {
      ...clamp,
      easing: easeOut,
    });

  const headerOpacity = fade(0, 0.4);
  const headerLift = lift(0, 0.4, 14);
  const summaryOpacity = fade(0.2, 0.7);
  const summaryLift = lift(0.2, 0.7, 18);
  const emotionsOpacity = fade(0.3, 0.8);
  const emotionsLift = lift(0.3, 0.8, 18);
  const transcriptOpacity = fade(0.65, 1.1);
  const transcriptLift = lift(0.65, 1.1, 16);
  const footerOpacity = fade(1.4, 1.8);
  const footerLift = lift(1.4, 1.8, 12);

  const msg1Opacity = fade(0.85, 1.1);
  const msg2Opacity = fade(1.0, 1.25);
  const msg3Opacity = fade(1.15, 1.4);
  const msg4Opacity = fade(1.3, 1.55);
  const msg5Opacity = fade(1.45, 1.7);
  const msg6Opacity = fade(1.6, 1.85);
  const msg1Lift = lift(0.85, 1.1, 10);
  const msg2Lift = lift(1.0, 1.25, 10);
  const msg3Lift = lift(1.15, 1.4, 10);
  const msg4Lift = lift(1.3, 1.55, 10);
  const msg5Lift = lift(1.45, 1.7, 10);
  const msg6Lift = lift(1.6, 1.85, 10);

  const scoreValue = interpolate(t, [0.35 * fps, 1.1 * fps], [0, 81], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });
  const communicationScore = interpolate(t, [0.45 * fps, 1.2 * fps], [0, 70], {
    ...clamp,
  });
  const presenceScore = interpolate(t, [0.5 * fps, 1.25 * fps], [0, 89], {
    ...clamp,
  });
  const technicalScore = interpolate(t, [0.55 * fps, 1.3 * fps], [0, 70], {
    ...clamp,
  });
  const confusionValue = interpolate(t, [0.6 * fps, 1.2 * fps], [0, 77], {
    ...clamp,
  });
  const calmnessValue = interpolate(t, [0.7 * fps, 1.3 * fps], [0, 29], {
    ...clamp,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: palette.bg,
        fontFamily: bodyFont,
        color: palette.ink,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -140,
          right: -80,
          width: 380,
          height: 380,
          background:
            "radial-gradient(circle at 30% 30%, rgba(251, 191, 36, 0.45), rgba(251, 191, 36, 0))",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -180,
          left: -140,
          width: 460,
          height: 460,
          background:
            "radial-gradient(circle at 30% 30%, rgba(20, 184, 166, 0.35), rgba(20, 184, 166, 0))",
        }}
      />

      <div
        style={{
          transform: `translateY(${-scrollY}px)`,
          padding: 32,
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              opacity: headerOpacity,
              transform: `translateY(${headerLift}px)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: titleFont,
                  fontSize: 28,
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                Signal Report
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: palette.muted,
                  textTransform: "uppercase",
                  letterSpacing: 1.4,
                }}
              >
                InterviewPro • Analyst Practice
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Tag label="Snapshot 19:50" bg="#ffffff" color={palette.ink} />
              <Tag label="Session 08" bg={palette.accentSoft} color={palette.gold} />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.05fr 1fr",
              gap: 20,
            }}
          >
            <div
              style={{
                opacity: summaryOpacity,
                transform: `translateY(${summaryLift}px)`,
              }}
            >
              <div
                style={{
                  backgroundColor: palette.card,
                  borderRadius: 24,
                  padding: 24,
                  border: `1px solid ${palette.line}`,
                  boxShadow: "0 18px 32px rgba(15, 23, 42, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: titleFont,
                        fontSize: 22,
                        fontWeight: 700,
                        marginBottom: 6,
                      }}
                    >
                      Performance Summary
                    </div>
                    <div style={{ fontSize: 12, color: palette.muted }}>
                      Signal clarity scored from voice + expression.
                    </div>
                  </div>
                  <Tag
                    label="Strong"
                    bg="#fff1df"
                    color={palette.gold}
                    border={palette.accentSoft}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
                  <div
                    style={{
                      fontFamily: titleFont,
                      fontSize: 64,
                      fontWeight: 700,
                      color: palette.accent,
                      lineHeight: 1,
                    }}
                  >
                    {Math.round(scoreValue)}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: 1.4,
                      color: palette.muted,
                      marginBottom: 6,
                    }}
                  >
                    Overall score
                    <div style={{ fontSize: 11, marginTop: 8 }}>
                      out of 100
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <MetricCard icon="💬" label="Filler Words" value="4" />
                  <MetricCard icon="📈" label="Words / Min" value="728" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  <ScoreChip
                    label="Communication"
                    score={Math.round(communicationScore)}
                    color={palette.accent}
                  />
                  <ScoreChip
                    label="Presence"
                    score={Math.round(presenceScore)}
                    color={palette.teal}
                  />
                  <ScoreChip
                    label="Technical"
                    score={Math.round(technicalScore)}
                    color={palette.accent}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                opacity: emotionsOpacity,
                transform: `translateY(${emotionsLift}px)`,
              }}
            >
              <div
                style={{
                  backgroundColor: palette.cardBright,
                  borderRadius: 24,
                  padding: 22,
                  border: `1px solid ${palette.line}`,
                  boxShadow: "0 18px 32px rgba(15, 23, 42, 0.08)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: 1.4,
                        color: palette.muted,
                        marginBottom: 6,
                      }}
                    >
                      Emotion signals
                    </div>
                    <div
                      style={{
                        fontFamily: titleFont,
                        fontSize: 18,
                        fontWeight: 700,
                      }}
                    >
                      Live capture
                    </div>
                  </div>
                  <Tag label="19:50" bg={palette.tealSoft} color={palette.teal} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <EmotionPanel
                    title="Facial Expression"
                    dotColor="#8b5cf6"
                    valueLabel="Confusion"
                    value={Math.round(confusionValue)}
                    valueColor={palette.accent}
                    barColor="#ec4899"
                    subEmotions={[
                      { label: "Admiration", value: 6 },
                      { label: "Adoration", value: 5 },
                      { label: "Concentration", value: 8 },
                    ]}
                  />
                  <EmotionPanel
                    title="Voice Prosody"
                    dotColor="#06b6d4"
                    valueLabel="Calmness"
                    value={Math.round(calmnessValue)}
                    valueColor="#06b6d4"
                    barColor="#ec4899"
                    subEmotions={[
                      { label: "Confidence", value: 7 },
                      { label: "Enthusiasm", value: 4 },
                      { label: "Clarity", value: 6 },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              opacity: transcriptOpacity,
              transform: `translateY(${transcriptLift}px)`,
            }}
          >
            <div
              style={{
                backgroundColor: palette.card,
                borderRadius: 24,
                padding: 22,
                border: `1px solid ${palette.line}`,
                boxShadow: "0 18px 32px rgba(15, 23, 42, 0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 12,
                    backgroundColor: palette.accentSoft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                  }}
                >
                  💬
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: titleFont,
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    Transcript Highlights
                  </div>
                  <div style={{ fontSize: 12, color: palette.muted }}>
                    8 messages • emotion overlay enabled
                  </div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  <Tag label="Auto-scroll" bg="#ffffff" color={palette.muted} />
                  <Tag label="Emotion Layer" bg="#fff1df" color={palette.gold} />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ opacity: msg1Opacity, transform: `translateY(${msg1Lift}px)` }}>
                  <MessageBubble
                    type="interviewer"
                    time="0:00"
                    content="Hi there! What is your first & last name?"
                  />
                </div>
                <div style={{ opacity: msg2Opacity, transform: `translateY(${msg2Lift}px)` }}>
                  <MessageBubble
                    type="user"
                    time="0:02"
                    content="Maxwell Moroz."
                    faceEmotion="Confusion"
                    faceValue={58}
                  />
                </div>
                <div style={{ opacity: msg3Opacity, transform: `translateY(${msg3Lift}px)` }}>
                  <MessageBubble
                    type="interviewer"
                    time="0:10"
                    content="Alright Maxwell, thank you. I have your resume here, and I see you're applying for an Analyst position at Quantum Base. Let's dive right in. Could you tell me about a time you led a data-driven project?"
                  />
                </div>
                <div style={{ opacity: msg4Opacity, transform: `translateY(${msg4Lift}px)` }}>
                  <MessageBubble
                    type="user"
                    time="0:19"
                    content="Yeah, so I led a project where we analyzed market trends using quantitative models. We looked at it from a data-driven perspective and identified key opportunities for the fund..."
                    faceEmotion="Concentration"
                    faceValue={72}
                    prosodyEmotion="Confidence"
                    prosodyValue={65}
                  />
                </div>
                <div style={{ opacity: msg5Opacity, transform: `translateY(${msg5Lift}px)` }}>
                  <MessageBubble
                    type="interviewer"
                    time="0:45"
                    content="That's great. Can you walk me through the specific methodology you used for the quantitative analysis?"
                  />
                </div>
                <div style={{ opacity: msg6Opacity, transform: `translateY(${msg6Lift}px)` }}>
                  <MessageBubble
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
          </div>

          <div
            style={{
              opacity: footerOpacity,
              transform: `translateY(${footerLift}px)`,
              display: "flex",
              gap: 12,
            }}
          >
            <div
              style={{
                flex: 1,
                background:
                  "linear-gradient(135deg, #f97316 0%, #fb923c 100%)",
                color: "#fff",
                borderRadius: 16,
                padding: "14px 20px",
                fontSize: 14,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              ↻ Practice Again
            </div>
            <div
              style={{
                flex: 1,
                backgroundColor: "#fff",
                color: palette.ink,
                border: `1px solid ${palette.line}`,
                borderRadius: 16,
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
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

type TagProps = {
  label: string;
  bg: string;
  color: string;
  border?: string;
};

const Tag: React.FC<TagProps> = ({ label, bg, color, border }) => (
  <div
    style={{
      padding: "6px 12px",
      borderRadius: 999,
      backgroundColor: bg,
      color,
      border: border ? `1px solid ${border}` : "1px solid transparent",
      fontSize: 10,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 1.1,
    }}
  >
    {label}
  </div>
);

type MetricCardProps = {
  icon: string;
  label: string;
  value: string;
};

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value }) => (
  <div
    style={{
      backgroundColor: "#fff",
      borderRadius: 14,
      border: `1px solid ${palette.line}`,
      padding: 12,
      display: "flex",
      alignItems: "center",
      gap: 10,
    }}
  >
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: palette.accentSoft,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 10, color: palette.muted, letterSpacing: 0.8 }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
    </div>
  </div>
);

type ScoreChipProps = {
  label: string;
  score: number;
  color: string;
};

const ScoreChip: React.FC<ScoreChipProps> = ({ label, score, color }) => (
  <div
    style={{
      backgroundColor: "#fff",
      borderRadius: 14,
      border: `1px solid ${palette.line}`,
      padding: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    }}
  >
    <div style={{ fontSize: 11, color: palette.muted, letterSpacing: 0.6 }}>
      {label}
    </div>
    <div
      style={{
        fontFamily: titleFont,
        fontSize: 18,
        fontWeight: 700,
        color,
      }}
    >
      {score}
    </div>
  </div>
);

type EmotionPanelProps = {
  title: string;
  dotColor: string;
  valueLabel: string;
  value: number;
  valueColor: string;
  barColor: string;
  subEmotions: { label: string; value: number }[];
};

const EmotionPanel: React.FC<EmotionPanelProps> = ({
  title,
  dotColor,
  valueLabel,
  value,
  valueColor,
  barColor,
  subEmotions,
}) => (
  <div
    style={{
      backgroundColor: "#fffaf0",
      borderRadius: 18,
      padding: 16,
      border: `1px solid ${palette.line}`,
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}
  >
    <div style={{ fontSize: 11, color: palette.muted, letterSpacing: 0.8 }}>
      {title.toUpperCase()}
    </div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            backgroundColor: dotColor,
          }}
        />
        <div style={{ fontSize: 14, fontWeight: 600 }}>{valueLabel}</div>
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: valueColor }}>
        {value}%
      </div>
    </div>
    <div
      style={{
        height: 6,
        backgroundColor: "#f1e4d6",
        borderRadius: 999,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${value}%`,
          height: "100%",
          backgroundColor: barColor,
          borderRadius: 999,
        }}
      />
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {subEmotions.map((emotion) => (
        <div key={emotion.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 90,
              height: 4,
              backgroundColor: "#f1e4d6",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${emotion.value * 5}%`,
                height: "100%",
                backgroundColor: barColor,
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: palette.muted, flex: 1 }}>
            {emotion.label}
          </div>
          <div style={{ fontSize: 11, color: palette.muted }}>{emotion.value}%</div>
        </div>
      ))}
    </div>
  </div>
);

type MessageBubbleProps = {
  type: "interviewer" | "user";
  time: string;
  content: string;
  faceEmotion?: string;
  faceValue?: number;
  prosodyEmotion?: string;
  prosodyValue?: number;
};

const MessageBubble: React.FC<MessageBubbleProps> = ({
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
        backgroundColor: isInterviewer ? "#fff3e8" : "#ffffff",
        border: `1px solid ${isInterviewer ? "#fed7aa" : "#e5e7eb"}`,
        borderRadius: 16,
        padding: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 10,
            backgroundColor: isInterviewer ? "#fed7aa" : "#dbeafe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 700,
            color: isInterviewer ? "#c2410c" : "#1d4ed8",
          }}
        >
          {isInterviewer ? "AI" : "YOU"}
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: isInterviewer ? "#c2410c" : "#1d4ed8",
          }}
        >
          {isInterviewer ? "Interviewer" : "You"}
        </div>
        <div style={{ fontSize: 11, color: palette.muted }}>{time}</div>
        {(faceEmotion || prosodyEmotion) && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {faceEmotion && (
              <EmotionBadge
                label="Face"
                emotion={faceEmotion}
                value={faceValue}
                dotColor="#8b5cf6"
                valueColor={palette.accent}
                bg="#f5f3ff"
              />
            )}
            {prosodyEmotion && (
              <EmotionBadge
                label="Voice"
                emotion={prosodyEmotion}
                value={prosodyValue}
                dotColor="#06b6d4"
                valueColor="#06b6d4"
                bg="#ecfeff"
              />
            )}
          </div>
        )}
      </div>
      <div style={{ fontSize: 13, color: palette.ink, lineHeight: 1.5 }}>
        {content}
      </div>
    </div>
  );
};

type EmotionBadgeProps = {
  label: string;
  emotion: string;
  value?: number;
  dotColor: string;
  valueColor: string;
  bg: string;
};

const EmotionBadge: React.FC<EmotionBadgeProps> = ({
  label,
  emotion,
  value,
  dotColor,
  valueColor,
  bg,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      backgroundColor: bg,
      padding: "4px 8px",
      borderRadius: 999,
      fontSize: 10,
    }}
  >
    <div
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        backgroundColor: dotColor,
      }}
    />
    <div style={{ fontWeight: 700 }}>{label}</div>
    <div style={{ color: palette.muted }}>{emotion}</div>
    {value !== undefined && (
      <div style={{ fontWeight: 700, color: valueColor }}>{value}%</div>
    )}
  </div>
);
