/* eslint-disable no-mixed-spaces-and-tabs */
import { BiDotsVerticalRounded } from "react-icons/bi";
import { FiArrowLeft } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { conversationOptionsOn } from "../../../lib/redux/slices/common/commonSlice";
import { ReduxState, useSelector } from "../../../lib/redux/store";
import ConversationOptions from "../Conversations/ConversationOptions";
import { useGetSingleConversationQuery } from "../../../lib/redux/slices/conversation/conversationApi";
import moment from "moment";
import { UserInterface } from "../../../interfaces/user";
import useColorScheme from "../../../Hooks/useColorScheme";
import tinycolor from "tinycolor2";

const MessageHeader = () => {
	const navigate = useNavigate();
	const { conversationOptions } = useSelector(
		(state: ReduxState) => state.common
	);
	const { user } = useSelector((state: ReduxState) => state.user);
	const { id } = useParams();
	const dispatch = useDispatch();
	const { textColor, primary, secondary } = useColorScheme();
	const bg = tinycolor(secondary).setAlpha(0.8).toRgbString();

	const { data, isLoading, isError } = useGetSingleConversationQuery(id);

	const participantColor = data?.data?.isGroup
		? data?.data?.groupColor
		: data?.data?.participants.find((p: UserInterface) => p._id !== user?._id)
				.color;

	let content;

	if (isLoading) {
		content = <div>Loading...</div>;
	} else if (!isLoading && isError) {
		content = <div>Something went wrong</div>;
	} else if (!isLoading && !isError && !data?.data) {
		content = <div className="dark:text-gray-500"></div>;
	} else if (!isLoading && !isError && data?.data) {
		const conversation = data?.data;
		const conversationName = conversation?.isGroup
			? conversation.groupName
			: "";
		const participant = !conversation?.isGroup
			? conversation.participants.find(
					(p: UserInterface) => p._id !== user?._id
			  )
			: null;
		content = (
			<>
				<div style={{ color: textColor }} className="flex items-center gap-3">
					<button onClick={() => navigate("/")} className="hidden sm:block">
						<FiArrowLeft className="text-[25px]" />
					</button>
					<div
						style={{ background: participantColor }}
						className="w-[45px] h-[45px] rounded-full flex justify-center items-center relative"
					>
						<p className="text-3xl font-bold text-white uppercase">
							{conversation?.isGroup
								? conversationName[0]
								: participant?.name[0]}
						</p>
					</div>
				</div>
				<div className=" leading-5" style={{ color: textColor }}>
					<p className="text-[17px] font-semibold">
						{conversation?.isGroup ? conversationName : participant?.name}
					</p>
					{!conversation?.isGroup && (
						<p className="text-[12px]">
							{participant.status === "offline"
								? "Last seen " + moment(participant.lastActive).fromNow()
								: "online"}
						</p>
					)}
				</div>
			</>
		);
	}

	return (
		<div
			style={{
				backgroundColor: bg,
				borderLeft: `1px solid ${primary}`,
			}}
			className="flex justify-between items-center px-[25px] sm:px-[15px] min-h-[75px] sm:min-h-[60px] py-2 w-full relative z-10"
		>
			<div className="flex items-center gap-3">{content}</div>
			<button
				onClick={() => dispatch(conversationOptionsOn(!conversationOptions))}
			>
				<BiDotsVerticalRounded className="text-[#4B4B4B] dark:text-white text-3xl" />
			</button>
			{
				<div
					className={`absolute top-[60px] right-8 sm:right-4 z-50 ${
						conversationOptions
							? "h-full w-fit visible opacity-1 transition-all ease-in-out"
							: "h-0 w-0 invisible opacity-0"
					}`}
				>
					<ConversationOptions conversation={data?.data} />
				</div>
			}
		</div>
	);
};

export default MessageHeader;
