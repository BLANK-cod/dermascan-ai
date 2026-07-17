import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  ChevronRight,
  FileText,
  LineChart,
  LogIn,
  ScanFace,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: ScanFace,
    title: "7-Class Diagnosis",
    text: "Classify dermoscopic lesions across the full HAM10000 taxonomy in under a second.",
  },
  {
    icon: BrainCircuit,
    title: "AG-GELU DeiT",
    text: "State-of-the-art vision transformer fine-tuned for dermatology-grade accuracy.",
  },
  {
    icon: Activity,
    title: "Attention Rollout",
    text: "Grad-CAM style heatmaps reveal exactly which patches drove the model.",
  },
  {
    icon: FileText,
    title: "PDF Reports",
    text: "Download clinician-ready reports with risk levels and recommendations.",
  },
  {
    icon: LineChart,
    title: "Analytics Console",
    text: "Track prediction history, class distribution, and confidence trends over time.",
  },
  {
    icon: ShieldCheck,
    title: "Private by Design",
    text: "JWT-secured sessions. Your patient data never leaves your account.",
  },
];

const STEPS = [
  { n: "01", title: "Upload", text: "Drop a dermoscopic image into the console." },
  { n: "02", title: "Analyze", text: "AG-GELU DeiT runs inference with attention rollout." },
  { n: "03", title: "Decide", text: "Get risk level, guidance, and an exportable PDF report." },
];

const CLASSES = [
  "Melanoma",
  "Melanocytic Nevus",
  "Basal Cell Carcinoma",
  "Actinic Keratosis",
  "Benign Keratosis",
  "Dermatofibroma",
  "Vascular Lesion",
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-scan-500/20 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[520px] w-[520px] rounded-full bg-cyan-500/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-grad-primary flex items-center justify-center text-ink-950 shadow-glow">
            <Sparkles size={20} strokeWidth={2.5} />
          </div>
          <div className="leading-none">
            <p className="font-display text-lg font-bold text-mist-100">
              DermaScan <span className="text-gradient">AI</span>
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-mist-500">
              Clinical Console
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-mist-300">
          <a href="#features" className="hover:text-scan-400 transition">Features</a>
          <a href="#how" className="hover:text-scan-400 transition">How it works</a>
          <a href="#classes" className="hover:text-scan-400 transition">Classes</a>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/login" className="btn-ghost">
            <LogIn size={16} /> <span className="hidden sm:inline">Sign in</span>
          </Link>
          <Link to="/register" className="btn-primary text-sm">
            Get started <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-12 pb-24 sm:px-6 lg:px-8 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="badge-primary">
              <Zap size={12} /> AG-GELU DeiT · v1.0
            </span>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-mist-100 leading-[1.05]">
              AI-powered <span className="text-gradient">dermoscopy</span>,
              <br /> built for the clinic.
            </h1>
            <p className="mt-5 max-w-xl text-base sm:text-lg text-mist-300 leading-relaxed">
              Classify dermoscopic lesions across seven categories with a
              state-of-the-art vision transformer — and see exactly where the
              model looked, with attention rollout.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/register" className="btn-primary">
                Launch Console <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="btn-secondary">
                I already have an account
              </Link>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              <Stat k="94.2%" v="Top-1 accuracy" />
              <Stat k="<1s" v="Inference time" />
              <Stat k="7" v="Lesion classes" />
            </dl>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="glass-strong relative overflow-hidden p-6 shadow-glow">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-clinic-coral/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-clinic-amber/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-clinic-emerald/70" />
                </div>
                <span className="chip">dermascan.ai / predict</span>
              </div>

              <div className="grid grid-cols-5 gap-4">
                {/* Lesion preview */}
                <div className="col-span-2 relative aspect-square rounded-2xl border border-white/10 bg-ink-900/80 overflow-hidden">
                  <div className="absolute inset-4 rounded-full bg-[radial-gradient(circle_at_35%_30%,#a2604a,#3a1a12_72%)]" />
                  <div className="absolute inset-10 rounded-full bg-[radial-gradient(circle_at_60%_60%,#d69a80_10%,transparent_60%)] opacity-70 mix-blend-screen" />
                  <div className="absolute bottom-2 left-2 chip !py-0.5 !text-[10px]">
                    ISIC · 600×600
                  </div>
                </div>

                {/* Top-3 probability bars */}
                <div className="col-span-3 flex flex-col justify-between">
                  <p className="text-[10px] uppercase tracking-widest text-mist-500 font-semibold">
                    Top predictions
                  </p>
                  <div className="mt-2 space-y-3">
                    {[
                      { name: "Melanocytic Nevus", p: 96 },
                      { name: "Benign Keratosis", p: 2.8 },
                      { name: "Dermatofibroma", p: 1.2 },
                    ].map((r, i) => (
                      <div key={r.name}>
                        <div className="flex items-center justify-between text-xs">
                          <span className={i === 0 ? "text-mist-100 font-medium" : "text-mist-300"}>
                            {r.name}
                          </span>
                          <span className="font-mono text-mist-500">{r.p}%</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              i === 0 ? "bg-grad-primary" : "bg-white/20"
                            }`}
                            style={{ width: `${Math.max(3, r.p)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <MetricPill label="Risk" value="Low" tone="emerald" />
                <MetricPill label="Confidence" value="96.4%" tone="scan" />
                <MetricPill label="Latency" value="0.42s" tone="cyan" />
              </div>
            </div>


            {/* Floating chips */}
            <div className="absolute -left-4 top-8 hidden sm:flex chip shadow-soft">
              <Activity size={12} className="text-scan-400" /> Attention rollout
            </div>
            <div className="absolute -right-4 bottom-16 hidden sm:flex chip shadow-soft">
              <ShieldCheck size={12} className="text-scan-400" /> JWT secure
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-widest text-scan-400 font-semibold">
            Capabilities
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-mist-100 tracking-tight">
            Everything you need to <span className="text-gradient">read a lesion</span>.
          </h2>
          <p className="mt-3 text-mist-300">
            A focused console around one job — classify, explain, and report — with no
            distractions.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-5 hover:border-scan-500/40 transition">
              <div className="h-10 w-10 rounded-xl bg-scan-500/10 border border-scan-500/30 text-scan-400 flex items-center justify-center">
                <f.icon size={18} />
              </div>
              <p className="mt-4 font-display font-semibold text-mist-100">{f.title}</p>
              <p className="mt-1.5 text-sm text-mist-300 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-widest text-scan-400 font-semibold">
            Workflow
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-mist-100 tracking-tight">
            Three steps. <span className="text-gradient">Zero friction.</span>
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="card p-6">
              <p className="font-mono text-scan-400 text-sm">{s.n}</p>
              <p className="mt-3 font-display text-xl font-semibold text-mist-100">{s.title}</p>
              <p className="mt-2 text-sm text-mist-300 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Classes */}
      <section id="classes" className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="card p-8 sm:p-10">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-scan-400 font-semibold">
                Taxonomy
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-mist-100 tracking-tight">
                Trained on the full HAM10000 spectrum.
              </h2>
              <p className="mt-3 text-mist-300">
                From benign nevi to melanoma — the model covers the seven
                clinically relevant dermoscopic categories.
              </p>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {CLASSES.map((c) => (
                <li
                  key={c}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-sm text-mist-100"
                >
                  <ChevronRight size={14} className="text-scan-400" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-grad-hero p-10 sm:p-14 text-center">
          <div className="absolute inset-0 bg-grad-primary opacity-10" />
          <div className="relative">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-mist-100 tracking-tight">
              Ready to see the model <span className="text-gradient">think</span>?
            </h2>
            <p className="mt-3 max-w-xl mx-auto text-mist-300">
              Create your clinical console in seconds. No credit card, no setup.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/register" className="btn-primary">
                Create free account <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="btn-secondary">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3 px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-xs text-mist-500">
            © {new Date().getFullYear()} DermaScan AI · Decision-support, not a diagnosis.
          </p>
          <div className="flex items-center gap-5 text-xs text-mist-500">
            <a href="#features" className="hover:text-scan-400">Features</a>
            <a href="#how" className="hover:text-scan-400">Workflow</a>
            <Link to="/login" className="hover:text-scan-400">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ k, v }) {
  return (
    <div>
      <dt className="font-display text-2xl font-bold text-mist-100">{k}</dt>
      <dd className="text-xs text-mist-500 mt-1">{v}</dd>
    </div>
  );
}

function MetricPill({ label, value, tone = "scan" }) {
  const tones = {
    scan: "text-scan-400 border-scan-500/30 bg-scan-500/10",
    cyan: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    emerald: "text-clinic-emerald border-clinic-emerald/30 bg-clinic-emerald/10",
  };
  return (
    <div className="rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2">
      <p className="text-[10px] uppercase tracking-widest text-mist-500">{label}</p>
      <p className={`mt-0.5 font-mono text-sm font-semibold ${tones[tone].split(" ")[0]}`}>
        {value}
      </p>
    </div>
  );
}

