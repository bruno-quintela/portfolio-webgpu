"use client";
import { useEffect, useCallback } from "react";
import * as THREE from "three";
import { Pane } from "tweakpane";
import { gsap } from "gsap";

export function useNewGallery() {
  // Lightweight scramble text helper
  const scrambleText = useCallback((
    element: Element | null,
    finalText: string,
    duration = 1,
    options: { chars?: string; speed?: number; revealDelay?: number } = {}
  ) => {
    if (!element) return;
    const el = element as HTMLElement;
    const chars = (options.chars || "!<>-_/\\[]{}—=+*^?#0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz").split("");
    const total = finalText.length;
    const revealDelay = Math.max(0, (options.revealDelay ?? 0) * duration);
    const startTime = performance.now();
    let rafId = 0;

    function update(now: number) {
      const t = Math.min(1, (now - startTime) / (duration * 1000));
      const revealT = Math.max(0, (t * duration - revealDelay) / Math.max(0.0001, duration - revealDelay));
      const revealedCount = Math.floor(revealT * total);
      let out = "";
      for (let i = 0; i < total; i++) {
        if (i < revealedCount) {
          out += finalText[i];
        } else {
          out += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      el.textContent = out;
      if (t < 1) {
        rafId = requestAnimationFrame(update);
      } else {
        el.textContent = finalText;
      }
    }

    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const hexToRgb = useCallback((hex: string) => {
    if (hex.startsWith("#")) {
      return [
        Number.parseInt(hex.slice(1, 3), 16),
        Number.parseInt(hex.slice(3, 5), 16),
        Number.parseInt(hex.slice(5, 7), 16)
      ];
    }
    const match = hex.match(/\d+/g);
    return match
      ? [
          Number.parseInt(match[0]),
          Number.parseInt(match[1]),
          Number.parseInt(match[2])
        ]
      : [255, 255, 255];
  }, []);

  const initGallery = useCallback(() => {
    if (typeof window === "undefined") return;

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

    // Loading Manager Class
    class SliderLoadingManager {
      overlay: HTMLDivElement | null = null;
      canvas: HTMLCanvasElement | null = null;
      ctx: CanvasRenderingContext2D | null = null;
      animationId: number | null = null;
      startTime: number | null = null;
      duration = 3000;

      createLoadingScreen() {
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
          { radius: 80, count: 24 }
        ];

        const colors = {
          primary: "#ff0000",
          accent: "#ff6666"
        };

        const animate = (timestamp: number) => {
          if (!this.startTime) this.startTime = timestamp;

          if (!lastTime) lastTime = timestamp;
          const deltaTime = timestamp - lastTime;
          lastTime = timestamp;
          time += deltaTime * 0.001;

          this.ctx!.clearRect(0, 0, this.canvas!.width, this.canvas!.height);

          this.ctx!.beginPath();
          this.ctx!.arc(centerX, centerY, 3, 0, Math.PI * 2);
          const rgb = hexToRgb(colors.primary);
          this.ctx!.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.9)`;
          this.ctx!.fill();

          dotRings.forEach((ring, ringIndex) => {
            for (let i = 0; i < ring.count; i++) {
              const angle = (i / ring.count) * Math.PI * 2;
              const radiusPulse = Math.sin(time * 2 - ringIndex * 0.4) * 3;
              const x = centerX + Math.cos(angle) * (ring.radius + radiusPulse);
              const y = centerY + Math.sin(angle) * (ring.radius + radiusPulse);

              const opacityWave =
                0.4 + Math.sin(time * 2 - ringIndex * 0.4 + i * 0.2) * 0.6;
              const isActive = Math.sin(time * 2 - ringIndex * 0.4 + i * 0.2) > 0.6;

              this.ctx!.beginPath();
              this.ctx!.moveTo(centerX, centerY);
              this.ctx!.lineTo(x, y);
              this.ctx!.lineWidth = 0.8;

              if (isActive) {
                const accentRgb = hexToRgb(colors.accent);
                this.ctx!.strokeStyle = `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, ${opacityWave * 0.7})`;
              } else {
                const primaryRgb = hexToRgb(colors.primary);
                this.ctx!.strokeStyle = `rgba(${primaryRgb[0]}, ${primaryRgb[1]}, ${primaryRgb[2]}, ${opacityWave * 0.5})`;
              }
              this.ctx!.stroke();

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

          if (timestamp - (this.startTime || 0) >= this.duration) {
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
            initSliderAfterPreloader();
            setTimeout(() => {
              const sliders = document.querySelectorAll("[data-image-slider-init]");
              sliders.forEach((slider) => {
                (slider as HTMLElement).classList.add("loaded");
              });
            }, 500);
          }, 800);
        }
      }
    }

    let sliderInitialized = false;

    function initImageSlider() {
      if (sliderInitialized) return;
      sliderInitialized = true;

      const sliders = document.querySelectorAll("[data-image-slider-init]");
      sliders.forEach((slider) => {
        // Initialize slider logic here
        // This would contain all the WebGL, shader, and interaction logic
        // from the original newGalleryLogic.ts file
        console.log("Initializing image slider...");
      });
    }

    function initSliderAfterPreloader() {
      setTimeout(() => { initImageSlider(); }, 100);
    }

    // Initialize with preloader
    const loadingManager = new SliderLoadingManager();
    loadingManager.createLoadingScreen();

    // Cleanup function
    return () => {
      preloaderStyle.remove();
    };
  }, [hexToRgb]);

  useEffect(() => {
    const cleanup = initGallery();
    return cleanup;
  }, [initGallery]);

  return {
    scrambleText,
    hexToRgb
  };
}
