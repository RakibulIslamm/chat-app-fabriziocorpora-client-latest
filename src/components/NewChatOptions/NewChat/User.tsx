import { useNavigate } from "react-router-dom";
import { UserInterface } from "../../../interfaces/user";
import { useCreateConversationMutation } from "../../../lib/redux/slices/conversation/conversationApi";
import { ReduxState, useDispatch, useSelector } from "../../../lib/redux/store";
import { conversationOn } from "../../../lib/redux/slices/common/commonSlice";
import moment from "moment";

type Props = {
	user: UserInterface;
};

const User = ({ user }: Props) => {
	const navigate = useNavigate();
	const { user: currentUser } = useSelector((state: ReduxState) => state.user);
	const [createConversation, { isLoading }] = useCreateConversationMutation();
	const participants = [user._id, currentUser?._id];
	const sender = currentUser?._id;
	const lastMessage = "";
	const unseenMessages = 0;
	const img = false;
	const timestamp = Date.now();

	const dispatch = useDispatch();

	const handleCreateConversation = async () => {
		const conversation = {
			participants,
			sender,
			lastMessage,
			unseenMessages,
			img,
			timestamp,
		};
		try {
			const data = await createConversation(conversation).unwrap();
			navigate(`messages/${data?.data?._id}`);
			dispatch(conversationOn());
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<>
			<button
				onClick={handleCreateConversation}
				className="text-sm font-medium flex items-center gap-2 hover:bg-[#00000025] p-3 rounded-md w-full"
			>
				<div
					style={{ background: user.color }}
					className="w-[45px] h-[45px] rounded-full flex justify-center items-center relative"
				>
					<p className="text-3xl font-bold text-white">{user?.name[0]}</p>
				</div>
				<div className="group-hover/menu:text-white flex flex-col">
					<p className="text-[17px] font-semibold line-clamp-1 text-left">
						{user?.name}
					</p>
					{user?.lastActive && (
						<small className="inline-block min-w-fit text-left">
							{moment(user?.lastActive).fromNow()}
						</small>
					)}
				</div>
			</button>
			{isLoading && (
				<div className="absolute w-full h-full bg-black bg-opacity-10 backdrop-blur-[3px] top-0 left-0 flex justify-center items-center z-50">
					<p className="text-2xl">loading...</p>
				</div>
			)}
		</>
	);
};

export default User;
