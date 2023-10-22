/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	BaseQueryFn,
	FetchArgs,
	FetchBaseQueryError,
	FetchBaseQueryMeta,
	createApi,
	fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

export type CustomFetchBaseQueryError = FetchBaseQueryError & {
	data?: {
		success: boolean;
		message: string;
		errorMessages: [];
		stack: string;
	};
};

type CustomBaseQueryFn = BaseQueryFn<
	string | FetchArgs,
	unknown,
	CustomFetchBaseQueryError,
	// eslint-disable-next-line @typescript-eslint/ban-types
	{},
	FetchBaseQueryMeta
>;

export const apiSlice = createApi({
	reducerPath: "chat-application",
	baseQuery: fetchBaseQuery({
		baseUrl: "http://localhost:5000/api",
	}) as CustomBaseQueryFn,
	tagTypes: ["auth", "users", "conversations"],
	endpoints: (_builder) => ({}),
});

export default apiSlice;
