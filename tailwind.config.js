/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        odl: {
          bg:            '#FFFFFF',
          surface:       '#F8F9FA',
          'surface-2':   '#F1F3F5',
          border:        '#E4E4E7',
          'border-strong':'#D4D4D8',
          text:          '#18181B',
          muted:         '#71717A',
          subtle:        '#A1A1AA',
          accent:        '#1870D5',
          'accent-hover':'#1559B0',
          'accent-light':'#3B82F6',
          'accent-bg':   '#EFF6FF',
          green:         '#16A34A',
          'green-bg':    '#F0FDF4',
          yellow:        '#CA8A04',
          'yellow-bg':   '#FEFCE8',
          red:           '#DC2626',
          'red-bg':      '#FEF2F2',
          orange:        '#EA580C',
          'orange-bg':   '#FFF7ED',
        },
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'Consolas', 'monospace'],
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '4px',
      },
    },
  },
  plugins: [],
}
