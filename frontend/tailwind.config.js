/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm paper background — leans gold, not the generic AI cream (#F4F1EA)
        paper: {
          DEFAULT: '#FFFBF2',
          dim: '#FBF3DE',
        },
        // Near-black ink with an amber undertone instead of flat #111
        ink: {
          DEFAULT: '#241a08',
          soft: '#4a3a1c',
          faint: '#8a7757',
        },
        // Full amber ramp — the single brand color family, used for everything
        amber: {
          50: '#FFF8E7',
          100: '#FDEBC0',
          150: '#FCE3A3',
          200: '#FBDA8B',
          300: '#F8C34E',
          400: '#F2A91D',
          500: '#DB8C0C',
          600: '#B06D06',
          700: '#7A4A04',
          800: '#543202',
          900: '#2E1B01',
        },
        // Reserved sparingly: a signal red only for destructive/error states
        signal: '#C0392B',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 0 rgba(46,27,1,0.06), 0 18px 30px -12px rgba(83,50,2,0.35)',
        stack: '0 30px 40px -20px rgba(83,50,2,0.45)',
      },
      borderRadius: {
        card: '1.75rem',
      },
    },
  },
  plugins: [],
}
