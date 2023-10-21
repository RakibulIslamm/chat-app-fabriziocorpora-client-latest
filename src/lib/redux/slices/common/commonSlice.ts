import { createSlice } from "@reduxjs/toolkit";

type commonSliceType = {
	menuOpen: boolean;
	searchFocus: boolean;
	newChatOptions: boolean;
	conversations: boolean;
	conversationOptions: boolean;
	newGroup: boolean;
	newChat: boolean;
	settings: boolean;
};

const initialState: commonSliceType = {
	menuOpen: false,
	searchFocus: false,
	newChatOptions: false,
	conversations: true,
	conversationOptions: false,
	newChat: false,
	newGroup: false,
	settings: false,
};

const commonSlice = createSlice({
	name: "common-slice",
	initialState,
	reducers: {
		openMenu: (state, action) => {
			state.menuOpen = action.payload;
			if (action.payload === true) {
				state.searchFocus = false;
				state.newChatOptions = false;
				state.newChat = false;
				state.newGroup = false;
				state.settings = false;
				state.conversationOptions = false;
			}
		},
		IsSearchFocus: (state, action) => {
			state.searchFocus = action.payload;
			if (action.payload === true) {
				state.menuOpen = false;
				state.newChatOptions = false;
				state.newChat = false;
				state.newGroup = false;
				state.settings = false;
				state.conversationOptions = false;
			}
		},
		selectNewChatOption: (state, action) => {
			state.newChatOptions = action.payload;
			if (action.payload === true) {
				state.menuOpen = false;
				state.searchFocus = false;
				state.newChat = false;
				state.newGroup = false;
				state.settings = false;
				state.conversationOptions = false;
			}
		},
		createNewGroup: (state, action) => {
			state.newGroup = action.payload;
			if (action.payload === true) {
				state.menuOpen = false;
				state.searchFocus = false;
				state.conversations = false;
				state.newChat = false;
				state.newChatOptions = false;
				state.settings = false;
				state.conversationOptions = false;
			}
			// window.history.pushState({ path: "new_group" }, "", null);
		},
		CreateNewChat: (state, action) => {
			state.newChat = action.payload;
			if (action.payload === true) {
				state.menuOpen = false;
				state.searchFocus = false;
				state.conversations = false;
				state.newGroup = false;
				state.newChatOptions = false;
				state.settings = false;
				state.conversationOptions = false;
			}
		},
		conversationOn: (state) => {
			state.conversations = true;
			state.menuOpen = false;
			state.searchFocus = false;
			state.settings = false;
			state.newGroup = false;
			state.newChatOptions = false;
			state.newChat = false;
			state.conversationOptions = false;
		},
		settingsOn: (state, action) => {
			state.settings = action.payload;
			if (action.payload === true) {
				state.menuOpen = false;
				state.searchFocus = false;
				state.conversations = false;
				state.newGroup = false;
				state.newChatOptions = false;
				state.newChat = false;
				state.conversationOptions = false;
			}
		},
		conversationOptionsOn: (state, action) => {
			state.conversationOptions = action.payload;
		},
	},
});

export default commonSlice.reducer;
export const {
	openMenu,
	IsSearchFocus,
	selectNewChatOption,
	CreateNewChat,
	createNewGroup,
	settingsOn,
	conversationOn,
	conversationOptionsOn,
} = commonSlice.actions;
