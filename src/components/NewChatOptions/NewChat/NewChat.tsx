import { FiArrowLeft } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import { ReduxState, useDispatch, useSelector } from "../../../lib/redux/store";
import { conversationOn } from "../../../lib/redux/slices/common/commonSlice";
import User from "./User";
import useColorScheme from "../../../Hooks/useColorScheme";
import { useGetUsersQuery } from "../../../lib/redux/slices/user/userApi";
import { UserInterface } from "../../../interfaces/user";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

const NewChat = () => {
	const [searchText, setSearchText] = useState<string>("");
	const { user } = useSelector((state: ReduxState) => state.user);
	const dispatch = useDispatch();
	const { textColor } = useColorScheme();
	const { isLoading, isError, data, isFetching } = useGetUsersQuery({
		id: user?._id,
		q: searchText,
	});

	const debounced = useDebouncedCallback((value) => {
		setSearchText(value);
	}, 1000);

	let content;

	if (isLoading) {
		content = <div>Loading...</div>;
	} else if (!isLoading && isError) {
		content = <div>Something went wrong</div>;
	} else if (!isLoading && !isError && !data?.data?.length) {
		content = <div className="dark:text-gray-500">User not found</div>;
	} else if (!isLoading && !isError && data?.data?.length) {
		content = data?.data?.map((user: UserInterface) => (
			<User key={user._id} user={user} />
		));
	}

	return (
		<div style={{ color: textColor }} className="w-full h-full relative">
			<div className="px-[20px]">
				<div className="w-full flex items-center gap-4 h-[75px]">
					<button onClick={() => dispatch(conversationOn())}>
						<FiArrowLeft className="text-[25px]" />
					</button>

					<h2 className="text-[20px] font-medium">New Chat</h2>
				</div>
				<div className="relative w-full dark:text-gray-700">
					<input
						className="border border-[#B4B4B4] rounded w-full py-2 pr-3 pl-[40px] leading-tight focus:outline-none focus:shadow text-[17px]"
						type="text"
						onChange={(e) => debounced(e.target.value)}
						placeholder="Search..."
					/>
					{!isFetching && (
						<CiSearch className=" absolute top-1/2 transform -translate-y-1/2 left-2 text-3xl" />
					)}
					{isFetching && (
						<div className="absolute top-1/2 transform -translate-y-1/2 left-2">
							<div className="border-t-transparent border-solid animate-spin  rounded-full border-gray-700 border h-6 w-6"></div>
						</div>
					)}
				</div>
			</div>
			<div className="w-full h-[calc(100%_-_130px)] mt-5 overflow-y-auto px-[25px]">
				{content}
			</div>
		</div>
	);
};

export default NewChat;
