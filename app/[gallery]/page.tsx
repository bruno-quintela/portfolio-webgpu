import { redirect } from "next/navigation";
import GalleryOverlay from "@/components/galleryOverlay";
//import { Gallery2 } from "@/components/gallery";
import { GalleryInfinite3 } from "@/components/galleryInfinite3";

export default function Page() {
  return (
    <div className="flex mt-10 text-black-400 bg-black flex-col w-full h-svh align-center justify-center items-center overflow-hidden">
      <GalleryInfinite3 />
      {/* <GalleryOverlay /> */}
    </div>
  );
}
