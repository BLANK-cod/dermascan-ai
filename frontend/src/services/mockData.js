// Mock data used when running without a backend (demo mode).
// All shapes intentionally mirror what the FastAPI backend would return
// so pages render exactly as they will in production.

export const MOCK_USER = {
  id: 1,
  username: "demo",
  email: "demo@dermascan.ai",
  full_name: "Demo Clinician",
  role: "admin",
  is_admin: true,
  created_at: "2025-01-12T09:24:00Z",
  avatar_url: null,
};

const CLASSES = [
  { key: "mel", label: "Melanoma" },
  { key: "nv", label: "Melanocytic Nevus" },
  { key: "bcc", label: "Basal Cell Carcinoma" },
  { key: "akiec", label: "Actinic Keratosis" },
  { key: "bkl", label: "Benign Keratosis" },
  { key: "df", label: "Dermatofibroma" },
  { key: "vasc", label: "Vascular Lesion" },
];

function seedProbs(topKey, topConf) {
  const rest = (1 - topConf) / (CLASSES.length - 1);
  const probs = {};
  CLASSES.forEach((c) => {
    probs[c.key] = c.key === topKey ? topConf : rest;
  });
  return probs;
}

export const MOCK_DASHBOARD = {
  total_predictions: 1284,
  total_users: 42,
  predictions_today: 37,
  average_confidence: 0.912,
  top_class: "Melanocytic Nevus",
  recent: [
    { id: 101, predicted_class: "Melanoma", confidence: 0.94, created_at: "2026-07-16T10:12:00Z" },
    { id: 100, predicted_class: "Melanocytic Nevus", confidence: 0.89, created_at: "2026-07-16T09:41:00Z" },
    { id: 99, predicted_class: "Basal Cell Carcinoma", confidence: 0.83, created_at: "2026-07-15T18:03:00Z" },
    { id: 98, predicted_class: "Benign Keratosis", confidence: 0.77, created_at: "2026-07-15T14:22:00Z" },
  ],
};

export const MOCK_HISTORY_ITEMS = Array.from({ length: 24 }).map((_, i) => {
  const c = CLASSES[i % CLASSES.length];
  const conf = 0.72 + ((i * 7) % 25) / 100;
  return {
    id: 200 - i,
    predicted_class: c.label,
    predicted_class_key: c.key,
    confidence: Math.min(0.99, conf),
    image_url: `/static/mock/lesion-${(i % 6) + 1}.jpg`,
    thumbnail_url: `/static/mock/lesion-${(i % 6) + 1}.jpg`,
    created_at: new Date(Date.now() - i * 3600_000 * 6).toISOString(),
    probabilities: seedProbs(c.key, Math.min(0.99, conf)),
    notes: i % 3 === 0 ? "Follow-up recommended in 3 months." : "",
  };
});

export const MOCK_HISTORY = {
  items: MOCK_HISTORY_ITEMS,
  total: MOCK_HISTORY_ITEMS.length,
  page: 1,
  page_size: 10,
};

const trend = (n, base) =>
  Array.from({ length: n }).map((_, i) => ({
    date: new Date(Date.now() - (n - 1 - i) * 86400_000).toISOString().slice(0, 10),
    count: base + Math.round(Math.sin(i / 2) * 12 + i * 1.4),
  }));

export const MOCK_ANALYTICS = {
  total_predictions: 1284,
  predictions_today: 37,
  average_confidence: 0.912,
  average_inference_time_ms: 420,
  class_distribution: CLASSES.reduce((acc, c, i) => {
    acc[c.label] = 60 + ((i * 37) % 180);
    return acc;
  }, {}),
  confidence_distribution: {
    "50-60%": 12,
    "60-70%": 34,
    "70-80%": 88,
    "80-90%": 210,
    "90-100%": 640,
  },
  daily_trend: trend(14, 30),
  weekly_trend: trend(8, 180).map((d, i) => ({ date: `W${i + 1}`, count: d.count })),
  monthly_trend: trend(12, 900).map((d, i) => ({
    date: new Date(0, i).toLocaleString("en", { month: "short" }),
    count: d.count,
  })),
  recent_predictions: MOCK_HISTORY_ITEMS.slice(0, 8).map((h) => ({
    id: h.id,
    predicted_class: h.predicted_class,
    confidence: h.confidence,
    inference_time_ms: 380 + ((h.id * 7) % 180),
    created_at: h.created_at,
  })),
};


export const MOCK_MODEL_INFO = {
  model_name: "DeiT-Base + AG-GELU",
  architecture: "Data-efficient Image Transformer (DeiT) with Adaptive-Gated GELU",
  framework: "PyTorch 2.3",
  dataset: "HAM10000 + ISIC 2020",
  input_size: "224 x 224",
  num_classes: 7,
  explainability_method: "Attention Rollout",
  is_loaded: true,
  overall_accuracy: 92.1,
  class_names: CLASSES.map((c) => c.label),
  notes: [
    "Demo mode: metrics shown are illustrative, not from a live checkpoint.",
    "Connect the FastAPI backend to load real model metadata.",
  ],
};


export const MOCK_ADMIN = {
  total_users: 42,
  active_users: 28,
  total_predictions: 1284,
  predictions_today: 37,
  most_predicted_disease: "Melanocytic Nevus",
  storage: {
    used_gb: 12.4,
    free_gb: 87.6,
    total_gb: 100,
  },
  system: {
    model_name: "DeiT-Base + AG-GELU",
    model_accuracy: 92.1,
  },
  recent_users: [
    { id: 1, username: "demo", email: "demo@dermascan.ai", role: "admin", created_at: "2025-01-12T09:24:00Z" },
    { id: 2, username: "dr.smith", email: "smith@clinic.io", role: "user", created_at: "2026-06-04T12:10:00Z" },
    { id: 3, username: "nurse.jane", email: "jane@clinic.io", role: "user", created_at: "2026-06-19T15:40:00Z" },
  ],
};


export function mockPredict() {
  const idx = Math.floor(Math.random() * CLASSES.length);
  const c = CLASSES[idx];
  const conf = 0.78 + Math.random() * 0.2;
  const id = Math.floor(Math.random() * 9000) + 1000;
  return {
    id,
    prediction_id: id,
    predicted_class: c.label,
    predicted_class_key: c.key,
    confidence: conf,
    probabilities: seedProbs(c.key, conf),
    image_url: null,
    created_at: new Date().toISOString(),
    explainability_url: null,
  };
}

export function mockExplainability(id) {
  return {
    prediction_id: id,
    heatmap_url: null,
    method: "Grad-CAM",
    notes: "Demo mode: heatmap image is not generated without a backend.",
  };
}
