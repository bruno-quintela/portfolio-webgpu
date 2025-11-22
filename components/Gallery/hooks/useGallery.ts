/**
 * Main Gallery Hook (Hybrid Approach)
 * Uses modular hooks for simple features (loading, background)
 * Uses monolithic logic for complex features (transitions, clicks, etc)
 */
"use client";
import { useEffect, useRef } from "react";
import { useLoadingScreen } from "./useLoadingScreen";
import { useBackgroundEffects } from "./useBackgroundEffects";
import { startNewGallery } from "../newGalleryLogic";

export interface GalleryData {
  title: string;
  cover: string;
  number?: string;
  description?: string;
  paragraphLines?: string[];
  slides?: Array<{ url: string; [key: string]: any }>;
  [key: string]: any;
}

/**
 * Main gallery hook - hybrid approach
 * - Modular: Loading screen, background effects (simple, isolated features)
 * - Monolithic: Gallery logic, transitions, clicks (complex, interconnected features)
 */
export function useGallery(galleryData: GalleryData[]) {
  const cleanupRef = useRef<Array<() => void>>([]);
  const initializedRef = useRef(false);

  // Use modular hooks for simple features
  useLoadingScreen({
    duration: 3000,
    onComplete: () => {
      // Gallery loaded
    },
  });

  useBackgroundEffects();

  // Use monolithic implementation for complex gallery logic
  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (initializedRef.current) return;
    if (typeof window === "undefined") return;

    initializedRef.current = true;

    // Use the complete gallery implementation
    const cleanup = startNewGallery(galleryData);
    if (cleanup) {
      cleanupRef.current.push(cleanup);
    }

    return () => {
      cleanupRef.current.forEach((fn) => fn());
      cleanupRef.current = [];
      initializedRef.current = false;
    };
  }, [galleryData]);

  return {
    // Hook API
  };
}
