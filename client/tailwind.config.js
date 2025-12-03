/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            keyframes: {
                glitch: {
                    "0%": { clipPath: "inset(0 0 0 0)" },
                    "10%": { clipPath: "inset(10% 0 85% 0)" },
                    "20%": { clipPath: "inset(85% 0 10% 0)" },
                    "30%": { clipPath: "inset(0 30% 0 0)" },
                    "40%": { clipPath: "inset(0 0 0 30%)" },
                    "50%": { clipPath: "inset(20% 0 60% 0)" },
                    "60%": { clipPath: "inset(0 60% 20% 0)" },
                    "70%": { clipPath: "inset(50% 0 30% 0)" },
                    "80%": { clipPath: "inset(0 40% 0 0)" },
                    "90%": { clipPath: "inset(0 0 40% 0)" },
                    "100%": { clipPath: "inset(0 0 0 0)" },
                },

                glitch2: {
                    "0%": { transform: "translate(0)" },
                    "20%": { transform: "translate(-2px, 2px)" },
                    "40%": { transform: "translate(-2px, -2px)" },
                    "60%": { transform: "translate(2px, 2px)" },
                    "80%": { transform: "translate(2px, -2px)" },
                    "100%": { transform: "translate(0)" },
                },
            },

            animation: {
                glitch: "glitch 1.2s infinite linear alternate-reverse",
                glitch2: "glitch2 0.8s infinite linear alternate-reverse",
            },
        },
    },
    plugins: [],
};
