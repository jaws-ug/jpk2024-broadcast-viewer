import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
    screens: {
      sm: '0px', // sm : Phone 575 - 0 px
      md: '576px', // md : Tablet 991 - 576 px
      lg: '992px', // lg : PC 1439 - 992 px
      xl: '1440px', // xl : 1440 - ∞ px
      '2xl': '1441px',
    },
  },
  plugins: [],
};
export default config;
