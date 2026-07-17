import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  History as HistoryIcon,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { deleteHistoryItem, getHistory } from "../services/api";
import HistoryDetailModal from "../components/HistoryDetailModal";
import PageHeader from "../components/PageHeader";
import { ScanLoader } from "../layouts/DashboardLayout";

const PAGE_SIZE = 10;

const CLASS_TONE = {
  MEL: "text-clinic-coral border-clinic-coral/30 bg-clinic-coral/10",
  BCC: "text-clinic-coral border-clinic-coral/30 bg-clinic-coral/10",
  AKIEC: "text-clinic-amber border-clinic-amber/30 bg-clinic-amber/10",
  NV: "text-scan-400 border-scan-500/30 bg-scan-500/10",
  BKL: "text-scan-400 border-scan-500/30 bg-scan-500/10",
  DF: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
  VASC: "text-sky-400 border-sky-500/30 bg-sky-500/10",
};

function confidenceTone(v) {
  if (v >= 0.85) return "text-scan-400";
  if (v >= 0.6) return "text-clinic-amber";
  return "text-clinic-coral";
}

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function load() {
    setLoading(true);
    try {
      const res = await getHistory({ page, page_size: PAGE_SIZE, search: search || undefined });
      setItems(res.data.items);
      setTotal(res.data.total);
    } catch {
      toast.error("Could not load history");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    load();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this prediction?")) return;
    try {
      await deleteHistoryItem(id);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={HistoryIcon}
        title="Prediction History"
        subtitle={`${total.toLocaleString()} predictions on record. Search, review results and re-open explainability maps.`}
        actions={
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mist-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by class (e.g. MEL)"
                className="input-field pl-9 w-56 sm:w-72"
              />
            </div>
            <button type="submit" className="btn-secondary">Search</button>
          </form>
        }
      />

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <ScanLoader label="Loading history" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 h-14 w-14 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-center text-mist-500">
              <HistoryIcon size={22} />
            </div>
            <p className="font-display font-semibold text-mist-100">No predictions yet</p>
            <p className="mt-1 text-sm text-mist-500">
              Predictions you run will appear here for review.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.02] text-mist-500 text-[11px] uppercase tracking-widest">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Prediction</th>
                  <th className="text-left px-5 py-3 font-semibold">Confidence</th>
                  <th className="text-left px-5 py-3 font-semibold">Inference</th>
                  <th className="text-left px-5 py-3 font-semibold">Date</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.025 }}
                    className="border-t border-white/[0.04] hover:bg-white/[0.02] transition"
                  >
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-lg border px-2 py-1 font-mono text-xs font-semibold ${
                          CLASS_TONE[item.predicted_class] || CLASS_TONE.NV
                        }`}
                      >
                        {item.predicted_class}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 min-w-[140px]">
                        <div className="h-1.5 flex-1 rounded-full bg-white/[0.05] overflow-hidden">
                          <div
                            className="h-full bg-grad-primary"
                            style={{ width: `${item.confidence * 100}%` }}
                          />
                        </div>
                        <span className={`font-mono tabular-nums ${confidenceTone(item.confidence)}`}>
                          {(item.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-mist-300 tabular-nums">
                      {item.inference_time_ms} ms
                    </td>
                    <td className="px-5 py-3 text-mist-500">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedId(item.id)}
                          className="rounded-lg p-2 text-mist-300 hover:bg-scan-500/10 hover:text-scan-400 transition"
                          aria-label="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded-lg p-2 text-mist-300 hover:bg-clinic-coral/10 hover:text-clinic-coral transition"
                          aria-label="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-ghost disabled:opacity-40"
            aria-label="Previous"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .map((p, i, arr) => (
              <div key={p} className="flex items-center gap-1">
                {i > 0 && arr[i - 1] !== p - 1 && (
                  <span className="px-1 text-mist-500">…</span>
                )}
                <button
                  onClick={() => setPage(p)}
                  className={`h-9 min-w-9 rounded-lg text-sm font-mono px-3 transition ${
                    p === page
                      ? "bg-grad-primary text-ink-950 font-bold shadow-glow"
                      : "bg-white/[0.03] border border-white/[0.06] text-mist-300 hover:bg-white/[0.06]"
                  }`}
                >
                  {p}
                </button>
              </div>
            ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-ghost disabled:opacity-40"
            aria-label="Next"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {selectedId && (
        <HistoryDetailModal predictionId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
