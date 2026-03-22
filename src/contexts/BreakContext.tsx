import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface BreakContextType {
  isBreakActive: boolean;
  startBreak: () => void;
  endBreak: () => void;
  breakUsedToday: boolean;
  markBreakUsed: () => void;
}

const BreakContext = createContext<BreakContextType | null>(null);

function getTodayKey() {
  return `break_used_${new Date().toISOString().slice(0, 10)}`;
}

export function BreakProvider({ children }: { children: ReactNode }) {
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [breakUsedToday, setBreakUsedToday] = useState(() => {
    return localStorage.getItem(getTodayKey()) === "true";
  });

  const startBreak = useCallback(() => {
    if (!breakUsedToday) {
      setIsBreakActive(true);
    }
  }, [breakUsedToday]);

  const endBreak = useCallback(() => {
    setIsBreakActive(false);
  }, []);

  const markBreakUsed = useCallback(() => {
    localStorage.setItem(getTodayKey(), "true");
    setBreakUsedToday(true);
  }, []);

  return (
    <BreakContext.Provider value={{ isBreakActive, startBreak, endBreak, breakUsedToday, markBreakUsed }}>
      {children}
    </BreakContext.Provider>
  );
}

export function useBreak() {
  const ctx = useContext(BreakContext);
  if (!ctx) throw new Error("useBreak must be used within BreakProvider");
  return ctx;
}
