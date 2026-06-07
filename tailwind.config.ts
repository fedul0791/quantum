import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: { DEFAULT: '#070B12', deep: '#040810', elevated: '#0A1020' },
        surface: { DEFAULT: '#101826', hover: '#162032', active: '#1A2636', glass: 'rgba(16, 24, 38, 0.8)' },
        accent: { DEFAULT: '#00E5D4', hover: '#37FFF1', muted: 'rgba(0, 229, 212, 0.15)', glow: 'rgba(0, 229, 212, 0.3)' },
        secondary: { DEFAULT: '#1E2B3D', hover: '#263448', muted: '#152130' },
        text: { primary: '#F5F7FA', secondary: '#8FA3B8', muted: '#5C728A', inverse: '#070B12' },
        success: { DEFAULT: '#00E5A0', muted: 'rgba(0, 229, 160, 0.15)' },
        danger: { DEFAULT: '#FF4757', muted: 'rgba(255, 71, 87, 0.15)' },
        warning: { DEFAULT: '#FFA502', muted: 'rgba(255, 165, 2, 0.15)' },
        info: { DEFAULT: '#3742FA', muted: 'rgba(55, 66, 250, 0.15)' },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
