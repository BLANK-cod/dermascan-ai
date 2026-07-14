import { Database, HardDrive, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAdminStats } from "../services/api";
import StatCard from "../components/StatCard";
import { ScanLoader } from "../layouts/DashboardLayout";

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
      <div className="flex h-64 items-center justify-center">
        <ScanLoader label="Loading admin dashboard" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-mist-100">Admin Dashboard</h1>
        <p className="text-sm text-mist-500">System-wide statistics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.total_users} icon={Users} />
        <StatCard label="Active Users" value={stats.active_users} icon={ShieldCheck} accent="amber" />
        <StatCard label="Total Predictions" value={stats.total_predictions} icon={Database} />
        <StatCard label="Predictions Today" value={stats.predictions_today} icon={Database} accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <p className="font-display font-medium text-mist-100 mb-3">Most predicted disease</p>
          <p className="font-mono text-scan-400 text-2xl">{stats.most_predicted_disease || "—"}</p>
        </div>

        <div className="card p-6">
          <p className="font-display font-medium text-mist-100 mb-3 flex items-center gap-2">
            <HardDrive size={16} /> Storage usage
          </p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-mist-300">
              <span>Used</span>
              <span className="font-mono">{stats.storage.used_gb} GB</span>
            </div>
            <div className="flex justify-between text-mist-300">
              <span>Free</span>
              <span className="font-mono">{stats.storage.free_gb} GB</span>
            </div>
            <div className="flex justify-between text-mist-300">
              <span>Total</span>
              <span className="font-mono">{stats.storage.total_gb} GB</span>
            </div>
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <p className="font-display font-medium text-mist-100 mb-3">System information</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-mist-500">Model</p>
              <p className="font-mono text-mist-100">{stats.system.model_name}</p>
            </div>
            <div>
              <p className="text-mist-500">Accuracy</p>
              <p className="font-mono text-mist-100">{stats.system.model_accuracy}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
