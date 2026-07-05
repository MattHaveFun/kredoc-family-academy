/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#04070d',
          900: '#060a12',
          850: '#0a101c',
          800: '#0d1524',
          700: '#15203a',
          600: '#1e2c4a',
        },
        up: '#2dd4a7',
        down: '#ff6b7f',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        panel:
          'inset 0 1px 0 rgba(148, 163, 184, 0.07), 0 24px 48px -24px rgba(0, 0, 0, 0.7)',
        card: 'inset 0 1px 0 rgba(148, 163, 184, 0.06), 0 16px 40px -20px rgba(0, 0, 0, 0.8)',
        'glow-accent':
          '0 0 0 1px rgba(56, 189, 248, 0.28), 0 0 36px -8px rgba(56, 189, 248, 0.4), 0 24px 48px -24px rgba(0, 0, 0, 0.7)',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'ticker-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        draw: {
          '0%': { 'stroke-dashoffset': '1' },
          '100%': { 'stroke-dashoffset': '0' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.25' },
        },
        'node-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        ticker: 'ticker 55s linear infinite',
        'ticker-fast': 'ticker 42s linear infinite',
        'ticker-slow': 'ticker-reverse 78s linear infinite',
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.6s ease both',
        draw: 'draw 1.2s cubic-bezier(0.65, 0, 0.35, 1) both',
        blink: 'blink 1.6s ease-in-out infinite',
        'node-float': 'node-float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
