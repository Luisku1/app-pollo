/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/react-tailwindcss-select/dist/index.esm.js"
  ],
  theme: {
    extend: {
      colors: {
        'pastel-pink': '#FEEAF2', // Tono de rosa pastel personalizado
        'header': '#333333',
        'menu': '#E4E4E4',
        'button': '#A36A63',
        'options-bar': '#415D43',
        'supervisor-button': '#CCCCCC',
        'inputs': '#FCE8E6',
        'outputs': '#E6F4F1',
        'providers': '#FAF3F3',
      },
    },
  },
  plugins: [],
}

