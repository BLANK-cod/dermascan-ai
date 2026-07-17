import { KeyRound, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { changePassword, updateProfile } from "../services/api";

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
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-semibold text-mist-100">Profile</h1>
        <p className="text-sm text-mist-500">@{user?.username}</p>
      </div>

      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="card p-6 space-y-4">
        <p className="font-display font-medium text-mist-100">Account details</p>
        <div>
          <label className="label">Full name</label>
          <input className="input-field" {...profileForm.register("full_name")} />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input-field" {...profileForm.register("email")} />
        </div>
        <button type="submit" className="btn-primary">
          <Save size={16} />
          Save changes
        </button>
      </form>

      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="card p-6 space-y-4">
        <p className="font-display font-medium text-mist-100">Change password</p>
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
          <KeyRound size={16} />
          Update password
        </button>
      </form>
    </div>
  );
}
