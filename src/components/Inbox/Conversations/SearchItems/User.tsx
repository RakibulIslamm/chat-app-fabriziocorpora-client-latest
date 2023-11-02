import { Link } from "react-router-dom";
import { ConversationInterface } from "../../../../interfaces/conversation";
import {
	ReduxState,
	useDispatch,
	useSelector,
} from "../../../../lib/redux/store";
import { conversationOn } from "../../../../lib/redux/slices/common/commonSlice";
import { RefObject } from "react";
import moment from "moment";

type Props = {
	conversation: ConversationInterface;
	searchRef: RefObject<HTMLInputElement>;
};

const User = ({ conversation, searchRef }: Props) => {
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
				searchRef!.current!.value = "";
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
					{moment(participant?.lastActive).fromNow()}
				</small>
			</div>
		</Link>
	);
};

export default User;
