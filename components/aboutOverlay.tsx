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

export default function AboutOverlay() {
  return (
    <div className="absolute top-0 w-full h-full border-y-4 border-black z-2 bg-transparent overflow-y-auto">
      <div className="flex flex-col h-full pt-[0px] justify-between bg-white">
        
        {/* NAVIGATION Content */}
       
        {/* Main Content */}
        
        <div className="grid grid-cols-2 gap-8 items-end px-8 pt-60 bg-white">
          {/* About Section */}

          <h1 className="text-[50px] text-black">
            About.
            <div className="hidden text-base leading-relaxed font-normal text-neutral-700">
              With lalalal of dedicated experience, I have been involved.
            </div>
          </h1>

          <div className="h-34 grid grid-cols-2 gap-8 items-end">
            {/* Profile Section */}
            <div className="text-sm w-[50%] font-normal text-neutral-900">
              <div>Welcome. hope you are having a nice day</div>
            </div>

            <div className="text-sm leading-relaxed font-medium text-neutral-900">
              <div>Creative</div>
              <div>Strategic</div>
              <div>Design Partner</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 mx-8 py-4 pt-20 border-b border-neutral-200">
          {/* Left Side */}
          <h1 className="text-8xl  m-0 font-medium text-neutral-900">
            BRUNO{" "}
            <span className="text-2xl font-thin text-neutral-900 float-end">
              +
            </span>
          </h1>
          <h1 className="text-8xl  m-0 font-medium text-neutral-900">
            QUINTELA{" "}
            <span className="text-2xl font-thin text-neutral-900 float-end">
              +
            </span>
          </h1>
        </div>
        {/* main image */}
        <div className="w-full h-auto px-0 py-8 bg-white">
         {/* <ImageScanEffect />  */}
          <Image
            src="/images/head.avif"
            alt="Head shot"
            className=""
            width={1920}
            height={384}
          />
        </div>
        {/* BANNER */}
        
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
                center of an egg, we believe that every brand has a core essence
                that makes it special. Innovative brand dedicated to crafting
                unique and impactful brand identities that stand out. Just like
                the rich, golden center of an egg, we believe that every brand
                has a core essence that makes it special.
              </div>
            </div>
          </div>
          {/* MORE CONTENT */}
          <div className="w-full h-auto px-8 py-4 bg-white">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Image
                src="/images/image3.avif"
                alt="Head shot"
                className="rounded-lg"
                width={1920}
                height={384}
              />
              <Image
                src="/images/image4.avif"
                alt="Head shot"
                className="rounded-lg"
                width={1920}
                height={384}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 px-8 py-8  bg-white">
            {/* Bio Section */}
            <div>
              <h2 className="text-sm font-medium mb-1 text-black">Skills</h2>
              <div className="grid grid-cols-2 gap-4 text-sm text-white pb-2.5 border-b border-zinc-200 mb-4">
                <span>Hello World</span>
                <span></span>
              </div>
              <div className="flex w-[50%] flex-col gap-2 mt-8 text-sm  text-black">
                Innovative brand dedicated to crafting unique and impactful
                brand identities that stand out. Just like the rich, golden
                center of an egg, we believe that every brand has a core essence
                that makes it special.
              </div>
            </div>

            {/* Clients Section */}
            <div>
              <div className="flex flex-col pb-32">
                <h2 className="text-sm font-medium mb-1 text-black">Stuff</h2>
                <div className="grid grid-cols-2 gap-4 text-sm text-zinc-400 pb-2.5 border-b border-zinc-200 mb-4">
                  <span>Hello World</span>
                  <span></span>
                </div>
                {clients.map((client, index) => (
                  <div
                    key={index}
                    className="group flex-row border-b border-zinc-200 py-4 relative"
                  >
                    <span className="text-zinc-400 text-lg mr-2 group-hover:text-black transition-colors duration-300">
                      0{index}.
                    </span>
                    <span className="text-black text-lg text-left">
                      {client.name}
                    </span>
                    <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-black group-hover:w-full transition-all duration-300 ease-in-out"></div>
                  </div>
                ))}
              </div>
              <div>
                <h2 className="text-sm font-medium mb-1 text-black">Clients</h2>
                <div className="grid grid-cols-2 gap-4 text-sm text-zinc-400 pb-2.5 border-b border-zinc-200 mb-4">
                  <span>Name</span>
                  <span>Num of Projects</span>
                </div>
                <div className="flex flex-col gap-2 mt-8">
                  {clients.map((client, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4 text-sm">
                      <span className="text-black">{client.name}</span>
                      <span className="text-zinc-400 text-left">
                        {client.projects}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="my-20">
                <h2 className="text-sm font-medium mb-1 text-black">Clients</h2>
                <div className="grid grid-cols-2 gap-4 text-sm text-zinc-400 pb-2.5 border-b border-zinc-200 mb-4">
                  <span>Name</span>
                  <span>Num of Projects</span>
                </div>
                <div className="flex flex-col gap-2 mt-8">
                  {clients.map((client, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4 text-sm">
                      <span className="text-black">{client.name}</span>
                      <span className="text-zinc-400 text-left">
                        {client.projects}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MORE CONTENT */}
        <div className="w-full h-auto px-8 py-4 bg-white">
          <div className="grid grid-cols-1 gap-4 rounded-lg text-sm h-48 overflow-hidden">
            <Image
              src="/images/image2.avif"
              alt="Head shot"
              className="w-full h-full object-cover object-[center_bottom]"
              width={1920}
              height={1080}
            />
          </div>
        </div>
        {/* MORE CONTENT */}
        <div className="w-full h-auto px-8 py-0 bg-white">
          <div className="flex flex-col gap-4 text-sm">
            <div>
              <h2 className="text-sm font-medium mb-1 text-black">
                the more you know
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm text-zinc-400 pb-2.5 border-b border-zinc-200 mb-4">
                <span>Hello World</span>
                <span></span>
              </div>
              <div className="flex flex-col gap-2 mt-8 text-4xl  text-black">
                Innovative brand dedicated to crafting unique and impactful
                brand identities that stand out. Just like the rich, golden
                center of an egg, we believe that every brand has a core essence
                that makes it special.
              </div>
            </div>
          </div>
        </div>
        <div className="w-full h-auto px-8 py-16 bg-white">
          <div className="grid grid-cols-1 gap-4 rounded-lg text-sm h-96 overflow-hidden">
            <Image
              src="/images/image2.avif"
              alt="Head shot"
              className=" w-full h-full object-cover object-[center_bottom]"
              width={1920}
              height={1080}
            />
          </div>
        </div>
        {/* Footer */}
        <div className="bg-black ">
          <div className="grid grid-cols-4 gap-8 px-8 py-16 bg-white border-t border-neutral-200">
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
          <div className="grid grid-cols-2 gap-8 px-8 py-4 bg-white border-t border-neutral-200">
            {/* Left Side */}
            <h1 className="text-8xl  m-0 font-medium text-neutral-900">
              B.
              <span className="text-2xl font-thin text-neutral-900 float-end">
                +
              </span>
            </h1>
            <h1 className="text-8xl m-0 font-medium text-neutral-900">
              Q.
              <span className="text-2xl font-thin text-neutral-900 float-end">
                +
              </span>
            </h1>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-8 px-8 py-4 items-center bg-black border-t border-neutral-200">
            {/* Say "Hello" Section */}
              <h3 className="block text-xs font-medium text-zinc-400">
                © 2025
              </h3>
              <div className="grid grid-cols-2 gap-8 items-center">
                <a
                    href="mailto:hello@mikeminimal.com"
                    className="text-xs text-zinc-400 hover:text-black transition-colors"
                >
                    
                </a>
                <a
                    href="mailto:hello@mikeminimal.com"
                    className="text-xs text-zinc-400 hover:text-black transition-colors"
                >
                    privacy & terms
                </a>
              </div>
              <div></div>
              <h3 className="block text-xs font-medium text-neutral-200">
                base on the design by @mikebak, coded by @bruno_quintela.
              </h3>
        </div>
      </div>
      
    </div>
  );
}
