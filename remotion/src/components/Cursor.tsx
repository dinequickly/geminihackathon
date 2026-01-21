import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

export type CursorProps = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  moveStartFrame: number;
  moveDuration: number;
  clickFrame?: number;
  visible?: boolean;
};

export const Cursor: React.FC<CursorProps> = ({
  startX,
  startY,
  endX,
  endY,
  moveStartFrame,
  moveDuration,
  clickFrame,
  visible = true,
}) => {
  const frame = useCurrentFrame();

  if (!visible) return null;

  // Cursor position with easing
  const x = interpolate(
    frame,
    [moveStartFrame, moveStartFrame + moveDuration],
    [startX, endX],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }
  );

  const y = interpolate(
    frame,
    [moveStartFrame, moveStartFrame + moveDuration],
    [startY, endY],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }
  );

  // Click animation
  const isClicking = clickFrame && frame >= clickFrame && frame < clickFrame + 10;
  const clickScale = isClicking
    ? interpolate(
        frame,
        [clickFrame, clickFrame + 5, clickFrame + 10],
        [1, 0.85, 1],
        { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
      )
    : 1;

  // Click ripple effect
  const showRipple = clickFrame && frame >= clickFrame && frame < clickFrame + 20;
  const rippleScale = clickFrame
    ? interpolate(
        frame,
        [clickFrame, clickFrame + 20],
        [0, 1.5],
        { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
      )
    : 0;
  const rippleOpacity = clickFrame
    ? interpolate(
        frame,
        [clickFrame, clickFrame + 20],
        [0.5, 0],
        { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
      )
    : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      {/* Click ripple */}
      {showRipple && (
        <div
          style={{
            position: "absolute",
            left: -20,
            top: -20,
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: "rgba(124, 58, 237, 0.3)",
            transform: `scale(${rippleScale})`,
            opacity: rippleOpacity,
          }}
        />
      )}

      {/* Cursor */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        style={{
          transform: `scale(${clickScale})`,
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
        }}
      >
        <path
          d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.35 2.87a.5.5 0 0 0-.85.35Z"
          fill="#fff"
          stroke="#000"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
};
