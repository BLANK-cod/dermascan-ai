import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Cpu,
  Gauge,
  ScanFace,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../services/api";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { ScanLoader } from "../layouts/DashboardLayout";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch(() => toast.error("Could not load dashboard stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <ScanLoader label="Loading dashboard" />
      </div>
    );
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="space-y-8">
      {/* Hero welcome */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-grad-hero p-6 sm:p-8"
      >
        <div
          aria-hidden
          className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-grad-primary opacity-20 blur-3xl"
        />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-scan-500/40 to-transparent" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="chip mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-scan-400" />
              DeiT + AG-GELU · Online
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-mist-100">
              {greeting},{" "}
              <span className="text-gradient">
                {user?.full_name?.split(" ")[0] || user?.username}
              </span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-mist-300 max-w-xl">
              Your clinical AI console for dermoscopic lesion classification, explainability and
              performance monitoring — all in one workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/predict" className="btn-primary">
              <ScanFace size={16} />
              New prediction
              <ArrowRight size={14} />
            </Link>
            <Link to="/analytics" className="btn-secondary">
              <Activity size={16} />
              View analytics
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          index={0}
          label="Total Predictions"
          value={stats?.total_predictions ?? 0}
          icon={Activity}
          accent="scan"
          hint="Across your entire history"
        />
        <StatCard
          index={1}
          label="Predictions Today"
          value={stats?.predictions_today ?? 0}
          icon={TrendingUp}
          accent="cyan"
          hint="Last 24 hours"
        />
        <StatCard
          index={2}
          label="Average Confidence"
          value={((stats?.average_confidence ?? 0) * 100).toFixed(1)}
          suffix="%"
          decimals={1}
          icon={Gauge}
          accent="sky"
        />
        <StatCard
          index={3}
          label="Avg Inference Time"
          value={stats?.average_inference_time_ms ?? 0}
          suffix=" ms"
          icon={Timer}
          accent="amber"
          hint="Per image, end-to-end"
        />
        <StatCard
          index={4}
          label="Current Model"
          value={stats?.current_model ?? "—"}
          icon={Cpu}
          accent="coral"
          animate={false}
        />
        <StatCard
          index={5}
          label="Overall Accuracy"
          value={stats?.model_accuracy ?? 0}
          suffix="%"
          icon={Zap}
          accent="scan"
          hint="Validation benchmark"
        />
      </div>

      {/* Quick actions row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <QuickCard
          to="/predict"
          icon={ScanFace}
          title="Run a scan"
          desc="Upload a dermoscopic image and receive a classified result with attention rollout."
          accent="scan"
        />
        <QuickCard
          to="/history"
          icon={Activity}
          title="Review history"
          desc="Search past predictions, revisit results, and export explainability maps."
          accent="cyan"
        />
        <QuickCard
          to="/model-info"
          icon={Cpu}
          title="Model details"
          desc="Architecture, training regime, custom AG-GELU activation and class taxonomy."
          accent="sky"
        />
      </div>
    </div>
  );
}

function QuickCard({ to, icon: Icon, title, desc, accent = "scan" }) {
  const border = {
    scan: "hover:border-scan-500/50",
    cyan: "hover:border-cyan-500/50",
    sky: "hover:border-sky-500/50",
  }[accent];
  const iconCls = {
    scan: "text-scan-400 bg-scan-500/10 border-scan-500/30",
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    sky: "text-sky-400 bg-sky-500/10 border-sky-500/30",
  }[accent];
  return (
    <Link to={to} className={`card p-6 group transition-all ${border} hover:-translate-y-1`}>
      <div className={`h-11 w-11 rounded-2xl border flex items-center justify-center ${iconCls}`}>
        <Icon size={20} />
      </div>
      <p className="mt-4 font-display font-semibold text-mist-100 text-lg">{title}</p>
      <p className="mt-1.5 text-sm text-mist-500 leading-relaxed">{desc}</p>
      <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-scan-400 group-hover:gap-2.5 transition-all">
        Open <ArrowRight size={12} />
      </p>
    </Link>
  );
}
