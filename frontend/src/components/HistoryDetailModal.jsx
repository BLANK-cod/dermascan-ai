import { X } from "lucide-react";
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-mist-100">Prediction detail</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-mist-500 hover:bg-ink-700">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <ScanLoader label="Loading" />
          </div>
        ) : prediction ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-mist-500">Predicted class</p>
                <p className="font-mono text-scan-400 text-lg">{prediction.predicted_class}</p>
              </div>
              <div>
                <p className="text-mist-500">Confidence</p>
                <p className="font-mono text-mist-100 text-lg">
                  {(prediction.confidence * 100).toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-mist-500">Inference time</p>
                <p className="font-mono text-mist-100">{prediction.inference_time_ms} ms</p>
              </div>
              <div>
                <p className="text-mist-500">Date</p>
                <p className="text-mist-100">{new Date(prediction.created_at).toLocaleString()}</p>
              </div>
            </div>

            {explainabilityImageUrl ? (
              <div className="grid grid-cols-2 gap-2">
                <img src={originalImageUrl} alt="Original" className="rounded-lg" />
                <img src={explainabilityImageUrl} alt="Attention map" className="rounded-lg" />
              </div>
            ) : (
              originalImageUrl && (
                <img src={originalImageUrl} alt="Original" className="rounded-lg max-h-64 mx-auto" />
              )
            )}
          </div>
        ) : (
          <p className="text-sm text-mist-500">Not found</p>
        )}
      </div>
    </div>
  );
}
