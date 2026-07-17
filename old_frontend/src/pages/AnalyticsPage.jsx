import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getAnalytics } from "../services/api";
import StatCard from "../components/StatCard";
import { Activity, BarChart3, Gauge, Sparkles, Timer, TrendingUp } from "lucide-react";
import { ScanLoader } from "../layouts/DashboardLayout";

const COLORS = ["#17E9C0", "#4CE9CE", "#F5B94A", "#FF6B4A", "#7C8B93", "#0FBFA0", "#B7C4C6"];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then((res) => setData(res.data))
      .catch(() => toast.error("Could not load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <ScanLoader label="Loading analytics" />
      </div>
    );
  }

  if (!data) return null;

  const pieData = Object.entries(data.class_distribution).map(([name, value]) => ({
    name,
    value,
  }));
  const confDistData = Object.entries(data.confidence_distribution).map(([bucket, count]) => ({
    bucket,
    count,
  }));

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-scan-500/20 via-ink-800 to-ink-900 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.35)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(23,233,192,0.24),_transparent_42%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-scan-500/30 bg-scan-500/10 px-3 py-1 text-sm text-scan-300">
              <Sparkles size={16} />
              Performance insights
            </div>
            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-mist-100 sm:text-4xl">
              Analytics overview
            </h1>
            <p className="mt-3 text-sm leading-7 text-mist-400 sm:text-base">
              Track model confidence, class distribution, and prediction volume through a polished healthcare-ready dashboard.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-mist-200 backdrop-blur-xl">
            <BarChart3 size={16} className="text-scan-400" />
            Live diagnostic trends
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Predictions" value={data.total_predictions} icon={Activity} />
        <StatCard label="Predictions Today" value={data.predictions_today} icon={TrendingUp} accent="amber" />
        <StatCard
          label="Average Confidence"
          value={(data.average_confidence * 100).toFixed(1)}
          suffix="%"
          icon={Gauge}
        />
        <StatCard
          label="Average Inference Time"
          value={data.average_inference_time_ms}
          suffix=" ms"
          icon={Timer}
          accent="amber"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-display text-lg font-semibold text-mist-100">Prediction distribution</p>
              <p className="text-sm text-mist-400">Share of each predicted class</p>
            </div>
            <span className="rounded-full border border-white/10 bg-ink-900/70 px-3 py-1 text-xs uppercase tracking-[0.3em] text-mist-500">
              Classes
            </span>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={94} paddingAngle={2}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#121A26", border: "1px solid #26333F", borderRadius: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-display text-lg font-semibold text-mist-100">Confidence distribution</p>
              <p className="text-sm text-mist-400">How predictions are grouped by confidence</p>
            </div>
            <span className="rounded-full border border-white/10 bg-ink-900/70 px-3 py-1 text-xs uppercase tracking-[0.3em] text-mist-500">
              Range
            </span>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confDistData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#26333F" vertical={false} />
                <XAxis dataKey="bucket" stroke="#7C8B93" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#7C8B93" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#121A26", border: "1px solid #26333F", borderRadius: "12px" }} />
                <Bar dataKey="count" fill="#17E9C0" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-display text-lg font-semibold text-mist-100">Daily trend</p>
              <p className="text-sm text-mist-400">Prediction momentum over time</p>
            </div>
            <span className="rounded-full border border-scan-500/25 bg-scan-500/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-scan-300">
              Daily
            </span>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.daily_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#26333F" vertical={false} />
                <XAxis dataKey="date" stroke="#7C8B93" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#7C8B93" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#121A26", border: "1px solid #26333F", borderRadius: "12px" }} />
                <Line type="monotone" dataKey="count" stroke="#17E9C0" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-display text-lg font-semibold text-mist-100">Weekly trend</p>
              <p className="text-sm text-mist-400">Rolling pattern across weeks</p>
            </div>
            <span className="rounded-full border border-clinic-amber/25 bg-clinic-amber/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-clinic-amber">
              Weekly
            </span>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.weekly_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#26333F" vertical={false} />
                <XAxis dataKey="date" stroke="#7C8B93" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#7C8B93" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#121A26", border: "1px solid #26333F", borderRadius: "12px" }} />
                <Line type="monotone" dataKey="count" stroke="#F5B94A" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl sm:p-6 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-display text-lg font-semibold text-mist-100">Monthly trend</p>
              <p className="text-sm text-mist-400">Longer-term prediction volume</p>
            </div>
            <span className="rounded-full border border-clinic-coral/25 bg-clinic-coral/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-clinic-coral">
              Monthly
            </span>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthly_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#26333F" vertical={false} />
                <XAxis dataKey="date" stroke="#7C8B93" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#7C8B93" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#121A26", border: "1px solid #26333F", borderRadius: "12px" }} />
                <Line type="monotone" dataKey="count" stroke="#FF6B4A" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/10 backdrop-blur-xl">
        <div className="border-b border-white/10 p-5 sm:p-6">
          <p className="font-display text-lg font-semibold text-mist-100">Recent predictions</p>
          <p className="mt-1 text-sm text-mist-400">Latest records ingested by the system</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-ink-900/70 text-mist-500 text-xs uppercase">
              <tr>
                <th className="text-left px-5 py-3">Prediction</th>
                <th className="text-left px-5 py-3">Confidence</th>
                <th className="text-left px-5 py-3">Inference time</th>
                <th className="text-left px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_predictions.map((item) => (
                <tr key={item.id} className="border-t border-white/10">
                  <td className="px-5 py-3 font-mono text-scan-400">{item.predicted_class}</td>
                  <td className="px-5 py-3">{(item.confidence * 100).toFixed(1)}%</td>
                  <td className="px-5 py-3">{item.inference_time_ms} ms</td>
                  <td className="px-5 py-3 text-mist-500">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
