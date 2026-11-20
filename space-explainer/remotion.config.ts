/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
Config.setJpegQuality(95);

// Use a locally installed Chromium when one is provided (for sandboxes that
// cannot download Remotion's headless shell). Set REMOTION_BROWSER to override.
import fs from 'node:fs';
const localBrowser =
	process.env.REMOTION_BROWSER ??
	'/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
if (fs.existsSync(localBrowser)) {
	Config.setBrowserExecutable(localBrowser);
}
