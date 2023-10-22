import { useState, useMemo } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import { MdArrowForwardIos } from "react-icons/md";
import { ReduxState, useDispatch, useSelector } from "../../../lib/redux/store";
import Item from "./Item";
import { conversationOn } from "../../../lib/redux/slices/common/commonSlice";
import SelectedItem from "./SelectedItem";
import useColorScheme from "../../../Hooks/useColorScheme";
import tinycolor from "tinycolor2";
import { useGetMembersQuery } from "../../../lib/redux/slices/user/userApi";
import { UserInterface } from "../../../interfaces/user";
import { useCreateConversationMutation } from "../../../lib/redux/slices/conversation/conversationApi";
import { useNavigate } from "react-router-dom";
import { getRandomColor } from "../../../utils/randomColor";
import { useDebouncedCallback } from "use-debounce";

const NewGroup = () => {
	const [selectedUsers, setSelectedUsers] = useState<UserInterface[]>([]);
	const [groupNameOn, setGroupNameOn] = useState(false);
	const [groupName, setGroupName] = useState<string>("");
	const [searchText, setSearchText] = useState<string>("");

	const { user } = useSelector((state: ReduxState) => state.user);
	const dispatch = useDispatch();
	const { textColor, main } = useColorScheme();
	const { isLoading, isError, data } = useGetMembersQuery({
		id: user?._id,
		q: searchText,
	});
	const [createConversation, { isLoading: groupCreating }] =
		useCreateConversationMutation();
	const navigate = useNavigate();

	const handleSelectedUsers = (user: UserInterface) => {
		const isSelected = selectedUsers.includes(user);
		if (isSelected) {
			setSelectedUsers(selectedUsers.filter((item) => item._id !== user._id));
		} else {
			setSelectedUsers([...selectedUsers, user]);
		}
	};

	const color = useMemo(() => {
		return getRandomColor();
	}, []);

	const handleCreateGroup = async () => {
		const userIds = selectedUsers.map((user) => user._id);
		const conversation = {
			isGroup: true,
			groupName: groupName,
			groupCreator: user?._id,
			groupColor: color,
			participants: [...userIds, user?._id],
			sender: user?._id,
			lastMessage: "",
			unseenMessages: 0,
			img: false,
			timestamp: Date.now(),
		};
		try {
			const newConversation = await createConversation(conversation).unwrap();
			navigate(`messages/${newConversation?.data?._id}`);
			dispatch(conversationOn());
		} catch (err) {
			console.log(err);
		}
	};

	const debounced = useDebouncedCallback((value) => {
		setSearchText(value);
	}, 1000);

	let members;
	if (isLoading) {
		members = <div>Loading...</div>;
	} else if (!isLoading && isError) {
		members = <div>Something went wrong</div>;
	} else if (!isLoading && !isError && !data?.data?.length) {
		members = <div className="dark:text-gray-500">User not found</div>;
	} else if (!isLoading && !isError && data?.data?.length) {
		members = data?.data?.map((user: UserInterface) => (
			<Item
				key={user._id}
				item={user}
				selectedUsers={selectedUsers}
				handleSelectedUsers={handleSelectedUsers}
			/>
		));
	}

	// window.addEventListener("popstate", () => {
	// 	// if (window.history.state?.path === "new_group") {
	// 	// 	dispatch(conversationOn());
	// 	// }
	// 	if (window.history.state?.path === "group_name") {
	// 		setGroupNameOn(false);
	// 	}
	// 	console.log(window.history.state?.path);
	// });

	return (
		<div style={{ color: textColor }} className="w-full h-full relative">
			{!groupNameOn && (
				<div className="px-[20px]">
					<div className="w-full flex items-center gap-4 h-[75px]">
						<button onClick={() => dispatch(conversationOn())}>
							<FiArrowLeft className="text-[25px]" />
						</button>

						<h2 className="text-[20px] font-medium">Add Members</h2>
					</div>
					<div className="relative w-full text-gray-500">
						<input
							className="border border-[#B4B4B4] rounded w-full py-2 pr-3 pl-[40px] leading-tight focus:outline-none focus:shadow text-[17px] placeholder:text-[#B4B4B4]"
							type="text"
							placeholder="Search..."
							onChange={(e) => debounced(e.target.value)}
						/>
						<CiSearch className=" absolute top-1/2 transform -translate-y-1/2 left-2 text-3xl" />
					</div>
				</div>
			)}
			{groupNameOn && (
				<div className="px-[20px]">
					<div className="w-full h-[75px] flex items-center gap-4">
						<button
							onClick={() => {
								setGroupNameOn(false);
								window.history.pushState({ path: "group_name" }, "", null);
							}}
						>
							<FiArrowLeft className="text-[25px]" />
						</button>

						<h2 className="text-[20px] font-medium">Group Name</h2>
					</div>
					<input
						className="border border-[#B4B4B4] rounded w-full py-3 px-5 leading-tight focus:outline-none focus:shadow text-[17px] text-gray-500"
						type="text"
						placeholder="Group Name"
						value={groupName}
						onChange={(e) => setGroupName(e.target.value)}
					/>
				</div>
			)}
			{!groupNameOn && (
				<div className="w-full h-[calc(100%_-_130px)] mt-5 space-y-5 overflow-y-auto px-[20px]">
					{members}
				</div>
			)}
			{groupNameOn && (
				<div className="w-full h-full">
					<p className="font-semibold px-[20px] pt-[15px]">
						Members {selectedUsers.length}
					</p>
					<div className="w-full h-[calc(100%_-_190px)] mt-3 space-y-3 overflow-y-auto px-[20px]">
						{selectedUsers.map((user) => (
							<SelectedItem key={user._id} user={user} />
						))}
					</div>
				</div>
			)}

			{!groupNameOn && (
				<button
					style={{
						background: tinycolor(main).setAlpha(0.7).toRgbString(),
					}}
					onClick={() => setGroupNameOn(true)}
					className=" absolute bottom-5 right-5 p-3 rounded-full text-2xl text-white"
				>
					<MdArrowForwardIos />
				</button>
			)}
			{groupNameOn && groupName && !groupCreating && (
				<button
					style={{
						background: tinycolor(main).setAlpha(0.7).toRgbString(),
					}}
					onClick={handleCreateGroup}
					className=" absolute bottom-5 right-5 p-3 rounded-full text-2xl text-white"
				>
					<MdArrowForwardIos />
				</button>
			)}
			{groupCreating && (
				<div className="absolute w-full h-full bg-black bg-opacity-10 backdrop-blur-[3px] top-0 left-0 flex justify-center items-center z-50">
					<p className="text-2xl">loading...</p>
				</div>
			)}
		</div>
	);
};

export default NewGroup;
