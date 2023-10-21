import { Link } from "react-router-dom";
import { ConversationInterface } from "../../../../interfaces/conversation";
import {
	ReduxState,
	useDispatch,
	useSelector,
} from "../../../../lib/redux/store";
import { conversationOn } from "../../../../lib/redux/slices/common/commonSlice";
import { Dispatch, SetStateAction } from "react";
import moment from "moment";

type Props = {
	conversation: ConversationInterface;
	setSearchText: Dispatch<SetStateAction<string>>;
};

const User = ({ conversation, setSearchText }: Props) => {
	const { user } = useSelector((state: ReduxState) => state.user);
	const participant = conversation?.participants?.find(
		(p) => p._id !== user?._id
	);
	const dispatch = useDispatch();
	return (
		<Link
			to={`/messages/${conversation._id}`}
			className="text-sm font-medium flex items-center gap-2 hover:bg-[#00000028] p-3 rounded-md"
			onClick={() => {
				dispatch(conversationOn());
				setSearchText("");
			}}
		>
			<div
				style={{ background: participant?.color }}
				className="w-[45px] h-[45px] rounded-full flex justify-center items-center relative"
			>
				<p className="text-3xl font-bold text-white">{participant?.name[0]}</p>
			</div>
			<div className="group-hover/menu:text-white">
				<p className="text-[17px] font-semibold line-clamp-1">
					{participant?.name}
				</p>
				<small className="inline-block min-w-fit">
					{moment(conversation.timestamp).fromNow()}
				</small>
			</div>
		</Link>
	);
};

export default User;
