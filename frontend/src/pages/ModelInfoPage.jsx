import { BrainCircuit, Cpu, Layers3, Microscope, ScanEye, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
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
      <div className="flex h-64 items-center justify-center">
        <ScanLoader label="Loading model info" />
      </div>
    );
  }

  if (!info) return null;

  const fields = [
    ["Model Name", info.model_name],
    ["Framework", info.framework],
    ["Dataset", info.dataset],
    ["Input Size", info.input_size],
    ["Classes", info.num_classes],
    ["Overall Accuracy", `${info.overall_accuracy}%`],
    ["Explainability Method", info.explainability_method],
    ["Checkpoint Loaded", info.is_loaded ? "Yes" : "Not yet — pending integration"],
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-scan-500/20 via-ink-800 to-ink-900 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.35)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(23,233,192,0.24),_transparent_42%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-scan-500/30 bg-scan-500/10 px-3 py-1 text-sm text-scan-300">
              <BrainCircuit size={16} />
              Vision transformer model
            </div>
            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-mist-100 sm:text-4xl">
              Model information
            </h1>
            <p className="mt-3 text-sm leading-7 text-mist-400 sm:text-base">{info.architecture}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-mist-200 backdrop-blur-xl">
            <p className="text-[10px] uppercase tracking-[0.3em] text-mist-500">Status</p>
            <p className="mt-1 font-display text-xl font-semibold text-mist-100">
              {info.is_loaded ? "Ready" : "Pending"}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-scan-500/15 text-scan-400">
              <Cpu size={20} />
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-mist-100">Model overview</p>
              <p className="text-sm text-mist-400">Core specifications and deployment details</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {fields.map(([label, value]) => (
              <div key={label} className="rounded-[20px] border border-white/10 bg-ink-900/70 p-4 transition hover:border-scan-500/30 hover:bg-ink-900">
                <p className="text-[10px] uppercase tracking-[0.3em] text-mist-500">{label}</p>
                <p className="mt-2 font-mono text-sm text-mist-100">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-scan-500/15 text-scan-400">
              <Microscope size={20} />
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-mist-100">Model image</p>
              <p className="text-sm text-mist-400">Visual reference for the deployed architecture</p>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-dashed border-white/10 bg-ink-900/60 p-4 text-center">
            <div className="flex min-h-[220px] items-center justify-center rounded-[20px] border border-white/10 bg-gradient-to-br from-scan-500/10 via-white/5 to-white/5 p-4">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-scan-500/25 bg-scan-500/10 text-scan-400">
                  <ScanEye size={28} />
                </div>
                <p className="mt-4 font-display text-lg font-semibold text-mist-100">DeiT architecture preview</p>
                <p className="mt-2 text-sm text-mist-400">A visual placeholder for the transformer pipeline and attention blocks.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-scan-500/15 text-scan-400">
            <Layers3 size={20} />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-mist-100">Architecture diagram placeholder</p>
            <p className="text-sm text-mist-400">Patch embedding → transformer blocks → classification head</p>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-dashed border-white/10 bg-ink-900/60 p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[20px] border border-white/10 bg-white/5 p-4 text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-mist-500">Stage 1</p>
              <p className="mt-2 font-display text-base font-semibold text-mist-100">Patch embedding</p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/5 p-4 text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-mist-500">Stage 2</p>
              <p className="mt-2 font-display text-base font-semibold text-mist-100">Transformer blocks</p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/5 p-4 text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-mist-500">Stage 3</p>
              <p className="mt-2 font-display text-base font-semibold text-mist-100">Classification head</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-scan-500/15 text-scan-400">
              <Zap size={20} />
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-mist-100">AG-GELU explanation</p>
              <p className="text-sm text-mist-400">Why this activation improves the transformer</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-mist-300">
            The custom AG-GELU activation replaces the standard GELU non-linearity with a smoother, more adaptive gating mechanism that can help preserve gradient flow across deeper transformer layers and improve sensitivity to subtle lesion textures.
          </p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-scan-500/15 text-scan-400">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-mist-100">Supported classes</p>
              <p className="text-sm text-mist-400">Seven lesion categories available for inference</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {info.class_names.map((cls) => (
              <span
                key={cls}
                className="rounded-full border border-scan-500/30 bg-scan-500/10 px-3 py-1 text-xs font-mono text-scan-400"
              >
                {cls}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl sm:p-6">
        <p className="font-display text-lg font-semibold text-mist-100">How prediction works</p>
        <p className="mt-3 text-sm leading-7 text-mist-300">
          DeiT splits the input lesion image into fixed-size patches, embeds them, and processes them through stacked self-attention transformer blocks — using the custom AG-GELU activation in place of standard GELU — to produce a class-token representation that is classified into one of seven lesion categories.
        </p>
        <p className="mt-4 text-sm leading-7 text-mist-300">
          Because DeiT has no convolutional feature maps, explainability uses <span className="text-scan-400">Attention Rollout</span> instead of CNN Grad-CAM: the self-attention weights from every transformer block are combined to trace how much each image patch influenced the final classification.
        </p>
      </div>

      {info.notes?.length > 0 && (
        <div className="rounded-[24px] border border-clinic-amber/30 bg-clinic-amber/10 p-5 backdrop-blur-xl sm:p-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-clinic-amber">Notes</p>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-mist-300">
            {info.notes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
