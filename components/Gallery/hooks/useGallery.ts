/**
 * Main comprehensive hook for gallery that orchestrates all modular components
 * This hook manages WebGL, animations, controls, and state
 */
"use client";
import { useEffect, useRef } from "react";
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
 * Main gallery hook - uses the complete gallery implementation
 * All event handling, transitions, and interactive features are included
 */
export function useGallery(galleryData: GalleryData[]) {
  const cleanupRef = useRef<Array<() => void>>([]);
  const initializedRef = useRef(false);

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
    // Hook can expose methods here if needed
    // For example: transitionSlide, setEffect, etc.
  };
}
