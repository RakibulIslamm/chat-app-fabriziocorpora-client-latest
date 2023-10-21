import { useEffect } from "react";
import Layout from "./Layout/Layout";
import { ReduxState, useDispatch, useSelector } from "./lib/redux/store";
import {
	setFontSize,
	setTheme,
	setThemeColor,
} from "./lib/redux/slices/theme/themeSlice";
import { isJSONValid } from "./utils/isValidJson";
import { socket } from "./utils/socket";
import useListenAuth from "./Hooks/useListenAuth";
import useColorScheme from "./Hooks/useColorScheme";

function App() {
	socket.connect();
	const { theme } = useSelector((state: ReduxState) => state.theme);
	const dispatch = useDispatch();
	useEffect(() => {
		const root = window.document.documentElement;
		root.removeAttribute("class");
		root.classList.add(theme);
	}, [theme]);

	useEffect(() => {
		if (typeof window !== "undefined") {
			window.addEventListener("resize", () => {
				const vh = window.innerHeight * 0.01;
				document.documentElement.style.setProperty("--vh", `${vh}px`);
			});

			const vh = window.innerHeight * 0.01;
			document.documentElement.style.setProperty("--vh", `${vh}px`);

			return () =>
				window.removeEventListener("resize", () => {
					const vh = window.innerHeight * 0.01;
					document.documentElement.style.setProperty("--vh", `${vh}px`);
				});
		}
	}, []);

	const getTheme = localStorage.getItem("theme");
	useEffect(() => {
		dispatch(setTheme(getTheme ? getTheme : "light"));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [getTheme]);

	const storageColor = localStorage.getItem("theme-color");
	const fontSize = localStorage.getItem("font-size");
	useEffect(() => {
		if (storageColor) {
			if (isJSONValid(storageColor)) {
				dispatch(setThemeColor(JSON.parse(storageColor)));
			} else {
				localStorage.removeItem("theme-color");
			}
		}
		if (fontSize) {
			dispatch(setFontSize(parseInt(fontSize)));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [storageColor, fontSize]);

	const isAuthListened = useListenAuth();

	const { primary, textColor } = useColorScheme();

	return !isAuthListened ? (
		<div
			style={{ background: primary }}
			className="w-full h-screen flex justify-center items-center"
		>
			<div
				style={{
					border: `1px solid ${textColor}`,
					borderTop: "transparent",
				}}
				className="animate-spin rounded-full h-20 w-20"
			></div>
		</div>
	) : (
		<Layout />
	);
}

export default App;
