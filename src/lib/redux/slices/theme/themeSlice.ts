import { createSlice } from "@reduxjs/toolkit";

export interface themeInterface {
	theme: "light" | "dark" | "system";
	themeColor: { h: number; s: number; l: number };
	fontSize: number;
}

const initialState: themeInterface = {
	theme: "light",
	themeColor: { h: 0, s: 0, l: 0 },
	fontSize: 16,
};

const themeSlice = createSlice({
	name: "theme",
	initialState,
	reducers: {
		setTheme: (state, action) => {
			localStorage.setItem("theme", action.payload);
			state.theme = action.payload;
		},
		setThemeColor: (state, action) => {
			state.themeColor = action.payload;
		},
		setFontSize: (state, action) => {
			state.fontSize = action.payload;
		},
	},
});

export default themeSlice.reducer;
export const { setThemeColor, setTheme, setFontSize } = themeSlice.actions;
