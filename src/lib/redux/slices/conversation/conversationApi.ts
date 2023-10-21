import { ConversationInterface } from "../../../../interfaces/conversation";
import { UserInterface } from "../../../../interfaces/user";
import { socket } from "../../../../utils/socket";
import apiSlice from "../api/apiSlice";

export const conversationsApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		// API goes here
		createConversation: builder.mutation({
			query: (data) => ({
				url: `/conversations`,
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["users"],
		}),

		deleteConversation: builder.mutation({
			query: (id) => ({
				url: `/conversations/delete-conversation/${id}`,
				method: "DELETE",
			}),
			// invalidatesTags: ["conversations"],
		}),

		joinGroup: builder.mutation({
			query: ({ id, userId }) => ({
				url: `/conversations/join-group?id=${id}`,
				method: "PUT",
				body: { userId: userId },
			}),
		}),

		updateConversation: builder.mutation({
			query: ({ messageData, id }) => ({
				url: `/conversations/${id}`,
				method: "PUT",
				body: messageData,
			}),
		}),

		getConversations: builder.query({
			query: (id) => `/conversations?id=${id}`,
			// async onQueryStarted(id, { dispatch, queryFulfilled }) {},
			providesTags: ["conversations"],
			async onCacheEntryAdded(
				_id,
				{ cacheDataLoaded, updateCachedData, cacheEntryRemoved }
			) {
				socket.on("conversation", async (data) => {
					await cacheDataLoaded;
					const isFound = data.participants.some(
						(c: UserInterface) => c._id === _id
					);

					// const sender = data.sender._id !== id;

					updateCachedData((draft) => {
						if (isFound) {
							draft.data.push(data);
						}
						draft.data.sort(
							(x: ConversationInterface, y: ConversationInterface) => {
								return new Date(x.timestamp) < new Date(y.timestamp) ? 1 : -1;
							}
						);
					});
				});

				socket.on("delete-conversation", async (id) => {
					await cacheDataLoaded;

					updateCachedData((draft) => {
						for (const c of draft.data) {
							if (c?._id === id) {
								c.deleted = true;
								break;
							}
						}
					});
				});

				socket.on("update-conversation", async ({ data, id }) => {
					await cacheDataLoaded;
					updateCachedData((draft) => {
						for (const c of draft.data) {
							if (c._id === id) {
								c.lastMessage = data.lastMessage;
								c.sender = data.sender;
								c.timestamp = data.timestamp;
								c.img = data.img;
								c.unseenMessages = data.unseenMessages;
								break;
							}
						}
						draft.data.sort(
							(x: ConversationInterface, y: ConversationInterface) => {
								return new Date(x.timestamp) < new Date(y.timestamp) ? 1 : -1;
							}
						);
					});
				});

				socket.on("seen-c", async (conversation) => {
					await cacheDataLoaded;
					updateCachedData((draft) => {
						for (const c of draft.data) {
							if (c?._id === conversation?._id) {
								c.unseenMessages = 0;
							}
						}
					});
				});

				socket.on("join-group", async ({ updatedConversation, id }) => {
					await cacheDataLoaded;
					updateCachedData((draft) => {
						for (const conversation of draft.data) {
							if (conversation._id === id) {
								conversation.participants = updatedConversation.participants;
								return;
							}
						}
					});
				});

				socket.on("online", async (userId) => {
					await cacheDataLoaded;
					updateCachedData((draft) => {
						for (const conversation of draft.data) {
							for (const user of conversation.participants) {
								if (user._id === userId) {
									user.status = "online";
									break;
								}
							}
						}
					});
				});

				socket.on("offline", async ({ id, lastActive }) => {
					await cacheDataLoaded;
					updateCachedData((draft) => {
						for (const conversation of draft.data) {
							for (const user of conversation.participants) {
								if (user._id === id) {
									user.status = "offline";
									user.lastActive = lastActive;
									break;
								}
							}
						}
					});
				});

				await cacheEntryRemoved;
				socket.close();
			},
		}),
		getMoreConversations: builder.query({
			query: ({ id, limit, skip }) =>
				`/conversations/more-conversations?id=${id}&skip=${skip}&limit=${limit}`,
		}),

		getSearchedChat: builder.query({
			query: ({ id, text }) =>
				`/conversations/search-chat?id=${id}&search=${text}`,
		}),

		getSearchedGroup: builder.query({
			query: (text) => `/conversations/search-group?search=${text}`,
		}),

		getSingleConversation: builder.query({
			query: (id) => `/conversations/conversation/${id}`,
			async onCacheEntryAdded(
				_id,
				{ cacheDataLoaded, updateCachedData, cacheEntryRemoved }
			) {
				socket.on("update-conversation", async ({ data, id }) => {
					await cacheDataLoaded;
					updateCachedData((draft) => {
						if (draft.data._id === id) {
							draft.data.lastMessage = data.lastMessage;
							draft.data.sender = data.sender;
							draft.data.timestamp = data.timestamp;
							draft.data.img = data.img;
							draft.data.unseenMessages = data.unseenMessages;
						}
					});
				});

				socket.on("seen-c", async (conversation) => {
					await cacheDataLoaded;
					updateCachedData((draft) => {
						if (draft.data?._id === conversation?._id) {
							draft.data.unseenMessages = 0;
						}
					});
				});

				socket.on("delete-conversation", async (id) => {
					await cacheDataLoaded;
					updateCachedData((draft) => {
						const conversation = draft.data;
						if (conversation?._id === id) {
							draft.data.deleted = true;
						}
					});
				});

				socket.on("join-group", async ({ updatedConversation, id }) => {
					await cacheDataLoaded;
					updateCachedData((draft) => {
						const conversation = draft.data;
						if (conversation._id === id) {
							conversation.participants = updatedConversation.participants;
						}
					});
				});

				socket.on("online", async (id) => {
					await cacheDataLoaded;
					updateCachedData((draft) => {
						if (draft.data) {
							for (const user of draft.data.participants) {
								if (user._id === id) {
									user.status = "online";
									return;
								}
							}
						}
					});
				});

				socket.on("offline", async ({ id, lastActive }) => {
					await cacheDataLoaded;
					updateCachedData((draft) => {
						for (const user of draft.data.participants) {
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
	}),
});

export const {
	useCreateConversationMutation,
	useGetConversationsQuery,
	useGetSingleConversationQuery,
	useUpdateConversationMutation,
	useGetSearchedChatQuery,
	useGetSearchedGroupQuery,
	useJoinGroupMutation,
	useGetMoreConversationsQuery,
	useDeleteConversationMutation,
} = conversationsApi;
