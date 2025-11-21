"use client";
import "./newGallery.css";
import { useEffect } from "react";
import { startNewGallery } from "./newGalleryLogic";
import galleryData from "@/data/galleryData.json";

const NewGallery = () => {

  useEffect(() => startNewGallery(galleryData), []);

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

          <text className="geometric-text" x="550" y="850">
            AWARENESS: SILENCE
          </text>
          <text className="geometric-text" x="550" y="865">
            STATE: VOID
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

      <aside className="corner-text corner-text-bottom-left" aria-hidden="true">
        {/* <div className="" id="debugLine5">
          STATE: VOID
        </div>
        <div className="" id="debugLine6">
          ENERGY: DORMANT
        </div> */}

        <div id="debugLine1">FPS: 120</div>
        <div id="debugLine2">Draw calls: 4/sec</div>
        <div id="debugLine3">Polygons: 98200</div>
        <div className="" id="debugLine7">
          PERFORMANCE:GOOD
        </div>
      </aside>

      <aside className="corner-text corner-text-top-right slide-counter">
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

        <div className="counter-total ml-1">&nbsp;/&nbsp;05</div>
      </aside>

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
      </nav>

      <aside id="verticalTitle" className="corner-text corner-text-center" aria-hidden="true">
        {
          galleryData.map((gallery, index) => <div key={index}>{gallery.title}</div>)
        }
        {/* <div>R&rsquo;LYEH</div>
        <div>FHTAGN</div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div>CTHULHU</div>
        <div></div>
        <div>THE</div>
        <div>SLEEPER</div>
        <div>STIRS</div> */}
      </aside>

      <section className="slides" data-featured-image>
        {galleryData.map((gallery, index) => (
          <div key={index} className={`slide ${index === 0 ? 'slide--current' : ''}`}>
            <div
              className="slide__img"
              style={{ backgroundImage: `url(${gallery.cover})`,
                
               }}
            ></div>
            <div className="slide-images-container">
              {gallery.slides?.map((slide, index)=>
                (
                  <div
                    key={index}
                    className={`slide-image ${index === 0 ? 'selected' : ''}`}
                    style={{ backgroundImage: `url(${slide.url})`}}
                  >
                    <div className="slide-details-container">View</div>
                  </div>
                ))}

            </div>
          </div>
        ))}
        {/* <div className="featured-image-wrapper" data-featured-wrapper>
          <img
            className="featured-image"
            src="https://assets.codepen.io/7558/horror-01.jpg"
            alt="Awakening Abyss - Eldritch horror scene with cosmic entity emerging from dark abyss"
          />
        </div> */}
      </section>

      <header className="slide-text" data-slide-text>
        <div className="slide-title" data-slide-title>
          <h1>Awakening Abyss</h1>
        </div>
        <div className="slide-description" data-slide-description>
          <p>Eldritch Emergence</p>
        </div>
        {/* <div className="slide-number text-zinc-400" data-slide-number>
          <span>02:04:2025</span>
        </div> */}
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