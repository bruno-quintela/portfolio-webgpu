"use client";
import { memo, useMemo } from "react";
import "./newGallery.css";
import { useGallery } from "./hooks/useGallery";
import { GalleryProvider, useGalleryContext } from "./context/GalleryContext";
import galleryData from "@/data/galleryData.json";

// Types
interface Gallery {
  title: string;
  cover: string;
  slides?: Array<{ url: string; [key: string]: any }>;
  [key: string]: any;
}

interface CornerTextProps {
  children: React.ReactNode;
  className: string;
  ariaLabel?: string;
  ariaHidden?: boolean;
}

interface SlideProps {
  gallery: Gallery;
  index: number;
  isActive: boolean;
}

interface GeometricTextBlockProps {
  x: string;
  y: string;
  lines: string[];
}

// Extracted Components
const CornerText = memo(({ children, className, ariaLabel, ariaHidden = false }: CornerTextProps) => (
  <aside 
    className={`corner-text ${className}`}
    aria-label={ariaLabel}
    aria-hidden={ariaHidden}
  >
    {children}
  </aside>
));
CornerText.displayName = "CornerText";

const GeometricTextBlock = memo(({ x, y, lines }: GeometricTextBlockProps) => (
  <>
    {lines.map((line, index) => (
      <text
        key={`${x}-${y}-${index}`}
        className="geometric-text"
        x={x}
        y={String(Number(y) + index * 15)}
      >
        {line}
      </text>
    ))}
  </>
));
GeometricTextBlock.displayName = "GeometricTextBlock";

const DebugInfo = memo(() => (
  <CornerText className="corner-text-bottom-left" ariaHidden>
    <div id="debugLine1">FPS: 120</div>
    <div id="debugLine2">Draw calls: 4/sec</div>
    <div id="debugLine3">Polygons: 98200</div>
    <div id="debugLine7">PERFORMANCE:GOOD</div>
  </CornerText>
));
DebugInfo.displayName = "DebugInfo";

const SlideCounter = memo(({ totalSlides }: { totalSlides: number }) => (
  <CornerText className="corner-text-top-right slide-counter">
    <div className="counter-container counter-date">
      <div className="counter-strip" data-slide-counter>
        <span>01:12:1232</span>
      </div>
    </div>
    <div className="counter-separator"></div>
    <div className="counter-container counter-number">
      <div className="counter-strip" data-slide-number>
        <span>02</span>
      </div>
    </div>
    <div className="counter-total ml-1">&nbsp;/&nbsp;{String(totalSlides).padStart(2, '0')}</div>
  </CornerText>
));
SlideCounter.displayName = "SlideCounter";

const KeyboardShortcuts = memo(() => {
  const shortcuts = useMemo(() => [
    { key: 'H', action: 'TOGGLE SETTINGS' },
    { key: '1', action: 'DATAMOSH' },
    { key: '2', action: 'PIXEL SORT' },
    { key: '3', action: 'DIGITAL STATIC' },
    { key: '4', action: 'STATIC SWEEP' },
    { key: '5', action: 'GLITCH WIPE' },
    { key: '6', action: 'ANALOG DECAY' },
  ], []);

  return (
    <nav className="corner-text corner-text-shortcuts" aria-label="Keyboard shortcuts">
      {shortcuts.map(({ key, action }) => (
        <p key={key}>{key} - {action}</p>
      ))}
    </nav>
  );
});
KeyboardShortcuts.displayName = "KeyboardShortcuts";

const GeometricBackground = memo(() => {
  const textBlocks = useMemo(() => [
    { x: "550", y: "250", lines: ["THE CREATIVE", "PROCESS"] },
    { x: "1250", y: "250", lines: ["THE ESSENCE", "OF SOUND"] },
    { x: "550", y: "850", lines: ["AWARENESS: SILENCE", "STATE: VOID"] },
    { x: "1250", y: "850", lines: ["BETWEEN THE", "HEARTBEATS"] },
  ], []);

  return (
    <div className="geometric-background">
      <svg className="geometric-svg" viewBox="0 0 1920 1080">
        <g id="grid-lines"></g>
        {textBlocks.map((block, index) => (
          <GeometricTextBlock key={index} {...block} />
        ))}
      </svg>
    </div>
  );
});
GeometricBackground.displayName = "GeometricBackground";

const Slide = memo(({ gallery, index, isActive }: SlideProps) => (
  <div className={`slide ${isActive ? 'slide--current' : ''}`}>
    <div
      className="slide__img"
      style={{ backgroundImage: `url(${gallery.cover})` }}
      role="img"
      aria-label={gallery.title}
    />
    <div className="slide-images-container">
      {gallery.slides?.map((slide, slideIndex) => (
        <div
          key={slideIndex}
          className={`slide-image ${slideIndex === 0 ? 'selected' : ''}`}
          style={{ backgroundImage: `url(${slide.url})` }}
          role="img"
          aria-label={`Slide ${slideIndex + 1}`}
        >
          <div className="slide-details-container">View</div>
        </div>
      ))}
    </div>
  </div>
));
Slide.displayName = "Slide";

const SlideText = memo(() => (
  <header className="slide-text" data-slide-text>
    <div className="slide-title" data-slide-title>
      <h1>Awakening Abyss</h1>
    </div>
    <div className="slide-description" data-slide-description>
      <p>Eldritch Emergence</p>
    </div>
  </header>
));
SlideText.displayName = "SlideText";

const SlideParagraph = memo(() => (
  <div className="slide-paragraph" data-slide-paragraph>
    <div className="slide-paragraph-line" data-paragraph-line-1>
      <span>Archived VHS documentary footage captures the moment</span>
    </div>
    <div className="slide-paragraph-line" data-paragraph-line-2>
      <span>an ancient cosmic entity ruptures frozen silence.</span>
    </div>
  </div>
));
SlideParagraph.displayName = "SlideParagraph";

const VerticalTitles = memo(({ galleries }: { galleries: Gallery[] }) => (
  <CornerText className="corner-text-center" ariaHidden>
    {galleries.map((gallery, index) => (
      <div key={index}>{gallery.title}</div>
    ))}
  </CornerText>
));
VerticalTitles.displayName = "VerticalTitles";

// Main Component (Internal)
const GalleryContent = () => {
  // Memoize gallery data to prevent unnecessary re-renders
  const galleries = useMemo(() => galleryData as Gallery[], []);
  
  // Get context registration functions
  const { registerStateGetter, registerActions } = useGalleryContext();
  
  // Initialize gallery with custom hook
  useGallery({
    galleryData: galleries,
    onRegisterState: registerStateGetter,
    onRegisterActions: registerActions,
  });

  return (
    <main
      className="image-slider"
      role="region"
      aria-label="Image carousel"
      data-image-slider-init
    >
      <canvas
        className="webgl-canvas"
        data-webgl-canvas
        aria-hidden="true"
      />

      <GeometricBackground />
      <DebugInfo />
      <SlideCounter totalSlides={galleries.length} />
      <KeyboardShortcuts />
      <VerticalTitles galleries={galleries} />

      <section className="slides" data-featured-image>
        {galleries.map((gallery, index) => (
          <Slide
            key={gallery.cover}
            gallery={gallery}
            index={index}
            isActive={index === 0}
          />
        ))}
      </section>

      <SlideText />
      <SlideParagraph />
    </main>
  );
};
GalleryContent.displayName = "GalleryContent";

// Main Component (Wrapper with Provider)
const NewGallery = () => {
  return (
    <GalleryProvider>
      <GalleryContent />
    </GalleryProvider>
  );
};

export default NewGallery;