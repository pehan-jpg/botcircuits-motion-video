import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('png');
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer('swangle');

// Optional: point Remotion at a preinstalled Chrome headless shell.
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
