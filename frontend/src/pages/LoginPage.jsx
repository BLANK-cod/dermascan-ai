import { LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(data) {
    try {
      await login(data.username, data.password);
      toast.success("Signed in");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Invalid credentials");
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your clinical AI console."
      footer={
        <>
          No account?{" "}
          <Link to="/register" className="text-scan-400 font-medium hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
        <div>
          <label className="label">Username</label>
          <input
            className="input-field"
            placeholder="jane.doe"
            {...register("username", { required: "Username is required" })}
          />
          {errors.username && (
            <p className="mt-1 text-xs text-clinic-coral">{errors.username.message}</p>
          )}
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            className="input-field"
            placeholder="••••••••"
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-clinic-coral">{errors.password.message}</p>
          )}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          <LogIn size={16} />
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
