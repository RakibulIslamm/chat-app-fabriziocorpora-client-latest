import userReducer from "./slices/user/userSlice";
import themeReducer from "../redux/slices/theme/themeSlice";
import commonReducer from "../redux/slices/common/commonSlice";
import settingsReducer from "../redux/slices/settings/settingsSlice";
import callReducer from "../redux/slices/call/callSlice";
import apiSlice from "./slices/api/apiSlice";

export const rootReducer = {
	[apiSlice.reducerPath]: apiSlice.reducer,
	user: userReducer,
	theme: themeReducer,
	common: commonReducer,
	settings: settingsReducer,
	call: callReducer,
};
