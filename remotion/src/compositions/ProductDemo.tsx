import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { MacOSTerminal } from "./MacOSTerminal";
import { Dashboard } from "./Dashboard";
import { InterviewConfig } from "./InterviewConfig";
import { LoadingScreen } from "./LoadingScreen";
import { InterviewInProgress } from "./InterviewInProgress";
import { ResultsView } from "./ResultsView";
import { FeaturesHighlight } from "./FeaturesHighlight";
import { Cursor } from "../components/Cursor";

export type ProductDemoProps = {};

export const ProductDemo: React.FC<ProductDemoProps> = () => {
  const frame = useCurrentFrame();

  // Timeline with 2x speedup except frames 690-840 (23-28 sec):
  // Everything before 23s speeds up 2x, 23-28s normal, after 28s continues
  const NORMAL_SPEED_START = 690; // 23 seconds at 30fps
  const NORMAL_SPEED_END = 840;   // 28 seconds at 30fps

  const browserOpenStart = 170; // Start browser transition right after click finishes
  const dashboardStart = 170; // Dashboard animates immediately when browser opens
  const cursorMoveToStartNew = 220;
  const startNewClickFrame = 237;
  const dashboardToConfigTransition = 245;
  const configStart = 245;

  // Config scrolling timeline (also sped up)
  const scrollStartFrame = 280;
  const scrollEndFrame = 300;
  const cursorMoveToStartInterview = 305;
  const startInterviewClickFrame = 322;
  const configToLoadingTransition = 330;
  const loadingStart = 332;

  // Interview in progress timeline (7 seconds = 210 frames)
  const loadingToInterviewTransition = 335;
  const interviewStart = 340;
  const interviewToResultsTransition = 550;

  // Results timeline (after interview)
  const resultsStart = 560;
  const resultsScrollStart = 590;
  const resultsScrollEnd = 590;


  // Scroll amount for config
  const configScrollY = interpolate(
    frame,
    [scrollStartFrame, scrollEndFrame],
    [0, 520],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 0.2, 1) }
  );

  // Scroll amount for results (disabled - no scroll)
  const resultsScrollY = 0;

  // Scene visibility
  const showTerminal = frame < browserOpenStart;
  const showDashboard = frame >= browserOpenStart && frame < dashboardToConfigTransition + 20;
  const showConfig = frame >= dashboardToConfigTransition && frame < configToLoadingTransition + 10;
  const showLoading = frame >= configToLoadingTransition && frame < loadingToInterviewTransition + 10;
  const showInterview = frame >= loadingToInterviewTransition && frame < interviewToResultsTransition + 20;
  const showResults = frame >= interviewToResultsTransition;

  // Dashboard to Config transition
  const dashToConfigProgress = interpolate(
    frame,
    [dashboardToConfigTransition, dashboardToConfigTransition + 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 0.2, 1) }
  );
  const dashboardRotateY = interpolate(dashToConfigProgress, [0, 1], [0, -90]);
  const configRotateY = interpolate(dashToConfigProgress, [0, 1], [90, 0]);
  const dashboardOpacity = dashToConfigProgress < 0.5 ? 1 : 0;
  const configOpacity = dashToConfigProgress >= 0.5 ? 1 : 0;

  // Config to Loading transition (quick 8-frame fade)
  const configToLoadProgress = interpolate(
    frame,
    [configToLoadingTransition, configToLoadingTransition + 8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 0.2, 1) }
  );

  // Loading to Interview transition (quick 8-frame fade)
  const loadingToInterviewProgress = interpolate(
    frame,
    [loadingToInterviewTransition, loadingToInterviewTransition + 8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 0.2, 1) }
  );

  // Interview to Results transition
  const interviewToResultsProgress = interpolate(
    frame,
    [interviewToResultsTransition, interviewToResultsTransition + 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 0.2, 1) }
  );

  // Cards slide off to the left with 0.2 second (6 frame) delays
  const cardSlideStart = 805; // Start sliding at ~26.8 seconds
  const cardSlideDuration = 45; // ~1.5 seconds to slide off
  const cardStaggerDelay = 6; // 0.2 seconds between each card

  // Helper function to get slide progress for each card
  const getCardSlideProgress = (cardIndex: number) => {
    const start = cardSlideStart + (cardIndex * cardStaggerDelay);
    return interpolate(
      frame,
      [start, start + cardSlideDuration],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 0.2, 1) }
    );
  };

  // Front card (index 0)
  const frontCardProgress = getCardSlideProgress(0);
  const frontCardTranslateX = interpolate(frontCardProgress, [0, 1], [0, -1500]);
  const frontCardOpacity = interpolate(frontCardProgress, [0, 1], [1, 0.7]);

  // Last card grows to fill screen (starts when card 2 begins sliding)
  const lastCardGrowStart = cardSlideStart + (2 * cardStaggerDelay); // After card 2 starts
  const lastCardGrowEnd = lastCardGrowStart + 40; // ~1.3 seconds to grow
  const lastCardGrowProgress = interpolate(
    frame,
    [lastCardGrowStart, lastCardGrowEnd],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 0.2, 1) }
  );
  const lastCardScale = interpolate(lastCardGrowProgress, [0, 1], [0.955, 1.08]);
  const lastCardTranslateX = interpolate(lastCardGrowProgress, [0, 1], [60, 0]); // Move from offset to center

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: 2000,
      }}
    >
      {/* LightLeakBackground effect */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", backgroundColor: "#ffffff" }}>
        {/* Base gradient */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom right, rgba(219, 234, 254, 0.3), #ffffff, rgba(253, 232, 208, 0.3))" }} />

        {/* Blue Orb */}
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

        {/* Pink Orb */}
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
      <div style={{ width: "100%", height: "100%", padding: 30, position: "relative", zIndex: 10 }}>
        {/* Terminal Scene */}
        {showTerminal && (
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 25px 80px rgba(0, 0, 0, 0.25)",
            }}
          >
            <MacOSTerminal
              promptUser="user"
              promptPath="/Users/maxwellmoroz"
              typedText="@claude help me get a job"
              typeStartFrame={30}
              framesPerChar={1}
              linkHoverFrame={155}
              linkClickFrame={160}
              showCursor={false}
            />
          </div>
        )}

        {/* Dashboard */}
        {showDashboard && (
          <div
            style={{
              position: "absolute",
              inset: 30,
              transformStyle: "preserve-3d",
              transform: `rotateY(${dashboardRotateY}deg)`,
              opacity: dashboardOpacity,
              backfaceVisibility: "hidden",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 25px 80px rgba(0, 0, 0, 0.25)",
            }}
          >
            <Dashboard
              animationStartFrame={dashboardStart}
              showPulsingButton={frame > dashboardStart + 60}
            />
          </div>
        )}

        {/* Config Screen */}
        {showConfig && (
          <div
            style={{
              position: "absolute",
              inset: 30,
              transformStyle: "preserve-3d",
              transform: frame < configToLoadingTransition ? `rotateY(${configRotateY}deg)` : "none",
              opacity: frame >= configToLoadingTransition ? interpolate(configToLoadProgress, [0, 1], [1, 0]) : configOpacity,
              backfaceVisibility: "hidden",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 25px 80px rgba(0, 0, 0, 0.25)",
            }}
          >
            <InterviewConfig
              animationStartFrame={configStart}
              scrollY={configScrollY}
            />
          </div>
        )}

        {/* Loading Screen */}
        {showLoading && (
          <div
            style={{
              position: "absolute",
              inset: 30,
              opacity: frame >= loadingToInterviewTransition
                ? interpolate(loadingToInterviewProgress, [0, 1], [1, 0])
                : interpolate(configToLoadProgress, [0, 1], [0, 1]),
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 25px 80px rgba(0, 0, 0, 0.25)",
            }}
          >
            <LoadingScreen animationStartFrame={loadingStart} />
          </div>
        )}

        {/* Interview In Progress (brief flash) */}
        {showInterview && (
          <div
            style={{
              position: "absolute",
              inset: 30,
              opacity: frame >= interviewToResultsTransition
                ? interpolate(interviewToResultsProgress, [0, 1], [1, 0])
                : interpolate(loadingToInterviewProgress, [0, 1], [0, 1]),
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 25px 80px rgba(0, 0, 0, 0.25)",
            }}
          >
            <InterviewInProgress animationStartFrame={interviewStart} interviewerVideoSrc="newtavusrecording.mp4" />
          </div>
        )}

        {/* Combined Results View (Performance + Live Emotions + Transcript) */}
        {showResults && (
          <>
            {/* Card stack container - stays in place */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: interpolate(interviewToResultsProgress, [0, 1], [0, 1]),
              }}
            >
              {/* Stack of cards behind - representing multiple practice sessions */}
              {/* Cards 1 and 2 slide off */}
              {[2, 1].map((i) => {
                const cardOffset = i * 20; // Horizontal offset for each card
                const cardScaleVal = 1 - i * 0.015; // Slightly smaller as they go back

                // Each card slides off with staggered delay
                const stackCardProgress = getCardSlideProgress(i);
                const stackCardTranslateX = interpolate(stackCardProgress, [0, 1], [cardOffset, -1500]);
                const stackCardOpacity = interpolate(stackCardProgress, [0, 1], [1, 0.7]);

                // Different page index for each card: card 2 shows page 2, card 1 shows page 1
                const pageIndex = i;

                return (
                  <div
                    key={`stack-${i}`}
                    style={{
                      position: "absolute",
                      inset: 30,
                      borderRadius: 16,
                      backgroundColor: "#ffffff",
                      overflow: "hidden",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.15), 0 0 20px rgba(255, 255, 255, 0.1)",
                      transform: `translateX(${stackCardTranslateX}px) scale(${cardScaleVal})`,
                      opacity: stackCardOpacity,
                      zIndex: -i,
                    }}
                  >
                    <ResultsView animationStartFrame={resultsStart} scrollY={resultsScrollY} pageIndex={pageIndex} static />
                  </div>
                );
              })}

              {/* Last card (card 3) - Features Highlight - grows to fill screen */}
              <div
                style={{
                  position: "absolute",
                  inset: 30,
                  borderRadius: 16,
                  backgroundColor: "#ffffff",
                  overflow: "hidden",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.15), 0 0 20px rgba(255, 255, 255, 0.1)",
                  transform: `translateX(${lastCardTranslateX}px) scale(${lastCardScale})`,
                  zIndex: -3,
                }}
              >
                <FeaturesHighlight animationStartFrame={lastCardGrowStart} />
              </div>

              {/* Main results card (front) - slides off to the right */}
              <div
                style={{
                  position: "absolute",
                  inset: 30,
                  borderRadius: 16,
                  overflow: "hidden",
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.15), 0 0 20px rgba(255, 255, 255, 0.1)",
                  zIndex: 1,
                  transform: `translateX(${frontCardTranslateX}px)`,
                  opacity: frontCardOpacity,
                }}
              >
                <ResultsView animationStartFrame={resultsStart} scrollY={resultsScrollY} />
              </div>
            </div>
          </>
        )}

        {/* Cursor for clicking InterviewPro link in terminal */}
        {frame >= 118 && frame < browserOpenStart + 20 && (
          <Cursor
            startX={800}
            startY={600}
            endX={340}
            endY={310}
            moveStartFrame={118}
            moveDuration={40}
            clickFrame={160}
          />
        )}

        {/* Cursor for clicking Start New Interview on dashboard */}
        {frame >= cursorMoveToStartNew && frame < dashboardToConfigTransition + 30 && (
          <Cursor
            startX={900}
            startY={600}
            endX={220}
            endY={355}
            moveStartFrame={cursorMoveToStartNew}
            moveDuration={30}
            clickFrame={startNewClickFrame}
          />
        )}

        {/* Cursor for clicking Start Interview on config */}
        {frame >= cursorMoveToStartInterview && frame < configToLoadingTransition + 30 && (
          <Cursor
            startX={900}
            startY={400}
            endX={1050}
            endY={880}
            moveStartFrame={cursorMoveToStartInterview}
            moveDuration={30}
            clickFrame={startInterviewClickFrame}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};
