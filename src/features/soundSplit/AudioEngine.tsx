import { useEffect, useRef } from "react";
import type { SceneData } from "./types";

interface AudioEngineProps {
  scenes: SceneData[];
  activeElements: string[];
}

const AudioEngine: React.FC<AudioEngineProps> = ({
  scenes,
  activeElements,
}) => {
  const sfxMapRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  useEffect(() => {
    const sfxByElement = new Map<string, string>();
    scenes.forEach((scene) => {
      scene.elements.forEach((element) => {
        sfxByElement.set(element.id, element.sfxUrl);
      });
    });

    const activeSet = new Set(activeElements);

    activeSet.forEach((elementId) => {
      if (sfxMapRef.current.has(elementId)) {
        return;
      }

      const sfxUrl = sfxByElement.get(elementId);
      if (!sfxUrl) {
        return;
      }

      const audio = new Audio(sfxUrl);
      audio.loop = true;
      audio.volume = 0.3;
      void audio.play().catch((error) => {
        console.error("SFX playback blocked", error);
      });

      sfxMapRef.current.set(elementId, audio);
    });

    Array.from(sfxMapRef.current.entries()).forEach(([elementId, audio]) => {
      if (activeSet.has(elementId)) {
        return;
      }

      audio.pause();
      audio.currentTime = 0;
      sfxMapRef.current.delete(elementId);
    });
  }, [activeElements, scenes]);

  useEffect(() => {
    return () => {
      sfxMapRef.current.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
      sfxMapRef.current.clear();
    };
  }, []);

  return null;
};

export default AudioEngine;
