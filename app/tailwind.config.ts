import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/**/*.{js,ts,jsx,tsx,mdx}"
	],
	theme: {
		extend: {
			colors: {
				primary: {
					50: "#f8f4fd",
					100: "#f1e9fb",
					200: "#e4d3f7",
					300: "#d6bcf2",
					400: "#c8a5ed",
					500: "#b98ee8", // Your main light purple
					600: "#a177e3",
					700: "#8960dd",
					800: "#7149d8",
					900: "#5932d3",
					950: "#3d14cf"
				},
				secondary: {
					// A slightly contrasting purple
					50: "#f5f0ff",
					100: "#ede6ff",
					200: "#e1d1ff",
					300: "#d3bbff",
					400: "#c6a6ff",
					500: "#b891ff",
					600: "#ac7cff",
					700: "#9f66ff",
					800: "#924dff",
					900: "#8533ff",
					950: "#6b00ff"
				},
				accent: {
					// For highlights or buttons
					50: "#fff7f2",
					100: "#ffeee5",
					200: "#ffd5c8",
					300: "#ffbca0",
					400: "#ffa278",
					500: "#ff8950",
					600: "#ff7028",
					700: "#ff5700",
					800: "#e64400",
					900: "#cc3100",
					950: "#992200"
				}
			}
		}
	},
	plugins: []
};
export default config;
