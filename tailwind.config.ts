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
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        popover: "0 4px 12px 0 rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;

