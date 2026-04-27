import { useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { toast } from "@/hooks/use-toast";

/**
 * Polls every 30s and fires browser notifications + toasts
 * for active reminders whose time matches the current minute.
 * Dedupes per (reminder, minute) key.
 */
const ReminderEngine = () => {
  const reminders = useAppStore((s) => s.reminders);
  const safetyAlerts = useAppStore((s) => s.settings.notifications);
  const markFired = useAppStore((s) => s.markReminderFired);

  useEffect(() => {
    if (!safetyAlerts) return;

    const fire = (medicine: string) => {
      // In-app toast
      toast({
        title: "💊 Medicine reminder",
        description: `Time to take ${medicine}`,
      });
      // Browser notification (if granted)
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        try {
          new Notification("MediScan", {
            body: `Time to take ${medicine}`,
            icon: "/favicon.ico",
            tag: `mediscan-${medicine}`,
          });
        } catch {
          /* ignore */
        }
      }
    };

    const tick = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const currentTime = `${hh}:${mm}`;
      const day = now.toISOString().slice(0, 10);
      const dedupeKey = `${day}-${currentTime}`;

      // Read latest state synchronously to avoid stale closures
      const current = useAppStore.getState().reminders;
      current.forEach((r) => {
        if (!r.enabled) return;
        // Normalise time format (in case "08:00" vs "8:00")
        const [rh, rm] = r.time.split(":");
        const rhh = String(parseInt(rh, 10)).padStart(2, "0");
        const rmm = String(parseInt(rm, 10)).padStart(2, "0");
        const target = `${rhh}:${rmm}`;
        if (target !== currentTime) return;
        if (r.lastFiredKey === dedupeKey) return;
        fire(r.medicine);
        markFired(r.id, dedupeKey);
      });
    };

    // Run immediately, then every 30s
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [reminders, safetyAlerts, markFired]);

  return null;
};

export default ReminderEngine;
