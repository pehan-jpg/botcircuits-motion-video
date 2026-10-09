import { loadFont } from "@remotion/fonts";
import { Easing, interpolate, spring, staticFile } from "remotion";

// Inter only. All headline / title-card copy is Regular (400) at 34px; Medium (500) appears only inside the product UI.
// Bundled locally (variable font, Latin subset) so renders never depend on the network.
export const fontFamily = "Inter";
loadFont({
  family: fontFamily,
  url: staticFile("fonts/Inter-Variable-latin.woff2"),
  weight: "400 500",
  display: "block",
});

export const COLORS = {
  canvas: "#F9FAFB",
  ink: "#111827",
  grey: "#6B7280",
  greyLight: "#9CA3AF",
  border: "#E5E7EB",
  surface: "#FFFFFF",
  lime: "#D2F800",
  limeSoft: "rgba(210, 248, 0, 0.18)",
  runBg: "#E0F2FE",
  runFg: "#0369A1",
  ifBg: "#F3E8FF",
  ifFg: "#7E22CE",
  sendBg: "#FFEDD5",
  sendFg: "#C2410C",
  varBg: "#DCFCE7",
  varFg: "#166534",
};

// All layout is authored on a 960×540 logical stage and scaled to the output size,
// so the type sizes from the design system (e.g. 32px) map 1:1 to the spec.
export const STAGE_W = 960;
export const STAGE_H = 540;

// Exponential ease-out used for every reveal.
export const EXPO_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const GLIDE = Easing.bezier(0.45, 0, 0.2, 1);

export const ease = (
  frame: number,
  input: [number, number],
  output: [number, number],
  easing: (t: number) => number = EXPO_OUT,
) =>
  interpolate(frame, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

export const pop = (frame: number, start: number, fps: number, damping = 12) =>
  spring({
    frame: frame - start,
    fps,
    config: { damping, stiffness: 180, mass: 0.6 },
  });

export const typed = (text: string, frame: number, start: number, framesPerChar: number) =>
  text.slice(0, Math.max(0, Math.floor((frame - start) / framesPerChar)));

export const TEXT = {
  line1: ["Every customer asks something different."],
  line2: ["Your CX agent should still know what to do."],
  introLead: "Introducing",
  introName: "BotCircuits Procedures",
  title: "Process Return & Refund Request",
  steps: [
    "Verify Order Eligibility & Policy Limits",
    "Calculate Refund Amount & Deduct Restocking Fee",
    "Generate Prepaid Shipping Label & Issue Credit",
  ],
  condition: "Order Age > 30 Days",
  elseCondition: "Item Marked Final Sale",
  action: "Escalate to Human Agent",
  userMessage: "I'd like to return my jacket from order #8492. I changed my mind about the color.",
  agentReply:
    "I can help with that! A $15 restocking fee applies for preference returns. Your net refund will be $105.00. Here is your prepaid shipping label:",
  outro1: "You decided once.",
  outro2: ["Every customer gets the right path."],
  tagline: "AI Concierge for Scalable, Personalized Customer Operations.",
};

// Hero logo size shared by Scene 1 and Scene 8 (140% of the 48px standard lock-up).
export const HERO_LOGO_H = 48 * 1.4;
