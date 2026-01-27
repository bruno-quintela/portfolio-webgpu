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

export function Slide({ gallery, index, isCurrent, onImageClick, selectedImageIndex = 0 }: SlideProps) {
  return (
    <div key={index} className={`slide ${isCurrent ? 'slide--current' : ''}`}>
      <div
        className="slide__img"
        style={{ backgroundImage: `url(${gallery.cover})` }}
      ></div>
      <div className="slide-images-container">
        {gallery.slides?.map((slide, slideIndex) => {
          const isSelected = selectedImageIndex === slideIndex;

          return (
            <div
              className={`slide-image-wrapper ${isSelected ? 'selected' : ''}`}
              key={slideIndex}
              onClick={() => onImageClick?.(slideIndex)}
            >
              <SlideImage
                url={slide.url}
                index={slideIndex}
                isSelected={isSelected}
              />
              <SlideDetails
                index={slideIndex}
                isSelected={isSelected}
                slide={slide}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
