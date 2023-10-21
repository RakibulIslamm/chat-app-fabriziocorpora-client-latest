import { socket } from "../../../../utils/socket";
import apiSlice from "../api/apiSlice";

export const messageApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		sendMessage: builder.mutation({
			query: (data) => ({
				url: "/messages/send-message",
				method: "POST",
				body: data,
			}),
		}),

		deleteMessage: builder.mutation({
			query: (id) => ({
				url: `/messages/delete-message/${id}`,
				method: "DELETE",
			}),
		}),

		getMessages: builder.query({
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			query: ({ conversationId }) =>
				`/messages?conversationId=${conversationId}`,
			async onCacheEntryAdded(
				{ conversationId },
				{ cacheDataLoaded, cacheEntryRemoved, updateCachedData }
			) {
				try {
					await cacheDataLoaded;
					socket.on("message", async (data) => {
						await cacheDataLoaded;
						updateCachedData((draft) => {
							if (conversationId === data.conversationId) {
								draft.data.unshift(data);
							}
						});
					});

					socket.on("delivered", async ({ delivered, convId }) => {
						await cacheDataLoaded;
						if (convId === conversationId && delivered) {
							updateCachedData((draft) => {
								for (const message of draft.data) {
									if (
										message.conversationId === convId &&
										message.status === "sent"
									) {
										message.status = "delivered";
									}
								}
							});
						}
					});

					socket.on("seen-m", async ({ message, id }) => {
						await cacheDataLoaded;
						if (
							message.conversationId === conversationId &&
							message.status === "seen"
						) {
							updateCachedData((draft) => {
								for (const m of draft.data) {
									if (m._id === id) {
										m.status = "seen";
										m.seen = message.seen;
									}
								}
							});
						}
					});

					socket.on("delete-message", async (data) => {
						await cacheDataLoaded;
						updateCachedData((draft) => {
							for (const message of draft.data) {
								if (message._id === data._id) {
									message.deleted = true;
									return;
								}
							}

							// const filteredMsg = draft.data?.filter((message:MessageInterface)=>message._id !== data._id)
						});
					});
				} catch (err) {
					console.log(err);
				} finally {
					await cacheEntryRemoved;
				}
			},
		}),
		getMoreMessages: builder.query({
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			query: ({ conversationId, limit, skip }) =>
				`/messages/more-messages?conversationId=${conversationId}&limit=${limit}&skip=${skip}`,
		}),
	}),
});

export const {
	useSendMessageMutation,
	useDeleteMessageMutation,
	useGetMessagesQuery,
	useGetMoreMessagesQuery,
} = messageApi;
