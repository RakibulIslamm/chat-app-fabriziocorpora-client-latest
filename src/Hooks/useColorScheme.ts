import { useState, useEffect } from "react";
import tinycolor from "tinycolor2";
import { ReduxState, useSelector } from "../lib/redux/store";

interface ColorScheme {
	main: string;
	primary: string;
	secondary: string;
	textColor: string;
}

function useColorScheme(): ColorScheme {
	const { theme, themeColor } = useSelector((state: ReduxState) => state.theme);

	const darkPrimary = `hsl(${themeColor.h},21%,20%)`;
	const lightPrimary = `hsl(${themeColor.h},40%,85%)`;

	const darkSecondary = `hsl(${themeColor.h},25%,15%)`;
	const lightSecondary = `hsl(0,0%,100%)`;

	const darkTextColor = `hsl(0,0%,90%)`;
	const lightTextColor = `hsl(0,0%,20%)`;

	const [main, setMain] = useState<string>(tinycolor(themeColor).toHslString());
	const [primary, setPrimary] = useState<string>("");
	const [secondary, setSecondary] = useState<string>("");
	const [textColor, setTextColor] = useState<string>("");

	const storageColor = localStorage.getItem("theme-color");
	useEffect(() => {
		if (storageColor) {
			if (theme === "dark") {
				setMain(tinycolor(themeColor).toHslString());
				setPrimary(darkPrimary);
				setSecondary(darkSecondary);
				setTextColor(darkTextColor);
			} else {
				setMain(tinycolor(themeColor).toHslString());
				setPrimary(lightPrimary);
				setSecondary(lightSecondary);
				setTextColor(lightTextColor);
			}
		} else {
			if (theme === "dark") {
				setMain("hsl(155,99%,38%)");
				setPrimary("hsl(237,25%,18%)");
				setSecondary("hsl(240,25%,15%)");
				setTextColor("hsl(0,0%,100%)");
			} else if (theme === "light") {
				setMain("hsl(155,99%,38%)");
				setPrimary("hsl(0,0%,90%)");
				setSecondary("hsl(0,0%,100%)");
				setTextColor("hsl(0,0%,20%)");
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [theme, themeColor, storageColor]);

	return { main, primary, secondary, textColor };
}

export default useColorScheme;

/* 

const [baseColor, setBaseColor] = useState<string>(color);
	const [darkBg, setDarkBg] = useState<string>(
		tinycolor(color).isLight()
			? "#0000"
			: tinycolor(color).darken(45).toString()
	);
	const [lightBg, setLightBg] = useState<string>(
		tinycolor(color).lighten(80).toString()
	);
	const [textColor, setTextColor] = useState<string>(
		tinycolor(color).isLight() ? "#000" : "#fff"
	);


*/
