/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Thème sombre (défaut) ──────────────────────────
        bg:    '#0C0A09',   // noir chaud principal
        s1:    '#131109',   // surface 1
        s2:    '#1A1710',   // surface 2 (cards)
        s3:    '#221E13',   // surface 3 (hover)
        s4:    '#2A2618',   // surface 4 (input)
        bord:  '#2E2A1A',   // bordure subtile
        bord2: '#3D3820',   // bordure visible

        // ── Or LOTISEC ─────────────────────────────────────
        gold: {
          DEFAULT: '#CFA237',
          light:   '#E8BB55',
          dark:    '#A67C20',
          muted:   '#6B5018',
          bg:      '#1F1A0A',
        },

        // ── Rouge urgence ──────────────────────────────────
        urg: {
          DEFAULT: '#E07E6B',
          light:   '#F0A090',
          dark:    '#C05A47',
          muted:   '#6B2E22',
          bg:      '#1F0E0A',
          red:     '#E07E6B',
          amber:   '#CFA237',
          green:   '#4CAF7D',
          blue:    '#5B9BD5',
        },

        // ── Togolais ───────────────────────────────────────
        togo: {
          green:  '#007A3D',
          yellow: '#CFA237',
          red:    '#E07E6B',
        },

        // ── Textes ─────────────────────────────────────────
        t1: '#F5F0E8',   // texte principal (blanc chaud)
        t2: '#9B9070',   // texte secondaire
        t3: '#4A4430',   // texte tertiaire

        // ── Thème clair ────────────────────────────────────
        light: {
          bg:    '#FDFAF5',
          s1:    '#F7F3EB',
          s2:    '#F0EAD8',
          bord:  '#E0D8C4',
          t1:    '#1A1209',
          t2:    '#5A4E35',
          t3:    '#8C7D5E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-urg':   'pulseUrg 1s ease-in-out infinite',
        'ripple-map':  'rippleMap 2s ease-out infinite',
        'zoom-in':     'zoomIn 0.6s cubic-bezier(0.16,1,0.3,1)',
        'fade-up':     'fadeUp 0.4s ease-out',
        'scan-line':   'scanLine 2s linear infinite',
      },
      keyframes: {
        pulseUrg: {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%':     { opacity: '0.4', transform: 'scale(0.8)' },
        },
        rippleMap: {
          '0%':   { width: '14px', height: '14px', opacity: '0.8' },
          '100%': { width: '60px', height: '60px', opacity: '0' },
        },
        zoomIn: {
          '0%':   { transform: 'scale(0.5)', opacity: '0' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        fadeUp: {
          '0%':   { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',   opacity: '1' },
        },
        scanLine: {
          '0%':   { top: '0%' },
          '100%': { top: '100%' },
        },
      },
    },
  },
  plugins: [],
};