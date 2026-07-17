/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0A0F14",
          900: "#0E1620",
          800: "#121A26",
          700: "#1A2432",
          600: "#26333F",
        },
        mist: {
          100: "#EAF2F1",
          300: "#B7C4C6",
          500: "#7C8B93",
        },
        scan: {
          400: "#4CE9CE",
          500: "#17E9C0",
          600: "#0FBFA0",
        },
        clinic: {
          coral: "#FF6B4A",
          amber: "#F5B94A",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px 0 rgba(23, 233, 192, 0.25)",
      },
      keyframes: {
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "ring-spin": {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "scan-line": "scan-line 2.2s ease-in-out infinite",
        "ring-spin": "ring-spin 3s linear infinite",
      },
    },
  },
  plugins: [],
};
