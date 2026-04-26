import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import BottomNav from "./BottomNav";
import { useAppStore } from "@/store/appStore";

const AppLayout = () => {
  const darkMode = useAppStore((s) => s.settings.darkMode);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [darkMode]);

  return (
    <div className="min-h-screen pb-32">
      <Outlet />
      <BottomNav />
    </div>
  );
};

export default AppLayout;
