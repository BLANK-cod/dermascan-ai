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
import { getAnalytics } from "../services/api";
import StatCard from "../components/StatCard";
import { Activity, Gauge, Timer, TrendingUp } from "lucide-react";
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
      <div>
        <h1 className="font-display text-2xl font-semibold text-mist-100">Analytics</h1>
        <p className="text-sm text-mist-500">Real-time prediction insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <p className="font-display font-medium text-mist-100 mb-4">Prediction Distribution</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#121A26", border: "1px solid #26333F" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <p className="font-display font-medium text-mist-100 mb-4">Confidence Distribution</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={confDistData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#26333F" />
              <XAxis dataKey="bucket" stroke="#7C8B93" fontSize={12} />
              <YAxis stroke="#7C8B93" fontSize={12} />
              <Tooltip contentStyle={{ background: "#121A26", border: "1px solid #26333F" }} />
              <Bar dataKey="count" fill="#17E9C0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <p className="font-display font-medium text-mist-100 mb-4">Daily Prediction Trend</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.daily_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#26333F" />
              <XAxis dataKey="date" stroke="#7C8B93" fontSize={11} />
              <YAxis stroke="#7C8B93" fontSize={12} />
              <Tooltip contentStyle={{ background: "#121A26", border: "1px solid #26333F" }} />
              <Line type="monotone" dataKey="count" stroke="#17E9C0" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <p className="font-display font-medium text-mist-100 mb-4">Weekly Prediction Trend</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.weekly_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#26333F" />
              <XAxis dataKey="date" stroke="#7C8B93" fontSize={11} />
              <YAxis stroke="#7C8B93" fontSize={12} />
              <Tooltip contentStyle={{ background: "#121A26", border: "1px solid #26333F" }} />
              <Line type="monotone" dataKey="count" stroke="#F5B94A" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6 lg:col-span-2">
          <p className="font-display font-medium text-mist-100 mb-4">Monthly Prediction Trend</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.monthly_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#26333F" />
              <XAxis dataKey="date" stroke="#7C8B93" fontSize={11} />
              <YAxis stroke="#7C8B93" fontSize={12} />
              <Tooltip contentStyle={{ background: "#121A26", border: "1px solid #26333F" }} />
              <Line type="monotone" dataKey="count" stroke="#FF6B4A" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card overflow-hidden">
        <p className="font-display font-medium text-mist-100 p-6 pb-4">Recent Predictions</p>
        <table className="w-full text-sm">
          <thead className="bg-ink-900 text-mist-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3">Prediction</th>
              <th className="text-left px-5 py-3">Confidence</th>
              <th className="text-left px-5 py-3">Inference time</th>
              <th className="text-left px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.recent_predictions.map((item) => (
              <tr key={item.id} className="border-t border-ink-600/60">
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
  );
}
