/**
 * Animation utilities for Gallery
 * Handles GSAP-based text transitions and slide animations
 */

import { gsap } from "gsap";
import { scrambleText } from "./galleryUtils";

export interface GalleryData {
  title: string;
  cover: string;
  number?: string;
  description?: string;
  paragraphLines?: string[];
  slides?: Array<{ url: string; [key: string]: any }>;
  [key: string]: any;
}

export function createTextElements(
  slideIndex: number,
  transitionDirection: "up" | "down",
  galleryData: GalleryData[]
) {
  const newNumber = document.createElement("span");
  newNumber.textContent = "0" + (slideIndex + 1);
  gsap.set(newNumber, { y: transitionDirection === "down" ? 20 : -20 });

  const newCounter = document.createElement("span");
  newCounter.textContent = galleryData[slideIndex]?.number || "0001101";
  gsap.set(newCounter, { y: transitionDirection === "down" ? 20 : -20 });

  const newTitle = document.createElement("h1");
  newTitle.textContent = galleryData[slideIndex]?.title || "1110001101";
  gsap.set(newTitle, { y: transitionDirection === "down" ? 60 : -60 });

  const newDescription = document.createElement("p");
  newDescription.textContent =
    galleryData[slideIndex]?.description || "1110001101";
  gsap.set(newDescription, {
    y: transitionDirection === "down" ? 24 : -24,
  });

  const newParagraphLines = (
    galleryData[slideIndex]?.paragraphLines || []
  ).map((lineText: string) => {
    const lineSpan = document.createElement("span");
    lineSpan.textContent = lineText;
    gsap.set(lineSpan, {
      y: transitionDirection === "down" ? 35 : -35,
    });
    return lineSpan;
  });

  return {
    newNumber,
    newCounter,
    newTitle,
    newDescription,
    newParagraphLines,
  };
}

export function animateTextTransition(
  timeline: gsap.core.Timeline,
  direction: "up" | "down",
  oldElements: any,
  newElements: any
) {
  const { oldNumber, oldCounter, oldTitle, oldDescription, oldParagraphLines } =
    oldElements;
  const { newNumber, newCounter, newTitle, newDescription, newParagraphLines } =
    newElements;

  const yOffset = direction === "down" ? -20 : 20;
  const yOffsetTitle = direction === "down" ? -60 : 60;
  const yOffsetDesc = direction === "down" ? -24 : 24;
  const yOffsetPara = direction === "down" ? -35 : 35;

  timeline
    .to(
      [oldNumber, oldCounter],
      { y: yOffset, autoAlpha: 0, duration: 0.4, ease: "power1.in" },
      0
    )
    .to(
      [newNumber, newCounter],
      { y: 0, autoAlpha: 1, duration: 0.4, ease: "power1.out" },
      "<0.2"
    )
    .to(
      oldTitle,
      { y: yOffsetTitle, autoAlpha: 0, duration: 0.6, ease: "power2.in" },
      0
    )
    .to(
      newTitle,
      { y: 0, autoAlpha: 1, duration: 0.6, ease: "power2.out" },
      "<0.2"
    )
    .to(
      oldDescription,
      {
        y: yOffsetDesc,
        autoAlpha: 0,
        duration: 0.5,
        ease: "power1.in",
      },
      0
    )
    .to(
      newDescription,
      { y: 0, autoAlpha: 1, duration: 0.5, ease: "power1.out" },
      "<0.2"
    )
    .to(
      oldParagraphLines,
      {
        y: yOffsetPara,
        autoAlpha: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "power1.in",
      },
      0
    )
    .to(
      newParagraphLines,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.4,
        stagger: 0.05,
        ease: "power1.out",
      },
      "<0.2"
    );
}

export function animateSlideTransition(
  currentIndex: number,
  nextIndex: number,
  direction: "up" | "down"
) {
  const slides = [...document.querySelectorAll(".slide")];
  const slidesInner = slides.map((item) => item.querySelector(".slide__img"));
  const directionValue = direction === "down" ? -1 : 1;

  const currentSlide = slides[currentIndex];
  const currentInner = slidesInner[currentIndex];
  const upcomingSlide = slides[nextIndex];
  const upcomingInner = slidesInner[nextIndex];

  gsap
    .timeline({
      defaults: {
        duration: 1.5,
        ease: "power4.inOut",
      },
      onStart: () => {
        upcomingSlide.classList.add("slide--current");
      },
      onComplete: () => {
        currentSlide.classList.remove("slide--current");
      },
    })
    .addLabel("start", 0)
    .to(
      currentSlide,
      {
        yPercent: directionValue * 100,
      },
      "start"
    )
    .to(
      currentInner,
      {
        yPercent: -directionValue * 30,
      },
      "start"
    )
    .fromTo(
      upcomingSlide,
      {
        yPercent: -directionValue * 100,
      },
      {
        yPercent: 0,
      },
      "start"
    )
    .fromTo(
      upcomingInner,
      {
        yPercent: directionValue * 30,
      },
      {
        yPercent: 0,
      },
      "start"
    );
}

export function addScrambleAnimations(
  timeline: gsap.core.Timeline,
  newElements: any,
  nextSlideIndex: number,
  galleryData: GalleryData[],
  transitionDirection: "up" | "down",
  config: { transitionDuration: number }
) {
  const { newNumber, newCounter, newTitle, newDescription, newParagraphLines } =
    newElements;

  // Number
  timeline
    .to(
      {},
      {
        duration: 0.8,
        onStart: () => {
          scrambleText(newNumber, "0" + (nextSlideIndex + 1).toString(), 0.8, {
            chars: "∅øΩ§∆◊¶†‡0123456789",
            revealDelay: 0.3,
            speed: 0.4,
          });
        },
      },
      0.2
    )
    // Counter
    .to(
      {},
      {
        duration: 0.8,
        onStart: () => {
          scrambleText(
            newCounter,
            galleryData[nextSlideIndex].number || "0001101",
            1.8,
            {
              chars: "∅øΩ§∆◊¶†‡0123456789",
              revealDelay: 0.3,
              speed: 0.4,
            }
          );
        },
      },
      0.2
    )
    // Title
    .to(
      {},
      {
        duration: 1.2,
        onStart: () => {
          scrambleText(
            newTitle,
            galleryData[nextSlideIndex].title,
            1.2,
            {
              chars: "!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ",
              revealDelay: 0.4,
              speed: 0.3,
            }
          );
        },
      },
      0.3
    )
    // Description
    .to(
      {},
      {
        duration: 1.0,
        onStart: () => {
          scrambleText(
            newDescription,
            galleryData[nextSlideIndex].description || "",
            1.0,
            {
              chars: "!<>-_\\/[]{}—=+*^?#abcdefghijklmnopqrstuvwxyz",
              revealDelay: 0.5,
              speed: 0.35,
            }
          );
        },
      },
      0.4
    );

  // Paragraph lines
  if (newParagraphLines.length > 0) {
    timeline.to(
      {},
      {
        duration: 1.4,
        onStart: () => {
          scrambleText(
            newParagraphLines[0],
            galleryData[nextSlideIndex].paragraphLines?.[0] || "",
            1.4,
            {
              chars: "01!<>-_\\/[]{}—=+*^?#________",
              revealDelay: 0.6,
              speed: 0.25,
            }
          );
        },
      },
      0.5
    );
  }

  if (newParagraphLines.length > 1) {
    timeline.to(
      {},
      {
        duration: 1.4,
        onStart: () => {
          scrambleText(
            newParagraphLines[1],
            galleryData[nextSlideIndex].paragraphLines?.[1] || "",
            1.4,
            {
              chars: "01!<>-_\\/[]{}—=+*^?#________",
              revealDelay: 0.7,
              speed: 0.25,
            }
          );
        },
      },
      0.6
    );
  }
}
