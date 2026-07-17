import { motion } from "framer-motion";
import { Activity, Cpu, Gauge, Layers, LayoutGrid, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader";
import { getModelInfo } from "../services/api";
import { ScanLoader } from "../layouts/DashboardLayout";

export default function ModelInfoPage() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getModelInfo()
      .then((res) => setInfo(res.data))
      .catch(() => toast.error("Could not load model info"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <ScanLoader label="Loading model info" />
      </div>
    );
  }
  if (!info) return null;

  const specs = [
    { label: "Model", value: info.model_name, icon: Cpu, accent: "scan" },
    { label: "Framework", value: info.framework, icon: Layers, accent: "cyan" },
    { label: "Dataset", value: info.dataset, icon: LayoutGrid, accent: "sky" },
    { label: "Input size", value: info.input_size, icon: Gauge, accent: "amber" },
    { label: "Classes", value: info.num_classes, icon: Activity, accent: "scan" },
    {
      label: "Explainability",
      value: info.explainability_method,
      icon: Sparkles,
      accent: "cyan",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        icon={Cpu}
        title="Model Information"
        subtitle={info.architecture}
      />

      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-grad-hero p-6 sm:p-8"
      >
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-grad-primary opacity-20 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-3 items-center">
          <div className="lg:col-span-2 space-y-3">
            <span className="chip">
              <span className="h-1.5 w-1.5 rounded-full bg-scan-400 animate-pulse" />
              {info.is_loaded ? "Checkpoint loaded" : "Checkpoint pending"}
            </span>
            <h2 className="font-display text-3xl font-bold text-mist-100">
              <span className="text-gradient">DeiT</span> with <span className="text-gradient">AG-GELU</span> activation
            </h2>
            <p className="text-sm text-mist-300 max-w-2xl leading-relaxed">
              Data-efficient Image Transformer splits each lesion image into fixed patches,
              embeds them, and processes them through stacked self-attention transformer blocks
              — swapping standard GELU for a custom AG-GELU (Adaptive-Gated GELU) activation —
              producing a class token that's decoded into one of seven diagnostic classes.
            </p>
          </div>
          <BigMetric label="Overall accuracy" value={info.overall_accuracy} suffix="%" />
        </div>
      </motion.div>

      {/* Spec grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {specs.map((s, i) => (
          <SpecCard key={s.label} {...s} index={i} />
        ))}
      </div>

      {/* Architecture diagram */}
      <div className="card p-6">
        <p className="text-[11px] uppercase tracking-widest text-mist-500 font-semibold mb-4">
          Inference pipeline
        </p>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {["Input 224×224", "Patch embed", "12× Transformer + AG-GELU", "Class token", "7-way Softmax"].map(
            (step, i, arr) => (
              <div key={step} className="flex items-center gap-3 sm:gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-mono text-mist-100"
                >
                  {step}
                </motion.div>
                {i < arr.length - 1 && (
                  <div className="hidden sm:block h-px w-6 bg-gradient-to-r from-scan-500/60 to-cyan-500/40" />
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* Classes */}
      <div className="card p-6">
        <p className="text-[11px] uppercase tracking-widest text-mist-500 font-semibold mb-4">
          Supported classes
        </p>
        <div className="flex flex-wrap gap-2">
          {info.class_names.map((cls, i) => (
            <motion.span
              key={cls}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="badge-primary"
            >
              {cls}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Explainability */}
      <div className="card p-6 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <Zap size={16} />
          </div>
          <p className="font-display font-semibold text-mist-100">Attention Rollout</p>
        </div>
        <p className="text-sm text-mist-300 leading-relaxed">
          Because DeiT has no convolutional feature maps, explainability uses{" "}
          <span className="text-scan-400">Attention Rollout</span> instead of CNN Grad-CAM: the
          self-attention weights from every transformer block are combined to trace how much each
          image patch influenced the final classification.
        </p>
      </div>

      {info.notes?.length > 0 && (
        <div className="card p-6 border-clinic-amber/30">
          <p className="text-[11px] uppercase tracking-widest text-clinic-amber font-semibold mb-2">
            Notes
          </p>
          <ul className="space-y-1.5 text-sm text-mist-300 list-disc list-inside">
            {info.notes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SpecCard({ label, value, icon: Icon, accent, index }) {
  const tone = {
    scan: "text-scan-400 bg-scan-500/10 border-scan-500/30",
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    sky: "text-sky-400 bg-sky-500/10 border-sky-500/30",
    amber: "text-clinic-amber bg-clinic-amber/10 border-clinic-amber/30",
  }[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card p-4"
    >
      <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${tone}`}>
        <Icon size={18} />
      </div>
      <p className="mt-3 text-[10px] uppercase tracking-widest text-mist-500 font-semibold">
        {label}
      </p>
      <p className="mt-1 font-mono text-sm text-mist-100 truncate">{value}</p>
    </motion.div>
  );
}

function BigMetric({ label, value, suffix = "" }) {
  return (
    <div className="glass-strong p-5 text-center">
      <p className="text-[11px] uppercase tracking-widest text-mist-500 font-semibold">
        {label}
      </p>
      <p className="mt-1 font-display text-5xl font-bold text-gradient tabular-nums">
        {value}
        <span className="text-2xl">{suffix}</span>
      </p>
      <p className="mt-2 text-xs text-mist-500">Validation benchmark</p>
    </div>
  );
}
