import React, { createContext, useContext, useState, useCallback } from 'react';

interface VolumeContextValue {
  /** 0–1 normalized volume */
  volume: number;
  /** Set volume (0–1) */
  setVolume: (v: number) => void;
}

const VolumeContext = createContext<VolumeContextValue>({
  volume: 0.5,
  setVolume: () => {},
});

const STORAGE_KEY = 'spe-global-volume';

function readStoredVolume(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = Number(raw);
      if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 1) return parsed;
    }
  } catch {
    // localStorage may be unavailable
  }
  return 0.5;
}

export const VolumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [volume, setVolumeState] = useState(readStoredVolume);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    try {
      localStorage.setItem(STORAGE_KEY, String(clamped));
    } catch {
      // ignore
    }
  }, []);

  return (
    <VolumeContext.Provider value={{ volume, setVolume }}>
      {children}
    </VolumeContext.Provider>
  );
};

export const useVolume = () => useContext(VolumeContext);
