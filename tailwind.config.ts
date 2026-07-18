import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        olive: {
          DEFAULT: "#616d4e",
          50: "#f3f4f0",
          100: "#e4e7dc",
          300: "#a8b096",
          500: "#616d4e",
          700: "#4a533b",
          900: "#333a29",
        },
        cream: {
          DEFAULT: "#f6f4f0",
          100: "#fdfcfb",
        },
        pink: {
          DEFAULT: "#e3b4c7",
          50: "#faf0f4",
          300: "#edcbd9",
          500: "#e3b4c7",
          700: "#c98aa4",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "sans-serif"],
        // Elegant serif accent for headlines and brand wordmarks only.
        display: ["var(--font-display)", "serif"],
      },
      boxShadow: {
        // Layered ambient + contact shadows, instead of a single flat blur.
        soft: "0 1px 2px rgba(51,58,41,0.05), 0 10px 26px -10px rgba(97,109,78,0.20)",
        card: "0 2px 4px rgba(51,58,41,0.05), 0 20px 44px -14px rgba(97,109,78,0.26)",
        premium: "0 4px 10px rgba(51,58,41,0.08), 0 30px 60px -16px rgba(97,109,78,0.32)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          from: { opacity: "0", transform: "translateY(-12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeInLeft: {
          from: { opacity: "0", transform: "translateX(-16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.94) translateY(8px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.85)" },
          "70%": { opacity: "1", transform: "scale(1.03)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "50%": { transform: "translateY(-16px) translateX(8px)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(14px) scale(1.05)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        spinSlow: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        gradientX: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        countUp: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in-up": "fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in-down": "fadeInDown 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in-left": "fadeInLeft 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "scale-in": "scaleIn 0.25s cubic-bezier(0.16,1,0.3,1) both",
        "pop-in": "popIn 0.5s cubic-bezier(0.16,1,0.3,1) both",
        float: "float 7s ease-in-out infinite",
        "float-slow": "floatSlow 11s ease-in-out infinite",
        shimmer: "shimmer 1.6s ease-in-out infinite",
        "spin-slow": "spinSlow 3.2s linear infinite",
        "gradient-x": "gradientX 6s ease infinite",
        wiggle: "wiggle 0.5s ease-in-out",
        "count-up": "countUp 0.5s cubic-bezier(0.16,1,0.3,1) both",
      },
      backgroundSize: {
        "shimmer-size": "800px 100%",
      },
    },
  },
  plugins: [],
};
export default config;
