import { useState, useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { chatSettingsOn } from "../../lib/redux/slices/settings/settingsSlice";
import { ReduxState, useDispatch } from "../../lib/redux/store";
import { HslColorPicker } from "react-colorful";
import { useSelector } from "react-redux";
import { useDebouncedCallback } from "use-debounce";
import { setThemeColor } from "../../lib/redux/slices/theme/themeSlice";
import useColorScheme from "../../Hooks/useColorScheme";
import tinycolor from "tinycolor2";

const ChatSettings = () => {
	const { themeColor } = useSelector((state: ReduxState) => state.theme);
	const [open, setOpen] = useState(false);
	const [color, setColor] = useState(themeColor);
	const dispatch = useDispatch();

	const colors = [
		"hsl(270,100%,34%)",
		"hsl(172,100%,38%)",
		"hsl(0,68%,46%)",
		"hsl(209,100%,38%)",
	];

	const debounced = useDebouncedCallback((value) => {
		setColor(value);
		dispatch(setThemeColor(value));
		localStorage.setItem("theme-color", JSON.stringify(value));
	}, 1000);

	const { textColor } = useColorScheme();

	useEffect(() => {
		// document.body.addEventListener("click", (e) => {
		// 	const target = e.target instanceof HTMLElement;
		// 	if (target && e.target.id !== "color-picker") {
		// 		setOpen(false);
		// 	}
		// });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleThemeChange = (color: string) => {
		const hsl = tinycolor(color).toHsl();
		dispatch(setThemeColor(hsl));
		localStorage.setItem("theme-color", JSON.stringify(hsl));
	};

	const resetTheme = () => {
		localStorage.removeItem("theme-color");
		dispatch(setThemeColor({ h: 0, s: 0, l: 0 }));
	};

	return (
		<div className="px-[20px]" style={{ color: textColor }}>
			<div className="w-full flex items-center gap-4 h-[75px]">
				<button onClick={() => dispatch(chatSettingsOn(false))}>
					<FiArrowLeft className="text-[25px] " />
				</button>

				<h2 className="text-[20px] font-medium">Chat Settings</h2>
			</div>

			<div className="mt-4 px-4 space-y-4 w-full">
				<div className="w-full">
					<p className="text-lg font-medium">Theme Color</p>
					<div className="w-full py-3 flex flex-wrap gap-4">
						{colors.map((color, idx) => (
							<div
								className={`w-6 h-6 rounded-full ${
									tinycolor(color).toHslString() ===
										tinycolor(themeColor).toHslString() && "outline"
								} outline-offset-2 outline-gray-400 cursor-pointer`}
								key={idx}
								style={{
									backgroundColor: color,
								}}
								onClick={() => handleThemeChange(color)}
							></div>
						))}
						<div
							onClick={() => setOpen(!open)}
							className={`w-6 h-6 rounded-full cursor-pointer relative`}
							style={{
								backgroundColor: `hsl(${color.h}, ${color.s}%, ${color.l}%)`,
							}}
						>
							<AiOutlinePlusCircle className=" absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white opacity-40" />
						</div>
					</div>
					{open && (
						<HslColorPicker
							id="color-picker"
							color={color}
							onChange={debounced}
						/>
					)}
					<button onClick={resetTheme} className="pt-8 text-sm font-light">
						Reset Theme
					</button>
				</div>
			</div>
		</div>
	);
};

export default ChatSettings;
