/**
 * Gallery State Context
 * Provides gallery state and actions to components via React Context
 */
"use client";
import React, { createContext, useContext, useCallback, useRef, ReactNode } from "react";

// State interface
export interface GalleryState {
  currentSlideIndex: number;
  isTransitioning: boolean;
  isGalleryExpanded: boolean;
  selectedGalleryIndex: number | null;
  currentEffect: string;
  isPaneVisible: boolean;
}

// Actions interface
export interface GalleryActions {
  goToSlide: (index: number) => void;
  nextSlide: () => void;
  previousSlide: () => void;
  expandGallery: (galleryIndex: number) => void;
  collapseGallery: () => void;
  setEffect: (effectName: string) => void;
  togglePane: () => void;
}

// Combined context type
interface GalleryContextType {
  state: GalleryState;
  actions: GalleryActions;
  registerStateGetter: (getter: () => GalleryState) => void;
  registerActions: (actions: GalleryActions) => void;
}

// Create context
const GalleryContext = createContext<GalleryContextType | null>(null);

// Provider component
interface GalleryProviderProps {
  children: ReactNode;
}

export function GalleryProvider({ children }: GalleryProviderProps) {
  const stateGetterRef = useRef<(() => GalleryState) | null>(null);
  const actionsRef = useRef<GalleryActions | null>(null);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  // Register state getter from monolithic logic
  const registerStateGetter = useCallback((getter: () => GalleryState) => {
    stateGetterRef.current = getter;
    forceUpdate();
  }, []);

  // Register actions from monolithic logic
  const registerActions = useCallback((actions: GalleryActions) => {
    actionsRef.current = actions;
    forceUpdate();
  }, []);

  // Default state when not registered
  const defaultState: GalleryState = {
    currentSlideIndex: 0,
    isTransitioning: false,
    isGalleryExpanded: false,
    selectedGalleryIndex: null,
    currentEffect: "datamosh",
    isPaneVisible: false,
  };

  // Default actions (no-ops) when not registered
  const defaultActions: GalleryActions = {
    goToSlide: () => console.warn("Gallery actions not registered"),
    nextSlide: () => console.warn("Gallery actions not registered"),
    previousSlide: () => console.warn("Gallery actions not registered"),
    expandGallery: () => console.warn("Gallery actions not registered"),
    collapseGallery: () => console.warn("Gallery actions not registered"),
    setEffect: () => console.warn("Gallery actions not registered"),
    togglePane: () => console.warn("Gallery actions not registered"),
  };

  const value: GalleryContextType = {
    state: stateGetterRef.current?.() || defaultState,
    actions: actionsRef.current || defaultActions,
    registerStateGetter,
    registerActions,
  };

  return (
    <GalleryContext.Provider value={value}>
      {children}
    </GalleryContext.Provider>
  );
}

// Hook to use gallery context
export function useGalleryContext() {
  const context = useContext(GalleryContext);
  
  if (!context) {
    throw new Error("useGalleryContext must be used within GalleryProvider");
  }
  
  return context;
}

// Convenience hooks for specific parts
export function useGalleryState() {
  const { state } = useGalleryContext();
  return state;
}

export function useGalleryActions() {
  const { actions } = useGalleryContext();
  return actions;
}
