/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Fond
        bg:    '#060B14',
        s1:    '#0A1020',
        s2:    '#0F1729',
        s3:    '#162035',
        bord:  '#1E2D47',
        bord2: '#243450',
        // Couleurs togolaises
        togo: {
          green:  '#007A3D',
          yellow: '#FFCD00',
          red:    '#D21034',
        },
        // Urgences
        urg: {
          red:    '#E8192C',
          amber:  '#F59E0B',
          green:  '#00A84F',
          blue:   '#3B82F6',
        },
        // Textes
        t1: '#F0F4FF',
        t2: '#8B98B5',
        t3: '#3D4F6B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};