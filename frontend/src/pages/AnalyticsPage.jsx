import { motion } from "framer-motion";
import { Activity, Gauge, LineChart as LineIcon, Timer, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { ScanLoader } from "../layouts/DashboardLayout";
import { getAnalytics } from "../services/api";

const COLORS = ["#14B8A6", "#06B6D4", "#38BDF8", "#FBBF24", "#FB7185", "#2DD4BF", "#7DD3FC"];
const TOOLTIP_STYLE = {
  background: "rgba(17, 26, 46, 0.95)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  color: "#E6EDF7",
  backdropFilter: "blur(12px)",
};

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
      <div className="flex h-[60vh] items-center justify-center">
        <ScanLoader label="Loading analytics" />
      </div>
    );
  }
  if (!data) return null;

  const pieData = Object.entries(data.class_distribution).map(([name, value]) => ({ name, value }));
  const confDistData = Object.entries(data.confidence_distribution).map(([bucket, count]) => ({
    bucket,
    count,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        icon={LineIcon}
        title="Analytics"
        subtitle="Real-time insights across prediction volume, confidence and inference performance."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard index={0} label="Total Predictions" value={data.total_predictions} icon={Activity} />
        <StatCard
          index={1}
          label="Predictions Today"
          value={data.predictions_today}
          icon={TrendingUp}
          accent="cyan"
        />
        <StatCard
          index={2}
          label="Average Confidence"
          value={(data.average_confidence * 100).toFixed(1)}
          suffix="%"
          decimals={1}
          icon={Gauge}
          accent="sky"
        />
        <StatCard
          index={3}
          label="Avg Inference"
          value={data.average_inference_time_ms}
          suffix=" ms"
          icon={Timer}
          accent="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Prediction Distribution" subtitle="Breakdown by lesion class">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <defs>
                {COLORS.map((c, i) => (
                  <linearGradient key={i} id={`pie-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={c} stopOpacity={0.55} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={62}
                outerRadius={100}
                paddingAngle={3}
                stroke="rgba(11,18,32,0.9)"
                strokeWidth={2}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={`url(#pie-${i % COLORS.length})`} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#A9B4C7" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Confidence Distribution" subtitle="How confident predictions are">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={confDistData}>
              <defs>
                <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2DD4BF" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#0D9488" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="bucket" stroke="#6B7793" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6B7793" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(20,184,166,0.06)" }} />
              <Bar dataKey="count" fill="url(#bar-grad)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Daily Prediction Trend" subtitle="Last window of scans">
          <TrendChart data={data.daily_trend} color="#14B8A6" gradId="grad-daily" />
        </ChartCard>

        <ChartCard title="Weekly Prediction Trend" subtitle="Rolling weekly view">
          <TrendChart data={data.weekly_trend} color="#38BDF8" gradId="grad-weekly" />
        </ChartCard>

        <div className="lg:col-span-2">
          <ChartCard title="Monthly Prediction Trend" subtitle="Long-term signal">
            <TrendChart data={data.monthly_trend} color="#FB7185" gradId="grad-monthly" height={240} />
          </ChartCard>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        <p className="font-display font-semibold text-mist-100 p-6 pb-4">Recent Predictions</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-mist-500 text-[11px] uppercase tracking-widest">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Prediction</th>
                <th className="text-left px-5 py-3 font-semibold">Confidence</th>
                <th className="text-left px-5 py-3 font-semibold">Inference time</th>
                <th className="text-left px-5 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_predictions.map((item) => (
                <tr key={item.id} className="border-t border-white/[0.04]">
                  <td className="px-5 py-3">
                    <span className="badge-primary">{item.predicted_class}</span>
                  </td>
                  <td className="px-5 py-3 font-mono text-mist-100">
                    {(item.confidence * 100).toFixed(1)}%
                  </td>
                  <td className="px-5 py-3 font-mono text-mist-300">
                    {item.inference_time_ms} ms
                  </td>
                  <td className="px-5 py-3 text-mist-500">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="mb-4">
        <p className="font-display font-semibold text-mist-100">{title}</p>
        {subtitle && <p className="text-xs text-mist-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

function TrendChart({ data, color, gradId, height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="date" stroke="#6B7793" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#6B7793" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Line
          type="monotone"
          dataKey="count"
          stroke={`url(#${gradId})`}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: color, stroke: "#0B1220", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
