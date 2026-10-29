import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#f7f9fb",
        surface: "#ffffff",
        "surface-muted": "#eceef0",
        ink: "#191c1e",
        muted: "#5b6673",
        line: "#dde2e8",
        primary: {
          DEFAULT: "#0059a4",
          dark: "#004785",
          bright: "#0072ce",
          soft: "#d4e3ff",
        },
        secondary: {
          DEFAULT: "#a63b00",
          bright: "#fc6c29",
          soft: "#ffdbce",
        },
        success: "#0f7a4b",
        warning: "#b45309",
        danger: "#ba1a1a",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "ui-sans-serif", "system-ui", "sans-serif"],
        arabic: ["var(--font-arabic)", "var(--font-jakarta)", "Tahoma", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(16, 24, 40, 0.04), 0 8px 24px rgba(16, 24, 40, 0.06)",
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
