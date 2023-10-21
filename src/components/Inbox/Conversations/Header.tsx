import { CiSearch } from "react-icons/ci";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { FiArrowLeft } from "react-icons/fi";
import { ReduxState, useDispatch, useSelector } from "../../../lib/redux/store";
import {
	IsSearchFocus,
	openMenu,
} from "../../../lib/redux/slices/common/commonSlice";
import { Dispatch, SetStateAction } from "react";
import { useDebouncedCallback } from "use-debounce";

type Prop = {
	setSearchText: Dispatch<SetStateAction<string>>;
};

const ConversationHeader = ({ setSearchText }: Prop) => {
	const { menuOpen, searchFocus } = useSelector(
		(state: ReduxState) => state.common
	);
	const dispatch = useDispatch();
	const debounced = useDebouncedCallback((value) => {
		setSearchText(value);
	}, 1000);

	return (
		// Theme color
		<div className="w-full h-[75px] flex items-center gap-2 px-[25px] md:px-[15px] sm:px-[15px]">
			{searchFocus && (
				<button onClick={() => dispatch(IsSearchFocus(false))}>
					<FiArrowLeft className="text-[25px] text-[#B4B4B4]" />
				</button>
			)}
			<div className="relative w-full">
				<input
					className="border border-[#B4B4B4] dark:border-[#7e7e7e] rounded w-full py-2 pr-3 pl-[40px] text-gray-700 leading-tight focus:outline-none focus:shadow text-[17px] placeholder:text-[#B4B4B4] dark:bg-transparent dark:text-white"
					type="text"
					placeholder="Search..."
					// value={searchText}
					onFocus={() => dispatch(IsSearchFocus(true))}
					onChange={(e) => debounced(e.target.value)}
				/>
				<CiSearch className=" absolute top-1/2 transform -translate-y-1/2 left-2 text-3xl text-[#B4B4B4]" />
			</div>
			{!searchFocus && !menuOpen && (
				<button onClick={() => dispatch(openMenu(true))}>
					<AiOutlineMenu className="text-[30px] text-[#B4B4B4] dark:text-[#7e7e7e]" />
				</button>
			)}
			{!searchFocus && menuOpen && (
				<button onClick={() => dispatch(openMenu(false))}>
					<AiOutlineClose className="text-[30px] text-[#B4B4B4] dark:text-[#7e7e7e]" />
				</button>
			)}
		</div>
	);
};

export default ConversationHeader;
