/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
        secondary: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        surface: {
          0:   "#ffffff",
          50:  "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card:    "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 6px rgba(0,0,0,0.08), 0 12px 32px rgba(13,148,136,0.12)",
        input:   "0 0 0 3px rgba(13,148,136,0.15)",
        btn:     "0 2px 8px rgba(13,148,136,0.30)",
        nav:     "0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)",
      },
      animation: {
        "fade-in":    "fadeIn 0.45s ease-out both",
        "slide-up":   "slideUp 0.4s ease-out both",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        float:        "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:    { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp:   { "0%": { opacity: "0", transform: "translateY(18px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        pulseSoft: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.6" } },
        float:     { "0%, 100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-8px)" } },
      },
    },
  },
  plugins: [],
};
