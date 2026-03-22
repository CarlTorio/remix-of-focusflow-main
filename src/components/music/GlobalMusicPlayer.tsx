import { Music, Pause } from "lucide-react";
import { useMusic } from "@/contexts/MusicContext";
import { cn } from "@/lib/utils";

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export function GlobalMusicPlayer() {
  const { isPlaying, progress, currentTime, toggle } = useMusic();

  if (!isPlaying) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 md:bottom-6 md:left-auto md:right-20 z-40">
      <div className="flex items-center gap-2.5 rounded-full bg-card/95 backdrop-blur-sm border border-border px-3 py-2 shadow-lg">
        <button
          onClick={toggle}
          className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground shrink-0 transition-transform hover:scale-105 active:scale-95"
        >
          <Pause className="h-3.5 w-3.5" />
        </button>
        <span className="text-sm font-mono font-semibold text-foreground tabular-nums shrink-0">
          {formatTime(currentTime)}
        </span>
        <div className="h-1.5 flex-1 min-w-0 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground shrink-0">🧠</span>
      </div>
    </div>
  );
}
