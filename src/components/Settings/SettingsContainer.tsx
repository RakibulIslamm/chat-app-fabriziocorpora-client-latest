import { ReduxState, useSelector } from "../../lib/redux/store";
import Settings from "./Settings";
import GeneralSettings from "./GeneralSettings";
import ChatSettings from "./ChatSettings";
import EditProfile from "./EditProfile";

const SettingsContainer = () => {
	const { settings } = useSelector((state: ReduxState) => state.common);
	const { chatSettings, editProfile, generalSettings } = useSelector(
		(state: ReduxState) => state.settings
	);
	return (
		<div>
			{settings && !generalSettings && !chatSettings && !editProfile && (
				<Settings />
			)}
			{settings && generalSettings && <GeneralSettings />}
			{settings && chatSettings && <ChatSettings />}
			{settings && editProfile && <EditProfile />}
		</div>
	);
};

export default SettingsContainer;
