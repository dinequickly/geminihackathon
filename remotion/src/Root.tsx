import { Composition, Folder } from "remotion";
import { MacOSTerminal, MacOSTerminalProps } from "./compositions/MacOSTerminal";
import { InterviewConfig, InterviewConfigProps } from "./compositions/InterviewConfig";
import { Dashboard, DashboardProps } from "./compositions/Dashboard";
import { LoadingScreen, LoadingScreenProps } from "./compositions/LoadingScreen";
import { LiveEmotionsView, LiveEmotionsViewProps } from "./compositions/LiveEmotionsView";
import { PerformanceView, PerformanceViewProps } from "./compositions/PerformanceView";
import { TranscriptView, TranscriptViewProps } from "./compositions/TranscriptView";
import { ResultsView, ResultsViewProps } from "./compositions/ResultsView";
import { ProductDemo } from "./compositions/ProductDemo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main Demo */}
      <Composition
        id="ProductDemo"
        component={ProductDemo}
        durationInFrames={920}
        fps={30}
        width={1280}
        height={1000}
        defaultProps={{}}
      />

      {/* Individual Scenes */}
      <Folder name="Scenes">
        <Composition
          id="MacOSTerminal"
          component={MacOSTerminal}
          durationInFrames={500}
          fps={30}
          width={1280}
          height={1000}
          defaultProps={{
            promptUser: "user",
            promptPath: "~",
            typedText: "@claude, help me get a job",
            typeStartFrame: 30,
            framesPerChar: 3,
            cursorMoveStartFrame: 350,
            cursorClickFrame: 440,
          } satisfies MacOSTerminalProps}
        />

        <Composition
          id="Dashboard"
          component={Dashboard}
          durationInFrames={180}
          fps={30}
          width={1280}
          height={1000}
          defaultProps={{
            animationStartFrame: 0,
            showPulsingButton: true,
          } satisfies DashboardProps}
        />

        <Composition
          id="InterviewConfig"
          component={InterviewConfig}
          durationInFrames={300}
          fps={30}
          width={1280}
          height={1000}
          defaultProps={{
            animationStartFrame: 0,
            scrollY: 0,
          } satisfies InterviewConfigProps}
        />

        <Composition
          id="LoadingScreen"
          component={LoadingScreen}
          durationInFrames={150}
          fps={30}
          width={1280}
          height={1000}
          defaultProps={{
            animationStartFrame: 0,
          } satisfies LoadingScreenProps}
        />

        <Composition
          id="LiveEmotionsView"
          component={LiveEmotionsView}
          durationInFrames={180}
          fps={30}
          width={1280}
          height={1000}
          defaultProps={{
            animationStartFrame: 0,
          } satisfies LiveEmotionsViewProps}
        />

        <Composition
          id="PerformanceView"
          component={PerformanceView}
          durationInFrames={180}
          fps={30}
          width={1280}
          height={1000}
          defaultProps={{
            animationStartFrame: 0,
          } satisfies PerformanceViewProps}
        />

        <Composition
          id="TranscriptView"
          component={TranscriptView}
          durationInFrames={180}
          fps={30}
          width={1280}
          height={1000}
          defaultProps={{
            animationStartFrame: 0,
            scrollY: 0,
          } satisfies TranscriptViewProps}
        />

        <Composition
          id="ResultsView"
          component={ResultsView}
          durationInFrames={180}
          fps={30}
          width={1280}
          height={1000}
          defaultProps={{
            animationStartFrame: 0,
          } satisfies ResultsViewProps}
        />
      </Folder>
    </>
  );
};
