import { useState, Dispatch, SetStateAction, useRef } from "react";
import { IoMdClose } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { useDebouncedCallback } from "use-debounce";
import { ReduxState, useSelector } from "../../../../lib/redux/store";
import { MessageInterface } from "../../../../interfaces/message";
import { ConversationInterface } from "../../../../interfaces/conversation";
import Item from "./Item";
import { useGetSearchedChatQuery } from "../../../../lib/redux/slices/conversation/conversationApi";
import useColorScheme from "../../../../Hooks/useColorScheme";

type Props = {
	setForwardOpen: Dispatch<SetStateAction<boolean>>;
	message: MessageInterface | null;
};

const Forward = ({ setForwardOpen, message }: Props) => {
	const [searchText, setSearchText] = useState<string>("");
	const searchRef = useRef<HTMLInputElement | null>(null);

	const { user } = useSelector((state: ReduxState) => state.user);

	const { isLoading, isError, data, isFetching } = useGetSearchedChatQuery({
		id: user?._id,
		text: searchText,
	});

	const debounced = useDebouncedCallback((value) => {
		setSearchText(value);
	}, 1000);

	const { textColor, secondary } = useColorScheme();

	let content = null;
	if (isLoading || isFetching) {
		content = <p className="p-3 text-center">Loading...</p>;
	} else if (!isLoading && isError) {
		content = (
			<p className="text-red-500 font-semibold px-1">Something went wrong</p>
		);
	} else if (!isLoading && !isError && !data?.data?.length && !searchText) {
		content = <p className="text-gray-500 font-semibold px-1">Search User</p>;
	} else if (!isLoading && !isError && !data?.data?.length) {
		content = (
			<p className="text-gray-500 font-semibold px-1">No Conversation Found</p>
		);
	} else if (!isLoading && !isError && data?.data?.length) {
		content = data?.data?.map((item: ConversationInterface) => (
			<Item
				key={item._id}
				item={item}
				message={message}
				setForwardOpen={setForwardOpen}
			/>
		));
	}

	return (
		<div
			style={{ color: textColor, background: secondary }}
			id="message-forward"
			className="max-w-[400px] min-w-[300px] sm:w-[90%] relative top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-2xl flex flex-col rounded-md"
		>
			<div className="px-4 py-3 flex justify-between items-center w-full rounded-t-md">
				<p className="text-lg font-semibold">Forward Message</p>
				<button
					onClick={() => {
						setForwardOpen(false);
						setSearchText("");
						searchRef!.current!.value = "";
					}}
				>
					<IoMdClose className="text-2xl" />
				</button>
			</div>
			<div className="w-full relative px-4">
				<input
					ref={searchRef}
					onChange={(e) => debounced(e.target.value)}
					className={`pl-4 pr-10 py-2 w-full font-light border border-[#B4B4B4] dark:border-[#7e7e7e] focus:shadow text-[17px] placeholder:text-[#B4B4B4] dark:bg-transparent dark:text-white outline-none rounded`}
					type="text"
					placeholder="Search..."
				/>
				<IoSearchOutline className="absolute top-1/2 right-6 transform -translate-y-1/2 text-3xl text-[#B4B4B4]" />
			</div>
			<div className="p-4 gap-4 h-[250px] max-h-[45%] overflow-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-lightBlack scrollbar-track-[#1d2535]">
				{content}
			</div>
		</div>
	);
};

export default Forward;
