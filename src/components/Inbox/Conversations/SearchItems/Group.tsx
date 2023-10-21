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
} from "../../../../lib/redux/slices/conversation/conversationApi";
import useColorScheme from "../../../../Hooks/useColorScheme";

type Props = {
	conversation: ConversationInterface;
};

const Group = ({ conversation }: Props) => {
	const { user } = useSelector((state: ReduxState) => state.user);
	const dispatch = useDispatch();
	const [joinGroup, { isLoading: joining }] = useJoinGroupMutation();
	const { main, textColor } = useColorScheme();
	const navigate = useNavigate();

	const handleJoin = async () => {
		try {
			const conv = await joinGroup({ id: conversation._id, userId: user?._id });

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
				navigate(`/messages/${conv?.data?._id}`);
			}
		} catch (err) {
			// Handle any other errors that may occur during the request
			console.log(err);
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
			{joining ? (
				<button
					style={{ background: main }}
					disabled
					className="px-4 py-1 rounded text-white"
				>
					Joining...
				</button>
			) : conversation.participants.some((p) => p._id === user?._id) ? (
				<button className="px-4 py-1 bg-slate-400 rounded text-white">
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
