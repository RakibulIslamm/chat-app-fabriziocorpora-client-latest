import { socket } from "../../../../utils/socket";
import apiSlice from "../api/apiSlice";
import { toast } from "react-toastify";

export const messageApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		sendMessage: builder.mutation({
			query: (data) => ({
				url: "/messages/send-message",
				method: "POST",
				body: data,
			}),
			async onQueryStarted(data, { dispatch, queryFulfilled }) {
				// console.log(data);
				const patchResult = dispatch(
					messageApi.util.updateQueryData(
						"getMessages",
						{ conversationId: data.conversationId, userId: data.sender.id },
						(draft) => {
							draft.data.unshift(data);
						}
					)
				);
				try {
					const message = await queryFulfilled;
					dispatch(
						messageApi.util.updateQueryData(
							"getMessages",
							{
								conversationId: data.conversationId,
								userId: data.sender?.id,
							},
							(draft) => {
								for (const m of draft.data) {
									if (m.messageId === message.data?.data?.messageId) {
										m.status = "sent";
										m._id = message.data?.data?._id;
										break;
									}
								}
							}
						)
					);
				} catch (err) {
					patchResult.undo();
					toast.error("Something went wrong!");
				}
			},
		}),

		deleteMessage: builder.mutation({
			query: (id) => ({
				url: `/messages/delete-message/${id}`,
				method: "DELETE",
			}),
		}),

		deleteAllMessage: builder.mutation({
			query: (id) => ({
				url: `/messages/delete-all-message/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["messages", "moreMessages"],
		}),

		getMessages: builder.query({
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			query: ({ conversationId }) =>
				`/messages?conversationId=${conversationId}`,
			providesTags: ["messages"],
			async onCacheEntryAdded(
				{ conversationId, userId },
				{ cacheDataLoaded, cacheEntryRemoved, updateCachedData }
			) {
				try {
					await cacheDataLoaded;
					socket.on("message", async (data) => {
						await cacheDataLoaded;
						let previousId: string;
						updateCachedData((draft) => {
							if (
								conversationId === data.conversationId &&
								data.sender.id !== userId &&
								previousId !== data.messageId
							) {
								draft.data.unshift(data);
								previousId = data.messageId;
							}
						});
					});

					socket.on("delete-all-messages", async (id) => {
						await cacheDataLoaded;
						updateCachedData((draft) => {
							if (conversationId === id) {
								draft.data = [];
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
			providesTags: ["moreMessages"],
		}),
		uploadFile: builder.mutation({
			query: (data) => ({
				url: "/upload",
				method: "POST",
				body: data,
			}),
		}),
	}),
});

export const {
	useSendMessageMutation,
	useDeleteMessageMutation,
	useGetMessagesQuery,
	useGetMoreMessagesQuery,
	useUploadFileMutation,
	useDeleteAllMessageMutation,
} = messageApi;
