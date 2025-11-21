/**
 * Main comprehensive hook for gallery that brings together all logic
 * This hook manages WebGL, animations, controls, and state
 */
"use client";
import { useEffect, useRef, useCallback } from "react";
import { startNewGallery } from "../newGalleryLogic";

interface GalleryData {
  title: string;
  cover: string;
  slides?: Array<{ url: string; [key: string]: any }>;
  [key: string]: any;
}

export function useGallery(galleryData: GalleryData[]) {
  const cleanupRef = useRef<(() => void) | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (initializedRef.current) return;
    if (typeof window === "undefined") return;

    initializedRef.current = true;

    // Start the gallery using the existing logic
    const cleanup = startNewGallery(galleryData);

    // Store cleanup function
    if (cleanup) {
      cleanupRef.current = cleanup;
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      initializedRef.current = false;
    };
  }, [galleryData]);

  return {
    // Hook can expose methods here if needed
  };
}
