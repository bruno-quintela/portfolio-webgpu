"use client";

import { ContextProvider, GlobalContext } from "@/context";
import { useContext, useMemo, useRef, useEffect, use } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Tomorrow } from "next/font/google";

import AboutOverlay from "@/components/aboutOverlay";

const tomorrow = Tomorrow({
  weight: "600",
  subsets: ["latin"],
});

const Html = () => {
  const { isLoading, setIsLoading } = useContext(GlobalContext);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 0);
  }, [setIsLoading]);
  //   const containerHeight = useMemo(() => {
  //     // Calculate container height based on aspect ratio
  //     // Adding 100vh to account for the viewport height and ensure full scroll range
  //     return `${(HEIGHT / WIDTH) * 100 + 300}vh`;
  //   }, []);

  useGSAP(() => {
    if (!isLoading) {
      gsap
        .timeline()
        .to("[data-loader]", {
          opacity: 0,
        })
        .from("[data-title]", {
          yPercent: -100,
          stagger: {
            each: 0.15,
          },
          ease: "power1.out",
        })
        .from("[data-desc]", {
          opacity: 0,
          yPercent: 100,
        });
    }
  }, [isLoading]);

  return (
    <div>
      <div
        className="h-svh fixed z-10 bg-neutral-300 pointer-events-none w-full flex justify-center items-center"
        data-loader
      >
        <div className="w-6 h-6 bg-white animate-ping rounded-full"></div>
      </div>
      <AboutOverlay />
    </div>
  );
};

export default function Page() {
  return (
    <ContextProvider>
      <Html></Html>
    </ContextProvider>
  );
}
