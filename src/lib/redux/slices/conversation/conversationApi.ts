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

		addGroupMembers: builder.mutation({
			query: ({ conversationId, userIds }) => ({
				url: `/conversations/add-members?id=${conversationId}`,
				method: "PUT",
				body: { userIds: userIds },
			}),
			invalidatesTags: ["members"],
		}),

		updateConversation: builder.mutation({
			query: ({ messageData, id }) => ({
				url: `/conversations/${id}`,
				method: "PUT",
				body: messageData,
			}),
			async onQueryStarted({ messageData, id }, { dispatch, queryFulfilled }) {
				// console.log(data);
				const patchResult = dispatch(
					conversationsApi.util.updateQueryData(
						"getConversations",
						messageData.sender,
						(draft) => {
							for (const c of draft.data) {
								if (c._id === id) {
									c.lastMessage = messageData.lastMessage;
									c.sender = messageData.sender;
									c.timestamp = messageData.timestamp;
									c.img = messageData.img;
									c.unseenMessages = messageData.unseenMessages;
									break;
								}
							}
							draft.data.sort(
								(x: ConversationInterface, y: ConversationInterface) => {
									return new Date(x.timestamp) < new Date(y.timestamp) ? 1 : -1;
								}
							);
						}
					)
				);
				try {
					await queryFulfilled;
				} catch (err) {
					patchResult.undo();
				}
			},
		}),

		getConversations: builder.query({
			query: (id) => `/conversations?id=${id}`,
			// async onQueryStarted(id, { dispatch, queryFulfilled }) {},
			providesTags: ["conversations"],
			keepUnusedDataFor: Infinity,
			async onCacheEntryAdded(
				userId,
				{ cacheDataLoaded, updateCachedData, cacheEntryRemoved }
			) {
				socket.on("conversation", async (data) => {
					await cacheDataLoaded;
					const isFound = data.participants.some(
						(c: UserInterface) => c._id === userId
					);

					// const sender = data.sender._id !== id;

					updateCachedData((draft) => {
						if (isFound) {
							const isConversationFound = draft.data.some(
								(conversation: ConversationInterface) =>
									conversation._id === data?._id
							);
							if (!isConversationFound) {
								draft.data.push(data);
							}
						}
						draft.data.sort(
							(x: ConversationInterface, y: ConversationInterface) => {
								return new Date(x.timestamp) < new Date(y.timestamp) ? 1 : -1;
							}
						);
					});
				});

				socket.on("add-members", async ({ updatedConversation, id }) => {
					await cacheDataLoaded;
					const isUserFound = updatedConversation.participants.some(
						(user: UserInterface) => user._id === userId
					);

					updateCachedData((draft) => {
						if (isUserFound) {
							const hasConversation = draft.data.find(
								(conversation: ConversationInterface) => conversation._id === id
							);
							if (!hasConversation) {
								draft.data.push(updatedConversation);
							} else if (hasConversation) {
								hasConversation.participants = [
									...updatedConversation.participants,
								];
							}
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
							if (c._id === id && data.sender !== userId) {
								c.lastMessage = data.lastMessage;
								c.sender = data.sender;
								c.timestamp = data.timestamp;
								c.img = data.img;
								c.file = data.file;
								c.unseenMessages = data.unseenMessages;
								break;
							}
						}
						if (data?.sender !== userId) {
							draft.data.sort(
								(x: ConversationInterface, y: ConversationInterface) => {
									return new Date(x.timestamp) < new Date(y.timestamp) ? 1 : -1;
								}
							);
						}
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
			keepUnusedDataFor: Infinity,
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

				socket.on("add-members", async ({ updatedConversation, id }) => {
					await cacheDataLoaded;

					updateCachedData((draft) => {
						if (id === _id) {
							draft.data.participants = [...updatedConversation.participants];
							// console.log(JSON.parse(JSON.stringify(draft.data.participants)));
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
	useAddGroupMembersMutation,
} = conversationsApi;
