import { AnimatePresence, motion } from "framer-motion";
import { ScanFace, UploadCloud } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getExplainability, predictImage } from "../services/api";
import { useAuthenticatedImage } from "../hooks/useAuthenticatedImage";

const CLASS_LABELS = {
  MEL: "Melanoma",
  NV: "Melanocytic Nevus",
  BCC: "Basal Cell Carcinoma",
  AKIEC: "Actinic Keratosis / Intraepithelial Carcinoma",
  BKL: "Benign Keratosis-like Lesion",
  DF: "Dermatofibroma",
  VASC: "Vascular Lesion",
}

export default function PredictionPage() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState(null);
  const [explainability, setExplainability] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const originalImageUrl = useAuthenticatedImage(result?.image_path);
  const explainabilityImageUrl = useAuthenticatedImage(explainability?.explainability_image_url);

  const handleFile = useCallback((selected) => {
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setResult(null);
    setExplainability(null);
  }, []);

  async function handlePredict() {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await predictImage(formData);
      setResult(res.data);
      toast.success(`Predicted: ${res.data.predicted_class}`);

      try {
        const exp = await getExplainability(res.data.id);
        setExplainability(exp.data);
      } catch {
        // explainability not available until model is fully integrated — non-fatal
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(detail || "Prediction failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-mist-100">Prediction</h1>
        <p className="text-sm text-mist-500">
          Upload a dermoscopic lesion image for DeiT + AG-GELU classification
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload / preview */}
        <div className="card p-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            onClick={() => inputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition ${
              dragOver ? "border-scan-500 bg-scan-500/5" : "border-ink-600 hover:border-scan-500/50"
            }`}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="max-h-64 rounded-xl object-contain" />
            ) : (
              <>
                <UploadCloud size={32} className="text-mist-500" />
                <p className="text-sm text-mist-300">Drag & drop an image, or click to browse</p>
                <p className="text-xs text-mist-500">JPEG, PNG, or WebP · up to 10MB</p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          <button
            onClick={handlePredict}
            disabled={!file || loading}
            className="btn-primary w-full mt-4"
          >
            <ScanFace size={16} />
            {loading ? "Analyzing…" : "Predict"}
          </button>
        </div>

        {/* Result */}
        <div className="card p-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <p className="text-xs uppercase tracking-wide text-mist-500">Predicted class</p>
                  <p className="font-display text-2xl font-semibold text-scan-400">
                    {result.predicted_class}{" "}
                    <span className="text-sm text-mist-500 font-body">
                      ({CLASS_LABELS[result.predicted_class]})
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-mist-500">Confidence</p>
                    <p className="font-mono text-mist-100">{(result.confidence * 100).toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-mist-500">Inference time</p>
                    <p className="font-mono text-mist-100">{result.inference_time_ms} ms</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-mist-500 mb-2">
                    Class probabilities
                  </p>
                  <div className="space-y-1.5">
                    {Object.entries(result.probabilities)
                      .sort((a, b) => b[1] - a[1])
                      .map(([cls, prob]) => (
                        <div key={cls} className="flex items-center gap-2 text-xs">
                          <span className="w-14 font-mono text-mist-300">{cls}</span>
                          <div className="flex-1 h-2 rounded-full bg-ink-700 overflow-hidden">
                            <div
                              className="h-full bg-scan-500"
                              style={{ width: `${prob * 100}%` }}
                            />
                          </div>
                          <span className="w-12 text-right font-mono text-mist-500">
                            {(prob * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {explainabilityImageUrl ? (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-mist-500 mb-2">
                      Attention rollout ({explainability?.method})
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <img src={originalImageUrl} alt="Original" className="rounded-lg" />
                      <img src={explainabilityImageUrl} alt="Attention map" className="rounded-lg" />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-mist-500 italic">
                    Explainability map not available yet — this appears once the DeiT + AG-GELU
                    checkpoint is fully integrated.
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-full min-h-[240px] items-center justify-center text-center text-sm text-mist-500"
              >
                Prediction results will appear here
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
