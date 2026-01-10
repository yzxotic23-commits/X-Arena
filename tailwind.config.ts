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
          DEFAULT: "#E60012", // Nintendo Red - Super Mario theme
          dark: "#CC0000",
          light: "#FF1A2E",
          accent: "#FFE5E8",
        },
        mario: {
          red: "#E60012",
          blue: "#0066CC",
          yellow: "#FFD700",
          green: "#00A859",
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
        heading: ["Poppins", "sans-serif"],
        body: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        "glow-red": "0 0 12px rgba(220, 38, 38, 0.25), 0 0 24px rgba(220, 38, 38, 0.15)",
        "glow-red-lg": "0 0 20px rgba(220, 38, 38, 0.3), 0 0 40px rgba(220, 38, 38, 0.2)",
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

