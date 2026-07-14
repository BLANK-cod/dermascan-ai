import { Activity, Cpu, Gauge, Timer, TrendingUp, Zap } from "lucide-react";
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
      <div>
        <h1 className="font-display text-2xl font-semibold text-mist-100">Dashboard</h1>
        <p className="text-sm text-mist-500">Overview of your prediction activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      <div className="card p-6">
        <p className="text-sm text-mist-300">
          Upload a dermoscopic image on the{" "}
          <a href="/predict" className="text-scan-400 hover:underline">
            Prediction
          </a>{" "}
          page to get started — DermaScan AI will classify it into one of 7 lesion
          categories and generate an attention-rollout explainability map.
        </p>
      </div>
    </div>
  );
}
