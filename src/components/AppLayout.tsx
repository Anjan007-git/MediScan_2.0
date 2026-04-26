import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

const AppLayout = () => {
  return (
    <div className="min-h-screen pb-32">
      <Outlet />
      <BottomNav />
    </div>
  );
};

export default AppLayout;
