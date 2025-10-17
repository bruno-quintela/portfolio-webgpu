"use client";
import "./newGallery.css";
import { useEffect } from "react";
import { startNewGallery } from "./newGalleryLogic";

const NewGallery = () => {
  const slideData = [
    {
      url: "https://assets.codepen.io/7558/horror-01.jpg",
      title: "Awakening Abyss",
      description: "#Eldritch #Emergence",
      number: "13:04:2025",
      paragraphLines: [
        "Archived VHS documentary footage captures the moment",
        "an ancient cosmic entity ruptures frozen silence.",
      ],
      prompt:
        "Extreme footage of icy Cthulhu-like horror rising out of a shattering ice sinkhole. VHS dystopian documentary style, eerie retro science fiction, dark future photography fused with 3D Zdzislaw Beksinski surrealism. Downward vertigo angle, madness, haunted atmosphere, static, glitches, and digital noise. Saturated, vibrant colors with cold blue highlights and fractured light.",
      caption: "Eldritch emergence in cracked ice",
      slides: [
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-01.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-02.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-03.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-04.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-05.jpg'
        }
      ]
    },
    {
        url: "https://assets.codepen.io/7558/horror-02.jpg",
      title: "Fractured Signal",
      description: "#Glitch #Documentary",
      number: "04:04:2025",
      paragraphLines: [
        "The broadcast distorts as forbidden knowledge leaks",
        "through corrupted frames and spectral interference.",
      ],
      prompt:
        "Glitch-heavy VHS transmission of a forbidden signal, blending cosmic horror iconography with retro-futuristic decay. Strange symbols bleeding through static, warped depths suggesting an otherworldly intelligence. Heavy digital noise, color aberrations, and surreal background shapes borrowing from Beksinski's dreamlike textures. Sense of paranoia and collapsing reality.",
      caption: "Corrupted broadcast of the unknown",
      slides: [
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-01.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-02.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-03.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-04.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-05.jpg'
        }
      ]
    },
    {
        url: "https://assets.codepen.io/7558/horror-03.jpg",
      title: "Echoes of the Deep",
      description: "#Haunted #Vision",
      number: "03:04:2025",
      paragraphLines: [
        "Submerged memories resurface in spectral echoes,",
        "reminding viewers that the abyss remembers.",
      ],
      prompt:
        "Eerie underwater surrealism showing the slow emergence of a drowned cosmic entity, lit by dying neon and flickering VHS artifacts. Documentary-style overlay with timestamps, phantom reflections, and faint, impossible geometry. Atmospheric fog, subtle demonic undertones, and a sense that the depths are watching back.",
      caption: "Submerged cosmic remembrance",
      slides: [
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-01.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-02.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-03.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-04.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-05.jpg'
        }
      ]
    },
    {
        url: "https://assets.codepen.io/7558/horror-04.jpg",
      title: "Glitching Sanctum",
      description: "#Digital #Cultifacts",
      number: "05:04:2025",
      paragraphLines: [
        "A sacred data temple collapses into noise,",
        "its ritual code leaking forbidden patterns.",
      ],
      prompt:
        "Dark future interior of a collapsing digital shrine, where eldritch runes are rendered as corrupted code. Mixed media: 3D Beksinski-inspired architecture dissolving into pixel shards, VHS tracking errors tearing the scene, and occult imagery flickering in neon. Vertigo-inducing perspective, heavy contrast between shadow and glitch-lit form.",
      caption: "Ritual code corruption",
      slides: [
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-01.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-02.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-03.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-04.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-05.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-03.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-04.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-05.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-03.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-04.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-05.jpg'
        }
      ]
    },
    {
      url: "https://assets.codepen.io/7558/horror-05.jpg",
      title: "Frozen Leviathan",
      description: "#Apocalyptic #Witness",
      number: "09:04:2025",
      paragraphLines: [
        "The last frame holds the frozen titan—half-buried,",
        "its silence a prophecy of an unraveling world.",
      ],
      prompt:
        "Dystopian aftermath shot of a gigantic eldritch leviathan encased in fractured ice, seen through a damaged documentary lens. Grainy VHS overlay, color bleeding, and subtle animation glitches hinting at latent motion. Sky warped with surreal auroras; the scene balances frozen stillness with impending doom.",
      caption: "Stilled titanic omen",
      slides: [
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-01.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-02.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-03.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-03.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-04.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-05.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-04.jpg'
        },
        {
          title: '01',
          url: 'https://assets.codepen.io/7558/horror-05.jpg'
        }
      ]
    },
  ];
  useEffect(() => startNewGallery(slideData), []);

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
          slideData.map((slide, index) => <div key={index}>{slide.title}</div>)
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
        {slideData.map((slide, index) => (
          <div key={index} className={`slide ${index === 0 ? 'slide--current' : ''}`}>
            <div
              className="slide__img"
              style={{ backgroundImage: `url(${slide.url})`,
                
               }}
            ></div>
            <div className="slide-images-container">
              {slide.slides?.map((image, index)=>
                (
                  <div
                    key={index}
                    className="slide-image"
                    style={{ backgroundImage: `url(${image.url})`}}
                  ></div>
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
