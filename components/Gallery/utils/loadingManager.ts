/**
 * Loading Manager for Gallery
 * Handles preloader screen with animated loading indicator
 */

import { hexToRgb } from "./galleryUtils";

export class SliderLoadingManager {
  overlay: HTMLDivElement | null = null;
  canvas: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;
  animationId: number | null = null;
  startTime: number | null = null;
  duration = 3000;
  onComplete?: () => void;

  createLoadingScreen(onComplete?: () => void) {
    this.onComplete = onComplete;
    
    this.overlay = document.createElement("div");
    this.overlay.style.cssText = `
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

    this.canvas = document.createElement("canvas");
    this.canvas.width = 300;
    this.canvas.height = 300;

    this.ctx = this.canvas.getContext("2d");
    this.overlay.appendChild(this.canvas);
    document.body.appendChild(this.overlay);

    this.startAnimation();
  }

  startAnimation() {
    if (!this.canvas || !this.ctx) return;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    let time = 0;
    let lastTime = 0;

    const dotRings = [
      { radius: 20, count: 8 },
      { radius: 35, count: 12 },
      { radius: 50, count: 16 },
      { radius: 65, count: 20 },
      { radius: 80, count: 24 },
    ];

    const colors = {
      primary: "#ff0000",
      accent: "#ff6666",
    };

    const animate = (timestamp: number) => {
      if (!this.startTime) this.startTime = timestamp;

      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      time += deltaTime * 0.001;

      this.ctx!.clearRect(0, 0, this.canvas!.width, this.canvas!.height);

      // Draw center dot
      this.ctx!.beginPath();
      this.ctx!.arc(centerX, centerY, 3, 0, Math.PI * 2);
      const rgb = hexToRgb(colors.primary);
      this.ctx!.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.9)`;
      this.ctx!.fill();

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
          this.ctx!.beginPath();
          this.ctx!.moveTo(centerX, centerY);
          this.ctx!.lineTo(x, y);
          this.ctx!.lineWidth = 0.8;

          if (isActive) {
            const accentRgb = hexToRgb(colors.accent);
            this.ctx!.strokeStyle = `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${
              accentRgb[2]
            }, ${opacityWave * 0.7})`;
          } else {
            const primaryRgb = hexToRgb(colors.primary);
            this.ctx!.strokeStyle = `rgba(${primaryRgb[0]}, ${
              primaryRgb[1]
            }, ${primaryRgb[2]}, ${opacityWave * 0.5})`;
          }
          this.ctx!.stroke();

          // Draw dot at the end of the line
          this.ctx!.beginPath();
          this.ctx!.arc(x, y, 2.5, 0, Math.PI * 2);
          if (isActive) {
            const accentRgb = hexToRgb(colors.accent);
            this.ctx!.fillStyle = `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, ${opacityWave})`;
          } else {
            const primaryRgb = hexToRgb(colors.primary);
            this.ctx!.fillStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, ${opacityWave})`;
          }
          this.ctx!.fill();
        }
      });

      // Check if we should complete the loading
      if (timestamp - this.startTime >= this.duration) {
        this.complete();
        return;
      }

      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  complete() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    if (this.overlay) {
      this.overlay.style.opacity = "0";
      this.overlay.style.transition = "opacity 0.8s ease";
      setTimeout(() => {
        this.overlay?.remove();
        
        // Fade in slider content after it's ready
        setTimeout(() => {
          const sliders = document.querySelectorAll(
            "[data-image-slider-init]"
          );
          sliders.forEach((slider) => {
            (slider as HTMLElement).classList.add("loaded");
          });
        }, 500);
        
        // Call completion callback
        if (this.onComplete) {
          this.onComplete();
        }
      }, 800);
    }
  }
}
