import { Eye, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { deleteHistoryItem, getHistory } from "../services/api";
import { ScanLoader } from "../layouts/DashboardLayout";
import HistoryDetailModal from "../components/HistoryDetailModal";

const PAGE_SIZE = 10;

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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-mist-100">History</h1>
          <p className="text-sm text-mist-500">{total} predictions on record</p>
        </div>
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mist-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by class (e.g. MEL)"
              className="input-field pl-9 w-64"
            />
          </div>
          <button type="submit" className="btn-secondary">
            Search
          </button>
        </form>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <ScanLoader label="Loading history" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-16 text-center text-sm text-mist-500">No predictions found</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-ink-900 text-mist-500 text-xs uppercase">
              <tr>
                <th className="text-left px-5 py-3">Prediction</th>
                <th className="text-left px-5 py-3">Confidence</th>
                <th className="text-left px-5 py-3">Inference time</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-ink-600/60">
                  <td className="px-5 py-3 font-mono text-scan-400">{item.predicted_class}</td>
                  <td className="px-5 py-3">{(item.confidence * 100).toFixed(1)}%</td>
                  <td className="px-5 py-3">{item.inference_time_ms} ms</td>
                  <td className="px-5 py-3 text-mist-500">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedId(item.id)}
                        className="rounded-lg p-2 text-mist-300 hover:bg-ink-700 hover:text-scan-400"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg p-2 text-mist-300 hover:bg-ink-700 hover:text-clinic-coral"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-9 w-9 rounded-lg text-sm font-mono ${
                p === page
                  ? "bg-scan-500 text-ink-950"
                  : "bg-ink-800 text-mist-300 hover:bg-ink-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {selectedId && (
        <HistoryDetailModal predictionId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
