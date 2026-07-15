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
    },
  },
  plugins: [],
};
export default config;
