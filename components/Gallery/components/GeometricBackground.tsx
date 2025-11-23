"use client";

export function GeometricBackground() {
  return (
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
  );
}
