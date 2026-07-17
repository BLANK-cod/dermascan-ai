import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
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
    <AuthShell
      title="Create your account"
      subtitle="Start classifying dermoscopic images in seconds."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-scan-400 font-medium hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
        <div>
          <label className="label">Full name</label>
          <input className="input-field" placeholder="Dr. Jane Doe" {...register("full_name")} />
        </div>
        <div>
          <label className="label">Username</label>
          <input
            className="input-field"
            placeholder="jane.doe"
            {...register("username", { required: true, minLength: 3 })}
          />
          {errors.username && (
            <p className="mt-1 text-xs text-clinic-coral">
              Username must be at least 3 characters
            </p>
          )}
        </div>
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input-field"
            placeholder="jane@clinic.com"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-clinic-coral">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="label">Password</label>
          <input
            type="password"
            className="input-field"
            placeholder="At least 8 characters"
            {...register("password", { required: true, minLength: 8 })}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-clinic-coral">
              Password must be at least 8 characters
            </p>
          )}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          <UserPlus size={16} />
          {isSubmitting ? "Creating…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
