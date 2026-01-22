import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";

export type FeaturesHighlightProps = {
  animationStartFrame?: number;
};

type Feature = {
  icon: string;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: "🎯",
    title: "Real-Time Feedback",
    description: "AI analyzes your performance as you speak",
  },
  {
    icon: "💡",
    title: "Instant Rewrites",
    description: "Get optimized versions of your responses",
  },
  {
    icon: "📊",
    title: "Emotion Tracking",
    description: "Track confidence, presence, and authenticity",
  },
  {
    icon: "🚀",
    title: "Continuous Growth",
    description: "Practice until you're interview-ready",
  },
];

export const FeaturesHighlight: React.FC<FeaturesHighlightProps> = ({
  animationStartFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - animationStartFrame);
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };

  // Main headline animation
  const headlineOpacity = interpolate(t, [0, 20], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const headlineLift = interpolate(t, [0, 20], [40, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  // Subheadline animation
  const subheadlineOpacity = interpolate(t, [10, 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const subheadlineLift = interpolate(t, [10, 30], [30, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  // Feature cards animation with stagger
  const getFeatureAnimation = (index: number) => {
    const startFrame = 20 + index * 8;
    const opacity = interpolate(t, [startFrame, startFrame + 20], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
    const lift = interpolate(t, [startFrame, startFrame + 20], [30, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
    const scale = interpolate(t, [startFrame, startFrame + 20], [0.9, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
    return { opacity, lift, scale };
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* LightLeakBackground effect */}
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

      <div style={{ position: "relative", zIndex: 10, maxWidth: 1100, padding: 60, textAlign: "center" }}>
        {/* Main headline */}
        <div
          style={{
            opacity: headlineOpacity,
            transform: `translateY(${headlineLift}px)`,
            marginBottom: 20,
          }}
        >
          <h1
            style={{
              fontFamily: 'DM Serif Display, serif',
              fontSize: 84,
              fontWeight: 400,
              color: "#000000",
              letterSpacing: "-0.02em",
              margin: 0,
              lineHeight: 1,
            }}
          >
            Real Insights.
          </h1>
        </div>

        {/* Subheadline */}
        <div
          style={{
            opacity: subheadlineOpacity,
            transform: `translateY(${subheadlineLift}px)`,
            marginBottom: 80,
          }}
        >
          <p
            style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: 24,
              fontWeight: 500,
              color: "#666666",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            Practice interviews with AI-powered feedback that helps you grow
          </p>
        </div>

        {/* Feature grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 32,
            maxWidth: 900,
            margin: "0 auto",
          }}
        >
          {features.map((feature, index) => {
            const { opacity, lift, scale } = getFeatureAnimation(index);
            return (
              <div
                key={feature.title}
                style={{
                  opacity,
                  transform: `translateY(${lift}px) scale(${scale})`,
                }}
              >
                <FeatureCard feature={feature} />
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const FeatureCard: React.FC<{ feature: Feature }> = ({ feature }) => (
  <div
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: 24,
      padding: 32,
      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.15)",
      textAlign: "left",
      transition: "transform 0.3s ease",
    }}
  >
    <div style={{ fontSize: 48, marginBottom: 16 }}>{feature.icon}</div>
    <h3
      style={{
        fontFamily: 'DM Serif Display, serif',
        fontSize: 28,
        fontWeight: 400,
        color: "#000000",
        letterSpacing: "-0.02em",
        margin: "0 0 12px 0",
      }}
    >
      {feature.title}
    </h3>
    <p
      style={{
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: 15,
        fontWeight: 400,
        color: "#666666",
        margin: 0,
        lineHeight: 1.5,
      }}
    >
      {feature.description}
    </p>
  </div>
);
