"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Settings, Info, VolumeOff } from 'lucide-react';
import { useRouter, usePathname } from "next/navigation";

const Footer: React.FC = () => {


  return (
    <footer className="fixed bottom-0 w-full h-auto bg-black/0 backdrop-blur-sm  hover:bg-black/100 z-50 transition-all duration-300">
      
      {/* NAVIGATION Content */}
      
      <div className="grid grid-cols-4 gap-8 px-8 py-4 items-center">
        {/* Right Side */}
        <div className="flex justify-start gap-5">
          <a
            href="#"
            className="text-sm text-zinc-400 hover:text-black transition-colors"
          >
            <div className="flex items-center gap-1 text-zinc-400">
              {/* <button className="bg-black/90 rounded-2xl px-1 py-1 text-xs border border-zinc-600 hover:border-zinc-400 text-zinc-400 hover:text-neutral-700 transition-all ease-in-out duration-200 cursor-pointer">
                <Info size={16} color="#777" className=""/>
              </button>
              <button className="bg-black/90 rounded-2xl px-1 py-1 text-xs border border-zinc-600 hover:border-zinc-400 text-zinc-400 hover:text-neutral-700 transition-all ease-in-out duration-200 cursor-pointer">
                <VolumeOff size={16} color="#777" className=""/>
              </button>
              <button className="bg-black/90 rounded-2xl px-1 py-1 text-xs border border-zinc-600 hover:border-zinc-400 text-zinc-400 hover:text-neutral-700 transition-all ease-in-out duration-200 cursor-pointer">
                <Settings size={16} color="#777" className=""/>
              </button> */}
              {/* <button className="bg-black/0 rounded-2xl px-1 py-1 text-xs border-zinc-100 hover:border-zinc-400 text-zinc-400 hover:text-neutral-700 transition-all ease-in-out duration-200 cursor-pointer">
                <Settings size={12} color="#aaa" className=""/>
              </button> */}
              
              <span className="ml-0 text-[10px] settings-link">SETTINGS</span>  
            </div>
          </a>
        </div>
        <div className=" w-full gap-4 text-right">
          
        </div>
        <div className=" w-full gap-4 text-right">
          {/* <div
            className="justify-start text-sm font-medium text-zinc-300 flex gap-2"
          >
            01
            
          </div> */}
        </div>
        <div className=" w-full gap-4 text-right">
          <div
            className="justify-end font-sans text-[10px] text-zinc-400 uppercase flex gap-2"
          >
            scroll & drag to navigate
            {/* <span className="font-normal text-zinc-400">Female Figures IV</span> */}
          </div>
        </div>
        
        
      </div>
    </footer>
  );
};

export default Footer;
