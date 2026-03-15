import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
        serif: ["IBM Plex Serif", "Georgia", "serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      colors: {
        sky: {
          lightest: "#E0F6FF",
          light: "#B3E5FC",
          medium: "#87CEEB",
          accent: "#4A90D9",
          dark: "#1a1a2e",
          "dark-accent": "#2d2d44",
        },
        status: {
          verified: "#1a5f4a",
          declared: "#2563eb",
          degraded: "#b45309",
          violated: "#b91c1c",
          unverifiable: "#7c3aed",
        },
        "status-bg": {
          verified: "#ecfdf5",
          declared: "#eff6ff",
          degraded: "#fffbeb",
          violated: "#fef2f2",
          unverifiable: "#f5f3ff",
        },
      },
      screens: {
        mobile: "480px",
        tablet: "768px",
        desktop: "1024px",
        wide: "1200px",
      },
    },
  },
  plugins: [],
};

export default config;
