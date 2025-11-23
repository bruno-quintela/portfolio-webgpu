"use client";
import { GalleryData } from "../context/GalleryContext";

interface VerticalTitleProps {
  galleryData: GalleryData[];
}

export function VerticalTitle({ galleryData }: VerticalTitleProps) {
  return (
    <aside id="verticalTitle" className="corner-text corner-text-center" aria-hidden="true">
      {galleryData.map((gallery, index) => (
        <div key={index}>{gallery.title}</div>
      ))}
    </aside>
  );
}
