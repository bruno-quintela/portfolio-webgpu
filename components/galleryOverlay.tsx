"use client";

import React from "react";
import Image from "next/image";
//import ImageScanEffect from "../ImageScanEffect/ImageScanEffect";

interface Client {
  name: string;
  projects: number;
}

const clients: Client[] = [
  { name: "Exxon Mobil Corporation", projects: 15 },
  { name: "whooo hoop.", projects: 9 },
  { name: "Home Depot, Inc.", projects: 19 },

  // Add more clients as needed
];

export default function GalleryOverlay() {
  return (
    <div className="absolute top-0 w-full h-full pointer-events-auto border-y-4 border-black z-2 bg-transparent overflow-y-auto">
      <div className="flex flex-col h-full justify-between bg-transparent">
        
        {/* NAVIGATION Content */}
       
        {/* Main Content */}
        <div className="grid grid-cols-2  pt-[100px] gap-8 items-center px-8 bg-white rounded-b-2xl">
          {/* About Section */}

          <h1 className="text-[50px] text-black">
            Gallery.
            <div className="hidden text-base leading-relaxed font-normal text-neutral-700">
              With lalalal of dedicated experience, I have been involved.
            </div>
          </h1>

          <div className="h-20 grid grid-cols-2 gap-8 items-center">
            {/* Profile Section */}
            <div className="text-sm w-[100%] font-normal text-neutral-900">
              <div>A collection of realtime experiments</div>
            </div>

            <div className="text-sm leading-relaxed font-medium text-zinc-400">
              <div>updated 01.06.2025</div>
            </div>
          </div>
        </div>
        {/* CHILDREN */}
        <div className="flex w-full h-[900px] shrink-0 px-0 py-0 bg-transparent">
        
        </div>
        
        {/*  Content */}
        <div>
          <div className="grid grid-cols-2 gap-8 px-8 py-8 pb-0 bg-white">
            {/* Bio Section */}
            <div>
              <h2 className="text-sm font-medium mt-0 text-black">Bio.</h2>
            </div>

            {/* Clients Section */}
            <div>
              <div className="flex flex-col gap-2 mt-0 text-base  text-zinc-700">
                Innovative brand dedicated to crafting unique and impactful
                brand identities that stand out. Just like the rich, golden
                the rich, golden center of an egg, we believe that every brand
                has a core essence that makes it special.
              </div>
            </div>
          </div>
          
        </div>
        {/* MORE CONTENT */}
        
        
        <div className="w-full h-auto px-8 py-8 bg-white">
          
        </div>
   
        {/* Footer */}
        <div className="bg-white px-8">
          <div className="grid grid-cols-4 gap-8 py-16 bg-white border-t border-neutral-200">
            {/* Say "Hello" Section */}
            <div>
              <h3 className="text-sm font-medium mb-4 text-neutral-900">
                Say "Hello":
              </h3>
              <a
                href="mailto:hello@mikeminimal.com"
                className="text-sm text-zinc-400 hover:text-black transition-colors"
              >
                hello@mikeminimal.com
              </a>
            </div>

            {/* Navigate Section */}
            <div>
              <h3 className="text-sm font-medium mb-4 text-neutral-900">
                Navigate:
              </h3>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-sm text-black">
                  HOME
                </a>
                <a
                  href="#"
                  className="text-sm text-zinc-400 hover:text-black transition-colors"
                >
                  PROJECTS
                </a>
                <a
                  href="#"
                  className="text-sm text-zinc-400 hover:text-black transition-colors"
                >
                  ABOUT
                </a>
                <a
                  href="#"
                  className="text-sm text-zinc-400 hover:text-black transition-colors"
                >
                  START A PROJECT
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-0 text-2xl  text-black">
              Innovative brand dedicated to crafting unique and impactful brand
              identities it special.
            </div>
            {/* Connect Section */}
            <div>
              <h3 className="text-sm font-medium mb-4 text-neutral-900">
                Connect:
              </h3>
              <div className="flex gap-5">
                <a
                  href="#"
                  className="text-sm text-zinc-400 hover:text-black transition-colors"
                >
                  Behance ↗
                </a>
                <a
                  href="#"
                  className="text-sm text-zinc-400 hover:text-black transition-colors"
                >
                  LinkedIn ↗
                </a>
                <a
                  href="#"
                  className="text-sm text-zinc-400 hover:text-black transition-colors"
                >
                  Twitter ↗
                </a>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 py-4 bg-white border-t border-neutral-200">
            {/* Left Side */}
            <h1 className="text-8xl  m-0 font-medium text-neutral-900">
              BRUNO
              <span className="text-2xl font-thin text-neutral-900 float-end">
                +
              </span>
            </h1>
            <h1 className="text-8xl m-0 font-medium text-neutral-900">
              QUINTELA
              <span className="text-2xl font-thin text-neutral-900 float-end">
                +
              </span>
            </h1>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-8 px-8 py-4 items-center bg-white border-t border-neutral-200">
            
        </div>
      </div>
      
    </div>
  );
}
