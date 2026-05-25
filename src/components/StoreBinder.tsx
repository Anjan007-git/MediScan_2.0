import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { bindStoreToUser } from "@/store/appStore";
import { useDbSync } from "@/hooks/useDbSync";

/** Binds the persisted Zustand store to the currently authenticated user
 *  so each user has their own isolated localStorage slot, and syncs
 *  data with the Supabase database. */
const StoreBinder = () => {
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user) {
      bindStoreToUser(null);
      return;
    }
    const name =
      profile?.display_name ||
      (user.user_metadata as any)?.full_name ||
      (user.user_metadata as any)?.name ||
      user.email?.split("@")[0] ||
      "there";
    bindStoreToUser(user.id, name);
  }, [user, profile]);

  // Hydrate store from DB on login + mirror local mutations back to DB
  useDbSync();

  return null;
};

export default StoreBinder;
