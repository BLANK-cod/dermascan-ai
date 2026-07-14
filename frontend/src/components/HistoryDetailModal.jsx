import { Clock3, Gauge, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getExplainability, getHistoryItem } from "../services/api";
import { useAuthenticatedImage } from "../hooks/useAuthenticatedImage";
import { ScanLoader } from "../layouts/DashboardLayout";

const CLASS_LABELS = {
  MEL: "Melanoma",
  NV: "Melanocytic Nevus",
  BCC: "Basal Cell Carcinoma",
  AKIEC: "Actinic Keratosis / Intraepithelial Carcinoma",
  BKL: "Benign Keratosis-like Lesion",
  DF: "Dermatofibroma",
  VASC: "Vascular Lesion",
};

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

  const probabilityEntries = prediction?.probabilities
    ? Object.entries(prediction.probabilities).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-3xl max-h-[88vh] overflow-y-auto p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-mist-500">Prediction detail</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-mist-100">
              {prediction?.predicted_class || "Details"}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-xl border border-white/10 bg-white/5 p-2 text-mist-400 transition hover:text-scan-400">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <ScanLoader label="Loading" />
          </div>
        ) : prediction ? (
          <div className="mt-5 space-y-5">
            <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-scan-500/10 to-white/5 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-mist-400">Predicted class</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-scan-400">
                    {prediction.predicted_class}
                  </p>
                  <p className="mt-1 text-sm text-mist-400">
                    {CLASS_LABELS[prediction.predicted_class] || "Class label"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-ink-900/70 px-4 py-3 text-center">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-mist-500">Confidence</p>
                  <p className="mt-1 font-display text-xl font-semibold text-mist-100">
                    {(prediction.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-ink-900/70 p-4">
                <div className="flex items-center gap-2 text-mist-400">
                  <Gauge size={16} className="text-scan-400" />
                  <p className="text-sm">Confidence</p>
                </div>
                <p className="mt-2 font-display text-xl font-semibold text-mist-100">
                  {(prediction.confidence * 100).toFixed(2)}%
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-ink-900/70 p-4">
                <div className="flex items-center gap-2 text-mist-400">
                  <Clock3 size={16} className="text-scan-400" />
                  <p className="text-sm">Inference time</p>
                </div>
                <p className="mt-2 font-display text-xl font-semibold text-mist-100">
                  {prediction.inference_time_ms} ms
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-ink-900/70 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-mist-200">Prediction details</p>
                <p className="text-xs uppercase tracking-[0.3em] text-mist-500">
                  {new Date(prediction.created_at).toLocaleString()}
                </p>
              </div>
              {probabilityEntries.length > 0 && (
                <div className="space-y-2.5">
                  {probabilityEntries.map(([cls, prob]) => (
                    <div key={cls} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="font-medium text-mist-200">{cls}</span>
                        <span className="font-mono text-mist-400">{(prob * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-ink-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-scan-400 to-scan-500"
                          style={{ width: `${prob * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {explainabilityImageUrl ? (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="overflow-hidden rounded-[18px] border border-white/10 bg-white/5 p-2">
                  <img src={originalImageUrl} alt="Original" className="h-40 w-full rounded-[14px] object-cover" />
                  <p className="mt-2 text-center text-xs uppercase tracking-[0.3em] text-mist-500">Input image</p>
                </div>
                <div className="overflow-hidden rounded-[18px] border border-white/10 bg-white/5 p-2">
                  <img src={explainabilityImageUrl} alt="Attention map" className="h-40 w-full rounded-[14px] object-cover" />
                  <p className="mt-2 text-center text-xs uppercase tracking-[0.3em] text-mist-500">Attention map</p>
                </div>
              </div>
            ) : (
              originalImageUrl && (
                <div className="overflow-hidden rounded-[18px] border border-white/10 bg-white/5 p-2">
                  <img src={originalImageUrl} alt="Original" className="mx-auto max-h-64 rounded-[14px] object-contain" />
                </div>
              )
            )}
          </div>
        ) : (
          <p className="mt-6 text-sm text-mist-500">Not found</p>
        )}
      </div>
    </div>
  );
}
