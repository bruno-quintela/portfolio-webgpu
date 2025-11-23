"use client";
import { useEffect, useRef } from "react";
import { GalleryData, useGalleryContext } from "../context/GalleryContext";
import gsap from "gsap";

interface VerticalTitleProps {
  galleryData: GalleryData[];
}

export function VerticalTitle({ galleryData }: VerticalTitleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { state } = useGalleryContext();
  const { currentImageIndex } = state;
  
  // Keep track of previous index to determine animation direction/logic if needed
  const prevIndexRef = useRef(currentImageIndex);

  useEffect(() => {
    const titles = containerRef.current?.querySelectorAll<HTMLDivElement>('.vertical-title-item');
    if (!titles || titles.length === 0) return;

    const container = containerRef.current;
    if (!container) return;

    const containerHeight = container.clientHeight;
    const titleCount = titles.length;
    
    // Calculate spacing to distribute titles evenly across the full height
    const spacing = containerHeight / (titleCount + 1);

    // Function to calculate the target Y position for a title based on its index
    // and the currently active index, ensuring the active title is centered.
    const calculateTargetY = (titleIndex: number, activeIndex: number) => {
      return (titleIndex - activeIndex) * spacing;
    };

    // Animate to new positions when currentImageIndex changes
    const animateToIndex = (newIndex: number) => {
      titles.forEach((title, titleIndex) => {
        const yPosition = calculateTargetY(titleIndex, newIndex);
        
        // Animate to new position
        gsap.to(title, {
          y: yPosition,
          duration: 1.5,
          ease: "power4.inOut",
        });

        // Calculate opacity based on distance from active title
        const distanceFromActive = Math.abs(titleIndex - newIndex);
        
        let targetOpacity = 1;
        if (distanceFromActive === 0) {
          targetOpacity = 1; // Current title
        } else if (distanceFromActive === 1) {
          targetOpacity = 0.6; // Adjacent titles
        } else if (distanceFromActive === 2) {
          targetOpacity = 0.3; // Two steps away
        } else {
          targetOpacity = 0.1; // Far away titles
        }

        gsap.to(title, {
          opacity: targetOpacity,
          duration: 1.5,
          ease: "power4.inOut",
        });
      });
    };

    // Initial setup or update
    animateToIndex(currentImageIndex);
    prevIndexRef.current = currentImageIndex;

  }, [currentImageIndex, galleryData.length]);

  return (
    <aside
      id="verticalTitle"
      className="corner-text corner-text-center vertical-title-container"
      aria-hidden="true"
      ref={containerRef}
    >
      {galleryData.map((gallery, index) => (
        <div
          key={index}
          className="vertical-title-item"
          data-index={index}
        >
          {gallery.title}
        </div>
      ))}
    </aside>
  );
}
