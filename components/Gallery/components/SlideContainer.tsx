"use client";
import { Slide } from "./Slide";
import { GalleryData, useGalleryContext } from "../context/GalleryContext";

interface SlideContainerProps {
  galleryData: GalleryData[];
}

export function SlideContainer({ galleryData }: SlideContainerProps) {
  const { state, actions } = useGalleryContext();

  const handleImageClick = (galleryIndex: number, imageIndex: number) => {
    actions.selectGalleryImage(galleryIndex, imageIndex);
  };

  return (
    <section className="slides" data-featured-image>
      {galleryData.map((gallery, index) => (
        <Slide
          key={index}
          gallery={gallery}
          index={index}
          isCurrent={index === state.currentImageIndex}
          onImageClick={(imageIndex) => handleImageClick(index, imageIndex)}
          selectedImageIndex={state.selectedImageIndices[index]}
        />
      ))}
    </section>
  );
}
