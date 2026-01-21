import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Cursor } from "../components/Cursor";

export type MacOSTerminalProps = {
  promptUser?: string;
  promptPath?: string;
  typedText?: string;
  typeStartFrame?: number;
  framesPerChar?: number;
  linkHoverFrame?: number; // Frame when cursor starts hovering over InterviewPro
  linkClickFrame?: number; // Frame when link is clicked
  showCursor?: boolean;
  cursorMoveStartFrame?: number;
  cursorClickFrame?: number;
};

export const MacOSTerminal: React.FC<MacOSTerminalProps> = ({
  promptUser = "user",
  promptPath = "/Users/maxwellmoroz",
  typedText = "@claude help me get a job",
  typeStartFrame = 30,
  framesPerChar = 3,
  linkHoverFrame = 380,
  linkClickFrame = 440,
  showCursor = true,
  cursorMoveStartFrame = 350,
  cursorClickFrame = 440,
}) => {
  const frame = useCurrentFrame();

  // Calculate typing progress for user input
  const typingProgress = Math.max(0, frame - typeStartFrame);
  const charsToShow = Math.min(
    Math.floor(typingProgress / framesPerChar),
    typedText.length
  );
  const displayedText = typedText.slice(0, charsToShow);

  // Calculate when user typing finishes
  const userTypingEndFrame = typeStartFrame + typedText.length * framesPerChar;

  // Claude response 1: appears 20 frames after user finishes
  const response1StartFrame = userTypingEndFrame + 20;
  const response1Text = "💀💀🤣";
  const response1Progress = Math.max(0, frame - response1StartFrame);
  const response1CharsToShow = Math.min(
    Math.floor(response1Progress / 6), // Slower for emojis
    response1Text.length
  );
  const displayedResponse1 = response1Text.slice(0, response1CharsToShow);
  const showResponse1 = frame >= response1StartFrame;

  // Claude response 2: "bro is cooked" - appears 30 frames after response 1 finishes
  const response2StartFrame = response1StartFrame + response1Text.length * 6 + 30;
  const response2Text = "bro is cooked 💀🤣";
  const response2Progress = Math.max(0, frame - response2StartFrame);
  const response2CharsToShow = Math.min(
    Math.floor(response2Progress / 4), // Slower typing for emphasis
    response2Text.length
  );
  const displayedResponse2 = response2Text.slice(0, response2CharsToShow);
  const showResponse2 = frame >= response2StartFrame;

  // Claude response 3: "wait just use InterviewPro" - appears 40 frames after response 2 finishes
  const response2EndFrame = response2StartFrame + response2Text.length * 4;
  const response3StartFrame = response2EndFrame + 40;
  const response3Prefix = "oh just use\u00A0";
  const response3Link = "InterviewPro";
  const response3Full = response3Prefix + response3Link;
  const response3Progress = Math.max(0, frame - response3StartFrame);
  const response3CharsToShow = Math.min(
    Math.floor(response3Progress / 2), // Faster typing
    response3Full.length
  );
  const displayedResponse3 = response3Full.slice(0, response3CharsToShow);
  const showResponse3 = frame >= response3StartFrame;

  // Split displayed text into prefix and link parts
  const displayedPrefix = displayedResponse3.slice(0, Math.min(response3CharsToShow, response3Prefix.length));
  const displayedLink = response3CharsToShow > response3Prefix.length
    ? displayedResponse3.slice(response3Prefix.length)
    : "";

  // Link hover/click states
  const isLinkHovered = frame >= linkHoverFrame;
  const isLinkClicked = frame >= linkClickFrame;

  // Cursor blinking
  const cursorVisible = Math.floor(frame / 15) % 2 === 0;

  // Determine which line cursor is on
  const cursorOnUser = !showResponse1;
  const cursorOnResponse1 = showResponse1 && !showResponse2;
  const cursorOnResponse2 = showResponse2 && !showResponse3;
  const cursorOnResponse3 = showResponse3;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#f5f5f5",
        padding: 40,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Terminal Window */}
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#ffffff",
          borderRadius: 12,
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Title Bar */}
        <div
          style={{
            height: 52,
            backgroundColor: "#f6f6f6",
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            position: "relative",
          }}
        >
          {/* Traffic Lights */}
          <div style={{ display: "flex", gap: 8 }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                backgroundColor: "#ff5f57",
                border: "1px solid rgba(0, 0, 0, 0.1)",
              }}
            />
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                backgroundColor: "#febc2e",
                border: "1px solid rgba(0, 0, 0, 0.1)",
              }}
            />
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                backgroundColor: "#28c840",
                border: "1px solid rgba(0, 0, 0, 0.1)",
              }}
            />
          </div>

          {/* Window Title */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: 14,
              color: "#4a4a4a",
              fontWeight: 500,
            }}
          >
            Terminal
          </div>
        </div>

        {/* Terminal Content */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#ffffff",
            padding: "32px 40px",
            fontFamily:
              '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Menlo, monospace',
            fontSize: 15,
            lineHeight: 1.6,
            color: "#1a1a1a",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Claude Code Header */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
            {/* Claude Code Logo - Pixel Art Style */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Row 1 */}
              <div style={{ display: "flex", gap: 2 }}>
                <div style={{ width: 16, height: 16, backgroundColor: "#c97a5d" }} />
                <div style={{ width: 16, height: 16, backgroundColor: "transparent" }} />
                <div style={{ width: 16, height: 16, backgroundColor: "#c97a5d" }} />
                <div style={{ width: 16, height: 16, backgroundColor: "transparent" }} />
                <div style={{ width: 16, height: 16, backgroundColor: "#c97a5d" }} />
              </div>
              {/* Row 2 */}
              <div style={{ display: "flex", gap: 2 }}>
                <div style={{ width: 16, height: 16, backgroundColor: "#c97a5d" }} />
                <div style={{ width: 16, height: 16, backgroundColor: "#c97a5d" }} />
                <div style={{ width: 16, height: 16, backgroundColor: "#c97a5d" }} />
                <div style={{ width: 16, height: 16, backgroundColor: "#c97a5d" }} />
                <div style={{ width: 16, height: 16, backgroundColor: "#c97a5d" }} />
              </div>
              {/* Row 3 - Eyes */}
              <div style={{ display: "flex", gap: 2 }}>
                <div style={{ width: 16, height: 16, backgroundColor: "#c97a5d" }} />
                <div style={{ width: 16, height: 16, backgroundColor: "#2d2d2d" }} />
                <div style={{ width: 16, height: 16, backgroundColor: "#c97a5d" }} />
                <div style={{ width: 16, height: 16, backgroundColor: "#2d2d2d" }} />
                <div style={{ width: 16, height: 16, backgroundColor: "#c97a5d" }} />
              </div>
              {/* Row 4 - Nose */}
              <div style={{ display: "flex", gap: 2 }}>
                <div style={{ width: 16, height: 16, backgroundColor: "#c97a5d" }} />
                <div style={{ width: 16, height: 16, backgroundColor: "#c97a5d" }} />
                <div style={{ width: 16, height: 16, backgroundColor: "#8b5a42" }} />
                <div style={{ width: 16, height: 16, backgroundColor: "#c97a5d" }} />
                <div style={{ width: 16, height: 16, backgroundColor: "#c97a5d" }} />
              </div>
            </div>

            {/* Header Text */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>Claude Code</span>
                <span style={{ fontSize: 14, color: "#9ca3af" }}>v2.0.55</span>
              </div>
              <div style={{ fontSize: 14, color: "#9ca3af" }}>
                Opus 4.5 · API Usage Billing
              </div>
              <div style={{ fontSize: 14, color: "#9ca3af" }}>
                {promptPath}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, backgroundColor: "#e5e7eb", marginBottom: 24 }} />

          {/* User Prompt Line */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ color: "#9ca3af", marginRight: 8 }}>&gt;</span>
            <span style={{ color: "#1a1a1a" }}>{displayedText}</span>
            {cursorOnUser && (
              <span
                style={{
                  width: 2,
                  height: 18,
                  backgroundColor: "#1a1a1a",
                  opacity: cursorVisible ? 1 : 0,
                  marginLeft: 1,
                }}
              />
            )}
          </div>

          {/* Claude Response 1 */}
          {showResponse1 && (
            <div style={{ display: "flex", alignItems: "center", marginTop: 16 }}>
              <span style={{ color: "#9ca3af", marginRight: 8 }}>&gt;</span>
              <span style={{ color: "#e65100", fontWeight: 600 }}>@claude:</span>
              <span style={{ marginLeft: 8 }}>{displayedResponse1}</span>
              {cursorOnResponse1 && (
                <span
                  style={{
                    width: 2,
                    height: 18,
                    backgroundColor: "#1a1a1a",
                    opacity: cursorVisible ? 1 : 0,
                    marginLeft: 1,
                  }}
                />
              )}
            </div>
          )}

          {/* Claude Response 2 */}
          {showResponse2 && (
            <div style={{ display: "flex", alignItems: "center", marginTop: 16 }}>
              <span style={{ color: "#9ca3af", marginRight: 8 }}>&gt;</span>
              <span style={{ color: "#e65100", fontWeight: 600 }}>@claude:</span>
              <span style={{ marginLeft: 8 }}>{displayedPrefix}</span>
              {displayedLink && (
                <span
                  style={{
                    color: isLinkHovered ? "#2563eb" : "#1a1a1a",
                    textDecoration: isLinkHovered ? "underline" : "none",
                    fontWeight: isLinkHovered ? 600 : 400,
                    transition: "all 0.15s ease",
                    cursor: isLinkHovered ? "pointer" : "default",
                  }}
                >
                  {displayedLink}
                </span>
              )}
              {cursorOnResponse2 && !isLinkClicked && (
                <span
                  style={{
                    width: 2,
                    height: 18,
                    backgroundColor: "#1a1a1a",
                    opacity: cursorVisible ? 1 : 0,
                    marginLeft: 1,
                  }}
                />
              )}
            </div>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Bottom hint */}
          <div style={{ fontSize: 14, color: "#9ca3af" }}>
            <span style={{ marginRight: 8 }}>?</span>
            for shortcuts
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
