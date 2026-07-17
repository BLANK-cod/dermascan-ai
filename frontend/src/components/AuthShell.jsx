import { motion } from "framer-motion";
import { Activity, ScanFace, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Premium split-screen frame used by Login and Register pages.
 */
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: brand */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden p-10 border-r border-white/[0.06]">
        <div className="absolute inset-0 bg-grad-hero" />
        <div
          aria-hidden
          className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-grad-primary opacity-30 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-grad-primary flex items-center justify-center text-ink-950 shadow-glow">
            <Sparkles size={20} strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-display text-lg font-bold text-mist-100 leading-none">
              DermaScan <span className="text-gradient">AI</span>
            </p>
            <p className="text-[10px] uppercase tracking-widest text-mist-500 mt-1">
              Clinical Console
            </p>
          </div>
        </div>

        <div className="relative">
          <h2 className="font-display text-4xl xl:text-5xl font-bold text-mist-100 leading-tight tracking-tight">
            AI-powered <span className="text-gradient">dermoscopy</span> at your fingertips.
          </h2>
          <p className="mt-4 max-w-md text-mist-300 leading-relaxed">
            Classify dermoscopic lesions across seven categories with a
            state-of-the-art DeiT transformer and inspect exactly where the model looked.
          </p>

          <div className="mt-8 grid gap-3 max-w-md">
            <Feature icon={ScanFace} title="Instant classification">
              Sub-second inference on dermoscopic images with confidence scores.
            </Feature>
            <Feature icon={Activity} title="Attention rollout">
              See exactly which patches drove the model's prediction.
            </Feature>
            <Feature icon={ShieldCheck} title="Private by design">
              JWT-secured sessions; your predictions stay in your account.
            </Feature>
          </div>
        </div>

        <p className="relative text-xs text-mist-500">
          © {new Date().getFullYear()} DermaScan AI · Decision-support, not a diagnosis.
        </p>
      </aside>

      {/* Right: form */}
      <main className="flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="h-10 w-10 rounded-2xl bg-grad-primary flex items-center justify-center text-ink-950 shadow-glow">
              <Sparkles size={20} strokeWidth={2.5} />
            </div>
            <p className="font-display text-xl font-bold text-mist-100">
              DermaScan <span className="text-gradient">AI</span>
            </p>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h1 className="font-display text-3xl font-bold text-mist-100 tracking-tight">
              {title}
            </h1>
            {subtitle && <p className="mt-2 text-sm text-mist-500">{subtitle}</p>}
          </div>

          {children}

          {footer && (
            <p className="mt-6 text-center lg:text-left text-sm text-mist-500">{footer}</p>
          )}
        </motion.div>
      </main>
    </div>
  );
}

function Feature({ icon: Icon, title, children }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3 backdrop-blur">
      <div className="h-9 w-9 shrink-0 rounded-xl bg-scan-500/10 border border-scan-500/30 text-scan-400 flex items-center justify-center">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-sm font-semibold text-mist-100">{title}</p>
        <p className="text-xs text-mist-500 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

export { Link };
