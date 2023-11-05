import { rootReducer } from "./rootReducer";
/* Core */
import { configureStore } from "@reduxjs/toolkit";
import {
	useSelector as useReduxSelector,
	useDispatch as useReduxDispatch,
	type TypedUseSelectorHook,
} from "react-redux";

/* Instruments */
import apiSlice from "./slices/api/apiSlice";

export const reduxStore = configureStore({
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) => {
		return getDefaultMiddleware({
			immutableCheck: false,
			serializableCheck: false,
		}).concat(apiSlice.middleware);
	},
	// devTools: false,
});

export const useDispatch = () => useReduxDispatch<ReduxDispatch>();
export const useSelector: TypedUseSelectorHook<ReduxState> = useReduxSelector;

/* Types */
export type ReduxStore = typeof reduxStore;
export type ReduxState = ReturnType<typeof reduxStore.getState>;
export type ReduxDispatch = typeof reduxStore.dispatch;
