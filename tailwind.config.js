/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        odl: {
          bg:             '#f9f6f1',   // sand
          surface:        '#f0ebe4',   // stone
          'surface-2':    '#e8e2d9',
          border:         '#ddd5ca',
          'border-strong':'#c8bfb4',
          text:           '#2a1f14',   // ink
          muted:          '#7a6555',   // ink-mid
          subtle:         '#a09082',   // ink-muted
          accent:         '#8b7355',   // bark
          'accent-hover': '#7a6447',
          'accent-light': '#b09a84',
          'accent-bg':    '#f5ede5',
          green:          '#2d6a4f',
          'green-bg':     '#f0f7f3',
          yellow:         '#92650a',
          'yellow-bg':    '#fdf8ee',
          red:            '#b91c1c',
          'red-bg':       '#fef3f2',
          orange:         '#c2410c',
          'orange-bg':    '#fff4ef',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans:    ['Inter Tight', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'Consolas', 'monospace'],
      },
      borderRadius: {
        card: '4px',
      },
    },
  },
  plugins: [],
}
