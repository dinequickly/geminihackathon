import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export type MacOSTerminalProps = {
  promptUser?: string;
  promptPath?: string;
  typedText?: string;
  typeStartFrame?: number;
  framesPerChar?: number;
};

export const MacOSTerminal: React.FC<MacOSTerminalProps> = ({
  promptUser = "user",
  promptPath = "~",
  typedText = "@claude, help me get a job",
  typeStartFrame = 30,
  framesPerChar = 3,
}) => {
  const frame = useCurrentFrame();

  // Calculate typing progress for user input
  const typingProgress = Math.max(0, frame - typeStartFrame);
  const charsToShow = Math.min(
    Math.floor(typingProgress / framesPerChar),
    typedText.length
  );
  const displayedText = typedText.slice(0, charsToShow);
  const isTypingComplete = charsToShow >= typedText.length;

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

  // Claude response 2: appears 30 frames after response 1 finishes
  const response2StartFrame = response1StartFrame + response1Text.length * 6 + 30;
  const response2Text = "wait just use InterviewPro";
  const response2Progress = Math.max(0, frame - response2StartFrame);
  const response2CharsToShow = Math.min(
    Math.floor(response2Progress / 2), // Faster typing
    response2Text.length
  );
  const displayedResponse2 = response2Text.slice(0, response2CharsToShow);
  const showResponse2 = frame >= response2StartFrame;

  // Determine where cursor should be
  const isResponse2Complete = response2CharsToShow >= response2Text.length;
  const cursorOpacity =
    isResponse2Complete && showResponse2
      ? Math.floor(frame / 15) % 2 === 0
        ? 1
        : 0
      : 1;

  // Determine which line cursor is on
  const cursorOnUser = !showResponse1;
  const cursorOnResponse1 = showResponse1 && !showResponse2;
  const cursorOnResponse2 = showResponse2;

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
            padding: 20,
            fontFamily:
              '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Menlo, monospace',
            fontSize: 15,
            lineHeight: 1.8,
            color: "#1a1a1a",
          }}
        >
          {/* User Prompt Line */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ color: "#2e7d32", fontWeight: 600 }}>
              {promptUser}@mac
            </span>
            <span style={{ color: "#757575" }}>:</span>
            <span style={{ color: "#1565c0", fontWeight: 600 }}>
              {promptPath}
            </span>
            <span style={{ color: "#757575" }}>$ </span>
            <span style={{ color: "#1a1a1a" }}>{displayedText}</span>
            {cursorOnUser && (
              <span
                style={{
                  width: 10,
                  height: 20,
                  backgroundColor: "#1a1a1a",
                  opacity: cursorOpacity,
                  marginLeft: 1,
                }}
              />
            )}
          </div>

          {/* Claude Response 1 */}
          {showResponse1 && (
            <div style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
              <span style={{ color: "#e65100", fontWeight: 600 }}>@claude:</span>
              <span style={{ marginLeft: 8 }}>{displayedResponse1}</span>
              {cursorOnResponse1 && (
                <span
                  style={{
                    width: 10,
                    height: 20,
                    backgroundColor: "#1a1a1a",
                    opacity: cursorOpacity,
                    marginLeft: 1,
                  }}
                />
              )}
            </div>
          )}

          {/* Claude Response 2 */}
          {showResponse2 && (
            <div style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
              <span style={{ color: "#e65100", fontWeight: 600 }}>@claude:</span>
              <span style={{ marginLeft: 8 }}>{displayedResponse2}</span>
              {cursorOnResponse2 && (
                <span
                  style={{
                    width: 10,
                    height: 20,
                    backgroundColor: "#1a1a1a",
                    opacity: cursorOpacity,
                    marginLeft: 1,
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
