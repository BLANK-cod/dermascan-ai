import { motion } from "framer-motion";
import { KeyRound, Mail, Save, ShieldCheck, User as UserIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { changePassword, updateProfile } from "../services/api";

function initials(name = "") {
  return name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ProfilePage() {
  const { user, setUser } = useAuth();

  const profileForm = useForm({
    defaultValues: { full_name: user?.full_name || "", email: user?.email || "" },
  });
  const passwordForm = useForm();

  async function onProfileSubmit(data) {
    try {
      const res = await updateProfile(data);
      setUser(res.data);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Update failed");
    }
  }

  async function onPasswordSubmit(data) {
    try {
      await changePassword(data);
      toast.success("Password changed");
      passwordForm.reset();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Password change failed");
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        icon={UserIcon}
        title="Profile & Settings"
        subtitle={`Signed in as @${user?.username}`}
      />

      {/* Identity card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-grad-hero p-6"
      >
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-grad-primary opacity-20 blur-3xl" />
        <div className="relative flex items-center gap-5 flex-wrap">
          <div className="h-20 w-20 rounded-3xl bg-grad-primary flex items-center justify-center text-ink-950 font-display font-black text-2xl shadow-glow">
            {initials(user?.full_name || user?.username || "U")}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-2xl font-bold text-mist-100 truncate">
              {user?.full_name || user?.username}
            </p>
            <p className="text-sm text-mist-500 truncate">{user?.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="chip">@{user?.username}</span>
              {user?.is_admin && (
                <span className="badge-primary border-clinic-coral/40 bg-clinic-coral/10 text-clinic-coral">
                  <ShieldCheck size={12} /> Admin
                </span>
              )}
              <span className="badge-primary">
                <ShieldCheck size={12} /> Verified account
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile form */}
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-scan-500/10 border border-scan-500/30 text-scan-400 flex items-center justify-center">
              <UserIcon size={18} />
            </div>
            <div>
              <p className="font-display font-semibold text-mist-100">Account details</p>
              <p className="text-xs text-mist-500">Update your name and contact email</p>
            </div>
          </div>
          <div>
            <label className="label">Full name</label>
            <input className="input-field" {...profileForm.register("full_name")} />
          </div>
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mist-500" />
              <input
                type="email"
                className="input-field pl-9"
                {...profileForm.register("email")}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            <Save size={16} /> Save changes
          </button>
        </form>

        {/* Password form */}
        <form
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          className="card p-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <KeyRound size={18} />
            </div>
            <div>
              <p className="font-display font-semibold text-mist-100">Change password</p>
              <p className="text-xs text-mist-500">Use a strong password (8+ characters)</p>
            </div>
          </div>
          <div>
            <label className="label">Current password</label>
            <input
              type="password"
              className="input-field"
              {...passwordForm.register("current_password", { required: true })}
            />
          </div>
          <div>
            <label className="label">New password</label>
            <input
              type="password"
              className="input-field"
              {...passwordForm.register("new_password", { required: true, minLength: 8 })}
            />
          </div>
          <button type="submit" className="btn-secondary">
            <KeyRound size={16} /> Update password
          </button>
        </form>
      </div>
    </div>
  );
}
