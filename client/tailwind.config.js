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
        'pastel-pink': '#FEEAF2',
        'header': '#333333',
        'menu': '#F4F4F4',
        'button': '#7b4e5a',
        'options-bar': '#415D43',
        'supervisor-button': '#CBD5E1',
        'inputs': '#FCE8E6',
        'outputs': '#E0F2F1',
        'providers': '#FAF3F3',
        'delete-button': '#E53E3E',
        'update-button': '#2B6CB0',
      },
    },
  },
  plugins: [],
}

