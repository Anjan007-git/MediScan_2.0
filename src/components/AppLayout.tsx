import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import BottomNav from "./BottomNav";
import { applyTheme, getTheme } from "@/lib/storage";

const AppLayout = () => {
  useEffect(() => {
    applyTheme(getTheme());
  }, []);

  return (
    <div className="min-h-screen pb-32">
      <Outlet />
      <BottomNav />
    </div>
  );
};

export default AppLayout;
