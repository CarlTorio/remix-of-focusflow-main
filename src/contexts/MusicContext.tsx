import { createContext, useContext, useRef, useState, useCallback, useEffect, type ReactNode } from "react";

interface MusicContextValue {
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  toggle: () => void;
}

const MusicContext = createContext<MusicContextValue | null>(null);

const MUSIC_STORAGE_KEY = "nexday_custom_music_url";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const DEFAULT_MUSIC_URL =
  `${SUPABASE_URL}/storage/v1/object/public/nexday/NLPSound2.mp3`;

function getMusicUrl() {
  return localStorage.getItem(MUSIC_STORAGE_KEY) || DEFAULT_MUSIC_URL;
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const syncState = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      setProgress((audio.currentTime / audio.duration) * 100);
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration);
    }
  }, []);

  const toggle = useCallback(() => {
    if (!audioRef.current) {
      const audio = document.createElement("audio");
      audio.loop = true;
      audio.volume = 0.5;
      audio.preload = "auto";
      audio.src = getMusicUrl();
      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setProgress(0);
      });
      audio.addEventListener("error", () => {
        console.error("Audio error:", audio.error?.message);
        setIsPlaying(false);
      });
      audioRef.current = audio;
    }

    const audio = audioRef.current;

    if (isPlaying) {
      audio.pause();
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsPlaying(false);
    } else {
      const expectedUrl = getMusicUrl();
      if (!audio.src || audio.src !== expectedUrl) {
        audio.src = expectedUrl;
        audio.load();
      }
      audio.volume = 0.5;
      audio.muted = false;
      audio.play().then(() => {
        setIsPlaying(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(syncState, 500);
      }).catch((err) => {
        console.error("Audio play failed:", err?.message || err);
        setIsPlaying(false);
      });
    }
  }, [isPlaying, syncState]);

  // Listen for music source changes (from settings upload)
  useEffect(() => {
    const handleSourceChange = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        if (intervalRef.current) clearInterval(intervalRef.current);
        audioRef.current = null;
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        setDuration(0);
      }
    };
    window.addEventListener("music-source-changed", handleSourceChange);
    return () => window.removeEventListener("music-source-changed", handleSourceChange);
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <MusicContext.Provider value={{ isPlaying, progress, currentTime, duration, toggle }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used within MusicProvider");
  return ctx;
}
