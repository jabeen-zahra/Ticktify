/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        accent:      '#CBFF47',
        'accent-dim':'#9FCC2E',
        'bg-primary':   '#08090F',
        'bg-secondary': '#0A0C14',
        'bg-card':      '#0D1117',
        'bg-elevated':  '#131929',
        'text-primary': '#F0F4FF',
        'text-secondary':'#8892A4',
        'text-muted':   '#4A5568',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"','sans-serif'],
        body:    ['"DM Sans"','sans-serif'],
      },
      screens: {
        xs: '480px',
      },
    },
  },
  plugins: [],
}
