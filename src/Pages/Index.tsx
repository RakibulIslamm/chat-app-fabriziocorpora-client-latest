import { ReduxState, useSelector } from "../lib/redux/store";
import Conversations from "../components/Inbox/Conversations/Conversations";
import { Outlet, useMatch } from "react-router-dom";
import NewGroup from "../components/NewChatOptions/NewGroup/NewGroup";
import NewChat from "../components/NewChatOptions/NewChat/NewChat";
import SettingsContainer from "../components/Settings/SettingsContainer";
import useColorScheme from "../Hooks/useColorScheme";
import tinycolor from "tinycolor2";
import { socket } from "../utils/socket";
import { useEffect } from "react";

// type Props = {};

const Index = () => {
	const { conversations, newChat, newGroup, settings } = useSelector(
		(state: ReduxState) => state.common
	);
	const { user } = useSelector((state: ReduxState) => state.user);
	// const { user } = useSelector((state: ReduxState) => state.user);
	const match = useMatch("/messages/:id");
	const { primary, secondary } = useColorScheme();
	const bg = tinycolor(secondary).setAlpha(0.8).toRgbString();

	useEffect(() => {
		const interval = setInterval(() => {
			if (socket.disconnected) {
				socket.connect();
				socket.emit("new_user", user?._id);
			}
		}, 30000);
		return () => clearInterval(interval);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		// theme color here below
		<div
			style={{ background: `${primary}` }}
			className={`w-full h-full flex overflow-hidden`}
		>
			{/* Theme color change here below */}
			<div
				style={{ backgroundColor: bg }}
				className={`lg:w-[390px] md:w-[290px] sm:w-full ${
					match?.params ? "sm:hidden" : "sm:block"
				} relative z-10`}
			>
				{conversations && !newChat && !newGroup && !settings && (
					<Conversations />
				)}
				{!conversations && !newChat && !settings && newGroup && <NewGroup />}
				{!conversations && !newGroup && !settings && newChat && <NewChat />}
				{settings && <SettingsContainer />}
			</div>
			<div
				className={`lg:w-[calc(100%_-_390px)] md:w-[calc(100%_-_290px)] ${
					match?.params ? "sm:block w-full" : "sm:hidden"
				}`}
			>
				<Outlet />
			</div>
		</div>
	);
};

export default Index;
