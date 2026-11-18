import React, { useEffect, useState } from "react";
import {
  Img,
  continueRender,
  delayRender,
  getStaticFiles,
  staticFile,
} from "remotion";
import { INK, LOGO_SYMBOL_FILE, LOGO_WORDMARK_FILE, WHATSAPP_LOGO_FILE } from "../constants";
import { MONO } from "../fonts";

export type BrandAssets = {
  hasSymbol: boolean;
  hasWordmark: boolean;
  hasWhatsApp: boolean;
  /** Width over height of the wordmark artwork (placeholder ratio when missing). */
  wordmarkAspect: number;
};

export const PLACEHOLDER_WORDMARK_ASPECT = 4.4;

const parseAspect = (svg: string): number | null => {
  const vb = svg.match(/viewBox\s*=\s*["']([^"']+)["']/i);
  if (vb) {
    const [, , w, h] = vb[1].trim().split(/[\s,]+/).map(Number);
    if (w > 0 && h > 0) return w / h;
  }
  const w = svg.match(/<svg[^>]*\swidth\s*=\s*["']([\d.]+)/i);
  const h = svg.match(/<svg[^>]*\sheight\s*=\s*["']([\d.]+)/i);
  if (w && h) return Number(w[1]) / Number(h[1]);
  return null;
};

/** Detects the brand files in /public. Never draws or invents a logo. */
export const useBrandAssets = (): BrandAssets | null => {
  const [assets, setAssets] = useState<BrandAssets | null>(null);
  const [handle] = useState(() => delayRender("Checking brand assets"));
  useEffect(() => {
    const names = new Set(getStaticFiles().map((f) => f.name));
    const hasSymbol = names.has(LOGO_SYMBOL_FILE);
    const hasWordmark = names.has(LOGO_WORDMARK_FILE);
    const hasWhatsApp = names.has(WHATSAPP_LOGO_FILE);
    const finish = (aspect: number) => {
      setAssets({ hasSymbol, hasWordmark, hasWhatsApp, wordmarkAspect: aspect });
      continueRender(handle);
    };
    if (!hasWordmark) {
      finish(PLACEHOLDER_WORDMARK_ASPECT);
      return;
    }
    fetch(staticFile(LOGO_WORDMARK_FILE))
      .then((r) => r.text())
      .then((svg) => finish(parseAspect(svg) ?? PLACEHOLDER_WORDMARK_ASPECT))
      .catch(() => finish(PLACEHOLDER_WORDMARK_ASPECT));
  }, [handle]);
  return assets;
};

const placeholderLabel: React.CSSProperties = {
  fontFamily: MONO,
  fontWeight: 500,
  color: INK,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  textAlign: "center",
  lineHeight: 1.25,
};

/** The BotCircuits symbol, tinted ink via a mask so any source colours become ink. */
export const BrandSymbol: React.FC<{ size: number; present: boolean }> = ({
  size,
  present,
}) => {
  if (present) {
    const url = `url(${staticFile(LOGO_SYMBOL_FILE)})`;
    return (
      <div
        style={{
          width: size,
          height: size,
          background: INK,
          WebkitMaskImage: url,
          maskImage: url,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        boxSizing: "border-box",
        border: `2px dashed ${INK}`,
        borderRadius: size * 0.22,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        ...placeholderLabel,
        fontSize: size * 0.15,
      }}
    >
      <div>Logo</div>
      <div style={{ fontSize: size * 0.11, opacity: 0.7 }}>placeholder</div>
    </div>
  );
};

export const BrandWordmark: React.FC<{
  width: number;
  height: number;
  present: boolean;
}> = ({ width, height, present }) => {
  if (present) {
    return (
      <Img
        src={staticFile(LOGO_WORDMARK_FILE)}
        style={{ width, height, objectFit: "contain", objectPosition: "left center" }}
      />
    );
  }
  return (
    <div
      style={{
        width,
        height,
        boxSizing: "border-box",
        border: `2px dashed ${INK}`,
        borderRadius: 14,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        ...placeholderLabel,
        fontSize: 17,
      }}
    >
      <div>Wordmark placeholder</div>
      <div style={{ fontSize: 12, opacity: 0.7, textTransform: "none" }}>
        {LOGO_WORDMARK_FILE}
      </div>
    </div>
  );
};

/** The real WhatsApp logo from /public/logos/whatsapp.svg, never redrawn. Neutral labelled placeholder when missing. */
export const WhatsAppLogo: React.FC<{ size: number; present: boolean }> = ({ size, present }) => {
  if (present) {
    return <Img src={staticFile(WHATSAPP_LOGO_FILE)} style={{ width: size, height: size, objectFit: "contain" }} />;
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        boxSizing: "border-box",
        borderRadius: "50%",
        border: "1.5px dashed rgba(13,18,36,0.45)",
        background: "#F1F2F5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...placeholderLabel,
        fontSize: size * 0.24,
        lineHeight: 1,
      }}
    >
      Logo
    </div>
  );
};
