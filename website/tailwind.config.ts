import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        yellow: "#fece00",
        blue: "#00adb5",
        black: "#222831",
        white: "#fff",
      },
    },
  },
  plugins: [require("daisyui")],
} satisfies Config;
