/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit", // Enable JIT mode for smaller builds
  purge: {
    enabled: true,
    content: ["./src/**/*.{html,ts,css,scss,sass,less}"],
    // Safelist classes that might be generated dynamically
    safelist: [],
  },
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
