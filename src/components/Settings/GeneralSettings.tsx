import { FiArrowLeft } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { generalSettingsOn } from "../../lib/redux/slices/settings/settingsSlice";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { ReduxState, useSelector } from "../../lib/redux/store";
import { setFontSize, setTheme } from "../../lib/redux/slices/theme/themeSlice";
import useColorScheme from "../../Hooks/useColorScheme";

const GeneralSettings = () => {
	const { theme, fontSize } = useSelector((state: ReduxState) => state.theme);
	const dispatch = useDispatch();

	const { textColor } = useColorScheme();
	// const bg = tinycolor(main).setAlpha(1).toRgbString();

	return (
		<div className="px-[20px]" style={{ color: textColor }}>
			<div className="w-full flex items-center gap-4 h-[75px]">
				<button onClick={() => dispatch(generalSettingsOn(false))}>
					<FiArrowLeft className="text-[25px]" />
				</button>

				<h2 className="text-[20px] font-medium">General Settings</h2>
			</div>

			<div className="mt-4 px-4">
				<div className="w-[80%]">
					<p className="text-lg font-medium">Message font size: {fontSize}</p>
					<Slider
						// trackStyle={{ background: bg }}
						// handleStyle={{ background: bg }}
						min={12}
						step={1}
						defaultValue={fontSize}
						max={23}
						onChange={(nextValues) => {
							dispatch(setFontSize(nextValues));
							localStorage.setItem("font-size", nextValues.toString());
						}}
					/>
				</div>

				<div className="mt-5">
					<p className="text-lg font-medium mb-2">Theme</p>
					<div className="flex flex-col gap-4">
						<div className="flex items-center">
							<input
								checked={theme === "dark"}
								id="dark"
								type="radio"
								value="dark"
								name="radio-btn"
								className="w-5 h-5 accent-[#4B4B4B] cursor-pointer"
								onChange={() => dispatch(setTheme("dark"))}
							/>
							<label
								htmlFor="dark"
								className="ml-2 text-sm font-medium cursor-pointer"
							>
								Dark
							</label>
						</div>
						<div className="flex items-center">
							<input
								checked={theme === "light"}
								id="light"
								type="radio"
								value="light"
								name="radio-btn"
								className="w-5 h-5 accent-[#4B4B4B] cursor-pointer"
								onChange={() => dispatch(setTheme("light"))}
							/>
							<label
								htmlFor="light"
								className="ml-2 text-sm font-medium cursor-pointer"
							>
								Light
							</label>
						</div>
						{/* <div className="flex items-center">
							<input
								checked={theme === "system"}
								id="system"
								type="radio"
								value="system"
								name="radio-btn"
								className="w-5 h-5 accent-[#4B4B4B] cursor-pointer"
								onChange={() => dispatch(setTheme("system"))}
							/>
							<label
								htmlFor="system"
								className="ml-2 text-sm font-medium text-gray-900 cursor-pointer"
							>
								System
							</label>
						</div> */}
					</div>
				</div>
			</div>
		</div>
	);
};

export default GeneralSettings;
