"use client";
import { SlideImage } from "./SlideImage";
import { GalleryData } from "../context/GalleryContext";
import { SlideDetails } from "./SlideDetails";

interface SlideProps {
  gallery: GalleryData;
  index: number;
  isCurrent: boolean;
  onImageClick?: (imageIndex: number) => void;
  selectedImageIndex?: number;
}

export function Slide({ gallery, index, isCurrent, onImageClick, selectedImageIndex }: SlideProps) {
  return (
    <div key={index} className={`slide ${isCurrent ? 'slide--current' : ''}`}>
      <div
        className="slide__img"
        style={{ backgroundImage: `url(${gallery.cover})` }}
      ></div>
      <div className="slide-images-container">
        {gallery.slides?.map((slide, slideIndex) => (
          <div
            className={`slide-image-wrapper ${selectedImageIndex === slideIndex || (slideIndex === 0 && selectedImageIndex === undefined) ? 'selected' : ''}`}
            key={slideIndex}
            onClick={() => onImageClick?.(slideIndex)}
          >
            <SlideImage
              url={slide.url}
              index={slideIndex}
              isSelected={selectedImageIndex === slideIndex}
            />
            <SlideDetails
              index={slideIndex}
              isSelected={selectedImageIndex === slideIndex}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
