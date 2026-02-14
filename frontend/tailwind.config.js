/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Overriding Blue with "Light Brown/Camel" tones
                blue: {
                    50: '#faf7f5',
                    100: '#f5efe9',
                    200: '#ebdcd3',
                    300: '#dfc3b5',
                    400: '#d4b096',
                    500: '#c19a6b', // Camel / Light Brown
                    600: '#a98054',
                    700: '#8f6840',
                    800: '#71553c',
                    900: '#563429',
                    950: '#2f1a14',
                },
                // Mapping Purple to the same Brown palette to unify the theme
                purple: {
                    50: '#faf7f5',
                    100: '#f5efe9',
                    200: '#ebdcd3',
                    300: '#dfc3b5',
                    400: '#d4b096',
                    500: '#c19a6b',
                    600: '#a98054',
                    700: '#8f6840',
                    800: '#71553c',
                    900: '#563429',
                    950: '#2f1a14',
                },
                // Mapping Indigo to the same Brown palette to fix Profile gradients
                indigo: {
                    50: '#faf7f5',
                    100: '#f5efe9',
                    200: '#ebdcd3',
                    300: '#dfc3b5',
                    400: '#d4b096',
                    500: '#c19a6b',
                    600: '#a98054',
                    700: '#8f6840',
                    800: '#71553c',
                    900: '#563429',
                    950: '#2f1a14',
                },
                // Overriding Gray with "Warm Earth/Beige" tones
                gray: {
                    50: '#fdfbf7', // Global Background
                    100: '#f7f3ec',
                    200: '#ebe3d5',
                    300: '#dcd1bb',
                    400: '#cbb6a0',
                    500: '#bba48b',
                    600: '#af8c73',
                    700: '#8e6f5a',
                    800: '#745a4b',
                    900: '#614d40',
                    950: '#3E2C22',
                }
            }
        },
    },
    plugins: [],
}
