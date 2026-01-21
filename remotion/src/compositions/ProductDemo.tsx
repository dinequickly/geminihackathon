import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { MacOSTerminal } from "./MacOSTerminal";
import { Dashboard } from "./Dashboard";
import { InterviewConfig } from "./InterviewConfig";
import { LoadingScreen } from "./LoadingScreen";
import { InterviewInProgress } from "./InterviewInProgress";
import { ResultsView } from "./ResultsView";
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
  // 780-870: Interview in progress (brief flash)
  // 870-1180: Results view with scroll (Performance + Live Emotions + Transcript)

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

  // Interview in progress timeline
  const loadingToInterviewTransition = 780;
  const interviewStart = 790;
  const interviewToResultsTransition = 870;

  // Results timeline
  const resultsStart = 890;
  const resultsScrollStart = 1000;
  const resultsScrollEnd = 1080;

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
  const showConfig = frame >= dashboardToConfigTransition && frame < configToLoadingTransition + 20;
  const showLoading = frame >= configToLoadingTransition && frame < loadingToInterviewTransition + 20;
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

  // Config to Loading transition
  const configToLoadProgress = interpolate(
    frame,
    [configToLoadingTransition, configToLoadingTransition + 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 0.2, 1) }
  );

  // Loading to Interview transition
  const loadingToInterviewProgress = interpolate(
    frame,
    [loadingToInterviewTransition, loadingToInterviewTransition + 15],
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
              opacity: frame >= loadingToInterviewTransition
                ? interpolate(loadingToInterviewProgress, [0, 1], [1, 0])
                : interpolate(configToLoadProgress, [0, 1], [0, 1]),
            }}
          >
            <BrowserWindow url="interviewpro.app/interview">
              <LoadingScreen animationStartFrame={loadingStart} />
            </BrowserWindow>
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
            }}
          >
            <BrowserWindow url="interviewpro.app/interview/live">
              <InterviewInProgress animationStartFrame={interviewStart} interviewerVideoSrc="interviewer-recording.mov" />
            </BrowserWindow>
          </div>
        )}

        {/* Combined Results View (Performance + Live Emotions + Transcript) */}
        {showResults && (
          <div
            style={{
              position: "absolute",
              inset: 30,
              opacity: interpolate(interviewToResultsProgress, [0, 1], [0, 1]),
            }}
          >
            <BrowserWindow url="interviewpro.app/results">
              <ResultsView animationStartFrame={resultsStart} scrollY={resultsScrollY} />
            </BrowserWindow>
          </div>
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
            startY={400}
            endX={640}
            endY={870}
            moveStartFrame={cursorMoveToStartInterview}
            moveDuration={30}
            clickFrame={startInterviewClickFrame}
          />
        )}
      </div>
    </AbsoluteFill>
  );
};
