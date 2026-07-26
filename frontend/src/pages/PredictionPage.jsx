import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Check,
  ChevronDown,
  Download,
  Info,
  Loader2,
  RotateCcw,
  ScanFace,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Timer,
  UploadCloud,
  X,
} from "lucide-react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import { getExplainability, predictImage } from "../services/api";
import { useAuthenticatedImage } from "../hooks/useAuthenticatedImage";
import PageHeader from "../components/PageHeader";

const CLASS_LABELS = {
  MEL: "Melanoma",
  NV: "Melanocytic Nevus",
  BCC: "Basal Cell Carcinoma",
  AKIEC: "Actinic Keratosis / Intraepithelial Carcinoma",
  BKL: "Benign Keratosis-like Lesion",
  DF: "Dermatofibroma",
  VASC: "Vascular Lesion",
};

const CLASS_LABELS_REVERSE = Object.fromEntries(
  Object.entries(CLASS_LABELS).map(([key, label]) => [label, key])
);

const TABS = [
  { key: "abcd", label: "ABCDE" },
  { key: "lesion", label: "Lesion Analysis" },
  { key: "probabilities", label: "Class Probability" },
  { key: "explainability", label: "Explainability" },
  { key: "risk", label: "Risk" },
  { key: "info", label: "Info" },
];

const RISK = {
  MEL: { level: "high", label: "High-risk", tone: "coral", score: 5 },
  BCC: { level: "high", label: "High-risk", tone: "coral", score: 4 },
  AKIEC: { level: "med", label: "Precancerous", tone: "amber", score: 3 },
  NV: { level: "low", label: "Typically benign", tone: "scan", score: 1 },
  BKL: { level: "low", label: "Typically benign", tone: "scan", score: 1 },
  DF: { level: "low", label: "Typically benign", tone: "scan", score: 1 },
  VASC: { level: "low", label: "Typically benign", tone: "scan", score: 2 },
};

const TONE = {
  coral: { chip: "border-clinic-coral/40 bg-clinic-coral/10 text-clinic-coral", icon: ShieldAlert, bar: "bg-clinic-coral" },
  amber: { chip: "border-clinic-amber/40 bg-clinic-amber/10 text-clinic-amber", icon: ShieldAlert, bar: "bg-clinic-amber" },
  scan: { chip: "border-scan-500/40 bg-scan-500/10 text-scan-400", icon: ShieldCheck, bar: "bg-scan-500" },
};

const DISEASE_INFO = {
  MEL: {
    about:
      "Melanoma is the most serious form of skin cancer. It develops in melanocytes and can spread rapidly to other organs if not treated early.",
    summary:
      "High-risk skin cancer. Early evaluation and biopsy are critical for timely treatment.",
    risk_text: "High risk",
    risk_extra: "Requires rapid dermatologic evaluation",
    attention: [
      "New or changing dark lesion",
      "Irregular borders",
      "Color variegation",
      "Diameter larger than 6mm",
      "Ulceration or bleeding",
    ],
    recommendations: [
      "Consult a dermatologist or oncologist within 1–2 weeks.",
      "Avoid sun exposure and use SPF 50+ sunscreen daily.",
      "Photograph the lesion weekly to monitor changes.",
      "Request a dermoscopic biopsy for confirmatory diagnosis.",
    ],
  },
  BCC: {
    about:
      "Basal Cell Carcinoma is the most common skin cancer. It grows slowly and rarely metastasizes, but can cause local tissue damage if untreated.",
    summary:
      "Low-to-moderate risk skin cancer. Treatment is recommended to prevent local tissue destruction.",
    risk_text: "High risk",
    risk_extra: "Usually localized but requires medical treatment",
    attention: [
      "Pearly or translucent bump",
      "Rolled edges",
      "Persistent ulceration",
      "Bleeding crust",
      "Slow but steady growth",
    ],
    recommendations: [
      "Schedule a dermatology consultation within 2–4 weeks.",
      "Avoid scratching or irritating the lesion.",
      "Discuss surgical excision or Mohs surgery options.",
      "Maintain strict sun protection habits.",
    ],
  },
  AKIEC: {
    about:
      "Actinic Keratosis is a pre-cancerous lesion caused by long-term UV damage. A small share progress to squamous cell carcinoma.",
    summary:
      "Precancerous skin lesion. Early dermatologic treatment can reduce progression risk.",
    risk_text: "Precancerous",
    risk_extra: "Requires medical evaluation",
    attention: [
      "Rough or scaly patch",
      "Redness or inflammation",
      "Itching or tenderness",
      "Crusting or bleeding",
      "Rapid appearance on sun-exposed skin",
    ],
    recommendations: [
      "See a dermatologist within 4 weeks for evaluation.",
      "Options include cryotherapy, topical 5-FU, or photodynamic therapy.",
      "Adopt daily broad-spectrum sunscreen (SPF 30+).",
      "Perform monthly self-checks of sun-exposed skin.",
    ],
  },
  NV: {
    about:
      "A Melanocytic Nevus (common mole) is a benign growth of melanocytes. Most are harmless but should be watched for atypical changes.",
    summary:
      "Common benign mole. Usually low risk but monitor for rapid changes in size, shape, or colour.",
    risk_text: "Usually benign",
    risk_extra: "Low risk of becoming cancerous",
    attention: [
      "Rapid growth",
      "Irregular borders",
      "Multiple colours",
      "Changes in size or shape",
      "Bleeding or itching",
    ],
    recommendations: [
      "Routine annual skin check with your GP is sufficient.",
      "Apply the ABCDE rule when self-monitoring.",
      "Seek review if the mole itches, bleeds, or grows.",
      "Continue standard sun-safe practices.",
    ],
  },
  BKL: {
    about:
      "Benign Keratosis-like lesions (e.g., seborrheic keratosis, solar lentigo) are non-cancerous growths that are common with age.",
    summary:
      "Non-cancerous lesion type. Usually harmless, but check a doctor if appearance changes or becomes symptomatic.",
    risk_text: "Usually benign",
    risk_extra: "Low risk of malignant transformation",
    attention: [
      "Rapid color change",
      "Itching or bleeding",
      "Pain or tenderness",
      "Sudden growth",
      "Surface crusting or ulceration",
    ],
    recommendations: [
      "No urgent action required — cosmetic removal is optional.",
      "Confirm with a dermatologist if diagnosis is uncertain.",
      "Watch for sudden color or texture changes.",
      "Maintain routine skin surveillance.",
    ],
  },
  DF: {
    about:
      "Dermatofibroma is a benign fibrous nodule, often on the legs. Usually harmless and may follow a minor injury or insect bite.",
    summary:
      "Harmless benign skin nodule. Medical attention is usually only needed for symptoms or cosmetic concerns.",
    risk_text: "Usually benign",
    risk_extra: "Very low risk of cancer",
    attention: [
      "Rapid growth",
      "Pain or itching",
      "Bleeding",
      "Skin ulceration",
      "Large or changing lesions",
    ],
    recommendations: [
      "No treatment is typically needed.",
      "Excision only if painful or cosmetically unwanted.",
      "Report rapid growth or bleeding to your doctor.",
      "Reassess if new lesions appear in clusters.",
    ],
  },
  VASC: {
    about:
      "Vascular lesions include cherry angiomas, hemangiomas, and angiokeratomas. They are benign proliferations of blood vessels.",
    summary:
      "Benign blood vessel growths. Usually low risk, but evaluation is useful if the lesion changes or bleeds.",
    risk_text: "Usually benign",
    risk_extra: "Low risk of malignancy",
    attention: [
      "Bleeding",
      "Ulceration",
      "Rapid growth",
      "Discomfort or pain",
      "Darkening or irregular shape",
    ],
    recommendations: [
      "No medical treatment required for asymptomatic lesions.",
      "Laser therapy is available for cosmetic reasons.",
      "Report bleeding, ulceration, or rapid growth.",
      "Distinguish from melanoma if pigmented — seek review if unsure.",
    ],
  },
};

const STAGES = [
  { key: "upload", label: "Uploading image", ms: 500 },
  { key: "preprocess", label: "Preprocessing (224×224, normalize)", ms: 700 },
  { key: "infer", label: "Running AG-GELU DeiT", ms: 1200 },
  { key: "explain", label: "Generating attention rollout", ms: 900 },
  { key: "done", label: "Prediction complete", ms: 400 },
];

export default function PredictionPage() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState(null);
  const [explainability, setExplainability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stageIdx, setStageIdx] = useState(-1);
  const [activeTab, setActiveTab] = useState("info");
  const inputRef = useRef(null);
  const reportRef = useRef(null);

  const originalImageUrl = useAuthenticatedImage(result?.image_path);
  const explainabilityImageUrl = useAuthenticatedImage(
    explainability?.explainability_image_url
  );

  const handleFile = useCallback((selected) => {
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      toast.error("File is larger than 10MB");
      return;
    }
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setResult(null);
    setExplainability(null);
  }, []);

  function reset() {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setExplainability(null);
    setStageIdx(-1);
  }

  // Drive staged animation while loading
  useEffect(() => {
    if (!loading) return;
    let cancelled = false;
    let i = 0;
    setStageIdx(0);
    const tick = () => {
      if (cancelled) return;
      const stage = STAGES[i];
      setTimeout(() => {
        if (cancelled) return;
        i += 1;
        if (i < STAGES.length) {
          setStageIdx(i);
          tick();
        }
      }, stage.ms);
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [loading]);

  async function handlePredict() {
    if (!file) return;
    setLoading(true);
    setStageIdx(0);
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
        /* non-fatal */
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Prediction failed");
    } finally {
      // Let the "complete" stage briefly show
      setTimeout(() => {
        setLoading(false);
        setStageIdx(-1);
      }, 400);
    }
  }

  const predictedClassKey = result
    ? CLASS_LABELS[result.predicted_class]
      ? result.predicted_class
      : CLASS_LABELS_REVERSE[result.predicted_class] || result.predicted_class
    : null;
  const predictedLabel = result
    ? CLASS_LABELS[predictedClassKey] || result.predicted_class
    : null;
  const risk = result ? RISK[predictedClassKey] : null;
  const tone = risk ? TONE[risk.tone] : null;
  const info = result ? DISEASE_INFO[predictedClassKey] : null;

  function downloadPdf() {
    if (!result) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    let y = 56;

    // Header bar
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, W, 80, "F");
    doc.setTextColor(56, 189, 248);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("DermaScan AI — Prediction Report", 40, 42);
    doc.setTextColor(200, 220, 235);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(new Date().toLocaleString(), 40, 62);

    y = 110;
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Predicted diagnosis", 40, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    y += 22;
    doc.text(
      `${CLASS_LABELS[result.predicted_class] || result.predicted_class} (${result.predicted_class})`,
      40,
      y
    );

    y += 26;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Confidence:", 40, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${(result.confidence * 100).toFixed(2)}%`, 130, y);

    doc.setFont("helvetica", "bold");
    doc.text("Inference time:", 260, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${result.inference_time_ms} ms`, 360, y);

    if (result.thickness_score) {
      doc.setFont("helvetica", "bold");
      doc.text("Thickness (proxy):", 40, y + 18);
      doc.setFont("helvetica", "normal");
      doc.text(`${result.thickness_score} mm`, 160, y + 18);
    }

    if (result.clinical_stage) {
      doc.setFont("helvetica", "bold");
      doc.text("Estimated stage:", 260, y + 18);
      doc.setFont("helvetica", "normal");
      doc.text(`${result.clinical_stage}`, 360, y + 18);
    }

    if (risk) {
      y += 18;
      doc.setFont("helvetica", "bold");
      doc.text("Risk level:", 40, y);
      doc.setFont("helvetica", "normal");
      doc.text(risk.label, 130, y);
    }

    // About
    if (info) {
      y += 34;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("About this condition", 40, y);
      y += 6;
      doc.setDrawColor(220);
      doc.line(40, y, W - 40, y);
      y += 16;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      const aboutLines = doc.splitTextToSize(info.about, W - 80);
      doc.text(aboutLines, 40, y);
      y += aboutLines.length * 14 + 10;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Recommendations", 40, y);
      y += 6;
      doc.line(40, y, W - 40, y);
      y += 16;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      info.recommendations.forEach((r) => {
        const lines = doc.splitTextToSize(`• ${r}`, W - 80);
        doc.text(lines, 40, y);
        y += lines.length * 14 + 2;
      });
    }

    // Probabilities table
    y += 14;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Class probabilities", 40, y);
    y += 6;
    doc.line(40, y, W - 40, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    Object.entries(result.probabilities)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cls, prob]) => {
        doc.text(`${cls}  —  ${CLASS_LABELS[cls] || cls}`, 40, y);
        doc.text(`${(prob * 100).toFixed(2)}%`, W - 80, y, { align: "right" });
        y += 16;
      });

    // Footer disclaimer
    y = doc.internal.pageSize.getHeight() - 60;
    doc.setDrawColor(220);
    doc.line(40, y, W - 40, y);
    doc.setFontSize(9);
    doc.setTextColor(120);
    const disc = doc.splitTextToSize(
      "Disclaimer: DermaScan AI provides decision-support only and is not a substitute for a qualified dermatologist's diagnosis. Please seek professional medical advice.",
      W - 80
    );
    doc.text(disc, 40, y + 16);

    doc.save(`dermascan-report-${result.id || Date.now()}.pdf`);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        icon={ScanFace}
        title="New Prediction"
        subtitle="Upload a dermoscopic lesion image — DeiT + AG-GELU will classify it into one of 7 categories and generate an attention-rollout explainability map."
      />

      <div className="grid grid-cols-1 gap-6">
        {/* Upload */}
        <div className="space-y-4">
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
            onClick={() => !previewUrl && inputRef.current?.click()}
            className={`relative overflow-hidden card p-6 min-h-[360px] flex flex-col items-center justify-center gap-4 text-center transition-all ${
              previewUrl ? "" : "cursor-pointer"
            } ${dragOver ? "ring-2 ring-scan-500/60" : ""}`}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-grad-hero opacity-60"
            />

            <AnimatePresence mode="wait">
              {previewUrl ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative w-full"
                >
                  <div className="relative mx-auto max-w-sm overflow-hidden rounded-2xl border border-white/10">
                    <img src={previewUrl} alt="Preview" className="w-full h-auto object-cover" />
                    {loading && (
                      <>
                        <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-[1px]" />
                        <div className="absolute inset-x-0 h-14 bg-gradient-to-b from-transparent via-scan-400/60 to-transparent animate-scan-line" />
                        <div className="absolute inset-0 border-2 border-scan-400/40 rounded-2xl animate-pulse" />
                      </>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4 gap-2">
                    <div className="text-left min-w-0">
                      <p className="text-sm font-medium text-mist-100 truncate">{file?.name}</p>
                      <p className="text-xs text-mist-500">
                        {(file?.size / 1024).toFixed(1)} KB · {file?.type}
                      </p>
                    </div>
                    <button
                      onClick={reset}
                      className="btn-ghost"
                      disabled={loading}
                      aria-label="Remove"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative flex flex-col items-center gap-4"
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-2xl bg-grad-primary blur-2xl opacity-40" />
                    <div className="relative h-16 w-16 rounded-2xl bg-grad-primary flex items-center justify-center text-ink-950 animate-pulse-glow">
                      <UploadCloud size={26} strokeWidth={2.4} />
                    </div>
                  </div>
                  <div>
                    <p className="font-display text-lg font-semibold text-mist-100">
                      Drop your image here
                    </p>
                    <p className="mt-1 text-sm text-mist-500">
                      or <span className="text-scan-400 font-medium">click to browse</span>
                    </p>
                    <p className="mt-3 text-xs text-mist-500">JPEG · PNG · WebP · up to 10MB</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </motion.div>

          <div className="flex gap-2">
            <button
              onClick={handlePredict}
              disabled={!file || loading}
              className="btn-primary flex-1"
            >
              <Sparkles size={16} />
              {loading ? "Analyzing…" : "Run prediction"}
            </button>
            {previewUrl && (
              <button onClick={reset} className="btn-secondary" disabled={loading}>
                <RotateCcw size={16} />
              </button>
            )}
          </div>

          {/* Processing stages panel */}
          <AnimatePresence>
            {loading && (
              <motion.div
                key="stages"
                initial={{ opacity: 0, y: 8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                className="card p-4 overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Activity size={14} className="text-scan-400" />
                  <p className="text-[11px] uppercase tracking-widest text-mist-500 font-semibold">
                    Processing pipeline
                  </p>
                </div>
                <ul className="space-y-2">
                  {STAGES.map((s, i) => {
                    const done = i < stageIdx;
                    const active = i === stageIdx;
                    return (
                      <li
                        key={s.key}
                        className={`flex items-center gap-3 text-sm transition-colors ${
                          done
                            ? "text-mist-300"
                            : active
                            ? "text-mist-100"
                            : "text-mist-500/60"
                        }`}
                      >
                        <span
                          className={`relative flex h-5 w-5 items-center justify-center rounded-full border ${
                            done
                              ? "bg-scan-500/20 border-scan-500/50 text-scan-400"
                              : active
                              ? "border-scan-400/60"
                              : "border-white/10"
                          }`}
                        >
                          {done ? (
                            <Check size={12} />
                          ) : active ? (
                            <Loader2 size={12} className="animate-spin text-scan-400" />
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-mist-500/40" />
                          )}
                        </span>
                        <span className="flex-1">{s.label}</span>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-3 h-1 rounded-full bg-white/[0.05] overflow-hidden">
                  <motion.div
                    className="h-full bg-grad-primary"
                    initial={{ width: "0%" }}
                    animate={{
                      width: `${((Math.max(0, stageIdx) + 1) / STAGES.length) * 100}%`,
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="card p-4 flex gap-3 text-xs text-mist-500 leading-relaxed">
            <Info size={16} className="shrink-0 text-scan-400 mt-0.5" />
            <p>
              DermaScan AI provides <span className="text-mist-300">decision-support</span> only.
              Results are not a substitute for a qualified dermatologist's diagnosis.
            </p>
          </div>
        </div>

        {/* Result */}
        <div>
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                ref={reportRef}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="card p-6">
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-widest text-mist-500 font-semibold">
                        Predicted Diagnosis
                      </p>
                      <h2 className="mt-3 text-4xl font-bold text-mist-100 sm:text-5xl">
                        {predictedLabel || "Unknown diagnosis"}
                      </h2>
                      <p className="mt-2 text-sm text-mist-500">
                        Class code · {predictedClassKey || "—"}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${tone?.chip || "border-white/10 bg-white/5 text-mist-100"}`}>
                          <span className={`h-2.5 w-2.5 rounded-full ${tone?.bar || "bg-mist-300"}`} />
                          {risk?.label || "Unknown risk"}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs font-semibold text-mist-100">
                          <Check size={12} />
                          {(result.confidence * 100).toFixed(2)}% confidence
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs font-semibold text-mist-100">
                          <Timer size={12} />
                          {result.inference_time_ms} ms
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={downloadPdf}
                      className="btn-secondary inline-flex items-center gap-2 text-xs px-4 py-2"
                    >
                      <Download size={14} />
                      Download Report
                    </button>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <StatRow label="Status" value={risk?.label || "Unknown"} />
                    <StatRow label="Thickness" value={result.thickness_score ? `${result.thickness_score} mm` : "—"} />
                    <StatRow label="Estimated Stage" value={result.clinical_stage || "—"} />
                    <StatRow label="Model Confidence" value={`${(result.confidence * 100).toFixed(2)}%`} />
                  </div>

                  <div className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-scan-500/5 via-white/5 to-scan-500/5 p-6">
                    <p className="text-sm uppercase tracking-widest text-scan-300/80 font-semibold">
                      Quick guidance
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-mist-300">
                      {info?.summary || "Review the tabs below for diagnosis context, lesion metrics, model confidence, and explainability."}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
                    <div className="grid grid-cols-6 divide-x divide-white/10 text-[11px] uppercase tracking-[0.12em] text-mist-500">
                      {TABS.map((tab, idx) => (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setActiveTab(tab.key)}
                          className={`relative px-3 py-3 text-left text-xs font-semibold transition-colors whitespace-nowrap ${
                            activeTab === tab.key
                              ? "text-mist-100 bg-scan-500/10"
                              : "hover:text-mist-100"
                          } ${idx === 0 ? "rounded-l-3xl" : ""} ${idx === TABS.length - 1 ? "rounded-r-3xl" : ""}`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="card p-6">
                    {activeTab === "abcd" && (
                      <div className="space-y-4">
                        <p className="text-sm font-semibold text-mist-100">ABCD Analysis</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <StatRow
                            label="Asymmetry"
                            value={result.morphology?.asymmetry_category || "—"}
                          />
                          <StatRow
                            label="Border"
                            value={result.morphology?.border_category || "—"}
                          />
                          <StatRow
                            label="Colour"
                            value={result.morphology?.colour_category || result.morphology?.color_category || "—"}
                          />
                          <StatRow
                            label="Diameter"
                            value={result.morphology?.diameter_category || "—"}
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === "lesion" && (
                      <div className="space-y-4">
                        <p className="text-sm font-semibold text-mist-100">Lesion Analysis</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <StatRow
                            label="Area"
                            value={result.morphology?.area ? `${Math.round(result.morphology.area)} px²` : "—"}
                          />
                          <StatRow
                            label="Perimeter"
                            value={result.morphology?.perimeter ? `${Math.round(result.morphology.perimeter)} px` : "—"}
                          />
                          <StatRow
                            label="Equivalent Diameter"
                            value={result.morphology?.equivalent_diameter_mm ? `${result.morphology.equivalent_diameter_mm.toFixed(1)} mm` : "—"}
                          />
                          <StatRow
                            label="Major Axis"
                            value={result.morphology?.major_axis_mm ? `${result.morphology.major_axis_mm.toFixed(1)} mm` : "—"}
                          />
                          <StatRow
                            label="Circularity"
                            value={result.morphology?.circularity ? result.morphology.circularity.toFixed(2) : "—"}
                          />
                          <StatRow
                            label="Compactness"
                            value={result.morphology?.compactness ? result.morphology.compactness.toFixed(2) : "—"}
                          />
                          <StatRow
                            label="Solidity"
                            value={result.morphology?.solidity ? result.morphology.solidity.toFixed(2) : "—"}
                          />
                          <StatRow
                            label="Extent"
                            value={result.morphology?.extent ? result.morphology.extent.toFixed(2) : "—"}
                          />
                          <StatRow
                            label="Eccentricity"
                            value={result.morphology?.eccentricity ? result.morphology.eccentricity.toFixed(2) : "—"}
                          />
                          <StatRow
                            label="Border Irregularity"
                            value={result.morphology?.border_irregularity ? result.morphology.border_irregularity.toFixed(2) : "—"}
                          />
                          <StatRow
                            label="Colour Variation"
                            value={
                              result.morphology?.color_variation
                                ? result.morphology.color_variation.toFixed(2)
                                : result.morphology?.colour_variation
                                ? result.morphology.colour_variation.toFixed(2)
                                : "—"
                            }
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === "probabilities" && (
                      <div className="space-y-4">
                        <p className="text-sm font-semibold text-mist-100">Class Probability</p>
                        <div className="space-y-4">
                          {Object.entries(result.probabilities)
                            .sort((a, b) => b[1] - a[1])
                            .map(([cls, prob]) => (
                              <div key={cls} className="space-y-2">
                                <div className="flex items-center justify-between text-sm text-mist-300">
                                  <div>
                                    <p className="font-medium text-mist-100">{CLASS_LABELS[cls] || cls}</p>
                                    <p className="text-xs text-mist-500">{cls}</p>
                                  </div>
                                  <p className="font-mono text-sm text-mist-100">
                                    {(prob * 100).toFixed(1)}%
                                  </p>
                                </div>
                                <div className="h-3 rounded-full bg-white/[0.08] overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-scan-400"
                                    style={{ width: `${prob * 100}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "explainability" && (
                      <div className="space-y-4">
                        <p className="text-sm font-semibold text-mist-100">Explainability</p>
                        <div className="grid gap-4 lg:grid-cols-2">
                          <ImageTile label="Input Image" src={originalImageUrl || previewUrl} />
                          {explainabilityImageUrl ? (
                            <ImageTile label="Grad-CAM Heatmap" src={explainabilityImageUrl} />
                          ) : (
                            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-mist-500">
                              Explainability map is not yet available for this prediction.
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === "risk" && (
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-mist-100">Risk Level</p>
                          <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                            <div className="flex items-center gap-3">
                              <span className={`h-3 w-3 rounded-full ${
                                risk?.level === "high"
                                  ? "bg-clinic-coral"
                                  : risk?.level === "med"
                                  ? "bg-clinic-amber"
                                  : "bg-scan-400"
                              }`} />
                              <p className="text-lg font-semibold text-mist-100">{risk?.label || "Unknown risk"}</p>
                            </div>
                            <p className="text-sm text-mist-300">
                              {risk?.level === "high"
                                ? "High-risk lesions require timely dermatology review."
                                : risk?.level === "med"
                                ? "This lesion may be precancerous and should be evaluated further."
                                : "Low-risk lesion; routine observation is usually appropriate."}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-mist-100">Clinical Recommendation</p>
                          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 space-y-2 text-sm text-mist-300">
                            {info?.recommendations?.map((rec, idx) => (
                              <p key={idx}>• {rec}</p>
                            )) || <p>No recommendation available.</p>}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "info" && (
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-mist-100">Condition</p>
                          <p className="text-base font-semibold text-mist-100">{predictedLabel}</p>
                        </div>
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-mist-100">Description</p>
                          <p className="text-sm leading-relaxed text-mist-300">{info?.about || "No description available."}</p>
                        </div>
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-mist-100">Is it Dangerous?</p>
                          <ul className="space-y-2 text-sm text-mist-300 list-inside list-disc">
                            <li>{info?.risk_text || "Please consult a dermatologist for a definitive diagnosis."}</li>
                            <li>{info?.risk_extra || "Observe the lesion for changes in size, shape, or colour."}</li>
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-mist-100">Recommendation</p>
                          <ul className="space-y-2 text-sm text-mist-300 list-inside list-disc">
                            {(info?.recommendations || []).map((rec, idx) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-mist-100">When to Seek Medical Attention</p>
                          <ul className="space-y-2 text-sm text-mist-300 list-inside list-disc">
                            {(info?.attention || [
                              "Rapid growth",
                              "Irregular borders",
                              "Multiple colours",
                              "Persistent bleeding",
                              "Sudden changes in appearance",
                            ]).map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty-result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="card p-10 min-h-[360px] flex flex-col items-center justify-center text-center"
              >
                <div className="relative h-20 w-20">
                  <div className="absolute inset-0 rounded-full border border-white/10" />
                  <div className="absolute inset-0 rounded-full border-t-2 border-scan-500 animate-ring-spin [animation-play-state:paused]" />
                  <ScanFace
                    size={28}
                    className="absolute inset-0 m-auto text-scan-400"
                  />
                </div>
                <p className="mt-5 font-display text-lg font-semibold text-mist-100">
                  Awaiting scan
                </p>
                <p className="mt-2 max-w-md text-sm text-mist-500">
                  Upload a dermoscopic image on the left, then hit <em>Run prediction</em> to see
                  classification, confidence and an attention-rollout map here.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ConfidenceRing({ value = 0 }) {
  const pct = Math.max(0, Math.min(1, value));
  const size = 96;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="conf-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#conf-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-display text-xl font-bold text-mist-100 tabular-nums">
          {(pct * 100).toFixed(0)}%
        </p>
        <p className="text-[10px] uppercase tracking-widest text-mist-500">Confidence</p>
      </div>
    </div>
  );
}

function SectionCard({ title, isOpen, onToggle, children }) {
  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full gap-3 px-6 py-4 text-left"
      >
        <div>
          <p className="text-sm font-semibold text-mist-100">{title}</p>
          <p className="text-xs text-mist-500">Tap to expand</p>
        </div>
        <ChevronDown className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""} text-mist-400`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="px-6 pb-6"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <span className="text-[10px] uppercase tracking-widest text-mist-500">{label}</span>
      <span className="font-mono text-sm text-mist-100">{value}</span>
    </div>
  );
}

function MetaTile({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg bg-scan-500/10 border border-scan-500/20 text-scan-400 flex items-center justify-center">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-mist-500">{label}</p>
        <p className="font-mono text-sm text-mist-100 truncate">{value}</p>
      </div>
    </div>
  );
}

function ImageTile({ label, src }) {
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden bg-black/20">
      <div className="flex items-center justify-between px-3 py-2 bg-white/[0.03] border-b border-white/[0.06]">
        <p className="text-[11px] uppercase tracking-widest text-mist-500 font-semibold">{label}</p>
      </div>
      <div className="h-[300px] overflow-hidden bg-black/10">
        <img src={src} alt={label} className="w-full h-full object-contain" />
      </div>
    </div>
  );
}
