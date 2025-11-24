"use client";

interface SlideImageProps {
  index: number;
  isSelected: boolean;
  onClick?: () => void;
}

export function SlideDetails({ index, isSelected, onClick }: SlideImageProps) {
  return (
    <div
      key={index}
      className={`slide-details-container ${index === 0 && !isSelected ? 'selected' : ''} ${isSelected ? 'selected' : ''}`}
    >
      <div className="top">top</div>
      <div className="bottom">View</div>
    </div>
  );
}
