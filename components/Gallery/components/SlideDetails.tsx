"use client";
import { Eye, Info } from "lucide-react";

interface SlideDetailsProps {
  index: number;
  isSelected: boolean;
  slide?: {
    title?: string;
    description?: string;
    number?: string;
    url?: string;
    [key: string]: any;
  };
  onClick?: () => void;
}

export function SlideDetails({
  index,
  isSelected,
  slide,
  onClick
}: SlideDetailsProps) {
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
        <div className="slide-details-info">
          <span className="slide-details-title">{slide?.title || ""}</span>
          <span className="slide-details-number">{slide?.number || ""}</span>
        </div>

      </div>
      <div className="bottom">
        <div className="slide-details-info">
          <span className="slide-details-description">{slide?.caption || ""}</span>
        </div>
        <button className="slide-details-btn" onClick={handleShowMore} aria-label="Show More">
          <Info size={16} />
        </button>
        <button className="slide-details-btn" onClick={handleLoad} aria-label="Load">
          <Eye size={16} />
        </button>
      </div>
    </div>
  );
}
