module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 900: '#0A1628', 800: '#0D1B2A', 700: '#1A2744', 600: '#1E3A5F' },
        amber: { DEFAULT: '#FF9933', dark: '#E8861A', light: '#FFB366' },
        emerald: { verify: '#10B981' },
        red: { fraud: '#E53935' },
        cream: '#FAFAF5'
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: [],
}
