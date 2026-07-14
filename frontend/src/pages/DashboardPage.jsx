import { Activity, ArrowUpRight, Cpu, Gauge, ShieldCheck, Sparkles, Timer, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getDashboardStats } from "../services/api";
import StatCard from "../components/StatCard";
import { ScanLoader } from "../layouts/DashboardLayout";

export default function DashboardPage() {
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
      <div className="flex h-64 items-center justify-center">
        <ScanLoader label="Loading dashboard" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-scan-500/20 via-ink-800 to-ink-900 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.35)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(23,233,192,0.25),_transparent_40%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-scan-500/30 bg-scan-500/10 px-3 py-1 text-sm text-scan-300">
              <Sparkles size={16} />
              AI healthcare insights
            </div>
            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-mist-100 sm:text-4xl">
              Welcome back to your Dermascan AI workspace
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-mist-400 sm:text-base">
              Monitor diagnostic activity, review model confidence, and continue building trust in every prediction.
            </p>
          </div>

          <a
            href="/predict"
            className="group inline-flex items-center justify-center gap-2 self-start rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-mist-100 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/15"
          >
            Open prediction workspace
            <ArrowUpRight size={16} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Predictions" value={stats?.total_predictions ?? 0} icon={Activity} />
        <StatCard label="Predictions Today" value={stats?.predictions_today ?? 0} icon={TrendingUp} accent="amber" />
        <StatCard
          label="Average Confidence"
          value={((stats?.average_confidence ?? 0) * 100).toFixed(1)}
          suffix="%"
          icon={Gauge}
        />
        <StatCard
          label="Average Inference Time"
          value={stats?.average_inference_time_ms ?? 0}
          suffix=" ms"
          icon={Timer}
          accent="amber"
        />
        <StatCard label="Current Model" value={stats?.current_model ?? "—"} icon={Cpu} accent="coral" />
        <StatCard
          label="Overall Model Accuracy"
          value={stats?.model_accuracy ?? 0}
          suffix="%"
          icon={Zap}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[24px] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-scan-500/15 text-scan-400">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-mist-100">Clinical workflow ready</h2>
              <p className="text-sm text-mist-400">A seamless experience for rapid image analysis.</p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-7 text-mist-300 sm:text-base">
            Upload a dermoscopic image on the{" "}
            <a href="/predict" className="font-medium text-scan-400 transition hover:text-scan-300 hover:underline">
              Prediction
            </a>{" "}
            page to get started — DermaScan AI will classify it into one of 7 lesion
            categories and generate an attention-rollout explainability map.
          </p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-white/15 to-white/5 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-mist-200">System status</p>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Online
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-ink-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-mist-500">Active model</p>
              <p className="mt-2 font-display text-xl font-semibold text-mist-100">{stats?.current_model ?? "—"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-ink-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-mist-500">Confidence target</p>
              <p className="mt-2 font-display text-xl font-semibold text-mist-100">{((stats?.average_confidence ?? 0) * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
