import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

export type BrowserWindowProps = {
  children: React.ReactNode;
  url?: string;
  openAnimationStart?: number;
  openAnimationDuration?: number;
  showOpenAnimation?: boolean;
};

export const BrowserWindow: React.FC<BrowserWindowProps> = ({
  children,
  url = "interviewpro.app",
  openAnimationStart = 0,
  openAnimationDuration = 20,
  showOpenAnimation = false,
}) => {
  const frame = useCurrentFrame();

  // Opening animation
  const openProgress = showOpenAnimation
    ? interpolate(
        frame,
        [openAnimationStart, openAnimationStart + openAnimationDuration],
        [0, 1],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.34, 1.56, 0.64, 1),
        }
      )
    : 1;

  const scale = showOpenAnimation
    ? interpolate(openProgress, [0, 1], [0.8, 1])
    : 1;

  const opacity = showOpenAnimation
    ? interpolate(openProgress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" })
    : 1;

  if (showOpenAnimation && frame < openAnimationStart) {
    return null;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 25px 80px rgba(0, 0, 0, 0.25), 0 10px 30px rgba(0, 0, 0, 0.15)",
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {/* Browser Chrome */}
      <div
        style={{
          height: 48,
          backgroundColor: "#f1f3f4",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          gap: 12,
        }}
      >
        {/* Traffic Lights */}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ff5f57" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#febc2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#28c840" }} />
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", gap: 8, marginLeft: 8 }}>
          <div style={{ color: "#9ca3af", fontSize: 16 }}>‹</div>
          <div style={{ color: "#9ca3af", fontSize: 16 }}>›</div>
        </div>

        {/* URL Bar */}
        <div
          style={{
            flex: 1,
            height: 32,
            backgroundColor: "#fff",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: 8,
          }}
        >
          <span style={{ color: "#059669", fontSize: 12 }}>🔒</span>
          <span style={{ color: "#374151", fontSize: 13 }}>{url}</span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, color: "#9ca3af" }}>
          <span>⋮</span>
        </div>
      </div>

      {/* Tab Bar */}
      <div
        style={{
          height: 36,
          backgroundColor: "#e5e7eb",
          display: "flex",
          alignItems: "flex-end",
          padding: "0 8px",
        }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "8px 8px 0 0",
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "#374151",
            maxWidth: 200,
          }}
        >
          <span style={{ fontSize: 14 }}>📋</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            InterviewPro
          </span>
          <span style={{ color: "#9ca3af", fontSize: 10, marginLeft: 4 }}>×</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {children}
      </div>
    </div>
  );
};
