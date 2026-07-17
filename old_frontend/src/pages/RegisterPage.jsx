import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(data) {
    try {
      await registerUser(data);
      toast.success("Account created");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
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
          <h1 className="font-display text-2xl font-semibold text-mist-100">Create account</h1>
          <p className="mt-1 text-sm text-mist-500">Join DermaScan AI</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input-field" {...register("full_name")} />
          </div>
          <div>
            <label className="label">Username</label>
            <input
              className="input-field"
              {...register("username", { required: "Username is required", minLength: 3 })}
            />
            {errors.username && (
              <p className="mt-1 text-xs text-clinic-coral">Username must be at least 3 characters</p>
            )}
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input-field"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <p className="mt-1 text-xs text-clinic-coral">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input-field"
              {...register("password", { required: true, minLength: 8 })}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-clinic-coral">Password must be at least 8 characters</p>
            )}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            <UserPlus size={16} />
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-mist-500">
          Already have an account?{" "}
          <Link to="/login" className="text-scan-400 hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
