import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        primary: {
          DEFAULT: "#EF6522",
          light: "#FF4B2F",
          muted: "#F6F6F6AD",
          gradient: "linear-gradient(229.01deg, #EF6522 -30.81%, rgba(235, 235, 235, 0.18) 121.96%)",
        },
        secondary: {
          DEFAULT: "#6E6E6E",
          light: "#CACBCF",
          dark: "#4D4D4D1A",
          alt: "#D9D9D9",
        },
        dark: {
          900: "#000000",
          800: "#05121B",
          700: "#122026",
          600: "#151D2B",
        },
        white: {
          DEFAULT: "#FFFFFF",
          soft: "#FFFFFF4D",
          softer: "#FFFFFF47",
        },
        accent: {
          green: "#008C2C",
          red: "#FF0000",
          blue: "#3884FF",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
