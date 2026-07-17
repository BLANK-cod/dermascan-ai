import { X } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getExplainability, getHistoryItem } from "../services/api";
import { useAuthenticatedImage } from "../hooks/useAuthenticatedImage";
import { ScanLoader } from "../layouts/DashboardLayout";

export default function HistoryDetailModal({ predictionId, onClose }) {
  const [prediction, setPrediction] = useState(null);
  const [explainability, setExplainability] = useState(null);
  const [loading, setLoading] = useState(true);

  const originalImageUrl = useAuthenticatedImage(prediction?.image_path);
  const explainabilityImageUrl = useAuthenticatedImage(
    explainability?.explainability_image_url
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    getHistoryItem(predictionId)
      .then((res) => {
        if (!active) return;
        setPrediction(res.data);
        return getExplainability(predictionId).catch(() => null);
      })
      .then((exp) => {
        if (active && exp) setExplainability(exp.data);
      })
      .catch(() => toast.error("Could not load prediction detail"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [predictionId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-strong w-full max-w-2xl max-h-[88vh] overflow-y-auto p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-mist-500 font-semibold">
              Prediction detail
            </p>
            <p className="font-display text-lg font-bold text-mist-100">
              #{predictionId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-mist-500 hover:bg-white/[0.05] hover:text-mist-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <ScanLoader label="Loading" />
          </div>
        ) : prediction ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <MetaCell label="Predicted class" value={prediction.predicted_class} accent />
              <MetaCell
                label="Confidence"
                value={`${(prediction.confidence * 100).toFixed(2)}%`}
              />
              <MetaCell
                label="Inference time"
                value={`${prediction.inference_time_ms} ms`}
              />
              <MetaCell
                label="Date"
                value={new Date(prediction.created_at).toLocaleString()}
              />
            </div>

            {explainabilityImageUrl ? (
              <div className="grid grid-cols-2 gap-3">
                <img
                  src={originalImageUrl}
                  alt="Original"
                  className="rounded-xl border border-white/10 w-full"
                />
                <img
                  src={explainabilityImageUrl}
                  alt="Attention map"
                  className="rounded-xl border border-white/10 w-full"
                />
              </div>
            ) : (
              originalImageUrl && (
                <img
                  src={originalImageUrl}
                  alt="Original"
                  className="rounded-xl border border-white/10 max-h-64 mx-auto"
                />
              )
            )}
          </div>
        ) : (
          <p className="text-sm text-mist-500">Not found</p>
        )}
      </motion.div>
    </div>
  );
}

function MetaCell({ label, value, accent }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <p className="text-[10px] uppercase tracking-widest text-mist-500 font-semibold">
        {label}
      </p>
      <p
        className={`mt-1 font-mono text-sm ${
          accent ? "text-scan-400 font-semibold" : "text-mist-100"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
