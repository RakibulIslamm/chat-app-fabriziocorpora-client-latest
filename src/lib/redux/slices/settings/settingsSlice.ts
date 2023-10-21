import { createSlice } from "@reduxjs/toolkit";

type settingsSliceType = {
	generalSettings: boolean;
	chatSettings: boolean;
	editProfile: boolean;
};

const initialState: settingsSliceType = {
	generalSettings: false,
	chatSettings: false,
	editProfile: false,
};

const settingsSlice = createSlice({
	name: "common-slice",
	initialState,
	reducers: {
		generalSettingsOn: (state, action) => {
			state.generalSettings = action.payload;
			if (action.payload === true) {
				state.chatSettings = false;
				state.editProfile = false;
			}
		},
		chatSettingsOn: (state, action) => {
			state.chatSettings = action.payload;
			state.generalSettings = false;
			state.editProfile = false;
		},
		editProfileOn: (state, action) => {
			state.editProfile = action.payload;
			state.chatSettings = false;
			state.generalSettings = false;
		},
	},
});

export default settingsSlice.reducer;
export const { chatSettingsOn, editProfileOn, generalSettingsOn } =
	settingsSlice.actions;
