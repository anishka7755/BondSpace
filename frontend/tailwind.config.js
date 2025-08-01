/** @type {import('tailwindcss').Config} */
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(240, 5%, 84%)", // ← define a custom 'border' color
      },
    },
  },
  plugins: [],
};
