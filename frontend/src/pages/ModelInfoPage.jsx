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
      <div>
        <h1 className="font-display text-2xl font-semibold text-mist-100">Model Information</h1>
        <p className="text-sm text-mist-500">{info.architecture}</p>
      </div>

      <div className="card p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(([label, value]) => (
          <div key={label}>
            <p className="text-xs uppercase tracking-wide text-mist-500">{label}</p>
            <p className="mt-1 font-mono text-mist-100">{value}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <p className="text-xs uppercase tracking-wide text-mist-500 mb-2">Supported classes</p>
        <div className="flex flex-wrap gap-2">
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

      <div className="card p-6 space-y-3">
        <p className="font-display font-medium text-mist-100">How prediction works</p>
        <p className="text-sm text-mist-300 leading-relaxed">
          DeiT (Data-efficient Image Transformer) splits the input lesion image into fixed-size
          patches, embeds them, and processes them through stacked self-attention transformer
          blocks — using the custom AG-GELU activation in place of standard GELU — to produce a
          class-token representation that's classified into one of seven lesion categories.
        </p>
        <p className="font-display font-medium text-mist-100 pt-2">Explainability</p>
        <p className="text-sm text-mist-300 leading-relaxed">
          Because DeiT has no convolutional feature maps, explainability uses{" "}
          <span className="text-scan-400">Attention Rollout</span> instead of CNN Grad-CAM: the
          self-attention weights from every transformer block are combined to trace how much each
          image patch influenced the final classification.
        </p>
      </div>

      {info.notes?.length > 0 && (
        <div className="card p-6 border-clinic-amber/30">
          <p className="text-xs uppercase tracking-wide text-clinic-amber mb-2">Notes</p>
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
