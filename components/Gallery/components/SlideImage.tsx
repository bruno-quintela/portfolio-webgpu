"use client";

interface SlideImageProps {
  url: string;
  index: number;
  isSelected: boolean;
  onClick?: () => void;
}

export function SlideImage({ url, index, isSelected, onClick }: SlideImageProps) {
  return (
    <div
      key={index}
      className={`slide-image ${isSelected ? 'selected' : ''}`}
      style={{ backgroundImage: `url(${url})` }}
      onClick={onClick}
    ></div>
  );
}
