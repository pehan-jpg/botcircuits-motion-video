import React from 'react';
import {Composition, Folder} from 'remotion';
import {DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH} from './config';
import {ensureInter} from './fonts';
import {Build} from './cx/build/Build';
import {Integrate} from './cx/integrate/Integrate';
import {Simulate} from './cx/simulate/Simulate';
import {Publish} from './cx/publish/Publish';
import {PUBLISH_DURATION_SECONDS} from './cx/publish/timeline';
import {Monitor} from './cx/monitor/Monitor';
import {MONITOR_DURATION_SECONDS} from './cx/monitor/timeline';
import {Optimize} from './cx/optimize/Optimize';
import {OPTIMIZE_DURATION_SECONDS} from './cx/optimize/timeline';
import {SpaceChat} from './space/chat/SpaceChat';
import {SpaceAgents} from './space/agents/SpaceAgents';
import {SPACE_AGENTS_DURATION_SECONDS} from './space/agents/timeline';
import {SpaceBrain} from './space/brain/SpaceBrain';
import {SPACE_BRAIN_DURATION_SECONDS} from './space/brain/timeline';
import {SpaceBuild} from './space/build/SpaceBuild';
import {SPACE_BUILD_DURATION_SECONDS} from './space/build/timeline';
import {SpaceAutomate} from './space/automate/SpaceAutomate';
import {SPACE_AUTOMATE_DURATION_SECONDS} from './space/automate/timeline';
import {SpaceConnect} from './space/connect/SpaceConnect';
import {SPACE_CONNECT_DURATION_SECONDS} from './space/connect/timeline';

ensureInter();

const canvas = {fps: FPS, width: WIDTH, height: HEIGHT};

/**
 * Two sets share this root, config, tokens and components:
 *   CX     the six BotCircuits CX capability animations (src/cx)
 *   Space  the BotCircuits Space animations (src/space)
 * Composition ids are unchanged from the CX only project.
 */
export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="CX">
      <Composition id="Build" component={Build} durationInFrames={DURATION_IN_FRAMES} {...canvas} />
      <Composition id="Integrate" component={Integrate} durationInFrames={DURATION_IN_FRAMES} {...canvas} />
      <Composition id="Simulate" component={Simulate} durationInFrames={DURATION_IN_FRAMES} {...canvas} />
      {/* Publish runs 12 seconds; Monitor and Optimize run 10. */}
      <Composition id="Publish" component={Publish} durationInFrames={PUBLISH_DURATION_SECONDS * FPS} {...canvas} />
      <Composition id="Monitor" component={Monitor} durationInFrames={MONITOR_DURATION_SECONDS * FPS} {...canvas} />
      <Composition id="Optimize" component={Optimize} durationInFrames={OPTIMIZE_DURATION_SECONDS * FPS} {...canvas} />
    </Folder>
    <Folder name="Space">
      <Composition id="SpaceChat" component={SpaceChat} durationInFrames={DURATION_IN_FRAMES} {...canvas} />
      {/* SpaceAgents runs 10 seconds. */}
      <Composition id="SpaceAgents" component={SpaceAgents} durationInFrames={SPACE_AGENTS_DURATION_SECONDS * FPS} {...canvas} />
      {/* SpaceBrain runs 12 seconds. */}
      <Composition id="SpaceBrain" component={SpaceBrain} durationInFrames={SPACE_BRAIN_DURATION_SECONDS * FPS} {...canvas} />
      {/* SpaceBuild runs 10 seconds. */}
      <Composition id="SpaceBuild" component={SpaceBuild} durationInFrames={SPACE_BUILD_DURATION_SECONDS * FPS} {...canvas} />
      {/* SpaceAutomate runs 10 seconds. */}
      <Composition id="SpaceAutomate" component={SpaceAutomate} durationInFrames={SPACE_AUTOMATE_DURATION_SECONDS * FPS} {...canvas} />
      {/* SpaceConnect runs 12 seconds. */}
      <Composition id="SpaceConnect" component={SpaceConnect} durationInFrames={SPACE_CONNECT_DURATION_SECONDS * FPS} {...canvas} />
    </Folder>
  </>
);
