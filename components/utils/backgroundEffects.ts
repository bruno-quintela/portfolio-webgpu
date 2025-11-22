/**
 * Background effects for Gallery
 * Handles geometric grid background and debug info
 */

export function setupGeometricBackground(cleanupFns: Array<() => void>) {
  const gridLinesGroup = document.getElementById("grid-lines");
  if (!gridLinesGroup) return;

  const gridSpacing: number = 100;
  for (let i = 0; i <= 40; i++) {
    const vLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    vLine.setAttribute("class", "grid-line");
    vLine.setAttribute("x1", String(i * gridSpacing));
    vLine.setAttribute("y1", "0");
    vLine.setAttribute("x2", String(i * gridSpacing));
    vLine.setAttribute("y2", "1080");
    gridLinesGroup.appendChild(vLine);
    
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

  const handleMouseMove = (event: MouseEvent) => {
    const x = event.clientX;
    const y = event.clientY;

    const debugLine1 = document.getElementById("debugLine1");
    const debugLine2 = document.getElementById("debugLine2");

    if (debugLine1) debugLine1.textContent = `FPS: [${x}]`;
    if (debugLine2) debugLine2.textContent = `Drawcalls: [${y}]`;
  };

  window.addEventListener("mousemove", handleMouseMove);
  cleanupFns.push(() => window.removeEventListener("mousemove", handleMouseMove));
}

export function addPreloaderStyles(): HTMLStyleElement {
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
  return preloaderStyle;
}
