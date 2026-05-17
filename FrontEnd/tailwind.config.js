/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0284c7",       // Medical Blue
        secondary: "#64748b",     // Slate Gray
        surface: "#ffffff",       // Pure White
        'surface-variant': "#f8fafc", // Nền xám nhạt
        'on-surface': "#0f172a",  // Chữ xám đen
        success: "#10b981",       // Xanh lá 
        warning: "#f59e0b",       // Vàng
        error: "#ef4444",         // Đỏ
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}