import { ReduxState, useDispatch, useSelector } from "../../../lib/redux/store";
import Conversation from "./Conversation";
import ConversationHeader from "./Header";
import Menu from "./Menu";
import { BsFillChatRightDotsFill } from "react-icons/bs";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { BiSolidUser } from "react-icons/bi";
import { FaUsers } from "react-icons/fa";
import {
	CreateNewChat,
	createNewGroup,
	selectNewChatOption,
} from "../../../lib/redux/slices/common/commonSlice";
import SearchItems from "./SearchItems/SearchItems";
import tinycolor from "tinycolor2";
import useColorScheme from "../../../Hooks/useColorScheme";
import {
	conversationsApi,
	useGetConversationsQuery,
	useGetMoreConversationsQuery,
} from "../../../lib/redux/slices/conversation/conversationApi";
import { ConversationInterface } from "../../../interfaces/conversation";
import { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

const Conversations = () => {
	const [searchText, setSearchText] = useState<string>("");
	const searchRef = useRef(null);
	// const [skip, setSkip] = useState<number>(1);
	const [hasMore, setHasMore] = useState<boolean>(true);
	const { menuOpen, searchFocus, newChatOptions } = useSelector(
		(state: ReduxState) => state.common
	);
	const { user } = useSelector((state: ReduxState) => state.user);
	const dispatch = useDispatch();
	const { primary, textColor, main } = useColorScheme();
	const bg = tinycolor(primary).setAlpha(0.7).toRgbString();
	const border = tinycolor(main).setAlpha(0.2).toRgbString();

	const { isLoading, isError, data } = useGetConversationsQuery(user?._id);
	const {
		isLoading: moreLoading,
		isFetching,
		data: moreConversation,
	} = useGetMoreConversationsQuery({
		id: user?._id,
		skip: data?.data?.length || 8,
		limit: 8,
	});

	useEffect(() => {
		if (data?.data?.length >= data?.count) {
			setHasMore(false);
			return;
		}
	}, [data]);

	const fetchMoreData = () => {
		if (moreLoading || isFetching) {
			console.log("Loading...");
		} else if (!moreLoading && moreConversation?.data?.length) {
			setTimeout(() => {
				dispatch(
					conversationsApi.util.updateQueryData(
						"getConversations",
						user?._id,
						(draft) => {
							draft.data = [...draft.data, ...moreConversation.data];
						}
					)
				);
				// setSkip((prev) => prev + 1);
			}, 500);
		}
	};

	let content;
	if (isLoading) {
		content = (
			<div className="px-[25px] text-xl font-bold text-gray-400">
				Loading...
			</div>
		);
	} else if (!isLoading && isError) {
		content = <div>Something went wrong</div>;
	} else if (!isLoading && !isError && !data?.data?.length) {
		content = (
			<div className="dark:text-gray-500 px-[25px] md:px-[15px] sm:px-[15px]">
				You have no conversation
			</div>
		);
	} else if (!isLoading && !isError && data?.data?.length) {
		content = data?.data?.map((conversation: ConversationInterface) => (
			<Conversation key={conversation._id} conversation={conversation} />
		));
	}

	return (
		<div className="w-full h-full relative group/new-chat">
			<ConversationHeader setSearchText={setSearchText} searchRef={searchRef} />
			{!searchFocus ? (
				<div
					className={`pb-4 space-y-1 ${
						menuOpen ? "overflow-hidden" : "overflow-y-auto"
					} w-full h-[calc(100%_-_75px)] scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200 scrollbar-thumb-rounded-full scrollbar-track-rounded-full relative`}
					id="conversationContainer"
				>
					<div
						className={`fixed top-18 left-12 md:right-0 md:px-4 sm:right-0 px-4 z-50 overflow-hidden ${
							menuOpen
								? "visible h-full transition-[height] ease-in-out duration-300"
								: "invisible h-0"
						}`}
					>
						<Menu />
					</div>
					<InfiniteScroll
						dataLength={data?.data?.length || 8}
						next={fetchMoreData}
						hasMore={hasMore}
						loader={
							!isLoading ? (
								<h4 className="text-xl font-semibold py-2 text-gray-400 px-[40px]">
									Loading...
								</h4>
							) : null
						}
						scrollableTarget="conversationContainer"
						endMessage={
							data?.data?.length > 8 ? (
								<p className="text-center text-xl py-2 text-gray-400 px-[40px] font-light">
									You have seen it all
								</p>
							) : null
						}
					>
						{content}
					</InfiniteScroll>
				</div>
			) : (
				<SearchItems
					searchText={searchText}
					setSearchText={setSearchText}
					searchRef={searchRef}
				/>
			)}

			{!menuOpen && !searchFocus && (
				<div className="absolute bottom-5 right-5 hidden group-hover/new-chat:block sm:block">
					{newChatOptions && (
						<div
							style={{ background: bg, color: textColor, border: border }}
							className="p-[15px] backdrop-blur-[3px] w-[200px] space-y-2 rounded-lg shadow font-semibold mb-4"
							id="chat-options"
						>
							<button
								onClick={() => dispatch(createNewGroup(true))}
								className="w-full px-3 py-1 hover:bg-white rounded text-left flex items-center gap-2 text-sm dark:hover:bg-[#00000033]"
							>
								<FaUsers className="text-xl" />
								New Group
							</button>
							<button
								onClick={() => dispatch(CreateNewChat(true))}
								className="w-full px-3 py-1 hover:bg-white rounded text-left flex items-center gap-2 text-sm dark:hover:bg-[#00000033]"
							>
								<BiSolidUser className="text-xl" />
								New Chat
							</button>
						</div>
					)}
					<div className="flex justify-end relative z-10">
						{!newChatOptions && (
							<button
								style={{
									background: tinycolor(main).setAlpha(0.7).toRgbString(),
								}}
								onClick={() => dispatch(selectNewChatOption(true))}
								className="p-4 text-xl rounded-md text-white"
							>
								<BsFillChatRightDotsFill />
							</button>
						)}
						{newChatOptions && (
							<button
								style={{
									background: tinycolor(main).setAlpha(0.7).toRgbString(),
								}}
								onClick={() => dispatch(selectNewChatOption(false))}
								className="p-4 text-xl rounded-md text-white"
							>
								<AiOutlineCloseCircle />
							</button>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default Conversations;
