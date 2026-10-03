import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Hostinger-inspired Dark Cosmic Palette
        cosmic: {
          midnight: "#0c0d0d",
          violet: "#181126",
          purple: "#673de6",
          "purple-hover": "#542bc7",
          lavender: "#a98cf1",
          "lavender-light": "#e4dcfa",
          surface: "#1f1733",
          border: "#2d2247",
        },
        // Light Mode Catalog & Body Palette
        catalog: {
          bg: "#ffffff",
          slate: "#f8fafc",
          border: "#e2e8f0",
          card: "#ffffff",
          muted: "#64748b",
          heading: "#0f172a",
        },
        // Cryptographic Verification Badges
        cns: {
          fips: "#10b981", // Emerald green (FIPS Verified)
          rfc: "#673de6",  // Electric purple (RFC Compliant)
          tamper: "#ef4444", // Crimson red (Tamper Detected)
          warning: "#f59e0b",
        },
        vault: {
          bg: "#F7F7F5",
          surface: "#FFFFFF",
          subtle: "#FAFAF9",
          card: "#FFFFFF",
          border: "#E7E7E4",
          "border-subtle": "#EFEFED",
          primary: "#171717",
          secondary: "#6B6B6B",
          tertiary: "#8E8E8E",
          navy: "#0F172A",
          charcoal: "#18181B",
          success: "#16845B",
          "success-subtle": "#EBF7EE",
          warning: "#B7791F",
          "warning-subtle": "#FEF8EC",
          danger: "#C44536",
          "danger-subtle": "#FDF2F1",
        },
      },
      fontFamily: {
        sans: [
          "DM Sans",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "8px",
        lg: "10px",
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        popover: "0 4px 12px 0 rgba(0, 0, 0, 0.08)",
        cosmic: "0 10px 30px -10px rgba(103, 61, 230, 0.3)",
        "cosmic-lg": "0 20px 40px -15px rgba(103, 61, 230, 0.4)",
      },
    },
  },
  plugins: [],
};
export default config;

