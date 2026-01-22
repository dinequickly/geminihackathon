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

type TranscriptLine = {
  role: "interviewer" | "user";
  time: string;
  content: string;
};

type ResultsPage = {
  snapshot: string;
  sessionLabel: string;
  score: number;
  categories: { icon: string; label: string; score: number }[];
  improvements: { number: string; area: string; suggestion: string }[];
  rewrite: { original: string; improved: string };
  transcript: TranscriptLine[];
};

const pages: ResultsPage[] = [
  {
    snapshot: "19:50",
    sessionLabel: "Session 08",
    score: 81,
    categories: [
      { icon: "🎤", label: "Communication", score: 70 },
      { icon: "✨", label: "Presence", score: 89 },
      { icon: "🧠", label: "Technical", score: 70 },
      { icon: "φ", label: "Filler Words", score: 4 },
      { icon: "⚡", label: "Words / Min", score: 728 },
    ],
    improvements: [
      {
        number: "01",
        area: "Speaking Pace",
        suggestion:
          "Consider slowing down your speech to allow for better comprehension.",
      },
      {
        number: "02",
        area: "Filler Words",
        suggestion:
          "Reduce use of 'um' and 'uh' - practice strategic pauses instead.",
      },
      {
        number: "03",
        area: "Eye Contact",
        suggestion: "Maintain more consistent eye contact with the camera.",
      },
    ],
    rewrite: {
      original: "Um, I think we should probably look at the data, you know?",
      improved: "I recommend we analyze the data to identify key trends.",
    },
    transcript: [
      {
        role: "interviewer",
        time: "0:00",
        content: "Hi there! What is your first & last name?",
      },
      {
        role: "user",
        time: "0:02",
        content: "Maxwell Moroz.",
      },
      {
        role: "interviewer",
        time: "0:10",
        content:
          "Tell me about a time you led a data-driven project. What was the outcome?",
      },
      {
        role: "user",
        time: "0:19",
        content:
          "We analyzed market trends using quantitative models and identified key opportunities for the fund.",
      },
    ],
  },
  {
    snapshot: "24:10",
    sessionLabel: "Session 09",
    score: 74,
    categories: [
      { icon: "🎤", label: "Communication", score: 62 },
      { icon: "✨", label: "Presence", score: 76 },
      { icon: "🧠", label: "Technical", score: 83 },
      { icon: "φ", label: "Filler Words", score: 7 },
      { icon: "⚡", label: "Words / Min", score: 612 },
    ],
    improvements: [
      {
        number: "01",
        area: "Structure",
        suggestion:
          "Start with the outcome, then explain the steps you took to get there.",
      },
      {
        number: "02",
        area: "Confidence",
        suggestion:
          "Use shorter, direct sentences to sound more decisive.",
      },
      {
        number: "03",
        area: "Detail",
        suggestion:
          "Add one quantitative result to reinforce the impact.",
      },
    ],
    rewrite: {
      original: "We kind of pushed the launch after some feedback.",
      improved:
        "We delayed the launch by two weeks to address feedback and avoid risk.",
    },
    transcript: [
      {
        role: "interviewer",
        time: "0:00",
        content:
          "Tell me about a time you had to influence without authority.",
      },
      {
        role: "user",
        time: "0:08",
        content:
          "I coordinated a cross-functional launch and aligned teams with competing priorities.",
      },
      {
        role: "interviewer",
        time: "0:29",
        content: "How did you handle resistance during the timeline shift?",
      },
      {
        role: "user",
        time: "0:41",
        content:
          "I mapped concerns, aligned the data with customer impact, and set weekly check-ins.",
      },
    ],
  },
  {
    snapshot: "31:22",
    sessionLabel: "Session 10",
    score: 88,
    categories: [
      { icon: "🎤", label: "Communication", score: 84 },
      { icon: "✨", label: "Presence", score: 92 },
      { icon: "🧠", label: "Technical", score: 87 },
      { icon: "φ", label: "Filler Words", score: 2 },
      { icon: "⚡", label: "Words / Min", score: 690 },
    ],
    improvements: [
      {
        number: "01",
        area: "Depth",
        suggestion:
          "Add one more trade-off when describing the decision.",
      },
      {
        number: "02",
        area: "Clarity",
        suggestion:
          "Summarize the outcome in one closing sentence.",
      },
      {
        number: "03",
        area: "Ownership",
        suggestion:
          "Mention the single decision you personally made to move faster.",
      },
    ],
    rewrite: {
      original: "We used a few methods to decide what to do next.",
      improved:
        "We ranked options by impact and risk, then chose the lowest-risk test.",
    },
    transcript: [
      {
        role: "interviewer",
        time: "0:00",
        content:
          "Walk me through a product decision you made using imperfect data.",
      },
      {
        role: "user",
        time: "0:12",
        content:
          "We segmented early adopters and triangulated qualitative feedback before committing.",
      },
      {
        role: "interviewer",
        time: "0:38",
        content:
          "What trade-offs did you communicate to leadership during that process?",
      },
      {
        role: "user",
        time: "0:53",
        content:
          "I framed the revenue impact against risk and offered two paths to choose from.",
      },
    ],
  },
];

export const ResultsView: React.FC<ResultsViewProps> = ({
  animationStartFrame = 0,
  scrollY = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = Math.max(0, frame - animationStartFrame);

  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
  const pageDurationSeconds = 3.6;
  const fadeSeconds = 0.5;
  const pageFrames = pageDurationSeconds * fps;
  const fadeFrames = fadeSeconds * fps;
  const totalFrames = pages.length * pageFrames;
  const stackProgress = interpolate(
    t,
    [totalFrames - 1.6 * fps, totalFrames - 0.2 * fps],
    [0, 1],
    clamp
  );
  const stackOpacity = interpolate(
    t,
    [totalFrames - 1.4 * fps, totalFrames - 0.2 * fps],
    [0, 1],
    clamp
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#ffffff",
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        color: "#000000",
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
          transform: `translateY(${-scrollY}px)`,
          padding: 48,
          position: "relative",
          zIndex: 10,
        }}
      >
        {pages.map((page, index) => {
          const pageStart = index * pageFrames;
          const pageEnd = pageStart + pageFrames;
          const pageFrame = t - pageStart;

          const pageOpacity =
            index === pages.length - 1
              ? interpolate(t, [pageStart, pageStart + fadeFrames], [0, 1], clamp)
              : interpolate(
                  t,
                  [pageStart, pageStart + fadeFrames, pageEnd - fadeFrames, pageEnd],
                  [0, 1, 1, 0],
                  clamp
                );

          if (pageFrame < -fadeFrames || pageFrame > pageFrames + fadeFrames) {
            return null;
          }

          return (
            <div
              key={page.sessionLabel}
              style={{
                position: "absolute",
                inset: 0,
                opacity: pageOpacity,
              }}
            >
              <ResultsPageView page={page} frame={pageFrame} fps={fps} />
            </div>
          );
        })}

        {stackOpacity > 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              opacity: stackOpacity,
              transform: `translateX(${interpolate(
                stackProgress,
                [0, 1],
                [120, 0],
                clamp
              )}px)`,
            }}
          >
            <div style={{ position: "relative", width: 520, height: 520 }}>
              {[2, 1, 0].map((index, offset) => (
                <StackCard
                  key={pages[index].sessionLabel}
                  page={pages[index]}
                  style={{
                    position: "absolute",
                    top: offset * 18,
                    right: offset * 26,
                    transform: `scale(${1 - offset * 0.06})`,
                    opacity: 1 - offset * 0.2,
                    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.18)",
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

const ResultsPageView: React.FC<{ page: ResultsPage; frame: number; fps: number }> = ({
  page,
  frame,
  fps,
}) => {
  const f = Math.max(0, frame);
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };
  const easeOut = Easing.out(Easing.cubic);
  const fade = (start: number, end: number) =>
    interpolate(f, [start * fps, end * fps], [0, 1], {
      ...clamp,
      easing: easeOut,
    });
  const lift = (start: number, end: number, distance = 16) =>
    interpolate(f, [start * fps, end * fps], [distance, 0], {
      ...clamp,
      easing: easeOut,
    });

  const headerOpacity = fade(0, 0.4);
  const headerLift = lift(0, 0.4, 14);
  const summaryOpacity = fade(0.2, 0.7);
  const summaryLift = lift(0.2, 0.7, 18);
  const improvementsOpacity = fade(0.3, 0.8);
  const improvementsLift = lift(0.3, 0.8, 18);
  const playbackOpacity = fade(0.65, 1.1);
  const playbackLift = lift(0.65, 1.1, 16);
  const footerOpacity = fade(1.4, 1.8);
  const footerLift = lift(1.4, 1.8, 12);

  const scoreValue = interpolate(f, [0.35 * fps, 1.1 * fps], [0, page.score], {
    ...clamp,
    easing: Easing.out(Easing.quad),
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header */}
      <div
        style={{
          opacity: headerOpacity,
          transform: `translateY(${headerLift}px)`,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, fontWeight: 400, color: "#000000", letterSpacing: "-0.02em" }}>TAVUS</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 400 }}>Analysis Report</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Tag label={`Snapshot ${page.snapshot}`} />
          <Tag label={page.sessionLabel} muted />
        </div>
      </div>

      {/* Overall Score Card */}
      <div
        style={{
          opacity: summaryOpacity,
          transform: `translateY(${summaryLift}px)`,
        }}
      >
        <LiquidGlassCard>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
            <div>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 36, fontWeight: 400, color: "#000000", marginBottom: 8, letterSpacing: "-0.02em" }}>Performance Summary</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 400, padding: "4px 8px", backgroundColor: "rgba(0, 0, 0, 0.05)", borderRadius: 6, display: "inline-block" }}>
                Strong
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 72, fontWeight: 400, color: "#000000", lineHeight: 1, letterSpacing: "-0.02em" }}>{Math.round(scoreValue)}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 4, fontWeight: 400 }}>Score Index</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16, justifyItems: "center" }}>
            {page.categories.map((item) => (
              <ScoreCategory key={item.label} icon={item.icon} label={item.label} score={item.score} />
            ))}
          </div>
        </LiquidGlassCard>
      </div>

      {/* Improvements Section */}
      <div
        style={{
          opacity: improvementsOpacity,
          transform: `translateY(${improvementsLift}px)`,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
        }}
      >
        <LiquidGlassCard>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, fontWeight: 400, color: "#000000", marginBottom: 20, letterSpacing: "-0.02em" }}>Key Improvements</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {page.improvements.map((item) => (
              <ImprovementItem key={item.number} number={item.number} area={item.area} suggestion={item.suggestion} />
            ))}
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, fontWeight: 400, color: "#000000", marginBottom: 20, letterSpacing: "-0.02em" }}>AI Rewrites</div>
          <RewriteItem original={page.rewrite.original} improved={page.rewrite.improved} />
        </LiquidGlassCard>
      </div>

      {/* Playback & Review */}
      <div
        style={{
          opacity: playbackOpacity,
          transform: `translateY(${playbackLift}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, fontWeight: 400, color: "#000000", letterSpacing: "-0.02em" }}>Playback & Review</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "#f3f4f6", padding: "4px", borderRadius: 16 }}>
            <div style={{ padding: "8px 16px", backgroundColor: "#ffffff", borderRadius: 12, fontSize: 13, fontWeight: 500, color: "#000000" }}>Review</div>
            <div style={{ padding: "8px 16px", fontSize: 13, fontWeight: 500, color: "#666666" }}>Watch</div>
          </div>
        </div>
        <LiquidGlassCard>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {page.transcript.map((line) => (
              <TranscriptRow key={`${line.time}-${line.role}`} line={line} />
            ))}
          </div>
        </LiquidGlassCard>
      </div>

      {/* Footer Actions */}
      <div
        style={{
          opacity: footerOpacity,
          transform: `translateY(${footerLift}px)`,
          display: "flex",
          gap: 16,
          justifyContent: "center",
        }}
      >
        <LiquidButtonBlack>↻ Practice Again</LiquidButtonBlack>
        <LiquidButtonSecondary>← Return to Dashboard</LiquidButtonSecondary>
      </div>
    </div>
  );
};

const Tag: React.FC<{ label: string; muted?: boolean }> = ({ label, muted }) => (
  <div
    style={{
      padding: "4px 8px",
      borderRadius: 6,
      backgroundColor: muted ? "rgba(0, 0, 0, 0.05)" : "rgba(251, 191, 36, 0.18)",
      color: muted ? "#666666" : "#b45309",
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 9,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      fontWeight: 400,
    }}
  >
    {label}
  </div>
);

// Liquid Glass Card Component
const LiquidGlassCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: 24,
      padding: 32,
      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.15), 0 0 20px rgba(255, 255, 255, 0.1)",
    }}
  >
    {children}
  </div>
);

const ScoreCategory: React.FC<{ icon: string; label: string; score: number }> = ({ icon, label, score }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
    <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
    <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, fontWeight: 400, color: "#000000", marginBottom: 4, letterSpacing: "-0.02em" }}>{score}</div>
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 400 }}>{label}</div>
  </div>
);

const ImprovementItem: React.FC<{ number: string; area: string; suggestion: string }> = ({ number, area, suggestion }) => (
  <div style={{ display: "flex", gap: 12, padding: 12, backgroundColor: "rgba(217, 119, 6, 0.1)", borderRadius: 12 }}>
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, color: "#d97706", opacity: 0.4 }}>{number}</div>
    <div>
      <div style={{ fontWeight: 600, color: "#000000", marginBottom: 4 }}>{area}</div>
      <div style={{ fontSize: 13, color: "#666666", fontWeight: 400, lineHeight: 1.4 }}>{suggestion}</div>
    </div>
  </div>
);

const RewriteItem: React.FC<{ original: string; improved: string }> = ({ original, improved }) => (
  <div style={{ borderRadius: 12, overflow: "hidden" }}>
    <div style={{ padding: 12, backgroundColor: "rgba(239, 68, 68, 0.1)", borderBottom: "1px solid rgba(0, 0, 0, 0.1)" }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: "#ef4444", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>Original</div>
      <div style={{ fontSize: 13, color: "#666666", fontWeight: 400 }}>{original}</div>
    </div>
    <div style={{ padding: 12, backgroundColor: "rgba(34, 197, 94, 0.1)" }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: "#22c55e", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>Optimized</div>
      <div style={{ fontSize: 13, color: "#000000", fontWeight: 400 }}>{improved}</div>
    </div>
  </div>
);

const TranscriptRow: React.FC<{ line: TranscriptLine }> = ({ line }) => (
  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
    <div
      style={{
        minWidth: 52,
        padding: "4px 8px",
        borderRadius: 6,
        backgroundColor: line.role === "user" ? "rgba(59, 130, 246, 0.1)" : "rgba(251, 191, 36, 0.15)",
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 9,
        color: line.role === "user" ? "#1d4ed8" : "#b45309",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}
    >
      {line.time}
    </div>
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#000000", marginBottom: 4 }}>
        {line.role === "user" ? "You" : "Interviewer"}
      </div>
      <div style={{ fontSize: 13, color: "#666666", lineHeight: 1.4 }}>
        {line.content}
      </div>
    </div>
  </div>
);

const LiquidButtonBlack: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: 20,
      padding: "14px 32px",
      color: "#000000",
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: 15,
      fontWeight: 600,
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      cursor: "pointer",
    }}
  >
    {children}
  </div>
);

const LiquidButtonSecondary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: 20,
      padding: "14px 32px",
      color: "#000000",
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: 15,
      fontWeight: 600,
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      cursor: "pointer",
    }}
  >
    {children}
  </div>
);

const StackCard: React.FC<{ page: ResultsPage; style?: React.CSSProperties }> = ({
  page,
  style,
}) => (
  <div
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderRadius: 24,
      padding: 24,
      width: 520,
      height: 520,
      border: "1px solid rgba(0, 0, 0, 0.08)",
      display: "flex",
      flexDirection: "column",
      gap: 20,
      ...style,
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {page.sessionLabel}
      </div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: "#b45309", letterSpacing: "0.08em", textTransform: "uppercase", backgroundColor: "rgba(251, 191, 36, 0.18)", padding: "4px 8px", borderRadius: 6 }}>
        {page.snapshot}
      </div>
    </div>
    <div>
      <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 44, fontWeight: 400, color: "#000000", lineHeight: 1 }}>
        {page.score}
      </div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 6 }}>
        Score Index
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
      {page.categories.slice(0, 3).map((item) => (
        <div key={item.label} style={{ borderRadius: 12, padding: 10, backgroundColor: "rgba(0, 0, 0, 0.04)", textAlign: "center" }}>
          <div style={{ fontSize: 18 }}>{item.icon}</div>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, color: "#000000" }}>{item.score}</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase" }}>{item.label}</div>
        </div>
      ))}
    </div>
    <div style={{ borderTop: "1px solid rgba(0, 0, 0, 0.06)", paddingTop: 14 }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: "#888888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
        Transcript Highlight
      </div>
      <div style={{ fontSize: 13, color: "#666666", lineHeight: 1.4 }}>
        {page.transcript[1]?.content || page.transcript[0]?.content}
      </div>
    </div>
  </div>
);
