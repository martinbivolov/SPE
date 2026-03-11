import { useEffect, useRef } from "react";
import type { SceneData } from "./types";

interface AudioEngineProps {
  scenes: SceneData[];
  activeElements: string[];
  isAudioAEnabled: boolean;
  isAudioBEnabled: boolean;
}

interface ToneHandle {
  oscillator: OscillatorNode;
  gain: GainNode;
}

const AudioEngine: React.FC<AudioEngineProps> = ({
  scenes,
  activeElements,
  isAudioAEnabled,
  isAudioBEnabled,
}) => {
  const contextRef = useRef<AudioContext | null>(null);
  const bgARef = useRef<ToneHandle | null>(null);
  const bgBRef = useRef<ToneHandle | null>(null);
  const sfxMapRef = useRef<Map<string, ToneHandle>>(new Map());

  useEffect(() => {
    const shouldStartAudio = isAudioAEnabled || isAudioBEnabled || activeElements.length > 0;

    if (!shouldStartAudio) {
      return;
    }

    if (!contextRef.current) {
      contextRef.current = new AudioContext();
    }

    if (contextRef.current.state === "suspended") {
      void contextRef.current.resume();
    }
  }, [isAudioAEnabled, isAudioBEnabled, activeElements.length]);

  useEffect(() => {
    const context = contextRef.current;
    if (!context) {
      return;
    }

    const buildBackgroundTone = (frequency: number): ToneHandle => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.value = 0;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      return { oscillator, gain };
    };

    const sceneA = scenes.find((scene) => scene.side === "A");
    const sceneB = scenes.find((scene) => scene.side === "B");

    if (sceneA && !bgARef.current) {
      bgARef.current = buildBackgroundTone(sceneA.audioFrequency);
    }

    if (sceneB && !bgBRef.current) {
      bgBRef.current = buildBackgroundTone(sceneB.audioFrequency);
    }

    if (bgARef.current) {
      bgARef.current.gain.gain.setTargetAtTime(isAudioAEnabled ? 0.035 : 0, context.currentTime, 0.03);
    }

    if (bgBRef.current) {
      bgBRef.current.gain.gain.setTargetAtTime(isAudioBEnabled ? 0.035 : 0, context.currentTime, 0.03);
    }
  }, [isAudioAEnabled, isAudioBEnabled, scenes]);

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

      [bgARef.current, bgBRef.current].forEach((tone) => {
        if (!tone) {
          return;
        }

        tone.oscillator.stop();
        tone.oscillator.disconnect();
        tone.gain.disconnect();
      });

      bgARef.current = null;
      bgBRef.current = null;

      if (contextRef.current) {
        void contextRef.current.close();
        contextRef.current = null;
      }
    };
  }, []);

  return null;
};

export default AudioEngine;
