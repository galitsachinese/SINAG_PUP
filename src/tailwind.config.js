/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      container: {
        center: false,
      },
      maxWidth: {
        none: 'none',
      },

      /* =========================
         🔥 MOVING GRADIENT ANIMATION
      ========================= */
      backgroundSize: {
        '200%': '200% 200%',
      },
      keyframes: {
        gradientMove: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        gradient: 'gradientMove 8s ease infinite',
      },
    },
  },

  /* =========================
     🔧 TOOLTIP UTILITIES
  ========================= */
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.tooltip': {
          position: 'absolute',
          bottom: '130%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#1f2937', // gray-800
          color: '#ffffff',
          padding: '4px 8px',
          fontSize: '12px',
          borderRadius: '4px',
          whiteSpace: 'nowrap',
          opacity: '0',
          pointerEvents: 'none',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
          zIndex: '50',
        },
        '.group:hover .tooltip': {
          opacity: '1',
          transform: 'translateX(-50%) translateY(-4px)',
        },
      });
    },
  ],
};
