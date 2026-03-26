import { useEffect, useState } from "react";
import "./storyIntro.css";

interface Props {
  onComplete?: () => void;
}

export default function StoryIntro({ onComplete }: Props) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 2200),
      setTimeout(() => setPhase(3), 3400),
      setTimeout(() => setPhase(4), 3900),
      setTimeout(() => setPhase(5), 5200),
      setTimeout(() => {
        onComplete?.(); // ← important
      }, 7000),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="story-container">
      <div className="animation-area">
        {phase < 3 && (
          <div className={`dots-wrapper ${phase >= 2 ? "merge" : "pulse"}`}>
            <div className="dot dot-left" />
            <div className="dot dot-center" />
            <div className="dot dot-right" />
          </div>
        )}

        {phase >= 3 && (
          <div className="circle-wrapper">
            <div className="ring ring-1" />
            <div className="ring ring-2" />
            <div className="center-dot" />
          </div>
        )}
      </div>

      <div className="text">
        <h1 className={`fade ${phase >= 4 ? "visible" : ""}`}>
          Your story is taking shape…
        </h1>
        <h2 className={`fade ${phase >= 5 ? "visible" : ""}`}>
          Listen closely.
        </h2>
      </div>
    </div>
  );
}