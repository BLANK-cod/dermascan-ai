import { useEffect, useState } from "react";

export default function StatCard({ label, value, icon: Icon, accent = "scan", suffix = "", animate = true }) {
  const accentClasses = {
    scan: "text-scan-400 border-scan-500/30 bg-scan-500/10 shadow-[0_0_0_1px_rgba(23,233,192,0.12)]",
    coral: "text-clinic-coral border-clinic-coral/30 bg-clinic-coral/10 shadow-[0_0_0_1px_rgba(255,120,120,0.12)]",
    amber: "text-clinic-amber border-clinic-amber/30 bg-clinic-amber/10 shadow-[0_0_0_1px_rgba(255,194,87,0.12)]",
  }[accent];

  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const isNumeric = typeof value === "number" || (typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value));

    if (!isNumeric) {
      setDisplayValue(value);
      return;
    }

    const numericValue = typeof value === "number" ? value : parseFloat(value);

    if (!animate || Number.isNaN(numericValue)) {
      setDisplayValue(value);
      return;
    }

    let animationFrame;
    const duration = 900;
    const startTime = performance.now();
    const startValue = 0;
    const endValue = numericValue;

    const step = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * eased;
      setDisplayValue(Number.isInteger(endValue) ? Math.round(currentValue) : currentValue.toFixed(1));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [animate, value]);

  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-scan-500/40 hover:bg-white/15">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.3em] text-mist-400">{label}</p>
          <p className="mt-3 font-display text-2xl font-semibold tracking-tight text-mist-100 sm:text-[1.75rem]">
            {displayValue}
            {suffix}
          </p>
        </div>
        {Icon && (
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${accentClasses}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  );
}
