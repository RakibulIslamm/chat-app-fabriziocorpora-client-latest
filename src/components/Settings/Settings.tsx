import { FiArrowLeft } from "react-icons/fi";
import { IoMdSettings } from "react-icons/io";
import { RiChatSettingsFill, RiUserSettingsFill } from "react-icons/ri";
import { ReduxState, useDispatch, useSelector } from "../../lib/redux/store";
import { conversationOn } from "../../lib/redux/slices/common/commonSlice";
import {
	chatSettingsOn,
	editProfileOn,
	generalSettingsOn,
} from "../../lib/redux/slices/settings/settingsSlice";
import useColorScheme from "../../Hooks/useColorScheme";

const Settings = () => {
	const { user } = useSelector((state: ReduxState) => state.user);
	const dispatch = useDispatch();
	const { textColor, main } = useColorScheme();
	return (
		<div className="" style={{ color: textColor }}>
			<div
				className="h-[200px] px-[20px] relative text-white"
				style={{ background: main }}
			>
				<div className="w-full flex items-center gap-4 h-[75px]">
					<button onClick={() => dispatch(conversationOn())}>
						<FiArrowLeft className="text-[25px]" />
					</button>

					<h2 className="text-[20px] font-medium">Settings</h2>
				</div>
				<h1 className=" absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold text-[80px] text-gray-700 opacity-50">
					{user?.name?.[0]}
				</h1>
				<div className=" absolute bottom-4 left-[20px]">
					<p className="text-xl font-semibold">{user?.name}</p>
					<p className="text-sm">@{user?.username}</p>
				</div>
			</div>

			<div className="mt-4 space-y-5 px-[20px]">
				<button
					onClick={() => dispatch(generalSettingsOn(true))}
					className="text font-semibold flex items-center gap-2"
				>
					<IoMdSettings className="text-2xl" />
					General Settings
				</button>
				<button
					className="text font-semibold flex items-center gap-2"
					onClick={() => dispatch(chatSettingsOn(true))}
				>
					<RiChatSettingsFill className="text-2xl" />
					Chat Settings
				</button>
				<button
					className="text font-semibold flex items-center gap-2"
					onClick={() => dispatch(editProfileOn(true))}
				>
					<RiUserSettingsFill className="text-2xl" />
					Edit Profile
				</button>
			</div>
		</div>
	);
};

export default Settings;
