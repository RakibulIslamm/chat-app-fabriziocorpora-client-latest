import { Outlet } from "react-router-dom";
import useColorScheme from "../../Hooks/useColorScheme";
import { IoMoon, IoSunny } from "react-icons/io5";
import { ReduxState, useDispatch, useSelector } from "../../lib/redux/store";
import { setTheme } from "../../lib/redux/slices/theme/themeSlice";

const PublicLayout = () => {
	const { primary, textColor, main } = useColorScheme();
	const { theme } = useSelector((state: ReduxState) => state.theme);
	const dispatch = useDispatch();
	return (
		<div
			style={{ background: primary, color: textColor }}
			className="w-full max-w-[1920px] mx-auto h-screen min-h-[400px]"
		>
			<div className="w-full flex justify-end sm:justify-center px-[80px]">
				<div className="flex items-center gap-2 h-[50px]">
					<button
						onClick={() => dispatch(setTheme("dark"))}
						style={{ background: `${theme === "dark" ? main : ""}` }}
						className="p-2 rounded-full"
					>
						<IoMoon className="text-xl" />
					</button>
					<button
						onClick={() => dispatch(setTheme("light"))}
						style={{
							background: `${theme === "light" ? main : ""}`,
							color: "white",
						}}
						className="p-2 rounded-full"
					>
						<IoSunny className="text-xl" />
					</button>
				</div>
			</div>
			<div className="w-full h-[calc(100%_-_50px)] -mt-10">
				<Outlet />
			</div>
		</div>
	);
};

export default PublicLayout;
