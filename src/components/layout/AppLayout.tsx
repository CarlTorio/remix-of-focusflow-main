import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "@/components/navigation/BottomNav";
import { DesktopSidebar } from "@/components/navigation/DesktopSidebar";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { GlobalMusicPlayer } from "@/components/music/GlobalMusicPlayer";

export function AppLayout() {
  const { pathname } = useLocation();
  const isPlanner = pathname === "/planner";

  return (
    <div className="min-h-screen bg-background">
      <OfflineIndicator />
      <DesktopSidebar />
      <div className="md:pl-[72px]">
        <Outlet />
      </div>
      {/* Show global mini player on all pages except planner (planner has its own) */}
      {!isPlanner && <GlobalMusicPlayer />}
      <BottomNav />
    </div>
  );
}
