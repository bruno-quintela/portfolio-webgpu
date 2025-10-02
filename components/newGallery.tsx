"use client";
import "./newGallery.css";
import { useEffect } from "react";
import { startNewGallery } from "./newGalleryLogic";

const NewGallery = () => {
  useEffect(() => startNewGallery(), []);

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
      ></canvas>
      <div className="geometric-background">
        <svg className="geometric-svg" viewBox="0 0 1920 1080">
          <g id="grid-lines"></g>
          <g id="circles-outline"></g>
          <g id="circles-filled">
            <clipPath id="right-half">
              <rect x="960" y="0" width="960" height="1080" />
            </clipPath>
            <g clipPath="url(#right-half)"></g>
          </g>

          <text className="geometric-text" x="550" y="250">
            THE CREATIVE
          </text>
          <text className="geometric-text" x="550" y="265">
            PROCESS
          </text>

          <text className="geometric-text" x="1250" y="250">
            THE ESSENCE
          </text>
          <text className="geometric-text" x="1250" y="265">
            OF SOUND
          </text>

          <text className="geometric-text" x="550" y="850" id="debugLine1">
            AWARENESS: SILENCE
          </text>
          <text className="geometric-text" x="550" y="865" id="debugLine2">
            STATE: VOID
          </text>
          <text className="geometric-text" x="550" y="880" id="debugLine3">
            ENERGY: DORMANT
          </text>
          <text className="geometric-text" x="550" y="895" id="debugLine4">
            PRESENCE: SOLID
          </text>

          <text className="geometric-text" x="1250" y="850">
            BETWEEN THE
          </text>
          <text className="geometric-text" x="1250" y="865">
            HEARTBEATS
          </text>
        </svg>
      </div>

      {/* <!-- Fixed corner and center text --> */}
      {/* <aside className="corner-text corner-text-top-left" aria-hidden="true">
    <div>ANCIENT</div>
    <div>ONES</div>
    <div>COSMIC</div>
    <div>HORROR</div>
  </aside> */}

      {/* <aside className="corner-text corner-text-top-right" aria-hidden="true">
    <div>Audio</div>
    <div>Settings</div>
  </aside> */}

      {/* <aside className="corner-text corner-text-bottom-left" aria-hidden="true">
    <div>TENTACLES</div>
    <div>EMERGE</div>
    <div>ANCIENT</div>
    <div>ONES</div>
    <div>COSMIC</div>
    <div>HORROR</div>
    <div>FROM</div>
    <div>DEPTHS</div>
  </aside> */}

      {/* <aside className="corner-text corner-text-bottom-right" aria-hidden="true">
    <div>NEXT</div>
    <div>PREVIOUS</div>
  </aside> */}

      <nav
        className="corner-text corner-text-shortcuts"
        aria-label="Keyboard shortcuts"
      >
        <p>H - TOGGLE SETTINGS</p>
        <p>1 - DATAMOSH</p>
        <p>2 - PIXEL SORT</p>
        <p>3 - DIGITAL STATIC</p>
        <p>4 - STATIC SWEEP</p>
        <p>5 - GLITCH WIPE</p>
        <p>6 - ANALOG DECAY</p>
        <p>P - CYCLE PRESETS</p>
        <p>+/- INTENSITY</p>
        <p>[ ] SPEED</p>
        <p>R - RESET</p>
      </nav>

      <aside className="corner-text corner-text-center" aria-hidden="true">
        <div>R&rsquo;LYEH</div>
        <div>FHTAGN</div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div>CTHULHU</div>
        <div></div>
        <div>THE</div>
        <div>SLEEPER</div>
        <div>STIRS</div>
      </aside>

      <section className="featured-image" data-featured-image>
        <div className="featured-image-wrapper" data-featured-wrapper>
          <img
            className="featured-image"
            src="https://assets.codepen.io/7558/horror-01.jpg"
            alt="Awakening Abyss - Eldritch horror scene with cosmic entity emerging from dark abyss"
          />
        </div>
      </section>

      <header className="slide-text" data-slide-text>
        <div className="slide-title" data-slide-title>
          <h1>Awakening Abyss</h1>
        </div>
        <div className="slide-description" data-slide-description>
          <p>Eldritch Emergence</p>
        </div>
        <div className="slide-number text-zinc-400" data-slide-number>
          <span>02:04:2025</span>
        </div>
      </header>

      <div className="slide-paragraph" data-slide-paragraph>
        <div className="slide-paragraph-line" data-paragraph-line-1>
          <span>Archived VHS documentary footage captures the moment</span>
        </div>
        <div className="slide-paragraph-line" data-paragraph-line-2>
          <span>an ancient cosmic entity ruptures frozen silence.</span>
        </div>
      </div>
    </main>
  );
};

export default NewGallery;
