import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "brand-blue": "rgb(var(--brand-blue) / <alpha-value>)",
        "brand-navy": "rgb(var(--brand-navy) / <alpha-value>)",
        "brand-orange": "rgb(var(--brand-orange) / <alpha-value>)",
        slate: "rgb(var(--slate) / <alpha-value>)",
        background: "rgb(var(--surface) / <alpha-value>)",
        surface: "rgb(var(--white) / <alpha-value>)",
        "surface-muted": "#EEF2F6",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--slate) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--brand-blue) / <alpha-value>)",
          dark: "rgb(var(--brand-navy) / <alpha-value>)",
          bright: "rgb(var(--accent-bright, 8 118 190) / <alpha-value>)",
          soft: "rgb(var(--accent-soft, 234 242 249) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "#a63b00",
          bright: "rgb(var(--brand-orange) / <alpha-value>)",
          soft: "rgb(var(--orange-soft, 255 219 206) / <alpha-value>)",
        },
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#DC2626",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "ui-sans-serif", "system-ui", "sans-serif"],
        arabic: ["var(--font-arabic)", "var(--font-jakarta)", "Tahoma", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15,23,42,.06), 0 12px 32px -8px rgba(15,23,42,.12)",
        lift: "0 18px 50px rgba(16, 24, 40, 0.14)",
        glow: "0 0 0 1px rgba(0, 114, 206, 0.12), 0 16px 40px rgba(0, 89, 164, 0.18)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
