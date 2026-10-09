/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FFEDB9",
        amber: "#FFCB56",
        orange: "#FFA259",
        coral: "#FF7E7E",
        ink: {
          DEFAULT: "#1F1B16",
          muted: "#6B6459",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          warm: "#FFFDF7",
          border: "#F1E7CC",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(31, 27, 22, 0.05), 0 1px 4px -1px rgba(31, 27, 22, 0.03)',
        'soft': '0 4px 20px -2px rgba(31, 27, 22, 0.06), 0 2px 6px -1px rgba(31, 27, 22, 0.03)',
        'soft-lg': '0 10px 30px -4px rgba(31, 27, 22, 0.08), 0 4px 12px -2px rgba(31, 27, 22, 0.04)',
      },
    },
  },
  plugins: [],
}
