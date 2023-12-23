/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: {
          max: '360px',
        },

        sm: {
          max: '576px',
        },

        md: {
          max: '768px',
          min: '576px',
        },

        lg: {
          min: '768px',
          max: '1200px',
        },
        xl: {
          min: '1200px',
          max: '100vw',
        },
      },
      height: {
        main: '100vh',
      },
      colors: {
        'primary-color': '#4d9ac0',
        'primary-opacity-color': '#4d9ac0a2',
        'search-icon-color': 'rgba(22,24,35,.34)',
        'overlay-color': '#2b2b2b80',
        'grey-opa-color': 'rgba(34, 34, 34, 0.2)',
        'success-color': '#84ca93',
        'danger-color': '#f75a5b',
        'warning-color': '#FFA902',
      },
      minWidth: {
        main: 'calc(100vw - 350px)',
        'w-sidebar': '60px',
      },
      maxWidth: {
        main: 'calc(100vw - 60px)',
        'w-sidebar': '350px',
      },
      boxShadow: {
        'bottom-line': '0 2px 2px -2px rgba(84, 84, 84, 0.22);',
        fab: 'rgb(38, 57, 77) 0px 20px 30px -10px;',
      },
      spacing: {
        'header-height': '80px',
        'sidebar-width-collapse': '130px',
        'sidebar-width': '450px',
        'default-px': '24px',
        'search-sidebar-width': '450px',
        'search-sidebar-height': '60px',
        'search-button-sidebar-width': '52px',
        'pt-main': '2vw',
        'md-search-bar-width': '350px',
        'sm-search-bar-width': '250px',
        'md-search-bar-height': '50px',
        'sm-search-bar-height': '40px',
      },
      gridTemplateColumns: {
        'video-group': 'repeat(auto-fill, minmax(33.33%, 1fr))',
        'video-group-md': 'repeat(auto-fill, minmax(50%, 1fr))',
        'video-group-sm': 'repeat(auto-fill, minmax(100%, 1fr))',
      },
    },
  },
  plugins: [],
};
