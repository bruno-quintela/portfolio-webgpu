"use client";
import { useState } from "react";
import { Slide } from "./Slide";
import { GalleryData } from "../context/GalleryContext";

interface SlideContainerProps {
  galleryData: GalleryData[];
}

export function SlideContainer({ galleryData }: SlideContainerProps) {
  const [currentSlideIndex] = useState(0);
  const [selectedImageIndices, setSelectedImageIndices] = useState<Record<number, number>>({});

  const handleImageClick = (galleryIndex: number, imageIndex: number) => {
    setSelectedImageIndices(prev => ({
      ...prev,
      [galleryIndex]: imageIndex
    }));
  };

  return (
    <section className="slides" data-featured-image>
      {galleryData.map((gallery, index) => (
        <Slide
          key={index}
          gallery={gallery}
          index={index}
          isCurrent={index === currentSlideIndex}
          onImageClick={(imageIndex) => handleImageClick(index, imageIndex)}
          selectedImageIndex={selectedImageIndices[index]}
        />
      ))}
    </section>
  );
}
