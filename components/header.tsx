"use client";

import React, { useState, useEffect, ReactNode } from "react";
import NextLink from "next/link";
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
  const handleLogoClick = () => router.push(`/${currentLocale}`);

  // Helper to check if a link is selected
  const isSelected = (href: string) => {
    // For root links like "/about" or "/gallery", check if pathname starts with them
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="fixed top-0 w-full h-auto z-50">
      <div className=" grid grid-cols-4 items-center gap-8 px-8 py-4 pb-5 bg-black border-b border-black">
        {/* Left Side */}
        <h1 className="flex items-center text-lg h-auto font-medium text-zinc-400">
          <Image
            className="mr-4 rounded w-auto cursor-pointer"
            src="/logo5.png"
            alt="Logo"
            width={17}
            height={17}
          />
          <span className="mr-2">BRUNO QUINTELA</span>
        </h1>
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/about"
            className={`text-sm font-medium cursor-pointer transition-all duration-200 ${isSelected("/about") ? "text-white font-bold" : "text-zinc-400 hover:text-zinc-300"}`}
          >
            ABOUT
          </Link>
        </div>
        <h1 className="flex items-center text-lg h-4 font-medium text-zinc-400">
          <div className=" w-full grid grid-cols-2 gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/gallery"
                className={`text-sm font-medium cursor-pointer ${isSelected("/gallery") ? "text-white font-bold" : "text-zinc-400"} hover:text-zinc-300`}
              >
                GALLERY
                {/* <span className="text-sm text-zinc-400">[6]</span> */}
              </Link>
            </div>
          </div>
        </h1>
        <div className="flex items-center justify-end gap-4">
          
          {/* <div className="text-sm text-zinc-400">Since 2012</div> */}
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            
            {/* <button className="bg-white/10 rounded-2xl w-full px-1 py-1 text-xs border border-zinc-700 hover:border-zinc-400 text-zinc-400 hover:text-white transition-all ease-in-out duration-200 cursor-pointer">
              <Info size={16} color="#bbb" className="" />
            </button> */}
            <button className="bg-white/10 rounded-2xl px-1 py-1 text-xs border border-zinc-700 hover:border-zinc-400 text-zinc-400 hover:text-white transition-all ease-in-out duration-200 cursor-pointer">
              <VolumeOff size={16} className="" />
            </button>
            <button className="bg-white/10 rounded-2xl px-1 py-1 text-xs border border-zinc-700 hover:border-zinc-400 text-zinc-400 hover:text-white transition-all ease-in-out duration-200 cursor-pointer">
              <Settings size={16} className="" />
            </button>
          </div>
        </div>
        {/* <span className="absolute right-8 text-lg font-thin text-neutral-900 float-end">
          +
        </span> */}
      </div>
      {/* NAVIGATION Content */}
      
      <div className=" grid grid-cols-4 gap-8 px-8 py-4 pb-8 items-start  hover:bg-black/10 z-50 transition-all duration-300">
        {/* Right Side */}

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
            {/* <div className="text-sm font-normal text-zinc-400">Female Figures IV</div> */}
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
      </div>
    </header>
  );
};

export default Header;
