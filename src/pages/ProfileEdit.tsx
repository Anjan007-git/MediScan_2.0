import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/store/appStore";
import { useToast } from "@/hooks/use-toast";
import avatarAlex from "@/assets/avatar-alex.jpg";

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user: authUser, profile } = useAuth();
  const { user: storeUser, setUserName, setUserEmail } = useAppStore();
  const { toast } = useToast();

  const initialName =
    profile?.display_name ||
    (authUser?.user_metadata as any)?.full_name ||
    storeUser.name ||
    "";
  const initialEmail = storeUser.email || profile?.email || authUser?.email || "";

  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);

  useEffect(() => {
    setName(initialName);
    setEmail(initialEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialName, initialEmail]);

  const avatarUrl =
    profile?.avatar_url ||
    (authUser?.user_metadata as any)?.avatar_url ||
    avatarAlex;

  const handleSave = () => {
    if (!name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setUserName(name.trim());
    setUserEmail(email.trim());
    toast({ title: "Profile updated", description: "Your changes have been saved." });
    navigate("/settings");
  };

  return (
    <div className="px-5 pt-12 pb-24 space-y-5">
      <header className="flex items-center gap-3 animate-fade-in-up">
        <button
          onClick={() => navigate("/settings")}
          className="w-11 h-11 rounded-full glass flex items-center justify-center active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.4} />
        </button>
        <h1 className="text-2xl font-extrabold tracking-tight">Edit Profile</h1>
      </header>

      <section className="glass-strong rounded-[24px] p-5 flex flex-col items-center animate-fade-in-up">
        <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-white shadow-glow">
          <img
            src={avatarUrl}
            alt="Profile"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <p className="text-[12px] text-muted-foreground mt-3">Profile photo synced from your account</p>
      </section>

      <section className="space-y-3 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
        <div className="glass rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-3.5 h-3.5 text-primary" strokeWidth={2.4} />
            <span className="text-[11px] font-semibold text-foreground/70 uppercase tracking-wide">Name</span>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60 text-sm font-medium"
          />
        </div>

        <div className="glass rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-3.5 h-3.5 text-primary" strokeWidth={2.4} />
            <span className="text-[11px] font-semibold text-foreground/70 uppercase tracking-wide">Email</span>
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60 text-sm font-medium"
          />
          <p className="text-[10.5px] text-muted-foreground mt-1">
            Used for display in the app.
          </p>
        </div>
      </section>

      <button
        onClick={handleSave}
        className="glossy w-full rounded-full py-4 font-bold text-white shadow-glow active:scale-[0.97] transition inline-flex items-center justify-center gap-2"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Save className="w-4 h-4" strokeWidth={2.6} />
        Save Changes
      </button>
    </div>
  );
};

export default ProfileEdit;
