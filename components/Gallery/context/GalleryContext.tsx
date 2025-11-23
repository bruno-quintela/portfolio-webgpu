"use client";
import { createContext, useContext } from "react";

export interface GalleryData {
  title: string;
  cover: string;
  number?: string;
  description?: string;
  paragraphLines?: string[];
  slides?: Array<{ url: string; [key: string]: any }>;
  [key: string]: any;
}

export interface GalleryState {
  currentImageIndex: number;
  currentGalleryImageIndex: number;
  selectedGalleryIndex: number | null;
  selectedSlideIndex: number;
  isTransitioning: boolean;
  scrollingEnabled: boolean;
  galleryData: GalleryData[];
  config: {
    transitionDuration: number;
    scrollThrottleDelay: number;
    touchThreshold: number;
    currentEffect: string;
    currentEffectPreset: string;
  };
}

export interface GalleryActions {
  nextSlide: () => void;
  previousSlide: () => void;
  goToSlide: (index: number) => void;
  selectGalleryImage: (galleryIndex: number, imageIndex: number) => void;
  setEffect: (effect: string) => void;
  syncCurrentIndex: (index: number) => void;
}

export interface GalleryContextValue {
  state: GalleryState;
  actions: GalleryActions;
}

export const GalleryContext = createContext<GalleryContextValue | null>(null);

export function useGalleryContext() {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error("useGalleryContext must be used within a GalleryProvider");
  }
  return context;
}
