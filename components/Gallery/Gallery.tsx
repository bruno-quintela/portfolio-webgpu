"use client";
import "./gallery.css";
import { useEffect } from "react";
import { startNewGallery } from "./GalleryLogic";
import galleryData from "@/data/galleryData.json";
import { GalleryProvider } from "./context/GalleryProvider";
import { useGalleryContext } from "./context/GalleryContext";
import {
  WebGLCanvas,
  GeometricBackground,
  DebugInfo,
  SlideCounter,
  KeyboardShortcuts,
  VerticalTitle,
  SlideText,
  SlideParagraph,
  SlideContainer,
} from "./components";

const GalleryContent = () => {
  const { state, actions } = useGalleryContext();
  const { galleryData } = state;

  useEffect(() => {
    const cleanup = startNewGallery(galleryData, (index) => {
      actions.syncCurrentIndex(index);
    });
    return cleanup;
  }, [galleryData, actions]);

  return (
    <main
      className="image-slider"
      role="region"
      aria-label="Image carousel"
      data-image-slider-init
    >
      <WebGLCanvas />
      <GeometricBackground />
      <DebugInfo />
      <SlideCounter />
      <KeyboardShortcuts />
      <VerticalTitle galleryData={galleryData} />
      <SlideContainer galleryData={galleryData} />
      <SlideText />
      <SlideParagraph />
    </main>
  );
};

const Gallery = () => {
  return (
    <GalleryProvider galleryData={galleryData}>
      <GalleryContent />
    </GalleryProvider>
  );
};

export default Gallery;