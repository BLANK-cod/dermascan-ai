import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";

const ACCENTS = {
  scan: {
    ring: "from-scan-500/40 to-cyan-500/10",
    icon: "text-scan-400 bg-scan-500/10 border-scan-500/30",
    glow: "shadow-glow",
  },
  cyan: {
    ring: "from-cyan-500/40 to-sky-500/10",
    icon: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    glow: "shadow-glow-cyan",
  },
  sky: {
    ring: "from-sky-500/40 to-cyan-500/10",
    icon: "text-sky-400 bg-sky-500/10 border-sky-500/30",
    glow: "",
  },
  amber: {
    ring: "from-clinic-amber/40 to-clinic-coral/10",
    icon: "text-clinic-amber bg-clinic-amber/10 border-clinic-amber/30",
    glow: "",
  },
  coral: {
    ring: "from-clinic-coral/40 to-scan-500/10",
    icon: "text-clinic-coral bg-clinic-coral/10 border-clinic-coral/30",
    glow: "",
  },
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = "scan",
  suffix = "",
  decimals,
  hint,
  animate = true,
  index = 0,
}) {
  const a = ACCENTS[accent] || ACCENTS.scan;
  const numeric = typeof value === "number" || (!isNaN(parseFloat(value)) && isFinite(value));
  const numValue = numeric ? Number(value) : 0;
  const guessDecimals = decimals ?? (numeric && !Number.isInteger(numValue) ? 1 : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ y: -3 }}
      className={`card p-5 group overflow-hidden ${a.glow}`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br ${a.ring} blur-2xl opacity-70 transition-opacity group-hover:opacity-100`}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-widest text-mist-500 font-semibold">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-mist-100 tabular-nums leading-none">
            {numeric && animate ? (
              <AnimatedCounter value={numValue} decimals={guessDecimals} suffix={suffix} />
            ) : (
              <>
                {value}
                {suffix}
              </>
            )}
          </p>
          {hint && <p className="mt-2 text-xs text-mist-500">{hint}</p>}
        </div>
        {Icon && (
          <div
            className={`h-11 w-11 shrink-0 rounded-2xl border flex items-center justify-center backdrop-blur ${a.icon}`}
          >
            <Icon size={20} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
