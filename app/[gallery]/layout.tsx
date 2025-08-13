"use client";

import { ContextProvider, GlobalContext } from "@/context";
import { useContext, useMemo, useRef, useEffect, use } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Tomorrow } from "next/font/google";

import Footer from "@/components/footer";

export default function Layout({ children }) {
  const { isLoading, setIsLoading } = useContext(GlobalContext);

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
    <div className="flex flex-col w-full h-full overflow-hidden">
      <div
        className="h-svh fixed z-10 bg-neutral-300 pointer-events-none w-full flex justify-center items-center"
        data-loader
      >
        <div className="w-6 h-6 bg-white animate-ping rounded-full"></div>
      </div>

      {children}
      <Footer />
    </div>
  );
}
