import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lidl: "#0050AA",
        ah: "#00A0E2",
        warm: {
          bg: "#F5F3EE",
          card: "#FFFFFF",
          muted: "#E8E4DC",
          text: "#2D2926",
          subtle: "#9B9490",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.07), 0 0 1px rgba(0,0,0,0.05)",
        "card-lg": "0 4px 16px rgba(0,0,0,0.10), 0 0 1px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
