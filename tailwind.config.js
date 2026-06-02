/** @type {import('tailwindcss').Config} */
const ch = (v) => `rgb(var(${v}) / <alpha-value>)`

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#0A84FF', soft: 'rgba(10,132,255,0.12)' },
        ink: ch('--bg-rgb'),
        card: ch('--card-rgb'),
        card2: ch('--card2-rgb'),
        line: ch('--line-rgb'),
        fg: ch('--fg-rgb'),
        muted: ch('--muted-rgb'),
        subtle: ch('--subtle-rgb'),
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { xl: '1rem', '2xl': '1.25rem' },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.2,0.7,0.2,1) both',
        'scale-in': 'scale-in 0.25s ease-out both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
