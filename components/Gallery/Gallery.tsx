"use client";
import "./gallery.css";
import { useEffect } from "react";
import { startNewGallery } from "./GalleryLogic";
import galleryData from "@/data/galleryData.json";
import { GalleryProvider } from "./context/GalleryProvider";
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

const Gallery = () => {
  useEffect(() => startNewGallery(galleryData), []);

  return (
    <GalleryProvider galleryData={galleryData}>
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
    </GalleryProvider>
  );
};

export default Gallery;