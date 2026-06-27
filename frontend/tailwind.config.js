/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: "#003366",
          saffron: "#FF9933",
          green: "#138808",
          page: "#EEEEEE",
          border: "#CCCCCC",
          link: "#004b8d",
        },
        navy: {
          DEFAULT: "#003366",
          900: "#003366",
          700: "#004080",
        },
        saffron: {
          DEFAULT: "#FF9933",
          600: "#E68900",
        },
        cream: "#F5F5F5",
        welfare: {
          health: "#0F766E",
          education: "#1D4ED8",
          housing: "#7C3AED",
          agriculture: "#15803D",
          finance: "#B45309",
          insurance: "#0369A1",
          welfare: "#9D174D",
          employment: "#1E40AF",
          skill: "#6D28D9",
        },
      },
      fontFamily: {
        sans: ['"Open Sans"', "Arial", "Helvetica", "sans-serif"],
        devanagari: ['"Noto Sans Devanagari"', '"Open Sans"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
