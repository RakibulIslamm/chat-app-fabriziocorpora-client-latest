import { Link, useNavigate } from "react-router-dom";
import { ConversationInterface } from "../../../../interfaces/conversation";
import {
	ReduxState,
	useDispatch,
	useSelector,
} from "../../../../lib/redux/store";
import { conversationOn } from "../../../../lib/redux/slices/common/commonSlice";
import moment from "moment";
import {
	conversationsApi,
	useJoinGroupMutation,
	useUpdateConversationMutation,
} from "../../../../lib/redux/slices/conversation/conversationApi";
import useColorScheme from "../../../../Hooks/useColorScheme";
import { useState } from "react";
import { MessageInterface } from "../../../../interfaces/message";
import { v4 as uuid } from "uuid";
import { useSendMessageMutation } from "../../../../lib/redux/slices/message/messageApi";

type Props = {
	conversation: ConversationInterface;
};

const Group = ({ conversation }: Props) => {
	const [loading, setLoading] = useState<boolean>(false);
	const { user } = useSelector((state: ReduxState) => state.user);
	const dispatch = useDispatch();
	const { main, textColor } = useColorScheme();
	const navigate = useNavigate();

	const [joinGroup] = useJoinGroupMutation();
	const [sendMessage] = useSendMessageMutation();
	const [updateConversation] = useUpdateConversationMutation();

	const handleJoin = async () => {
		setLoading(true);
		try {
			const conv = await joinGroup({ id: conversation._id, userId: user?._id });

			const messageData: Partial<MessageInterface> = {
				sender: { name: user?.name as string, id: user?._id as string },
				messageId: uuid(),
				conversationId: conversation._id,
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
				await updateConversation({
					messageData: conversationData,
					id: conversation._id,
				});
				dispatch(conversationOn());
				navigate(`/messages/${conv?.data?.data?._id}`);
			}
		} catch (err) {
			// Handle any other errors that may occur during the request
			console.log(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			style={{ color: textColor }}
			className="flex items-center justify-between gap-2 w-full overflow-hidden"
		>
			<Link
				to={`/messages/${conversation._id}`}
				className="text-sm font-medium p-3 rounded-md flex items-center gap-2 w-full"
				onClick={() => dispatch(conversationOn())}
			>
				<div
					style={{ background: conversation.groupColor }}
					className="w-[45px] h-[45px] rounded-full flex justify-center items-center relative"
				>
					<p className="text-3xl font-bold text-white">
						{conversation?.groupName && conversation?.groupName[0]}
					</p>
				</div>
				<div className="w-[calc(100%_-_60px)]">
					<p className="text-[17px] font-semibold line-clamp-1">
						{conversation.groupName}
					</p>
					<small className="inline-block min-w-fit">
						{moment(conversation.timestamp).fromNow()}
					</small>
				</div>
			</Link>
			{loading ? (
				<button
					style={{ background: main }}
					disabled
					className="px-4 py-1 rounded text-white"
				>
					Joining...
				</button>
			) : conversation.participants.some((p) => p._id === user?._id) ? (
				<button className="px-4 py-1 bg-slate-400 rounded text-white" disabled>
					Joined
				</button>
			) : (
				<button
					style={{ background: main }}
					onClick={handleJoin}
					className="px-4 py-1 rounded text-white"
				>
					Join
				</button>
			)}
		</div>
	);
};

export default Group;
