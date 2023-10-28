/* eslint-disable no-mixed-spaces-and-tabs */
import tinycolor from "tinycolor2";
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
} from "../../../lib/redux/slices/message/messageApi";
import { MessageInterface } from "../../../interfaces/message";
import { ReduxState, useDispatch, useSelector } from "../../../lib/redux/store";
import { CustomFetchBaseQueryError } from "../../../lib/redux/slices/api/apiSlice";
import {
	conversationsApi,
	useGetSingleConversationQuery,
	useJoinGroupMutation,
} from "../../../lib/redux/slices/conversation/conversationApi";
import { UserInterface } from "../../../interfaces/user";
import { useState, useEffect, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { conversationOn } from "../../../lib/redux/slices/common/commonSlice";
import { socket } from "../../../utils/socket";
import Forward from "./Forward/Forward";

const Messages = () => {
	const [reply, setReply] = useState<MessageInterface | null>(null);
	const [forwardOpen, setForwardOpen] = useState(false);
	const [forwardMessage, setForwardMessage] = useState<MessageInterface | null>(
		null
	);
	// const [skip, setSkip] = useState<number>(1);
	const [hasMore, setHasMore] = useState<boolean>(true);
	const lastMessageRef = useRef<HTMLDivElement | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);

	const { user } = useSelector((state: ReduxState) => state.user);
	const { secondary, primary, textColor, main } = useColorScheme();
	const bg = tinycolor(secondary).setAlpha(0.8).toRgbString();
	const { id } = useParams();

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

	const [joinGroup, { isLoading: joining }] = useJoinGroupMutation();

	const { isLoading: cLoading, data: conversation } =
		useGetSingleConversationQuery(id);

	const isMember = conversation?.data?.participants?.some(
		(m: UserInterface) => m._id === user?._id
	);

	const dispatch = useDispatch();
	const {
		isLoading: moreLoading,
		isFetching,
		data: moreMessages,
	} = useGetMoreMessagesQuery({
		conversationId: id,
		skip: data?.data?.length || 10,
		limit: 20,
	});

	useEffect(() => {
		if (data?.data?.length >= data?.count) {
			setHasMore(false);
			return;
		} else {
			setHasMore(true);
		}
	}, [data]);

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
						}
					)
				);
				// setSkip((prev) => prev + 10);
			}, 500);
		}
	};

	const handleJoin = async () => {
		try {
			const conv = await joinGroup({ id, userId: user?._id });

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
				dispatch(conversationOn());
			}
		} catch (err) {
			// Handle any other errors that may occur during the request
			console.log(err);
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

	/* useEffect(() => {
		if (lastMessageRef?.current) {
			// console.log(data?.data?.[0].sender?._id);
			if (data?.data?.[0].sender?.id === user?._id) {
				console.log("inside");
				// lastMessageRef.current?.scrollIntoView();
				lastMessageRef.current.scrollTop = lastMessageRef.current?.scrollHeight;
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
				key={message._id}
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
				<div className="flex flex-col justify-between w-full h-full relative">
					{/* Theme color */}
					<div
						style={{
							backgroundColor: bg,
							borderLeft: `1px solid ${primary}`,
						}}
						className="max-h-[75px] sm:max-h-[60px] w-full py-4 sm:py-2 relative z-10"
					>
						<MessageHeader />
					</div>

					<div
						ref={lastMessageRef}
						onClick={handleClick}
						id="messagesContainer"
						className="w-full max-h-[calc(100%_-_165px)] sm:max-h-[calc(100%_-_100px)] overflow-y-auto px-[55px] md:px-[20px] sm:px-[15px] flex flex-col-reverse gap-3 pt-3 pb-1 relative lg:scrollbar-thin lg:scrollbar-thumb-gray-500 lg:scrollbar-track-gray-200 lg:scrollbar-thumb-rounded-full lg:scrollbar-track-rounded-full"
					>
						{/* <div ref={lastMessageRef}></div> */}
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
								className="flex flex-col-reverse gap-4 pt-[60px]"
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
										<p className="text-center text-lg py-2 text-gray-400 px-[40px] font-light">
											<b>Finished!</b>
										</p>
									) : null
								}
							>
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
					<div
						className="max-h-[140px] py-4 sm:py-3"
						onClick={handleClick}
						ref={containerRef}
					>
						{isMember
							? conversation?.data &&
							  !conversation?.data?.deleted && (
									<MessageFooter
										reply={reply}
										setReply={setReply}
										lastMessageRef={lastMessageRef}
										containerRef={containerRef}
									/>
							  )
							: !cLoading &&
							  conversation?.data && (
									<button
										onClick={handleJoin}
										style={{ background: main }}
										className="px-[55px] md:px-[20px] sm:px-[15px] w-full text-white py-3 flex justify-center items-center text-xl font-semibold"
									>
										{joining ? "Joining..." : "Join"}
									</button>
							  )}
					</div>

					<div
						className={`w-full h-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
							forwardOpen ? "visible z-50" : "invisible"
						}`}
					>
						<Forward setForwardOpen={setForwardOpen} message={forwardMessage} />
					</div>
				</div>
			)}
		</>
	);
};

export default Messages;
