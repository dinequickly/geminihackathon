import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { MacOSTerminal } from "./MacOSTerminal";
import { Dashboard } from "./Dashboard";
import { InterviewConfig } from "./InterviewConfig";
import { LoadingScreen } from "./LoadingScreen";
import { LiveEmotionsView } from "./LiveEmotionsView";
import { PerformanceView } from "./PerformanceView";
import { TranscriptView } from "./TranscriptView";
import { Cursor } from "../components/Cursor";
import { BrowserWindow } from "../components/BrowserWindow";

export type ProductDemoProps = {};

export const ProductDemo: React.FC<ProductDemoProps> = () => {
  const frame = useCurrentFrame();

  // Timeline:
  // 0-300: Terminal scene (user types, claude responds)
  // 270-290: Cursor moves to "InterviewPro" text, clicks
  // 300-450: Dashboard with pulsing button
  // 420-440: Cursor moves to Start Interview button, clicks
  // 450-680: Interview Config screen with scroll
  // 680-780: Loading screen
  // 780-930: Live Emotions view
  // 930-1080: Performance view
  // 1080-1230: Transcript view

  const browserOpenStart = 300;
  const dashboardStart = 310;
  const cursorMoveToStartNew = 400;
  const startNewClickFrame = 435;
  const dashboardToConfigTransition = 450;
  const configStart = 470;

  // Config scrolling timeline
  const scrollStartFrame = 580;
  const scrollEndFrame = 620;
  const cursorMoveToStartInterview = 630;
  const startInterviewClickFrame = 665;
  const configToLoadingTransition = 680;
  const loadingStart = 700;

  // Feature showcase timeline
  const loadingToEmotionsTransition = 780;
  const emotionsStart = 800;
  const emotionsToPerformanceTransition = 930;
  const performanceStart = 950;
  const performanceToTranscriptTransition = 1080;
  const transcriptStart = 1100;

  // Scroll amount for config
  const configScrollY = interpolate(
    frame,
    [scrollStartFrame, scrollEndFrame],
    [0, 350],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 0.2, 1) }
  );

  // Scene visibility
  const showTerminal = frame < browserOpenStart;
  const showDashboard = frame >= browserOpenStart && frame < dashboardToConfigTransition + 20;
  const showConfig = frame >= dashboardToConfigTransition && frame < configToLoadingTransition + 20;
  const showLoading = frame >= configToLoadingTransition && frame < loadingToEmotionsTransition + 20;
  const showEmotions = frame >= loadingToEmotionsTransition && frame < emotionsToPerformanceTransition + 20;
  const showPerformance = frame >= emotionsToPerformanceTransition && frame < performanceToTranscriptTransition + 20;
  const showTranscript = frame >= performanceToTranscriptTransition;

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

  // Config to Loading transition
  const configToLoadProgress = interpolate(
    frame,
    [configToLoadingTransition, configToLoadingTransition + 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 0.2, 1) }
  );

  // Loading to Emotions transition
  const loadingToEmotionsProgress = interpolate(
    frame,
    [loadingToEmotionsTransition, loadingToEmotionsTransition + 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 0.2, 1) }
  );

  // Emotions to Performance transition
  const emotionsToPerformanceProgress = interpolate(
    frame,
    [emotionsToPerformanceTransition, emotionsToPerformanceTransition + 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 0.2, 1) }
  );

  // Performance to Transcript transition
  const performanceToTranscriptProgress = interpolate(
    frame,
    [performanceToTranscriptTransition, performanceToTranscriptTransition + 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 0.2, 1) }
  );

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
              promptPath="~"
              typedText="@claude, help me get a job"
              typeStartFrame={30}
              framesPerChar={3}
            />
          </div>
        )}

        {/* Browser with Dashboard */}
        {showDashboard && (
          <div
            style={{
              position: "absolute",
              inset: 30,
              transformStyle: "preserve-3d",
              transform: `rotateY(${dashboardRotateY}deg)`,
              opacity: dashboardOpacity,
              backfaceVisibility: "hidden",
            }}
          >
            <BrowserWindow
              url="interviewpro.app"
              showOpenAnimation={true}
              openAnimationStart={browserOpenStart}
              openAnimationDuration={15}
            >
              <Dashboard
                animationStartFrame={dashboardStart}
                showPulsingButton={frame > dashboardStart + 60}
              />
            </BrowserWindow>
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
            }}
          >
            <BrowserWindow url="interviewpro.app/configure">
              <InterviewConfig
                animationStartFrame={configStart}
                scrollY={configScrollY}
              />
            </BrowserWindow>
          </div>
        )}

        {/* Loading Screen */}
        {showLoading && (
          <div
            style={{
              position: "absolute",
              inset: 30,
              opacity: frame >= loadingToEmotionsTransition
                ? interpolate(loadingToEmotionsProgress, [0, 1], [1, 0])
                : interpolate(configToLoadProgress, [0, 1], [0, 1]),
            }}
          >
            <BrowserWindow url="interviewpro.app/interview">
              <LoadingScreen animationStartFrame={loadingStart} />
            </BrowserWindow>
          </div>
        )}

        {/* Live Emotions View */}
        {showEmotions && (
          <div
            style={{
              position: "absolute",
              inset: 30,
              opacity: frame >= emotionsToPerformanceTransition
                ? interpolate(emotionsToPerformanceProgress, [0, 1], [1, 0])
                : interpolate(loadingToEmotionsProgress, [0, 1], [0, 1]),
            }}
          >
            <BrowserWindow url="interviewpro.app/interview/live">
              <LiveEmotionsView animationStartFrame={emotionsStart} />
            </BrowserWindow>
          </div>
        )}

        {/* Performance View */}
        {showPerformance && (
          <div
            style={{
              position: "absolute",
              inset: 30,
              opacity: frame >= performanceToTranscriptTransition
                ? interpolate(performanceToTranscriptProgress, [0, 1], [1, 0])
                : interpolate(emotionsToPerformanceProgress, [0, 1], [0, 1]),
            }}
          >
            <BrowserWindow url="interviewpro.app/results">
              <PerformanceView animationStartFrame={performanceStart} />
            </BrowserWindow>
          </div>
        )}

        {/* Transcript View */}
        {showTranscript && (
          <div
            style={{
              position: "absolute",
              inset: 30,
              opacity: interpolate(performanceToTranscriptProgress, [0, 1], [0, 1]),
            }}
          >
            <BrowserWindow url="interviewpro.app/transcript">
              <TranscriptView animationStartFrame={transcriptStart} />
            </BrowserWindow>
          </div>
        )}

        {/* Cursor for clicking InterviewPro text in terminal */}
        {frame >= 250 && frame < browserOpenStart + 20 && (
          <Cursor
            startX={800}
            startY={700}
            endX={378}
            endY={242}
            moveStartFrame={250}
            moveDuration={35}
            clickFrame={288}
          />
        )}

        {/* Cursor for clicking Start New Interview on dashboard */}
        {frame >= cursorMoveToStartNew && frame < dashboardToConfigTransition + 30 && (
          <Cursor
            startX={900}
            startY={600}
            endX={220}
            endY={420}
            moveStartFrame={cursorMoveToStartNew}
            moveDuration={30}
            clickFrame={startNewClickFrame}
          />
        )}

        {/* Cursor for clicking Start Interview on config */}
        {frame >= cursorMoveToStartInterview && frame < configToLoadingTransition + 30 && (
          <Cursor
            startX={900}
            startY={300}
            endX={640}
            endY={620}
            moveStartFrame={cursorMoveToStartInterview}
            moveDuration={30}
            clickFrame={startInterviewClickFrame}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};
