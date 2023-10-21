import { socket } from "../../../../utils/socket";
import apiSlice from "../api/apiSlice";

const userApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		getUser: builder.query({
			query: (id: string) => `/users/user?id=${id}`,
		}),
		getUsers: builder.query({
			query: ({ id, q }) => `/users?id=${id}&q=${q}`,
			providesTags: ["users"],
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			async onCacheEntryAdded(
				_args,
				{ cacheDataLoaded, updateCachedData, cacheEntryRemoved }
			) {
				socket.on("online", async (id) => {
					await cacheDataLoaded;
					updateCachedData((draft) => {
						for (const user of draft.data) {
							if (user._id === id) {
								user.status = "online";
								return;
							}
						}
					});
				});
				socket.on("offline", async ({ id, lastActive }) => {
					await cacheDataLoaded;
					updateCachedData((draft) => {
						for (const user of draft.data) {
							if (user._id === id) {
								user.status = "offline";
								user.lastActive = lastActive;
								return;
							}
						}
					});
				});

				await cacheEntryRemoved;
			},
		}),
		getMembers: builder.query({
			query: ({ id, q }) => `/users/select-members?id=${id}&q=${q}`,
		}),
		editUser: builder.mutation({
			query: ({ data, id }) => ({
				url: `/users/edit?id=${id}`,
				method: "PUT",
				body: data,
			}),
		}),
	}),
});

export const {
	useGetUserQuery,
	useGetUsersQuery,
	useGetMembersQuery,
	useEditUserMutation,
} = userApi;
