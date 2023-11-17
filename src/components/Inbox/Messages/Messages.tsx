/* eslint-disable no-mixed-spaces-and-tabs */
import useColorScheme from "../../../Hooks/useColorScheme";
import Message from "./Message";
import MessageFooter from "./MessageFooter";
import MessageHeader from "./MessageHeader";
import { AiFillCloseCircle } from "react-icons/ai";
import { IoIosArrowBack } from "react-icons/io";
import { Link, useParams } from "react-router-dom";
import {
	messageApi,
	useGetMessagesQuery,
	useGetMoreMessagesQuery,
	useSendMessageMutation,
} from "../../../lib/redux/slices/message/messageApi";
import { MessageInterface } from "../../../interfaces/message";
import { ReduxState, useDispatch, useSelector } from "../../../lib/redux/store";
import { CustomFetchBaseQueryError } from "../../../lib/redux/slices/api/apiSlice";
import {
	conversationsApi,
	useGetSingleConversationQuery,
	useJoinGroupMutation,
	useUpdateConversationMutation,
} from "../../../lib/redux/slices/conversation/conversationApi";
import { UserInterface } from "../../../interfaces/user";
import { useState, useEffect, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import {
	addMembersOn,
	conversationOn,
	groupMembersOn,
} from "../../../lib/redux/slices/common/commonSlice";
import { socket } from "../../../utils/socket";
import Forward from "./Forward/Forward";
import GroupMembers from "./GroupMembers";
import AddMembers from "./AddMembers";
import OutsideClickHandler from "react-outside-click-handler";
import tinycolor from "tinycolor2";
import { v4 as uuid } from "uuid";
import { IncomingCallInfoType } from "../../../interfaces/callInfo";
import {
	incomingCall,
	setCallAnswered,
	setCurrentGroupCall,
} from "../../../lib/redux/slices/call/callSlice";

const Messages = () => {
	const [reply, setReply] = useState<MessageInterface | null>(null);
	const [forwardOpen, setForwardOpen] = useState(false);
	const [forwardMessage, setForwardMessage] = useState<MessageInterface | null>(
		null
	);
	// const [skip, setSkip] = useState<number>(1);
	const [loading, setLoading] = useState<boolean>(false);
	const [hasMore, setHasMore] = useState<boolean>(true);
	const lastMessageRef = useRef<HTMLDivElement | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);

	const { user } = useSelector((state: ReduxState) => state.user);
	const { currentGroupCall, minimize } = useSelector(
		(state: ReduxState) => state.call
	);
	const { groupMembers, addMembers } = useSelector(
		(state: ReduxState) => state.common
	);

	const { secondary, textColor, main } = useColorScheme();
	const { id } = useParams();
	const dispatch = useDispatch();

	const [sendMessage] = useSendMessageMutation();
	const [updateConversation] = useUpdateConversationMutation();
	const {
		isLoading,
		isFetching: messagesFetching,
		isError,
		data,
		error,
	} = useGetMessagesQuery({
		conversationId: id,
		userId: user?._id,
	});
	const {
		isLoading: moreLoading,
		isFetching,
		data: moreMessages,
	} = useGetMoreMessagesQuery({
		conversationId: id,
		skip: data?.data?.length || 10,
		limit: 20,
	});
	const [joinGroup] = useJoinGroupMutation();

	const { isLoading: cLoading, data: conversation } =
		useGetSingleConversationQuery(id);

	const isMember = conversation?.data?.participants?.some(
		(m: UserInterface) => m._id === user?._id
	);

	useEffect(() => {
		if (data?.data?.length >= data?.count) {
			setHasMore(false);
			return;
		} else {
			setHasMore(true);
		}
	}, [data]);

	useEffect(() => {
		dispatch(setCurrentGroupCall(null));
		const listener = (data: Partial<IncomingCallInfoType>) => {
			if (data.callInfo?.room === id) {
				dispatch(setCurrentGroupCall(data));
			}
		};

		socket.on("group-call", listener);

		return () => {
			socket.off("group-call", listener);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const listener = (_user: UserInterface) => {
			dispatch(setCurrentGroupCall(null));
		};
		socket.on("callEnd", listener);

		return () => {
			socket.off("callEnd", listener);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const fetchMoreData = () => {
		if (moreLoading || isFetching) {
			console.log("Loading...");
		} else if (!moreLoading && moreMessages?.data?.length) {
			setTimeout(() => {
				dispatch(
					messageApi.util.updateQueryData(
						"getMessages",
						{ conversationId: id, userId: user?._id },
						(draft) => {
							draft.data = [...draft.data, ...moreMessages.data];
							draft.data.sort((x: MessageInterface, y: MessageInterface) => {
								return new Date(x.timestamp) < new Date(y.timestamp) ? 1 : -1;
							});
						}
					)
				);
				// setSkip((prev) => prev + 10);
			}, 500);
		}
	};

	const handleJoin = async () => {
		setLoading(true);
		try {
			const conv = await joinGroup({ id, userId: user?._id });
			const messageData: Partial<MessageInterface> = {
				sender: { name: user?.name as string, id: user?._id as string },
				messageId: uuid(),
				conversationId: id,
				message: `${user?.name} has joined the group`,
				forGroup: true,
				joinGroup: user?._id,
				timestamp: Date.now(),
			};
			const conversationData = {
				sender: user?._id,
				lastMessage: "New user joined the group",
				img: false,
				file: false,
				timestamp: Date.now(),
			};

			if ("data" in conv && conv.data.success) {
				dispatch(
					conversationsApi.util.updateQueryData(
						"getConversations",
						user?._id,
						(draft) => {
							draft.data.unshift(conv.data.data);
						}
					)
				);
				await sendMessage(messageData);
				await updateConversation({ messageData: conversationData, id: id });
				dispatch(conversationOn());
			}
		} catch (err) {
			// Handle any other errors that may occur during the request
			console.log(err);
		} finally {
			setLoading(false);
		}
	};

	const handleJoinCall = () => {
		if (currentGroupCall) {
			const receiver = currentGroupCall.participants?.find(
				(p: UserInterface) => p._id === user?._id
			);
			dispatch(
				incomingCall({
					caller: currentGroupCall.caller,
					participants: currentGroupCall.participants,
					callInfo: currentGroupCall.callInfo,
				})
			);
			dispatch(setCallAnswered());
			socket.emit("receiveSignal", receiver);
		} else {
			alert("Call ended");
		}
	};

	const handleClick = () => {
		if (
			conversation?.data?.unseenMessages > 0 &&
			conversation?.data?.sender !== user?._id
		) {
			socket.emit("seen-c", { conversationId: id, userId: user?._id });
		}
	};

	/* 	useEffect(() => {
		if (lastMessageRef?.current) {
			// console.log(data?.data?.[0].sender?._id);
			if (data?.data?.[0].sender?.id === user?._id) {
				console.log("inside");
				lastMessageRef.current?.scrollIntoView();
				// containerRef!.current!.scrollTop = containerRef!.current!.scrollHeight;
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data?.data]); */

	let content;

	if (isLoading || messagesFetching) {
		content = (
			<div className="text-center py-5 text-lg text-gray-400">Loading...</div>
		);
	} else if (!isLoading && isError) {
		const fetchError = error as CustomFetchBaseQueryError;
		content = (
			<div className="w-full h-full flex items-center justify-center">
				{fetchError?.data?.message}
			</div>
		);
	} else if (!isLoading && !isError && !data?.data?.length) {
		content = (
			<div className="text-gray-500 text-2xl w-full h-full flex justify-center items-center py-10">
				Start conversation
			</div>
		);
	} else if (!isLoading && !isError && data?.data?.length) {
		content = data?.data?.map((message: MessageInterface) => (
			<Message
				key={message.messageId}
				message={message}
				setReply={setReply}
				setForwardMessage={setForwardMessage}
				setForwardOpen={setForwardOpen}
			/>
		));
	}

	return (
		<>
			{!error && (
				<div className="flex flex-col justify-between w-full h-full relative overflow-hidden z-40">
					<MessageHeader />
					<div
						ref={containerRef}
						onClick={handleClick}
						id="messagesContainer"
						className="w-full h-[calc(100%_-_135px)] sm:h-[calc(100%_-_120px)] overflow-y-auto px-[55px] md:px-[20px] sm:px-[15px] flex flex-col-reverse justify-start gap-3 relative lg:scrollbar-thin lg:scrollbar-thumb-gray-500 lg:scrollbar-track-gray-200 lg:scrollbar-thumb-rounded-full lg:scrollbar-track-rounded-full"
					>
						{conversation?.data?.deleted ? (
							<div className="w-full h-full flex justify-center items-center flex-col">
								<p className="text-xl font-semibold text-gray-500">
									Conversation deleted
								</p>
								<Link to={"/"} className="underline flex items-center gap-1">
									<IoIosArrowBack /> Go back
								</Link>
							</div>
						) : (
							<InfiniteScroll
								style={{ overflow: "hidden" }}
								className="flex flex-col-reverse gap-4 pt-10"
								dataLength={data?.data?.length || 16}
								next={fetchMoreData}
								hasMore={hasMore}
								loader={
									!isLoading && !messagesFetching ? (
										<h4 className="text-xl font-semibold py-2 text-gray-400 px-[40px] text-center">
											Loading...
										</h4>
									) : null
								}
								inverse={true}
								scrollableTarget="messagesContainer"
								endMessage={
									data?.data?.length > 20 && !isLoading && !isFetching ? (
										<p className="text-center text-lg pb-2 text-gray-400 px-[40px] font-light">
											<b>Finished!</b>
										</p>
									) : null
								}
							>
								<span id="anchor" ref={lastMessageRef}></span>
								{currentGroupCall?.callInfo?.isGroupCall && !minimize && (
									<div className="w-full flex justify-center">
										<button
											style={{ background: secondary, color: textColor }}
											className="px-8 py-2 border border-red-500 rounded-lg relative"
											onClick={handleJoinCall}
										>
											<span className="absolute flex h-3 w-3 -top-1 -right-1">
												<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
												<span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
											</span>
											<span className="relative">
												<span className="absolute animate-ping opacity-75 blur-sm text-red-400">
													Join call
												</span>
												<span>Calling....</span>
											</span>
										</button>
									</div>
								)}
								{content}
							</InfiniteScroll>
						)}
					</div>

					{reply && (
						<div
							style={{ background: secondary, color: textColor }}
							className="px-[55px] md:px-[20px] sm:px-[15px] py-3 w-full flex items-center justify-between"
						>
							{!reply.img && (
								<p className="line-clamp-1 overflow-hidden">
									Replying: {reply.message}
								</p>
							)}
							{reply.img && (
								<div className="flex items-center gap-10">
									<div>
										<p>Replying:</p>
										<p>Photo</p>
									</div>
									<img
										className="w-[100px] max-h-[100px] object-cover"
										src={reply.img}
										alt=""
									/>
								</div>
							)}
							<button onClick={() => setReply(null)}>
								<AiFillCloseCircle className="text-xl" />
							</button>
						</div>
					)}

					{isMember
						? conversation?.data &&
						  !conversation?.data?.deleted && (
								<MessageFooter
									reply={reply}
									setReply={setReply}
									lastMessageRef={lastMessageRef}
									containerRef={containerRef}
									handleClick={handleClick}
								/>
						  )
						: !cLoading &&
						  conversation?.data && (
								<button
									disabled={loading}
									onClick={handleJoin}
									style={{ background: main }}
									className="px-[55px] md:px-[20px] sm:px-[15px] w-full text-white py-3 flex justify-center items-center text-xl font-semibold"
								>
									{loading ? "Joining..." : "Join"}
								</button>
						  )}

					<div
						className={`w-full h-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
							forwardOpen ? "visible z-50" : "invisible"
						}`}
					>
						<Forward setForwardOpen={setForwardOpen} message={forwardMessage} />
					</div>

					{conversation?.data?.isGroup && (
						<OutsideClickHandler
							onOutsideClick={() => {
								dispatch(groupMembersOn(false));
								dispatch(addMembersOn(false));
							}}
						>
							<div
								style={{
									background: tinycolor(secondary).setAlpha(0.7).toRgbString(),
								}}
								className={`w-[400px] sm:w-10/12 h-full absolute top-0 right-0 transform ${
									groupMembers
										? "translate-x-[0px] shadow-xl"
										: "translate-x-[400px]"
								} bg-gray-400 transition-all ease-in-out duration-500 z-50 backdrop-blur p-5 sm:p-3`}
							>
								{!addMembers && groupMembers && (
									<GroupMembers conversation={conversation?.data} />
								)}
								{addMembers && groupMembers && <AddMembers />}
							</div>
						</OutsideClickHandler>
					)}
				</div>
			)}
		</>
	);
};

export default Messages;
