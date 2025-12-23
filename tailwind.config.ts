import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        primary: {
          DEFAULT: "#DC2626", // Money Heist red - lebih bold
          dark: "#991B1B",
          light: "#EF4444",
          accent: "#FEE2E2",
        },
        card: {
          DEFAULT: "rgba(0, 0, 0, 0.9)",
          border: "rgba(220, 38, 38, 0.5)",
        },
        glow: {
          red: "rgba(220, 38, 38, 0.6)",
        },
        moneyHeist: {
          red: "#DC2626",
          darkRed: "#991B1B",
          lightRed: "#EF4444",
          black: "#0A0A0A",
          darkGray: "#1F1F1F",
        },
      },
      fontFamily: {
        heading: ["Orbitron", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        "glow-red": "0 0 20px rgba(220, 38, 38, 0.6), 0 0 40px rgba(220, 38, 38, 0.3)",
        "glow-red-lg": "0 0 40px rgba(220, 38, 38, 0.8), 0 0 80px rgba(220, 38, 38, 0.4)",
        "card-gaming": "0 4px 20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(220, 38, 38, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        "card-gaming-hover": "0 8px 30px rgba(220, 38, 38, 0.4), 0 0 0 1px rgba(220, 38, 38, 0.5)",
      },
      animation: {
        "pulse-glow": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "count-up": "countUp 1s ease-out",
      },
      keyframes: {
        countUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

