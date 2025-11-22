/**
 * Background Effects Hook
 * Manages geometric grid background and debug information display
 */
"use client";
import { useEffect, useRef } from "react";

export function useBackgroundEffects() {
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasInitializedRef.current) return; // Prevent re-initialization
    
    hasInitializedRef.current = true;

    const gridLinesGroup = document.getElementById("grid-lines");
    if (!gridLinesGroup) return;

    // Create grid lines
    const gridSpacing = 100;
    
    for (let i = 0; i <= 40; i++) {
      //Vertical lines
      const vLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      vLine.setAttribute("class", "grid-line");
      vLine.setAttribute("x1", String(i * gridSpacing));
      vLine.setAttribute("y1", "0");
      vLine.setAttribute("x2", String(i * gridSpacing));
      vLine.setAttribute("y2", "1080");
      gridLinesGroup.appendChild(vLine);

      // Horizontal lines
      if (i <= 22) {
        const hLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        hLine.setAttribute("class", "grid-line");
        hLine.setAttribute("x1", "0");
        hLine.setAttribute("y1", String(i * gridSpacing));
        hLine.setAttribute("x2", "1920");
        hLine.setAttribute("y2", String(i * gridSpacing));
        gridLinesGroup.appendChild(hLine);
      }
    }

    // Setup mouse tracking for debug info
    const handleMouseMove = (event: MouseEvent) => {
      const x = Math.round(event.clientX);
      const y = Math.round(event.clientY);

      const debugLine1 = document.getElementById("debugLine1");
      const debugLine2 = document.getElementById("debugLine2");

      if (debugLine1) debugLine1.textContent = `FPS: [${x}]`;
      if (debugLine2) debugLine2.textContent = `Drawcalls: [${y}]`;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Add preloader styles
    const preloaderStyle = document.createElement("style");
    preloaderStyle.textContent = `
.image-slider, [data-image-slider-init] {
  opacity: 0;
  transition: opacity 1.5s ease-in;
  pointer-events: none;
}

.image-slider.loaded, [data-image-slider-init].loaded {
  opacity: 1;
  pointer-events: auto;
}
`;
    document.head.appendChild(preloaderStyle);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      preloaderStyle.remove();
      
      // Clear grid lines
      while (gridLinesGroup.firstChild) {
        gridLinesGroup.removeChild(gridLinesGroup.firstChild);
      }
    };
  }, []); // Only run once
}
