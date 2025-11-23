"use client";

export function DebugInfo() {
  return (
    <aside className="corner-text corner-text-bottom-left" aria-hidden="true">
      <div id="debugLine1">FPS: 120</div>
      <div id="debugLine2">Draw calls: 4/sec</div>
      <div id="debugLine3">Polygons: 98200</div>
      <div className="" id="debugLine7">
        PERFORMANCE:GOOD
      </div>
    </aside>
  );
}
