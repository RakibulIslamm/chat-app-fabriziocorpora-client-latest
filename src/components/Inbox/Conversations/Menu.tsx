import { useEffect } from "react";
import { ReduxState, useDispatch, useSelector } from "../../../lib/redux/store";
import { setTheme } from "../../../lib/redux/slices/theme/themeSlice";
import { IoSettingsSharp, IoMoon, IoExit } from "react-icons/io5";
import {
	openMenu,
	settingsOn,
} from "../../../lib/redux/slices/common/commonSlice";
import useColorScheme from "../../../Hooks/useColorScheme";
import tinycolor from "tinycolor2";
import { setCurrentUser } from "../../../lib/redux/slices/user/userSlice";
import { socket } from "../../../utils/socket";

const Menu = () => {
	const { theme } = useSelector((state: ReduxState) => state.theme);
	const { user } = useSelector((state: ReduxState) => state.user);
	const { menuOpen } = useSelector((state: ReduxState) => state.common);
	const dispatch = useDispatch();

	const handleSetTheme = () => {
		if (theme === "light") {
			dispatch(setTheme("dark"));
		} else {
			dispatch(setTheme("light"));
		}
	};

	useEffect(() => {
		dispatch(openMenu(false));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		document.body.addEventListener("click", (e) => {
			const target = e.target instanceof HTMLElement;
			if (
				target &&
				e.target.id !== "menu_container" &&
				!e.target.classList.contains("menu")
			) {
				dispatch(openMenu(false));
			}
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// if (e.target instanceof HTMLElement && e.target.id !== "menu_container") {
	// 	dispatch(openMenu(false));
	// }
	const { primary, textColor, main } = useColorScheme();
	const bg = tinycolor(primary).setAlpha(0.8).toRgbString();
	const border = tinycolor(main).setAlpha(0.2).toRgbString();

	return (
		// Theme color change here below
		<div
			style={{
				background: bg,
				color: textColor,
				border: `1px solid ${border}`,
			}}
			className={`p-[25px] backdrop-blur-[3px] w-[300px] md:w-full sm:w-full space-y-3 rounded-lg shadow font-semibold overflow-hidden ${
				menuOpen
					? "visible h-[170px] opacity-100 transition-all ease-in-out duration-300"
					: "invisible h-0 opacity-0"
			}`}
			id="menu_container"
		>
			<button
				onClick={() => dispatch(settingsOn(true))}
				className="w-full px-3 py-1 hover:bg-white dark:hover:bg-[#00000033] rounded flex items-center gap-2 menu"
			>
				<IoSettingsSharp className="text-xl menu" />
				Settings
			</button>
			<div className="w-full flex items-center justify-between px-3 py-1 menu">
				<button
					className="flex items-center gap-2 menu"
					onClick={handleSetTheme}
				>
					<IoMoon className="text-xl menu" />
					Night Mode
				</button>
				<button
					onClick={handleSetTheme}
					className={`w-[30px] h-4 rounded-full flex items-center ${
						theme === "dark"
							? "justify-end bg-green-500"
							: "justify-start bg-slate-700"
					} menu`}
				>
					<span className="w-3 h-3 bg-slate-50 rounded-full mx-[2px] transition-all ease-in-out menu"></span>
				</button>
			</div>
			<button
				onClick={() => {
					sessionStorage.removeItem("auth");
					dispatch(setCurrentUser(null));
					socket.emit("leavedUser", user?._id);
				}}
				className="w-full px-3 py-1 hover:bg-white dark:hover:bg-[#00000033] rounded text-left flex items-center gap-2 menu"
			>
				<IoExit className="text-xl menu" />
				Logout
			</button>
		</div>
	);
};

export default Menu;
