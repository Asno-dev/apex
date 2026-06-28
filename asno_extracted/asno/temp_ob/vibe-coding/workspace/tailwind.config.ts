import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          500: '#6f4e37',
          600: '#5d402e',
          700: '#4b3325',
        }
      }
    },
  },
  plugins: [],
};
export default config;