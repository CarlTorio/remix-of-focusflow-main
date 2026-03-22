import {
  Home, CalendarDays, Bell, FileText,
  Settings, ShieldCheck, BookOpen, LogOut, User, Brain,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";

const mainNav = [
  { label: "Hub", icon: Home, to: "/hub" },
  { label: "Plan", icon: CalendarDays, to: "/planner" },
  { label: "Alarm", icon: Bell, to: "/alarm" },
  { label: "Notes", icon: FileText, to: "/notes" },
];

const secondaryNav = [
  { label: "Tutorial", icon: BookOpen, to: "/tutorial" },
  { label: "Settings", icon: Settings, to: "/settings" },
];

export function DesktopSidebar() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const initials = profile
    ? `${(profile.first_name || "")[0] || ""}${(profile.last_name || "")[0] || ""}`.toUpperCase()
    : "?";

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[72px] flex-col items-center border-r border-border bg-card py-4 md:flex">
      <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Brain className="h-5 w-5" />
      </div>

      <nav className="flex flex-1 flex-col items-center gap-1">
        {mainNav.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `relative flex w-14 flex-col items-center gap-0.5 rounded-xl py-2 text-[10px] transition-colors ${
                isActive
                  ? "bg-primary-light text-primary font-semibold"
                  : "text-muted-foreground hover:bg-secondary"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                )}
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        <div className="my-2 h-px w-8 bg-border" />

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex w-14 flex-col items-center gap-0.5 rounded-xl py-2 text-[10px] transition-colors ${
                isActive ? "text-primary bg-primary-light font-semibold" : "text-muted-foreground hover:bg-secondary"
              }`
            }
          >
            <ShieldCheck className="h-5 w-5" />
            <span>Admin</span>
          </NavLink>
        )}

        {secondaryNav.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex w-14 flex-col items-center gap-0.5 rounded-xl py-2 text-[10px] transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:bg-secondary"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <Popover>
        <PopoverTrigger asChild>
          <button className="mt-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-xs font-semibold text-primary-dark hover:ring-2 hover:ring-primary/40 transition-all active:scale-95">
            {initials}
          </button>
        </PopoverTrigger>
        <PopoverContent side="right" align="end" className="w-48 p-1.5">
          <button
            onClick={() => navigate("/settings")}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
          >
            <User className="h-4 w-4" />
            Profile & Settings
          </button>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate("/login"); }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </PopoverContent>
      </Popover>
    </aside>
  );
}
