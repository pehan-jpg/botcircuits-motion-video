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
    <Folder name="Space">{null}</Folder>
  </>
);
