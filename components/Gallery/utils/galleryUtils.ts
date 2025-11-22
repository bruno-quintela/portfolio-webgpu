/**
 * Utility functions and configurations for the gallery
 */

export interface GalleryConfig {
  transitionDuration: number;
  scrollThrottleDelay: number;
  touchThreshold: number;
  currentEffect: string;
  currentEffectPreset: string;
  globalIntensity: number;
  speedMultiplier: number;
  colorShiftAmount: number;
  distortionStrength: number;
  noiseLevel: number;
  // Datamosh
  datamoshBlockSize: number;
  datamoshCorruptionFreq: number;
  datamoshQuantization: number;
  datamoshDisplacement: number;
  datamoshTemporal: number;
  // Pixel Sort
  pixelSortDirection: number;
  pixelSortThreshold: number;
  pixelSortBandWidth: number;
  pixelSortSeparation: number;
  pixelSortSensitivity: number;
  // Digital Static
  staticDensity: number;
  staticWaveSpeed: number;
  staticAnalogNoise: number;
  staticChannelShift: number;
  staticFlicker: number;
  // Static Sweep
  sweepWidth: number;
  sweepLayers: number;
  sweepChromaticAberration: number;
  sweepEdgeGlow: number;
  sweepFadeTiming: number;
  // Glitch Wipe
  wipeAngle: number;
  wipeAberrationStrength: number;
  wipeEdgeWidth: number;
  wipeColorBleeding: number;
  wipeTransitionCurve: number;
  // Analog Decay
  analogGrain: number;
  analogBleeding: number;
  analogVSync: number;
  analogScanlines: number;
  analogVignette: number;
  analogJitter: number;
  analogChroma: number;
}

export const defaultConfig: GalleryConfig = {
  transitionDuration: 1.8,
  scrollThrottleDelay: 1000,
  touchThreshold: 10,
  currentEffect: "digitalStatic",
  currentEffectPreset: "Default",
  globalIntensity: 1.0,
  speedMultiplier: 1.0,
  colorShiftAmount: 0.3,
  distortionStrength: 1.0,
  noiseLevel: 0.5,
  datamoshBlockSize: 1.0,
  datamoshCorruptionFreq: 1.0,
  datamoshQuantization: 1.0,
  datamoshDisplacement: 1.0,
  datamoshTemporal: 1.0,
  pixelSortDirection: 0.5,
  pixelSortThreshold: 1.0,
  pixelSortBandWidth: 1.0,
  pixelSortSeparation: 1.0,
  pixelSortSensitivity: 1.0,
  staticDensity: 1.0,
  staticWaveSpeed: 1.0,
  staticAnalogNoise: 1.0,
  staticChannelShift: 1.0,
  staticFlicker: 1.0,
  sweepWidth: 1.0,
  sweepLayers: 1.0,
  sweepChromaticAberration: 1.0,
  sweepEdgeGlow: 1.0,
  sweepFadeTiming: 1.0,
  wipeAngle: 0.0,
  wipeAberrationStrength: 1.0,
  wipeEdgeWidth: 1.0,
  wipeColorBleeding: 1.0,
  wipeTransitionCurve: 1.0,
  analogGrain: 1.0,
  analogBleeding: 1.0,
  analogVSync: 1.0,
  analogScanlines: 1.0,
  analogVignette: 1.0,
  analogJitter: 1.0,
  analogChroma: 1.0,
};

export type EffectPresets = Record<string, Record<string, Partial<GalleryConfig>>>;

export const effectPresets: EffectPresets = {
  datamosh: {
    Subtle: {
      datamoshBlockSize: 1.5,
      datamoshCorruptionFreq: 0.6,
      datamoshQuantization: 0.4,
      datamoshDisplacement: 0.3,
      datamoshTemporal: 0.8,
    },
    Default: {
      datamoshBlockSize: 1.0,
      datamoshCorruptionFreq: 1.0,
      datamoshQuantization: 1.0,
      datamoshDisplacement: 1.0,
      datamoshTemporal: 1.0,
    },
    Intense: {
      datamoshBlockSize: 0.5,
      datamoshCorruptionFreq: 1.8,
      datamoshQuantization: 1.6,
      datamoshDisplacement: 2.0,
      datamoshTemporal: 1.4,
    },
    Minimal: {
      datamoshBlockSize: 2.0,
      datamoshCorruptionFreq: 0.3,
      datamoshQuantization: 0.2,
      datamoshDisplacement: 0.1,
      datamoshTemporal: 0.5,
    },
  },
  pixelSort: {
    Gentle: {
      pixelSortDirection: 0.2,
      pixelSortThreshold: 0.6,
      pixelSortBandWidth: 1.4,
      pixelSortSeparation: 0.5,
      pixelSortSensitivity: 0.7,
    },
    Default: {
      pixelSortDirection: 0.5,
      pixelSortThreshold: 1.0,
      pixelSortBandWidth: 1.0,
      pixelSortSeparation: 1.0,
      pixelSortSensitivity: 1.0,
    },
    Chaos: {
      pixelSortDirection: 0.8,
      pixelSortThreshold: 1.5,
      pixelSortBandWidth: 0.6,
      pixelSortSeparation: 1.8,
      pixelSortSensitivity: 1.4,
    },
    Ordered: {
      pixelSortDirection: 0.0,
      pixelSortThreshold: 0.8,
      pixelSortBandWidth: 1.8,
      pixelSortSeparation: 0.3,
      pixelSortSensitivity: 0.9,
    },
  },
  digitalStatic: {
    Soft: {
      staticDensity: 0.6,
      staticWaveSpeed: 0.7,
      staticAnalogNoise: 0.5,
      staticChannelShift: 0.4,
      staticFlicker: 0.3,
    },
    Default: {
      staticDensity: 1.0,
      staticWaveSpeed: 1.0,
      staticAnalogNoise: 1.0,
      staticChannelShift: 1.0,
      staticFlicker: 1.0,
    },
    Storm: {
      staticDensity: 1.7,
      staticWaveSpeed: 2.0,
      staticAnalogNoise: 1.6,
      staticChannelShift: 1.8,
      staticFlicker: 1.5,
    },
    Vintage: {
      staticDensity: 0.8,
      staticWaveSpeed: 0.4,
      staticAnalogNoise: 1.3,
      staticChannelShift: 0.2,
      staticFlicker: 0.8,
    },
  },
  staticSweep: {
    Clean: {
      sweepWidth: 1.2,
      sweepLayers: 0.7,
      sweepChromaticAberration: 0.6,
      sweepEdgeGlow: 1.1,
      sweepFadeTiming: 0.8,
    },
    Default: {
      sweepWidth: 1.0,
      sweepLayers: 1.0,
      sweepChromaticAberration: 1.0,
      sweepEdgeGlow: 1.0,
      sweepFadeTiming: 1.0,
    },
    Brutal: {
      sweepWidth: 0.7,
      sweepLayers: 1.8,
      sweepChromaticAberration: 1.7,
      sweepEdgeGlow: 0.9,
      sweepFadeTiming: 1.5,
    },
    Smooth: {
      sweepWidth: 1.5,
      sweepLayers: 0.5,
      sweepChromaticAberration: 0.4,
      sweepEdgeGlow: 1.3,
      sweepFadeTiming: 0.6,
    },
  },
  glitchWipe: {
    Smooth: {
      wipeAngle: 15.0,
      wipeAberrationStrength: 0.6,
      wipeEdgeWidth: 1.3,
      wipeColorBleeding: 0.5,
      wipeTransitionCurve: 0.8,
    },
    Default: {
      wipeAngle: 0.0,
      wipeAberrationStrength: 1.0,
      wipeEdgeWidth: 1.0,
      wipeColorBleeding: 1.0,
      wipeTransitionCurve: 1.0,
    },
    Aggressive: {
      wipeAngle: -25.0,
      wipeAberrationStrength: 1.8,
      wipeEdgeWidth: 0.7,
      wipeColorBleeding: 1.6,
      wipeTransitionCurve: 1.4,
    },
    Diagonal: {
      wipeAngle: 35.0,
      wipeAberrationStrength: 1.2,
      wipeEdgeWidth: 0.9,
      wipeColorBleeding: 1.1,
      wipeTransitionCurve: 1.1,
    },
  },
  analogDecay: {
    Vintage: {
      analogGrain: 0.7,
      analogBleeding: 0.5,
      analogVSync: 0.3,
      analogScanlines: 0.8,
      analogVignette: 1.2,
      analogJitter: 0.4,
      analogChroma: 0.6,
    },
    Default: {
      analogGrain: 1.0,
      analogBleeding: 1.0,
      analogVSync: 1.0,
      analogScanlines: 1.0,
      analogVignette: 1.0,
      analogJitter: 1.0,
      analogChroma: 1.0,
    },
    Corrupted: {
      analogGrain: 1.8,
      analogBleeding: 1.6,
      analogVSync: 2.0,
      analogScanlines: 1.4,
      analogVignette: 0.8,
      analogJitter: 1.8,
      analogChroma: 1.5,
    },
    Minimal: {
      analogGrain: 0.3,
      analogBleeding: 0.2,
      analogVSync: 0.1,
      analogScanlines: 0.5,
      analogVignette: 1.5,
      analogJitter: 0.2,
      analogChroma: 0.3,
    },
  },
};

// Helper function to convert hex color to RGB array
export function hexToRgb(hex: string): number[] {
  if (hex.startsWith("#")) {
    return [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ];
  }
  const match = hex.match(/\d+/g);
  return match
    ? [parseInt(match[0]), parseInt(match[1]), parseInt(match[2])]
    : [255, 255, 255];
}

// Lightweight scramble text helper (replacement for ScrambleTextPlugin)
export function scrambleText(
  element: Element | null,
  finalText: string,
  duration = 1,
  options: { chars?: string; speed?: number; revealDelay?: number } = {}
): (() => void) | undefined {
  if (!element) return;
  const el = element as HTMLElement;
  const chars = (
    options.chars ||
    "!<>-_/\\[]{}—=+*^?#0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
  ).split("");
  const total = finalText.length;
  const revealDelay = Math.max(0, (options.revealDelay ?? 0) * duration);
  const startTime = performance.now();
  let rafId = 0;

  function update(now: number) {
    const t = Math.min(1, (now - startTime) / (duration * 1000));
    // reveal progress after delay
    const revealT = Math.max(
      0,
      (t * duration - revealDelay) / Math.max(0.0001, duration - revealDelay)
    );
    const revealedCount = Math.floor(revealT * total);
    let out = "";
    for (let i = 0; i < total; i++) {
      if (i < revealedCount) {
        out += finalText[i];
      } else {
        out += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    el.textContent = out;
    if (t < 1) {
      rafId = requestAnimationFrame(update);
    } else {
      el.textContent = finalText;
    }
  }

  // kick off
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(update);
  return () => cancelAnimationFrame(rafId);
}
