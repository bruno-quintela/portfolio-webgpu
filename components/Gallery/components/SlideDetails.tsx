"use client";
import { Download, Info } from "lucide-react";

interface SlideDetailsProps {
  index: number;
  isSelected: boolean;
  onClick?: () => void;
}

export function SlideDetails({ index, isSelected, onClick }: SlideDetailsProps) {
  const handleLoad = () => {
    console.log(`Load clicked for slide ${index}`);
    // Add your load logic here
  };

  const handleShowMore = () => {
    console.log(`Show more clicked for slide ${index}`);
    // Add your show more logic here
  };

  return (
    <div
      key={index}
      className={`slide-details-container ${index === 0 && !isSelected ? 'selected' : ''} ${isSelected ? 'selected' : ''}`}
    >
      <div className="top">
        <button className="slide-details-btn" onClick={handleShowMore} aria-label="Show More">
          <Info size={16} />
        </button>
      </div>
      <div className="bottom">
        <button className="slide-details-btn" onClick={handleShowMore} aria-label="Show More">
          <Info size={16} />
        </button>
        <button className="slide-details-btn" onClick={handleLoad} aria-label="Load">
          <Download size={16} />
        </button>
      </div>
    </div>
  );
}
