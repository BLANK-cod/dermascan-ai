import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
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
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-4 h-12 w-12 rounded-full border-2 border-scan-500">
            <span className="absolute inset-1.5 rounded-full bg-scan-500/20 animate-pulse" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-mist-100">
            DermaScan <span className="text-scan-400">AI</span>
          </h1>
          <p className="mt-1 text-sm text-mist-500">Dermoscopy decision-support console</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
          <div>
            <label className="label">Username</label>
            <input
              className="input-field"
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
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-clinic-coral">{errors.password.message}</p>
            )}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            <LogIn size={16} />
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-mist-500">
          No account?{" "}
          <Link to="/register" className="text-scan-400 hover:underline">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
