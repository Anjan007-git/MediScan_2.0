import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import StoreBinder from "./components/StoreBinder";
import Home from "./pages/Home";
import Scan from "./pages/Scan";
import Receipts from "./pages/Receipts";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";
import History from "./pages/History";
import Saved from "./pages/Saved";
import MedicineDetail from "./pages/MedicineDetail";
import ReceiptDetail from "./pages/ReceiptDetail";
import Reminders from "./pages/Reminders";
import SettingsContent from "./pages/SettingsContent";
import ProfileEdit from "./pages/ProfileEdit";
import InsightsCategories from "./pages/InsightsCategories";
import UploadImage from "./pages/UploadImage";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ReminderEngine from "./components/ReminderEngine";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <StoreBinder />
          <ReminderEngine />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Home />} />
              <Route path="/scan" element={<Scan />} />
              <Route path="/receipts" element={<Receipts />} />
              <Route path="/history" element={<History />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/profile" element={<ProfileEdit />} />
              <Route path="/settings/:kind" element={<SettingsContent />} />
              <Route path="/home/reminders" element={<Reminders />} />
              <Route path="/home/uploadimage" element={<UploadImage />} />
              <Route path="/insights/categories" element={<InsightsCategories />} />
              <Route path="/medicine/:id" element={<MedicineDetail />} />
              <Route path="/receipts/:id" element={<ReceiptDetail />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
