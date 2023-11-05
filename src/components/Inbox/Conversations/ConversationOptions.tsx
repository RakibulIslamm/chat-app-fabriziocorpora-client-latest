import { IoTrashBinSharp } from "react-icons/io5";
import { HiUsers } from "react-icons/hi2";
import {
	conversationOptionsOn,
	groupMembersOn,
} from "../../../lib/redux/slices/common/commonSlice";
import { ReduxState, useDispatch, useSelector } from "../../../lib/redux/store";
import { useEffect } from "react";
import tinycolor from "tinycolor2";
import useColorScheme from "../../../Hooks/useColorScheme";
import { useNavigate, useParams } from "react-router-dom";
import {
	useDeleteConversationMutation,
	useUpdateConversationMutation,
} from "../../../lib/redux/slices/conversation/conversationApi";
import { ConversationInterface } from "../../../interfaces/conversation";
import { AiOutlineClear } from "react-icons/ai";
import { useDeleteAllMessageMutation } from "../../../lib/redux/slices/message/messageApi";

const ConversationOptions = ({
	conversation,
}: {
	conversation: ConversationInterface;
}) => {
	const { user } = useSelector((state: ReduxState) => state.user);
	const dispatch = useDispatch();
	const { secondary, textColor, main } = useColorScheme();
	const bg = tinycolor(secondary).setAlpha(0.8).toRgbString();
	const border = tinycolor(main).setAlpha(0.2).toRgbString();

	const { id } = useParams();

	useEffect(() => {
		document.body.addEventListener("click", (e) => {
			const target = e.target instanceof HTMLElement;
			if (
				target &&
				e.target.id !== "conversation-options" &&
				!e.target.classList.contains("menu")
			) {
				dispatch(conversationOptionsOn(false));
			}
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const navigate = useNavigate();
	const [deleteConversation] = useDeleteConversationMutation();
	const [updateConversation] = useUpdateConversationMutation();
	const [deleteAllMessage] = useDeleteAllMessageMutation();

	const handleDeleteAllMessage = async () => {
		try {
			const conversationData = {
				sender: user?._id,
				lastMessage: "",
				img: false,
				file: false,
				timestamp: Date.now(),
			};
			const result = await deleteAllMessage(id);
			if ("data" in result && result.data.data.deletedCount > 0) {
				await updateConversation({ messageData: conversationData, id: id });
			}
		} catch (error) {
			console.log(error);
		}
	};

	return (
		// Theme color change here below
		<>
			{!conversation?.deleted && (
				<div
					style={{
						background: bg,
						color: textColor,
						border: `1px solid ${border}`,
					}}
					className={`p-2 backdrop-blur-[3px] md:w-full sm:w-full rounded-lg shadow font-semibold`}
					id="conversation-options"
				>
					{conversation?.isGroup && (
						<>
							<button
								onClick={() => dispatch(groupMembersOn(true))}
								className="w-full px-3 py-2 hover:bg-black hover:bg-opacity-20 rounded flex items-center gap-2 menu"
							>
								<HiUsers className="text-lg sm:text-base menu" />
								<span className="text-sm font-normal">Group members</span>
							</button>
							{conversation?.groupCreator === user?._id && (
								<button
									onClick={handleDeleteAllMessage}
									className="w-full px-3 py-2 hover:bg-black hover:bg-opacity-20 rounded flex items-center gap-2 menu"
								>
									<AiOutlineClear className="text-lg sm:text-base menu" />
									<span className="text-sm font-normal">Clear Messages</span>
								</button>
							)}
							{conversation?.groupCreator === user?._id && (
								<button
									onClick={() => {
										deleteConversation(id);
										navigate("/");
									}}
									className="w-full px-3 py-2 hover:bg-black hover:bg-opacity-20 rounded flex items-center gap-2 menu"
								>
									<IoTrashBinSharp className="text-lg sm:text-base menu" />
									<span className="text-sm font-normal">Delete</span>
								</button>
							)}
						</>
					)}

					{!conversation?.isGroup && (
						<>
							<button
								onClick={handleDeleteAllMessage}
								className="w-full px-3 py-2 hover:bg-black hover:bg-opacity-20 rounded flex items-center gap-2 menu"
							>
								<AiOutlineClear className="text-lg sm:text-base menu" />
								<span className="text-sm font-normal">Clear Messages</span>
							</button>

							<button
								onClick={() => {
									deleteConversation(id);
									navigate("/");
								}}
								className="w-full px-3 py-2 hover:bg-black hover:bg-opacity-20 rounded flex items-center gap-2 menu"
							>
								<IoTrashBinSharp className="text-lg sm:text-base menu" />
								<span className="text-sm font-normal">Delete</span>
							</button>
						</>
					)}
				</div>
			)}
		</>
	);
};

export default ConversationOptions;
