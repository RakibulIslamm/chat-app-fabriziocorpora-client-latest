/* eslint-disable no-mixed-spaces-and-tabs */
import { useState, Dispatch, SetStateAction, RefObject } from "react";
import User from "./User";
import { AiOutlineUser, AiOutlineUsergroupAdd } from "react-icons/ai";
import useColorScheme from "../../../../Hooks/useColorScheme";
import tinycolor from "tinycolor2";
import { ReduxState, useSelector } from "../../../../lib/redux/store";
import {
	useGetSearchedChatQuery,
	useGetSearchedGroupQuery,
} from "../../../../lib/redux/slices/conversation/conversationApi";
import { ConversationInterface } from "../../../../interfaces/conversation";
import Group from "./Group";

type Props = {
	searchText: string | null;
	setSearchText: Dispatch<SetStateAction<string>>;
	searchRef: RefObject<HTMLInputElement>;
};

const SearchItems = ({ searchText, setSearchText, searchRef }: Props) => {
	const { user } = useSelector((state: ReduxState) => state.user);
	const [searchFor, setSearchFor] = useState("user");

	const { textColor, main } = useColorScheme();

	const {
		isLoading: chatLoading,
		isError: chatError,
		data: conversations,
	} = useGetSearchedChatQuery({
		id: user?._id,
		text: searchText,
	});

	const { isLoading, isError, data } = useGetSearchedGroupQuery(searchText);

	let content;

	if (searchFor === "user") {
		if (chatLoading) {
			content = <div>Loading...</div>;
		} else if (!chatLoading && chatError) {
			content = <div>Something went wrong</div>;
		} else if (!searchText) {
			content = <div className="dark:text-gray-500">Search Chat</div>;
		} else if (!chatLoading && !chatError && !conversations?.data?.length) {
			content = <div className="dark:text-gray-500">User not found</div>;
		} else if (!chatLoading && !chatError && conversations?.data?.length) {
			content = conversations?.data?.map(
				(conversation: ConversationInterface) => (
					<User
						key={conversation._id}
						conversation={conversation}
						searchRef={searchRef}
					/>
				)
			);
		}
	} else {
		if (isLoading) {
			content = <div>Loading...</div>;
		} else if (!isLoading && isError) {
			content = <div>Something went wrong</div>;
		} else if (!searchText) {
			content = <div className="dark:text-gray-500">Search Group</div>;
		} else if (!isLoading && !isError && !data?.data?.length) {
			content = <div className="dark:text-gray-500">Group not found</div>;
		} else if (!isLoading && !isError && data?.data?.length) {
			content = data?.data?.map((conversation: ConversationInterface) => (
				<Group key={conversation._id} conversation={conversation} />
			));
		}
	}

	return (
		<div style={{ color: textColor }} className="h-full">
			<div className="px-[20px] py-3 flex items-center gap-3">
				<button
					onClick={() => {
						setSearchFor("user");
						setSearchText("");
					}}
					style={
						searchFor === "user"
							? {
									background: tinycolor(main).setAlpha(0.7).toRgbString(),
							  }
							: {
									background: "lightgrey",
									color: "black",
							  }
					}
					className={`px-4 py-1 rounded-full flex items-center gap-1`}
				>
					<AiOutlineUser />
					User
				</button>
				<button
					style={
						searchFor === "group"
							? {
									background: tinycolor(main).setAlpha(0.7).toRgbString(),
							  }
							: {
									background: "lightgrey",
									color: "black",
							  }
					}
					onClick={() => {
						setSearchFor("group");
						setSearchText("");
					}}
					className={`px-4 py-1 rounded-full flex items-center gap-1`}
				>
					<AiOutlineUsergroupAdd />
					Group
				</button>
			</div>
			<div className="px-[20px] overflow-y-auto h-[calc(100%_-_135px)] scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
				{content}
			</div>
		</div>
	);
};

export default SearchItems;
