import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Coffee, X } from "lucide-react";
import { playAlarmSound, stopAlarmSound } from "@/lib/alarmSounds";
import { cn } from "@/lib/utils";

const BREAK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

interface BreakCountdownProps {
  onComplete: () => void;
  onCancel: () => void;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00";
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function BreakCountdown({ onComplete, onCancel }: BreakCountdownProps) {
  const [remaining, setRemaining] = useState(BREAK_DURATION_MS);
  const startRef = useRef(Date.now());
  const completedRef = useRef(false);
  const rafRef = useRef<number>();

  const handleComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    playAlarmSound("alarm-2");
    // Auto-stop alarm after 15 seconds
    setTimeout(() => stopAlarmSound(), 15000);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const left = BREAK_DURATION_MS - elapsed;
      setRemaining(Math.max(0, left));
      if (left <= 0) {
        handleComplete();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleComplete]);

  const progress = 1 - remaining / BREAK_DURATION_MS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md animate-fade-in">
      <div className="text-center space-y-6 px-6 max-w-sm">
        {/* Pulsing circle with progress ring */}
        <div className="mx-auto relative w-40 h-40 flex items-center justify-center">
          {/* Background ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80" cy="80" r="72"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="6"
            />
            <circle
              cx="80" cy="80" r="72"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 72}
              strokeDashoffset={2 * Math.PI * 72 * (1 - progress)}
              className="transition-[stroke-dashoffset] duration-1000"
            />
          </svg>
          <div className="rounded-full bg-primary/10 w-28 h-28 flex items-center justify-center animate-[pulse_4s_ease-in-out_infinite]">
            <Coffee className="h-10 w-10 text-primary" />
          </div>
        </div>

        <h2 className="text-2xl font-bold font-heading text-foreground">Break Time</h2>
        <p className="text-muted-foreground text-sm">
          Step away, stretch, and recharge. You deserve this.
        </p>

        {/* Countdown */}
        <p className="font-mono text-5xl tabular-nums text-foreground tracking-tight">
          {formatCountdown(remaining)}
        </p>

        {/* Cancel */}
        <Button
          variant="ghost"
          onClick={() => {
            stopAlarmSound();
            onCancel();
          }}
          className="mt-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1.5" />
          End break early
        </Button>
      </div>
    </div>
  );
}
