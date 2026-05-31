export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        prime: {
          black: '#1A1A1A',
          gold: '#C9A961',
          red: '#B33A3A',
          gray: '#F5F5F5'
        }
      },
      boxShadow: {
        soft: '0 16px 40px rgba(26, 26, 26, 0.08)'
      }
    }
  },
  plugins: []
};
