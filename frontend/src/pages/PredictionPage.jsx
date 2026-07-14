import { AnimatePresence, motion } from "framer-motion";
import { Clock3, Gauge, ScanFace, Sparkles, ShieldCheck, UploadCloud } from "lucide-react";
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

function CircularConfidence({ value }) {
  const size = 110;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, value / 100));
  const offset = circumference * (1 - progress);

  return (
    <div className="relative flex h-[110px] w-[110px] items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.12)" strokeWidth={strokeWidth} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#17e9c0"
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          fill="none"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDasharray: circumference, strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-mist-500">Confidence</p>
        <p className="mt-1 font-display text-xl font-semibold text-mist-100">{value.toFixed(1)}%</p>
      </div>
    </div>
  );
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

  const confidencePercent = result ? result.confidence * 100 : 0;
  const probabilityEntries = result
    ? Object.entries(result.probabilities).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-scan-500/20 via-ink-800 to-ink-900 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.35)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(23,233,192,0.22),_transparent_45%)]" />
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-scan-500/30 bg-scan-500/10 px-3 py-1 text-sm text-scan-300">
            <Sparkles size={16} />
            Medical image analysis
          </div>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-mist-100 sm:text-4xl">
            Predict lesion type with confidence
          </h1>
          <p className="mt-3 text-sm leading-7 text-mist-400 sm:text-base">
            Upload a dermoscopic image for DeiT + AG-GELU classification and review explainability insights in one place.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[24px] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-mist-200">Upload image</p>
              <p className="text-sm text-mist-400">Drag and drop your dermoscopic scan</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
              <ShieldCheck size={14} />
              Secure upload
            </div>
          </div>

          <motion.div
            layout
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
            className={`mt-5 flex min-h-[320px] cursor-pointer flex-col items-center justify-center gap-4 rounded-[24px] border-2 border-dashed p-6 text-center transition-all duration-300 ${
              dragOver
                ? "border-scan-500 bg-scan-500/12 shadow-[0_0_0_1px_rgba(23,233,192,0.24)]"
                : "border-white/10 bg-ink-950/40 hover:border-scan-500/50 hover:bg-white/8"
            }`}
          >
            {previewUrl ? (
              <div className="w-full overflow-hidden rounded-[20px] border border-white/10 bg-ink-900/70 p-3">
                <img src={previewUrl} alt="Preview" className="max-h-64 w-full rounded-[16px] object-contain" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-scan-500/30 bg-scan-500/10 text-scan-400">
                  <UploadCloud size={28} />
                </div>
                <div>
                  <p className="text-base font-medium text-mist-200">Drop your image here</p>
                  <p className="mt-1 text-sm text-mist-400">JPEG, PNG, or WebP · up to 10MB</p>
                </div>
              </div>
            )}

            <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-mist-400">
              {previewUrl ? "Image ready for analysis" : "Tap to browse your files"}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </motion.div>

          <button
            onClick={handlePredict}
            disabled={!file || loading}
            className="btn-primary mt-4 w-full py-3 text-sm"
          >
            <ScanFace size={16} />
            {loading ? "Analyzing…" : "Predict"}
          </button>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-ink-900/70 p-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-mist-500">Model</p>
              <p className="mt-1 font-display text-sm font-semibold text-mist-100">DeiT + AG-GELU</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-ink-900/70 p-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-mist-500">Output</p>
              <p className="mt-1 font-display text-sm font-semibold text-mist-100">7 classes</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-ink-900/70 p-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-mist-500">Workflow</p>
              <p className="mt-1 font-display text-sm font-semibold text-mist-100">Explainable</p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div className="flex flex-col gap-4 rounded-[24px] border border-white/10 bg-gradient-to-br from-scan-500/12 to-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-mist-500">Predicted class</p>
                    <p className="mt-2 font-display text-2xl font-semibold text-scan-400">
                      {result.predicted_class}{" "}
                      <span className="text-sm font-body text-mist-400">
                        ({CLASS_LABELS[result.predicted_class]})
                      </span>
                    </p>
                  </div>
                  <CircularConfidence value={confidencePercent} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-ink-900/70 p-4">
                    <div className="flex items-center gap-2 text-mist-400">
                      <Gauge size={16} className="text-scan-400" />
                      <p className="text-sm">Confidence</p>
                    </div>
                    <p className="mt-2 font-display text-xl font-semibold text-mist-100">
                      {(result.confidence * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-ink-900/70 p-4">
                    <div className="flex items-center gap-2 text-mist-400">
                      <Clock3 size={16} className="text-scan-400" />
                      <p className="text-sm">Inference time</p>
                    </div>
                    <p className="mt-2 font-display text-xl font-semibold text-mist-100">
                      {result.inference_time_ms} ms
                    </p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-ink-900/60 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-mist-200">Class probabilities</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-mist-500"> ranked</p>
                  </div>
                  <div className="space-y-2.5">
                    {probabilityEntries.map(([cls, prob]) => (
                      <div key={cls} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="font-medium text-mist-200">{cls}</span>
                          <span className="font-mono text-mist-400">{(prob * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-ink-800">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${prob * 100}%` }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-scan-400 to-scan-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-ink-900/60 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-mist-200">Explainability view</p>
                      <p className="text-xs text-mist-500">Attention rollout map</p>
                    </div>
                    <span className="rounded-full border border-scan-500/25 bg-scan-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.3em] text-scan-300">
                      {explainability?.method || "Available"}
                    </span>
                  </div>

                  {explainabilityImageUrl ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="overflow-hidden rounded-[18px] border border-white/10 bg-white/5 p-2">
                        <img src={originalImageUrl || previewUrl} alt="Original" className="h-40 w-full rounded-[14px] object-cover" />
                        <p className="mt-2 text-center text-xs uppercase tracking-[0.3em] text-mist-500">Input image</p>
                      </div>
                      <div className="overflow-hidden rounded-[18px] border border-white/10 bg-white/5 p-2">
                        <img src={explainabilityImageUrl} alt="Attention map" className="h-40 w-full rounded-[14px] object-cover" />
                        <p className="mt-2 text-center text-xs uppercase tracking-[0.3em] text-mist-500">Attention map</p>
                      </div>
                    </div>
                  ) : (
                    <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm leading-7 text-mist-400">
                      Explainability map not available yet — this appears once the DeiT + AG-GELU checkpoint is fully integrated.
                    </p>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-ink-900/50 px-6 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-mist-400">
                  <ScanFace size={24} />
                </div>
                <p className="mt-4 text-base font-medium text-mist-200">Prediction results will appear here</p>
                <p className="mt-2 text-sm leading-7 text-mist-400">
                  Upload an image to see the predicted class, confidence, and explainability output.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
