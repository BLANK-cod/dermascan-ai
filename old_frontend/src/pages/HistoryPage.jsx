import { CalendarDays, Eye, Filter, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { deleteHistoryItem, getHistory } from "../services/api";
import { ScanLoader } from "../layouts/DashboardLayout";
import HistoryDetailModal from "../components/HistoryDetailModal";

const PAGE_SIZE = 10;
const CLASS_LABELS = {
  MEL: "Melanoma",
  NV: "Melanocytic Nevus",
  BCC: "Basal Cell Carcinoma",
  AKIEC: "Actinic Keratosis / Intraepithelial Carcinoma",
  BKL: "Benign Keratosis-like Lesion",
  DF: "Dermatofibroma",
  VASC: "Vascular Lesion",
};

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function load() {
    setLoading(true);
    try {
      const res = await getHistory({ page, page_size: PAGE_SIZE, search: appliedSearch || undefined });
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch {
      toast.error("Could not load history");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, appliedSearch]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(searchInput.trim());
  }

  function handleResetFilters() {
    setSearchInput("");
    setAppliedSearch("");
    setClassFilter("all");
    setDateFilter("");
    setPage(1);
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

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesClass = classFilter === "all" || item.predicted_class === classFilter;
      const itemDate = (item.created_at || "").slice(0, 10);
      const matchesDate = !dateFilter || itemDate === dateFilter;
      return matchesClass && matchesDate;
    });
  }, [items, classFilter, dateFilter]);

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-white/10 bg-gradient-to-br from-scan-500/20 via-ink-800 to-ink-900 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.35)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-mist-100">History</h1>
            <p className="mt-2 text-sm text-mist-400 sm:text-base">
              Review prior lesion predictions, filter findings quickly, and inspect model outputs.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-mist-200 backdrop-blur-xl">
            <p className="text-[10px] uppercase tracking-[0.3em] text-mist-500">Stored predictions</p>
            <p className="mt-1 font-display text-xl font-semibold text-mist-100">{total}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-xl sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <form onSubmit={handleSearchSubmit} className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mist-500" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by class (e.g. MEL)"
                className="input-field w-full pl-9"
              />
            </div>
            <button type="submit" className="btn-secondary">
              Search
            </button>
          </form>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-ink-900/70 px-3 py-2 text-sm text-mist-300">
              <Filter size={16} className="text-scan-400" />
              <select
                value={classFilter}
                onChange={(e) => {
                  setClassFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-sm outline-none"
              >
                <option value="all" className="bg-ink-900 text-mist-100">All classes</option>
                {Object.entries(CLASS_LABELS).map(([value, label]) => (
                  <option key={value} value={value} className="bg-ink-900 text-mist-100">
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-ink-900/70 px-3 py-2 text-sm text-mist-300">
              <CalendarDays size={16} className="text-scan-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-sm outline-none"
              />
            </label>

            <button onClick={handleResetFilters} className="btn-secondary">
              Reset
            </button>
          </div>
        </div>
      </section>

      <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-xl sm:p-5">
        {loading ? (
          <div className="flex justify-center py-16">
            <ScanLoader label="Loading history" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-white/10 bg-ink-900/50 px-6 py-16 text-center">
            <p className="text-lg font-medium text-mist-200">No predictions match those filters</p>
            <p className="mt-2 text-sm text-mist-400">Try widening the search or clearing a filter.</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredItems.map((item) => (
              <article key={item.id} className="group rounded-[24px] border border-white/10 bg-ink-900/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-scan-500/40 hover:bg-ink-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-mist-500">Prediction</p>
                    <h3 className="mt-2 font-display text-lg font-semibold text-mist-100">{item.predicted_class}</h3>
                    <p className="mt-1 text-sm text-mist-400">{CLASS_LABELS[item.predicted_class] || "Unknown class"}</p>
                  </div>
                  <span className="rounded-full border border-scan-500/25 bg-scan-500/10 px-3 py-1 text-sm font-medium text-scan-300">
                    {(item.confidence * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-scan-400 to-scan-500"
                    style={{ width: `${Math.max(8, item.confidence * 100)}%` }}
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-mist-400">
                  <span>{new Date(item.created_at).toLocaleString()}</span>
                  <span>{item.inference_time_ms} ms</span>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedId(item.id)}
                    className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-mist-300 transition hover:text-scan-400"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-mist-300 transition hover:text-clinic-coral"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-mist-200 transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-9 min-w-[2.25rem] rounded-xl px-3 text-sm font-medium ${
                p === page
                  ? "bg-scan-500 text-ink-950"
                  : "border border-white/10 bg-white/10 text-mist-300 hover:bg-white/15"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-mist-200 transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {selectedId && (
        <HistoryDetailModal predictionId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
