import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { MacOSTerminal } from "./MacOSTerminal";
import { Dashboard } from "./Dashboard";
import { InterviewConfig } from "./InterviewConfig";
import { LoadingScreen } from "./LoadingScreen";
import { InterviewInProgress } from "./InterviewInProgress";
import { ResultsView } from "./ResultsView";
import { Cursor } from "../components/Cursor";

export type ProductDemoProps = {};

export const ProductDemo: React.FC<ProductDemoProps> = () => {
  const frame = useCurrentFrame();

  // Timeline with 2x speedup except frames 690-840 (23-28 sec):
  // Everything before 23s speeds up 2x, 23-28s normal, after 28s continues
  const NORMAL_SPEED_START = 690; // 23 seconds at 30fps
  const NORMAL_SPEED_END = 840;   // 28 seconds at 30fps

  // Speed up timeline: divide frame times by 2 up to 23s
  const browserOpenStart = 150;      // was 300
  const dashboardStart = 155;        // was 310
  const cursorMoveToStartNew = 200;  // was 400
  const startNewClickFrame = 217;    // was 435
  const dashboardToConfigTransition = 225;  // was 450
  const configStart = 235;           // was 470

  // Config scrolling timeline (also sped up)
  const scrollStartFrame = 290;      // was 580
  const scrollEndFrame = 310;        // was 620
  const cursorMoveToStartInterview = 315; // was 630
  const startInterviewClickFrame = 332;   // was 665
  const configToLoadingTransition = 340;  // was 680
  const loadingStart = 342;          // was 685

  // Interview in progress timeline (7 seconds = 210 frames)
  const loadingToInterviewTransition = 345; // was 695 (still in speedup)
  const interviewStart = 350;        // was 705
  const interviewToResultsTransition = 560; // was 825 (now 7 seconds: 350 + 210)

  // Results timeline (after interview)
  const resultsStart = 570;          // was 840
  const resultsScrollStart = 600;    // was 950 (added 1 second pause: 30 frames)
  const resultsScrollEnd = 640;      // was 1030

  // Shuffleboard effect timeline
  const shuffleboardStart = 650;     // When card starts moving
  const shuffleboardShootOut = 690;  // When card shoots into space (slower: 40 frames instead of 20)

  // Scroll amount for config
  const configScrollY = interpolate(
    frame,
    [scrollStartFrame, scrollEndFrame],
    [0, 350],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 0.2, 1) }
  );

  // Scroll amount for results
  const resultsScrollY = interpolate(
    frame,
    [resultsScrollStart, resultsScrollEnd],
    [0, 400],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 0.2, 1) }
  );

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

  // Shuffleboard 3D card effect
  const shuffleboardProgress = interpolate(
    frame,
    [shuffleboardStart, shuffleboardShootOut],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 0.2, 1) }
  );

  // Card moves left and rotates
  const cardTranslateX = interpolate(shuffleboardProgress, [0, 0.5, 1], [0, -200, -800]);
  const cardRotateX = interpolate(shuffleboardProgress, [0, 0.5, 1], [0, 30, 45]); // Clockwise tilt
  const cardScale = interpolate(shuffleboardProgress, [0, 0.5, 1], [1, 0.95, 0.6]); // Shrink as it goes away
  const cardOpacity = interpolate(shuffleboardProgress, [0, 0.8, 1], [1, 1, 0]); // Fade out at end

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#e5e5e5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: 2000,
      }}
    >
      <div style={{ width: "100%", height: "100%", padding: 30, position: "relative" }}>
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
              typedText="@claude, help me get a job"
              typeStartFrame={30}
              framesPerChar={3}
              linkHoverFrame={280}
              linkClickFrame={288}
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
            {/* Background cards (deck effect) - only visible during shuffleboard */}
            {frame >= shuffleboardStart && (
              <>
                {[1, 2, 3].map((i) => {
                  // Stagger each card's appearance
                  const cardDelay = i * 0.15; // Each card starts 15% later
                  const cardProgress = interpolate(
                    shuffleboardProgress,
                    [cardDelay, cardDelay + 0.4, cardDelay + 0.7, 1],
                    [0, 1, 1, 0],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                  );

                  return (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        inset: 30,
                        borderRadius: 16,
                        backgroundColor: "#fff",
                        boxShadow: "0 25px 80px rgba(0, 0, 0, 0.25)",
                        transformStyle: "preserve-3d",
                        transform: `translateX(${-150 - i * 10}px) translateY(${i * 8}px) rotateX(${20 + i * 5}deg) scale(${0.95 - i * 0.05})`,
                        opacity: cardProgress * 0.6,
                        zIndex: -i,
                      }}
                    />
                  );
                })}
              </>
            )}

            {/* Main results card with shuffleboard effect */}
            <div
              style={{
                position: "absolute",
                inset: 30,
                opacity: frame < shuffleboardStart
                  ? interpolate(interviewToResultsProgress, [0, 1], [0, 1])
                  : cardOpacity,
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 25px 80px rgba(0, 0, 0, 0.25)",
                transformStyle: "preserve-3d",
                transform: frame >= shuffleboardStart
                  ? `translateX(${cardTranslateX}px) rotateX(${cardRotateX}deg) scale(${cardScale})`
                  : "none",
              }}
            >
              <ResultsView animationStartFrame={resultsStart} scrollY={resultsScrollY} />
            </div>
          </>
        )}

        {/* Cursor for clicking InterviewPro link in terminal */}
        {frame >= 250 && frame < browserOpenStart + 20 && (
          <Cursor
            startX={800}
            startY={600}
            endX={340}
            endY={340}
            moveStartFrame={250}
            moveDuration={25}
            clickFrame={288}
          />
        )}

        {/* Cursor for clicking Start New Interview on dashboard */}
        {frame >= cursorMoveToStartNew && frame < dashboardToConfigTransition + 30 && (
          <Cursor
            startX={900}
            startY={600}
            endX={220}
            endY={335}
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
            endX={640}
            endY={820}
            moveStartFrame={cursorMoveToStartInterview}
            moveDuration={30}
            clickFrame={startInterviewClickFrame}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};
