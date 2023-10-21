import { createSlice } from "@reduxjs/toolkit";
import { UserInterface } from "../../../../interfaces/user";

interface InitialStateInterface {
	user: UserInterface | null;
}

const initialState: InitialStateInterface = {
	user: null,
};

const userSlice = createSlice({
	name: "auth",
	initialState: initialState,
	reducers: {
		setCurrentUser: (state, action) => {
			state.user = action.payload;
		},
	},
});

export default userSlice.reducer;
export const { setCurrentUser } = userSlice.actions;
