import { Database, HardDrive, Shield, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { ScanLoader } from "../layouts/DashboardLayout";
import { getAdminStats } from "../services/api";

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then((res) => setStats(res.data))
      .catch(() => toast.error("Admin access required"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <ScanLoader label="Loading admin dashboard" />
      </div>
    );
  }
  if (!stats) return null;

  const usedPct = stats.storage.total_gb
    ? (stats.storage.used_gb / stats.storage.total_gb) * 100
    : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        icon={Shield}
        title="Admin Dashboard"
        subtitle="System-wide statistics and platform health."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard index={0} label="Total Users" value={stats.total_users} icon={Users} accent="scan" />
        <StatCard
          index={1}
          label="Active Users"
          value={stats.active_users}
          icon={ShieldCheck}
          accent="cyan"
        />
        <StatCard
          index={2}
          label="Total Predictions"
          value={stats.total_predictions}
          icon={Database}
          accent="sky"
        />
        <StatCard
          index={3}
          label="Predictions Today"
          value={stats.predictions_today}
          icon={Database}
          accent="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <p className="text-[11px] uppercase tracking-widest text-mist-500 font-semibold">
            Most predicted disease
          </p>
          <p className="mt-3 font-display text-3xl font-bold text-gradient">
            {stats.most_predicted_disease || "—"}
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-xl bg-scan-500/10 border border-scan-500/30 text-scan-400 flex items-center justify-center">
              <HardDrive size={16} />
            </div>
            <p className="font-display font-semibold text-mist-100">Storage usage</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-mist-300">
              <span>Used</span>
              <span className="font-mono">{stats.storage.used_gb} GB</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
              <div
                className="h-full bg-grad-primary"
                style={{ width: `${Math.min(100, usedPct)}%` }}
              />
            </div>
            <div className="flex justify-between text-mist-500 text-xs">
              <span>{stats.storage.free_gb} GB free</span>
              <span>{stats.storage.total_gb} GB total</span>
            </div>
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <p className="font-display font-semibold text-mist-100 mb-4">System information</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="text-[10px] uppercase tracking-widest text-mist-500 font-semibold">
                Model
              </p>
              <p className="mt-1 font-mono text-mist-100">{stats.system.model_name}</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="text-[10px] uppercase tracking-widest text-mist-500 font-semibold">
                Accuracy
              </p>
              <p className="mt-1 font-mono text-scan-400 font-semibold">
                {stats.system.model_accuracy}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
