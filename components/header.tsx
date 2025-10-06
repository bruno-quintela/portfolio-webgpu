"use client";

import React, { useState, useEffect, ReactNode } from "react";
import NextLink from "next/link";
import { gsap } from "gsap";

import { Settings, Info, VolumeOff } from "lucide-react";

import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

const Link = ({
  href,
  target,
  className,
  children,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  target?: string;
}) => {
  return (
    <NextLink
      target={target}
      className={`pointer-events-auto ${className}`}
      href={href}
    >
      {children}
    </NextLink>
  );
};

const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const splitPath = pathname.split("/");
  const currentLocale = splitPath[1];
  const [audioEnabled, setAudioEnabled] = useState(false);
  const handleLogoClick = () => router.push(`/${currentLocale}`);

  const handleAudioClick = () => {
    setAudioEnabled(!audioEnabled);
    const setupBackgroundSound = () => {
      const startClickSound = document.getElementById("startClickSound");
      const preloaderSound = document.getElementById("preloaderSound");
      const backgroundMusic = document.getElementById("backgroundMusic");
    
      if (startClickSound) startClickSound.play().catch((e) => {});
      //document.querySelector(".audio-enable").style.display = "none";
      //document.getElementById("preloader").style.display = "flex";
      if (preloaderSound) preloaderSound.play().catch((e) => {});
    
      setTimeout(() => {
        if (backgroundMusic) {
          backgroundMusic.volume = 0.25;
          backgroundMusic.play().catch((e) => {
            console.error("Error playing background music", e);
          });
        }
      }, 500);
      
    };
    
    function setupScrollSounds() {
      let scrollTimeout = 1000;
      const scrollSound1 = document.getElementById("scrollSound1");
      const scrollSound2 = document.getElementById("scrollSound2");
      const scrollSound3 = document.getElementById("scrollSound3");
      function getCurrentSection() {
        const scrollY = window.scrollY;
        const sectionHeight = window.innerHeight * 2;
        if (scrollY < sectionHeight) return 1;
        else if (scrollY < sectionHeight * 2) return 2;
        else return 3;
      }
    
      function stopAllScrollSounds() {
        [scrollSound1, scrollSound2, scrollSound3].forEach((sound) => {
          if (sound && !sound.paused) {
            sound.pause();
            sound.currentTime = 0;
          }
        });
      }
      let currentSection = 2;
      
      window.addEventListener("wheel", () => {
        let isScrolling = true;
        // const newSection = getCurrentSection();
        
        // if (newSection !== currentSection) {
        //   stopAllScrollSounds();
        //   currentSection = newSection;
        // }
        const currentScrollSound = eval(`scrollSound${currentSection}`);
        if (currentScrollSound && currentScrollSound.paused) {
          currentScrollSound.currentTime = 0;
          currentScrollSound.volume = 1;
          currentScrollSound.play().catch((e) => {
            console.error("Error playing scroll sound", e);
          });
        }
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          stopAllScrollSounds();
          isScrolling = false;
        },900);
      });
    }

    function setupNavigationSounds() {
      
      document.querySelectorAll("#main-nav a").forEach((navItem) => {
        const hoverSound = document.getElementById("hoverSound");
        navItem.addEventListener("mouseenter", () => {
          const square = navItem.querySelector(".nav-hover-square");
          gsap.to(square, { scaleX: 1, duration: 0.3, ease: "power2.out" });
          if (hoverSound) {
            hoverSound.currentTime = 0;
            hoverSound.volume = 0.3;
            hoverSound.play().catch((e) => {});
          }
        });
        navItem.addEventListener("mouseleave", () => {
          const square = navItem.querySelector(".nav-hover-square");
          gsap.to(square, { scaleX: 0, duration: 0.2, ease: "power2.in" });
        });
      });
    };

    // run the sound setup
    setupBackgroundSound();
    setupNavigationSounds();
    setupScrollSounds();
  };



  // Helper to check if a link is selected
  const isSelected = (href: string) => {
    // For root links like "/about" or "/gallery", check if pathname starts with them
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="fixed top-0 w-full h-auto z-50">
      <audio id="startClickSound" preload="auto">
            <source src="https://assets.codepen.io/7558/preloader-2s-001.mp3" type="audio/mpeg" />
        </audio>

        <audio id="preloaderSound" preload="auto">
            <source src="https://assets.codepen.io/7558/preloader-5s-001.mp3" type="audio/mpeg" />
        </audio>

        <audio id="scrollSound1" loop preload="auto">
            <source src="https://assets.codepen.io/7558/glitch-fx-001.mp3" type="audio/mpeg" />
        </audio>

        <audio id="scrollSound2" loop preload="auto">
            <source src="https://assets.codepen.io/7558/glitch-fx-001.mp3" type="audio/mpeg" />
        </audio>

        <audio id="scrollSound3" loop preload="auto">
            <source src="https://assets.codepen.io/7558/glitch-fx-001.mp3" type="audio/mpeg" />
        </audio>

        <audio id="hoverSound" preload="auto">
            <source src="https://assets.codepen.io/7558/preloader-2s-001.mp3" type="audio/mpeg" />
        </audio>

        <audio id="backgroundMusic" loop preload="auto">
            <source src="https://assets.codepen.io/7558/lxstnght-night-angel.mp3" type="audio/mpeg" />
        </audio>

      <div className=" grid grid-cols-4 items-center gap-8 px-8 py-4 pb-5 backdrop-blur-sm hover:bg-black/100 z-50 transition-all duration-300">
        {/* Left Side */}
        <nav id="main-nav" className="flex items-center">
          {/* <div className="logo-container">
            <div className="logo-circles">
              <div className="circle circle-1"></div>
              <div className="circle circle-2"></div>
            </div>
          </div> */}
          {/* <Image
            className="mr-4 rounded w-auto cursor-pointer"
            src="/logo5.png"
            alt="Logo"
            width={17}
            height={17}
          /> */}
          <div className="mr-2 font-mono text-xs h-auto text-zinc-400"># BRUOU012TELA2 / </div>
          <Link
            href="/about" className="relative mr-2 font-mono text-xs h-auto text-zinc-300 hover:text-white uppercase"><div className="nav-hover-square"></div>About
          </Link>
          <Link
            href="/gallery" className="relative mr-2 font-mono text-xs h-auto text-zinc-100 hover:text-white uppercase"> <div className="nav-hover-square"></div>Gallery
          </Link>
        </nav>
        <div className="flex items-center justify-end gap-4">
          {/* <Link
            href="/about"
            className={`text-sm font-medium cursor-pointer transition-all duration-200 ${isSelected("/about") ? "text-white font-bold" : "text-zinc-400 hover:text-zinc-300"}`}
          >
            ABOUT
          </Link> */}
        </div>
        <h1 className="flex items-center text-lg h-4 font-medium text-zinc-400">
          <div className=" w-full grid grid-cols-2 gap-4">
            <div className="flex items-center gap-4">
              {/* <Link
                href="/gallery"
                className={`text-sm font-medium cursor-pointer ${isSelected("/gallery") ? "text-white font-bold" : "text-zinc-400"} hover:text-zinc-300`}
              >
                GALLERY
               
              </Link> */}
            </div>
          </div>
        </h1>
        <div className="flex items-center justify-end gap-4">
          
          {/* <div className="text-sm text-zinc-400">Since 2012</div> */}
          <div className="flex items-center gap-0 text-sm text-zinc-400">
            
            {/* <button className="bg-white/10 rounded-2xl w-full px-1 py-1 text-xs border border-zinc-700 hover:border-zinc-400 text-zinc-400 hover:text-white transition-all ease-in-out duration-200 cursor-pointer">
              <Info size={16} color="#bbb" className="" />
            </button> */}
            {/* <button className="bg-white/10 rounded-2xl px-1 py-1 text-xs border border-zinc-700 hover:border-zinc-400 text-zinc-400 hover:text-white transition-all ease-in-out duration-200 cursor-pointer">
              <VolumeOff size={16} className="" />
            </button>
            <button className="bg-white/10 rounded-2xl px-1 py-1 text-xs border border-zinc-700 hover:border-zinc-400 text-zinc-400 hover:text-white transition-all ease-in-out duration-200 cursor-pointer">
              <Settings size={16} className="" />
            </button> */}
            <span className="mr-0 font-sans text-[10px] h-auto text-zinc-200 cursor-pointer">AUDIO</span>
            <span className={`ml-1 font-sans text-[10px] h-auto cursor-pointer ${audioEnabled ? "text-green-300" : "text-red-300"}`} onClick={handleAudioClick}>{audioEnabled ? "ON" : "OFF"}</span>
          </div>
        </div>
        {/* <span className="absolute right-8 text-lg font-thin text-neutral-900 float-end">
          +
        </span> */}
      </div>
      {/* NAVIGATION Content */}
      
      {/* <div className=" grid grid-cols-4 gap-8 px-8 py-8 pb-8 items-start  hover:bg-black/100 z-50 transition-all duration-300">


        <div className=" w-full col-span-2 grid grid-cols-2 gap-4 ">
          <span className="text-base font-thin text-zinc-100">
              +
          </span>
          <span className="text-6xl font-normal text-zinc-100 text-right uppercase">Female Figures</span>

        </div>
        <div className="flex gap-5">
          <div
            className="mb-0 opacity-70 hover:opacity-100 flex-1 flex-col text-sm font-medium text-zinc-400 gap-2"
          >
            <div className="text-sm text-zinc-100 uppercase mb-1.5">01 Currently playing</div>

            <div className="text-xs font-normal text-zinc-500">A navigation buttons in your header will now visually indicate which page is currently selected, based on the current pathname.</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          
          <div className="flex justify-end gap-2">
            <button className="rounded-2xl w-full px-3 py-1 text-xs border border-zinc-700 hover:border-zinc-400 text-zinc-400 hover:text-white transition-all ease-in-out duration-200 cursor-pointer">
              Close
            </button>
          </div>
          <div className="flex justify-start gap-2">
            <button className="rounded-2xl w-30 px-3 py-1 text-xs border border-zinc-700 hover:border-zinc-400 text-zinc-400 hover:text-white transition-all ease-in-out duration-200 cursor-pointer">
              Prev
            </button>
            <button className="rounded-2xl w-30 px-3 py-1 text-xs border border-zinc-700 hover:border-zinc-400 text-zinc-400 hover:text-white transition-all ease-in-out duration-200 cursor-pointer">
              Next
            </button>
          </div>
        </div>
      </div> */}
    </header>
  );
};

export default Header;
