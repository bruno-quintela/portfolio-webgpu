import { useEffect, useRef, useState } from "react";

export interface LoadingScreenOptions {
  duration?: number;
  onComplete?: () => void;
}

export function useLoadingScreen(options: LoadingScreenOptions = {}) {
  const { duration = 3000, onComplete } = options;
  const [isLoading, setIsLoading] = useState(true);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasInitializedRef.current) return; // Prevent re-initialization
    
    hasInitializedRef.current = true;

    // Create overlay
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #000000;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;

    // Create canvas
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");

    overlay.appendChild(canvas);
    document.body.appendChild(overlay);

    overlayRef.current = overlay;
    canvasRef.current = canvas;

    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let time = 0;
    let lastTime = 0;

    const dotRings = [
      { radius: 20, count: 8 },
      { radius: 35, count: 12 },
      { radius: 50, count: 16 },
      { radius: 65, count: 20 },
      { radius: 80, count: 24 },
    ];

    const hexToRgb = (hex: string) => [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ];

    const colors = {
      primary: "#ff0000",
      accent: "#ff6666",
    };

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      if (!lastTime) lastTime = timestamp;
      
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      time += deltaTime * 0.001;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw center dot
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
      const rgb = hexToRgb(colors.primary);
      ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.9)`;
      ctx.fill();

      // Draw Line Pulse Wave animation
      dotRings.forEach((ring, ringIndex) => {
        for (let i = 0; i < ring.count; i++) {
          const angle = (i / ring.count) * Math.PI * 2;
          const radiusPulse = Math.sin(time * 2 - ringIndex * 0.4) * 3;
          const x = centerX + Math.cos(angle) * (ring.radius + radiusPulse);
          const y = centerY + Math.sin(angle) * (ring.radius + radiusPulse);

          const opacityWave =
            0.4 + Math.sin(time * 2 - ringIndex * 0.4 + i * 0.2) * 0.6;
          const isActive =
            Math.sin(time * 2 - ringIndex * 0.4 + i * 0.2) > 0.6;

          // Draw line from center to point
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(x, y);
          ctx.lineWidth = 0.8;

          if (isActive) {
            const accentRgb = hexToRgb(colors.accent);
            ctx.strokeStyle = `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, ${opacityWave * 0.7})`;
          } else {
            const primaryRgb = hexToRgb(colors.primary);
            ctx.strokeStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, ${opacityWave * 0.5})`;
          }
          ctx.stroke();

          // Draw dot at the end of the line
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          if (isActive) {
            const accentRgb = hexToRgb(colors.accent);
            ctx.fillStyle = `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]},${opacityWave})`;
          } else {
            const primaryRgb = hexToRgb(colors.primary);
            ctx.fillStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, ${opacityWave})`;
          }
          ctx.fill();
        }
      });

      // Check if we should complete the loading
      if (timestamp - startTimeRef.current >= duration) {
        complete();
        return;
      }

      animationIdRef.current = requestAnimationFrame(animate);
    };

    const complete = () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }

      if (overlayRef.current) {
        overlayRef.current.style.opacity = "0";
        overlayRef.current.style.transition = "opacity 0.8s ease";
        setTimeout(() => {
          overlayRef.current?.remove();
          setIsLoading(false);
          onComplete?.();
        }, 800);
      }
    };

    animationIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      overlayRef.current?.remove();
    };
  }, []); // Empty deps - only run once on mount

  return { isLoading };
}
