/* eslint-disable no-mixed-spaces-and-tabs */
import useColorScheme from "../../../Hooks/useColorScheme";
import {
	addMembersOn,
	groupMembersOn,
} from "../../../lib/redux/slices/common/commonSlice";
import { ReduxState, useDispatch, useSelector } from "../../../lib/redux/store";
import { FiArrowLeft } from "react-icons/fi";
import { useState } from "react";
import { UserInterface } from "../../../interfaces/user";
import { CiSearch } from "react-icons/ci";
import { useDebouncedCallback } from "use-debounce";
import { useParams } from "react-router-dom";
import { useGetMembersQuery } from "../../../lib/redux/slices/user/userApi";
import Item from "../../NewChatOptions/NewGroup/Item";
import {
	useAddGroupMembersMutation,
	useUpdateConversationMutation,
} from "../../../lib/redux/slices/conversation/conversationApi";
import { v4 as uuid } from "uuid";
import { MessageInterface } from "../../../interfaces/message";
import { useSendMessageMutation } from "../../../lib/redux/slices/message/messageApi";

const AddMembers = () => {
	const { user } = useSelector((state: ReduxState) => state.user);
	const [selectedUsers, setSelectedUsers] = useState<UserInterface[]>([]);
	const [searchText, setSearchText] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const dispatch = useDispatch();
	const { textColor } = useColorScheme();
	const { id } = useParams();

	const { isLoading, isError, data } = useGetMembersQuery({
		id: user?._id,
		q: searchText,
		conversationId: id,
	});

	const handleSelectedUsers = (user: UserInterface) => {
		const isSelected = selectedUsers.includes(user);
		if (isSelected) {
			setSelectedUsers(selectedUsers.filter((item) => item._id !== user._id));
		} else {
			setSelectedUsers([...selectedUsers, user]);
		}
	};

	const debounced = useDebouncedCallback((value) => {
		setSearchText(value);
	}, 1000);

	const [addGroupMembers] = useAddGroupMembersMutation();

	const [sendMessage] = useSendMessageMutation();
	const [updateConversation] = useUpdateConversationMutation();

	const handleAddGroupMembers = async () => {
		setLoading(true);
		try {
			const userIds = selectedUsers.map((user) => user._id);
			const names = selectedUsers
				.map((user) => user.name)
				.slice(0, 4)
				.join(", ");
			const msg =
				userIds.length > 5
					? `${names} and ${userIds.length - 5} people added by ${user?.name}`
					: `${names} ${userIds.length > 1 ? "are" : "is"} added by ${
							user?.name
					  }`;
			const result = await addGroupMembers({
				conversationId: id,
				userIds: [...userIds],
			});
			if ("data" in result && result.data?.success) {
				const messageData: Partial<MessageInterface> = {
					sender: { name: user?.name as string, id: user?._id as string },
					messageId: uuid(),
					conversationId: id,
					message: msg,
					forGroup: true,
					addMembers: {
						addedBy: user?._id as string,
						addedMembers: [...userIds] as string[],
					},
					timestamp: Date.now(),
				};
				const conversationData = {
					sender: user?._id,
					lastMessage: "Members Added",
					img: false,
					file: false,
					timestamp: Date.now(),
				};
				await sendMessage(messageData);
				await updateConversation({ messageData: conversationData, id: id });
				dispatch(addMembersOn(false));
				dispatch(groupMembersOn(false));
			}
		} catch (error) {
			console.log(error);
			// toast.error("Something went wrong")
		} finally {
			setLoading(false);
		}
	};

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

	return (
		<div style={{ color: textColor }} className="w-full h-full relative">
			<div className="h-[90px]">
				<div className="flex items-center gap-3">
					<button onClick={() => dispatch(addMembersOn(false))}>
						<FiArrowLeft className="text-[25px]" />
					</button>
					<p className="text-lg font-semibold">Add Members</p>
				</div>
				<div className="relative w-full text-gray-500 mt-2">
					<input
						className="border border-[#B4B4B4] rounded w-full py-2 pr-3 pl-[40px] leading-tight focus:outline-none focus:shadow text-[17px] placeholder:text-[#B4B4B4]"
						type="text"
						placeholder="Search..."
						onChange={(e) => debounced(e.target.value)}
					/>
					<CiSearch className=" absolute top-1/2 transform -translate-y-1/2 left-2 text-3xl" />
				</div>
			</div>
			<div className="h-[calc(100%_-_130px)] overflow-y-auto space-y-3 pb-2 pl-3">
				{members}
			</div>
			<button
				disabled={loading}
				onClick={handleAddGroupMembers}
				className="w-full h-[40px] bg-black bg-opacity-50"
			>
				{loading ? "Loading..." : "Add"}
			</button>
		</div>
	);
};

export default AddMembers;
