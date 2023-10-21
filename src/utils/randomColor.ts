import tinycolor from "tinycolor2";

const colors = [
	"#" + Math.floor(Math.random() * 16777215).toString(16),
	"#" + Math.floor(Math.random() * 16777215).toString(16),
	"#" + Math.floor(Math.random() * 16777215).toString(16),
	"#" + Math.floor(Math.random() * 16777215).toString(16),
	"#" + Math.floor(Math.random() * 16777215).toString(16),
];

export const getRandomColor = () => {
	const color = colors[Math.ceil(Math.random() * 4)];
	const hsl = tinycolor(color).toHsl();
	const hslColorString = `hsl(${parseInt(`${hsl.h}`)},100%,40%)`;
	return hslColorString;
};
