import { useEffect, useRef } from "react";
import type { SceneData } from "./types";

interface AudioEngineProps {
  scenes: SceneData[];
  activeElements: string[];
}

interface ToneHandle {
  oscillator: OscillatorNode;
  gain: GainNode;
}

const AudioEngine: React.FC<AudioEngineProps> = ({
  scenes,
  activeElements,
}) => {
  const contextRef = useRef<AudioContext | null>(null);
  const sfxMapRef = useRef<Map<string, ToneHandle>>(new Map());

  useEffect(() => {
    const shouldStartAudio = activeElements.length > 0;

    if (!shouldStartAudio) {
      return;
    }

    if (!contextRef.current) {
      contextRef.current = new AudioContext();
    }

    if (contextRef.current.state === "suspended") {
      void contextRef.current.resume();
    }
  }, [activeElements.length]);

  useEffect(() => {
    const context = contextRef.current;
    if (!context) {
      return;
    }

    const frequencyByElement = new Map<string, number>();
    scenes.forEach((scene) => {
      scene.elements.forEach((element) => {
        frequencyByElement.set(element.id, element.sfxFrequency);
      });
    });

    const activeSet = new Set(activeElements);

    activeSet.forEach((elementId) => {
      if (sfxMapRef.current.has(elementId)) {
        return;
      }

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.value = frequencyByElement.get(elementId) ?? 440;
      gain.gain.value = 0.06;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      sfxMapRef.current.set(elementId, { oscillator, gain });
    });

    Array.from(sfxMapRef.current.entries()).forEach(([elementId, tone]) => {
      if (activeSet.has(elementId)) {
        return;
      }

      tone.gain.gain.setTargetAtTime(0, context.currentTime, 0.02);
      window.setTimeout(() => {
        tone.oscillator.stop();
        tone.oscillator.disconnect();
        tone.gain.disconnect();
      }, 80);
      sfxMapRef.current.delete(elementId);
    });
  }, [activeElements, scenes]);

  useEffect(() => {
    return () => {
      sfxMapRef.current.forEach((tone) => {
        tone.oscillator.stop();
        tone.oscillator.disconnect();
        tone.gain.disconnect();
      });
      sfxMapRef.current.clear();
      if (contextRef.current) {
        void contextRef.current.close();
        contextRef.current = null;
      }
    };
  }, []);

  return null;
};

export default AudioEngine;
