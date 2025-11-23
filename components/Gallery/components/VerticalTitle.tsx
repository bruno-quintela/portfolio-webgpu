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
    // We want max 3 visible titles (Center, Top, Bottom)
    const spacing = containerHeight / 3;

    // Function to calculate the target Y position for a title based on its index
    // and the currently active index, ensuring the active title is centered.
    const calculateTargetY = (titleIndex: number, activeIndex: number) => {
      // Calculate the distance in "indices"
      let diff = titleIndex - activeIndex;
      
      // Adjust for wrapping to find shortest path for the target position calculation
      // This ensures the target Y is always in the "visible" range relative to center
      const totalTitles = titleCount;
      if (diff > totalTitles / 2) {
        diff -= totalTitles;
      } else if (diff < -totalTitles / 2) {
        diff += totalTitles;
      }
      
      return diff * spacing;
    };

    // Animate to new positions when currentImageIndex changes
    const animateToIndex = (newIndex: number) => {
      const totalHeight = titleCount * spacing;

      titles.forEach((title, titleIndex) => {
        const targetY = calculateTargetY(titleIndex, newIndex);
        const currentY = gsap.getProperty(title, "y") as number;
        
        // Calculate the shortest distance to the target
        let delta = targetY - currentY;
        
        // Wrap delta to be within [-totalHeight/2, totalHeight/2]
        // This ensures we always animate the shortest distance (e.g. moving up 1 unit instead of down 4)
        if (delta > totalHeight / 2) {
          delta -= totalHeight;
        } else if (delta < -totalHeight / 2) {
          delta += totalHeight;
        }

        // The virtual target we animate to (might be outside canonical range)
        const virtualTargetY = currentY + delta;

        // Animate to virtual position
        gsap.to(title, {
          y: virtualTargetY,
          duration: 1.5,
          ease: "power4.inOut",
          onComplete: () => {
            // Reset to canonical position after animation to prevent drifting
            // This is invisible if the virtual target and canonical target are visually consistent (modulo totalHeight)
            gsap.set(title, { y: targetY });
          }
        });

        // Calculate opacity based on distance from active title (handling wrap)
        let diff = Math.abs(titleIndex - newIndex);
        if (diff > titleCount / 2) {
          diff = titleCount - diff;
        }
        
        let targetOpacity = 1;
        if (diff === 0) {
          targetOpacity = .75; // Current title
        } else if (diff === 1) {
          targetOpacity = 0.75; // Adjacent titles
        } else {
          targetOpacity = 0.25; // Far away titles (hidden)
        }

        gsap.to(title, {
          opacity: targetOpacity,
          duration: .5,
          ease: "power4.inOut",
        });
      });
    };

    // Initialize centering
    gsap.set(titles, { xPercent: -50, yPercent: -50 });

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
