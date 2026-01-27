"use client";
import { ReactNode, useRef, useState, useCallback, useMemo } from "react";
import { GalleryContext, GalleryData, GalleryState, GalleryActions } from "./GalleryContext";


interface GalleryProviderProps {
  children: ReactNode;
  galleryData: GalleryData[];
}

export function GalleryProvider({ children, galleryData }: GalleryProviderProps) {
  // Initialize selectedImageIndices with first image (index 0) for all galleries
  const initialSelectedImageIndices = galleryData.reduce((acc, _, index) => {
    acc[index] = 0; // Default to first image for each gallery
    return acc;
  }, {} as Record<number, number>);

  const stateRef = useRef<GalleryState>({
    currentImageIndex: 0,
    currentGalleryImageIndex: 0,
    selectedGalleryIndex: null,
    selectedSlideIndex: 0,
    selectedImageIndices: initialSelectedImageIndices,
    isTransitioning: false,
    scrollingEnabled: true,
    galleryData,
    config: {
      transitionDuration: 1.8,
      scrollThrottleDelay: 1000,
      touchThreshold: 10,
      currentEffect: "digitalStatic",
      currentEffectPreset: "digitalStatic",
    },
  });

  const [, forceUpdate] = useState({});

  const getState = useCallback(() => stateRef.current, []);

  const setState = useCallback((updater: Partial<GalleryState> | ((prev: GalleryState) => Partial<GalleryState>)) => {
    const updates = typeof updater === "function" ? updater(stateRef.current) : updater;
    stateRef.current = { ...stateRef.current, ...updates };
    forceUpdate({});
  }, []);

  const actions = useMemo<GalleryActions>(() => ({
    nextSlide: () => {
      const state = getState();
      if (state.isTransitioning) return;
      const nextIndex = (state.currentImageIndex + 1) % galleryData.length;
      setState({ currentImageIndex: nextIndex, isTransitioning: true });
      setTimeout(() => setState({ isTransitioning: false }), state.config.transitionDuration * 1000);
    },

    previousSlide: () => {
      const state = getState();
      if (state.isTransitioning) return;
      const prevIndex = (state.currentImageIndex - 1 + galleryData.length) % galleryData.length;
      setState({ currentImageIndex: prevIndex, isTransitioning: true });
      setTimeout(() => setState({ isTransitioning: false }), state.config.transitionDuration * 1000);
    },

    goToSlide: (index: number) => {
      const state = getState();
      if (state.isTransitioning || index === state.currentImageIndex) return;
      setState({ currentImageIndex: index, isTransitioning: true });
      setTimeout(() => setState({ isTransitioning: false }), state.config.transitionDuration * 1000);
    },

    selectGalleryImage: (galleryIndex: number, imageIndex: number) => {
      const state = getState();
      setState({
        selectedGalleryIndex: galleryIndex,
        currentGalleryImageIndex: imageIndex,
        selectedImageIndices: {
          ...state.selectedImageIndices,
          [galleryIndex]: imageIndex,
        },
      });
    },

    setEffect: (effect: string) => {
      setState((prev) => ({
        config: { ...prev.config, currentEffect: effect },
      }));
    },

    syncCurrentIndex: (index: number) => {
      setState({ currentImageIndex: index });
    },
  }), [galleryData.length, getState, setState]);

  const value = useMemo(() => ({
    state: stateRef.current,
    actions,
  }), [stateRef.current, actions]);

  return <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>;
}
