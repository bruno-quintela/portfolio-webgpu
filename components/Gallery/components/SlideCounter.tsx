"use client";

export function SlideCounter() {
  return (
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
  );
}
