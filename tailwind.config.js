/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	darkMode: "class",
	theme: {
		height: (theme) => ({
			auto: "auto",
			...theme("spacing"),
			full: "100%",
			screen: "calc(var(--vh) * 100)",
		}),
		minHeight: (theme) => ({
			0: "0",
			...theme("spacing"),
			full: "100%",
			screen: "calc(var(--vh) * 100)",
		}),
		extend: {
			screens: {
				// xs: { max: "480px" },
				sm: { max: "599px" },
				md: { min: "600px", max: "1024px" },
				lg: { min: "1025px" },
			},
		},
	},
	// eslint-disable-next-line no-undef, @typescript-eslint/no-var-requires
	plugins: [require("tailwind-scrollbar")({ nocompatible: true })],
};
