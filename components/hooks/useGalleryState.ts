import { useState } from "react";

export interface GalleryState {
  currentImageIndex: number;
  currentGalleryImageIndex: number;
  selectedGalleryIndex: number | null;
  selectedSlideIndex: number;
  isTransitioning: boolean;
  scrollingEnabled: boolean;
  lastScrollTimestamp: number;
  touchStartPosition: number;
  isTouchActive: boolean;
  texturesLoaded: boolean;
  gallerySelectedIndices: number[];
}

export function useGalleryState(totalGalleries: number) {
  const [state, setState] = useState<GalleryState>({
    currentImageIndex: 0,
    currentGalleryImageIndex: 0,
    selectedGalleryIndex: null,
    selectedSlideIndex: 0,
    isTransitioning: false,
    scrollingEnabled: true,
    lastScrollTimestamp: 0,
    touchStartPosition: 0,
    isTouchActive: false,
    texturesLoaded: false,
    gallerySelectedIndices: new Array(totalGalleries).fill(0),
  });

  const updateState = (updates: Partial<GalleryState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const setCurrentImageIndex = (index: number) => {
    updateState({ currentImageIndex: index });
  };

  const setSelectedGalleryIndex = (index: number | null) => {
    updateState({ selectedGalleryIndex: index });
  };

  const setIsTransitioning = (isTransitioning: boolean) => {
    updateState({ isTransitioning });
  };

  const setTexturesLoaded = (loaded: boolean) => {
    updateState({ texturesLoaded: loaded });
  };

  const setScrollingEnabled = (enabled: boolean) => {
    updateState({ scrollingEnabled: enabled });
  };

  const updateGallerySelectedIndex = (galleryIndex: number, slideIndex: number) => {
    setState((prev) => {
      const newIndices = [...prev.gallerySelectedIndices];
      newIndices[galleryIndex] = slideIndex;
      return { ...prev, gallerySelectedIndices: newIndices };
    });
  };

  return {
    state,
    updateState,
    setCurrentImageIndex,
    setSelectedGalleryIndex,
    setIsTransitioning,
    setTexturesLoaded,
    setScrollingEnabled,
    updateGallerySelectedIndex,
  };
}
