import { useEffect, useRef, useState } from "react";

/**
 * Counts up to `value` when it changes. Handles integers and floats.
 */
export default function AnimatedCounter({
  value = 0,
  duration = 900,
  decimals = 0,
  suffix = "",
  prefix = "",
  className = "",
}) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const fromRef = useRef(0);

  useEffect(() => {
    const to = Number(value) || 0;
    const from = fromRef.current;
    startRef.current = null;

    let raf;
    const step = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const t = Math.min(1, (ts - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(step);
      else fromRef.current = to;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  const shown = decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString();

  return (
    <span className={className}>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}
