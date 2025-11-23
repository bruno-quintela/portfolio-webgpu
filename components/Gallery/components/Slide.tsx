"use client";
import { SlideImage } from "./SlideImage";
import { GalleryData } from "../context/GalleryContext";

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
          <SlideImage
            key={slideIndex}
            url={slide.url}
            index={slideIndex}
            isSelected={selectedImageIndex === slideIndex}
            onClick={() => onImageClick?.(slideIndex)}
          />
        ))}
      </div>
    </div>
  );
}
