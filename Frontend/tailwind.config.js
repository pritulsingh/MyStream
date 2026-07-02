/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#0d0f14",
        panel: "#151922",
        line: "#252b36",
        flame: "#ff5a3d",
        gold: "#ffbf47",
        aqua: "#48d6c8"
      },
      boxShadow: {
        glow: "0 20px 80px rgba(255, 90, 61, 0.18)"
      }
    }
  },
  plugins: []
}
