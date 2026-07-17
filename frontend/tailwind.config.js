/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Premium dark medical palette
        // Backgrounds
        ink: {
          950: "#070C17", // deepest
          900: "#0B1220", // app background
          800: "#111a2e", // card base
          700: "#1a2540", // raised
          600: "#243052", // borders
        },
        // Text
        mist: {
          100: "#E6EDF7",
          300: "#A9B4C7",
          500: "#6B7793",
        },
        // Primary teal (scan)
        scan: {
          400: "#2DD4BF",
          500: "#14B8A6", // primary
          600: "#0D9488",
        },
        // Secondary cyan
        cyan: {
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
        },
        // Accent sky
        sky: {
          400: "#7DD3FC",
          500: "#38BDF8",
          600: "#0EA5E9",
        },
        clinic: {
          coral: "#FB7185",
          amber: "#FBBF24",
          emerald: "#34D399",
        },
      },
      fontFamily: {
        display: ["'Inter'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "16px",
        "3xl": "22px",
      },
      boxShadow: {
        glow: "0 0 32px 0 rgba(20, 184, 166, 0.28)",
        "glow-cyan": "0 0 32px 0 rgba(6, 182, 212, 0.25)",
        soft: "0 8px 32px rgba(2, 6, 23, 0.45)",
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 40px -20px rgba(2,6,23,0.7)",
      },
      backgroundImage: {
        "grad-primary": "linear-gradient(135deg, #14B8A6 0%, #06B6D4 50%, #38BDF8 100%)",
        "grad-hero": "radial-gradient(1200px 500px at 10% -10%, rgba(20,184,166,0.18), transparent 60%), radial-gradient(900px 400px at 100% 0%, rgba(56,189,248,0.12), transparent 60%)",
        "grad-card": "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0))",
      },
      keyframes: {
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "ring-spin": { to: { transform: "rotate(360deg)" } },
        "fade-in": {
          from: { opacity: 0, transform: "translateY(6px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(20,184,166,0.45)" },
          "50%": { boxShadow: "0 0 0 12px rgba(20,184,166,0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-500px 0" },
          "100%": { backgroundPosition: "500px 0" },
        },
      },
      animation: {
        "scan-line": "scan-line 2.2s ease-in-out infinite",
        "ring-spin": "ring-spin 3s linear infinite",
        "fade-in": "fade-in 0.4s ease-out both",
        "pulse-glow": "pulse-glow 2.4s ease-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};
