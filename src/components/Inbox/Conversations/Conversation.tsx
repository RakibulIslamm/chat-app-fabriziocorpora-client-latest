/* eslint-disable no-mixed-spaces-and-tabs */
import { Link, useParams } from "react-router-dom";
import useColorScheme from "../../../Hooks/useColorScheme";
import tinycolor from "tinycolor2";
import { ConversationInterface } from "../../../interfaces/conversation";
import { ReduxState, useSelector } from "../../../lib/redux/store";
import { formateDate } from "../../../utils/formateDate";
import { UserInterface } from "../../../interfaces/user";
import { socket } from "../../../utils/socket";
import { useEffect } from "react";

type Props = {
	conversation: ConversationInterface;
};

const Conversation = ({ conversation }: Props) => {
	const { user } = useSelector((state: ReduxState) => state.user);
	const conversationName = conversation.isGroup ? conversation.groupName : "";
	const participant = !conversation.isGroup
		? conversation.participants.find((p) => p._id !== user?._id)
		: conversation.participants.find(
				(p: UserInterface) => p.status === "online" && p._id !== user?._id
		  );

	const { main, textColor } = useColorScheme();
	const { id } = useParams();
	const bg = tinycolor(main).setAlpha(0.7).toRgbString();
	const date = formateDate(conversation.timestamp);

	useEffect(() => {
		if (conversation.sender !== user?._id) {
			socket.emit("delivering", conversation._id);
		}
	}, [conversation, user?._id]);

	return (
		<>
			{!conversation?.deleted && (
				<div
					className="px-[20px] md:px-[15px] sm:px-[15px]"
					style={{ color: textColor }}
				>
					{/* Theme color */}
					<Link
						to={`/messages/${conversation._id}`}
						style={{
							background: `${conversation._id === id ? bg : ""}`,
							color: `${conversation._id === id ? "white" : ""}`,
						}}
						className={`flex items-center gap-2 w-full rounded-xl md:rounded-lg p-3 md:p-2 sm:p-2 group/menu hover:bg-black hover:bg-opacity-10`}
					>
						<div
							style={{
								background: `${
									conversation?.isGroup
										? conversation.groupColor
										: participant?.color
								}`,
							}}
							className="w-[55px] h-[55px] md:w-[45px] md:h-[45px] sm:w-[50px] sm:h-[50px] rounded-full flex justify-center items-center relative"
						>
							<p className="text-4xl md:text-xl font-semibold text-white uppercase">
								{conversationName ? conversationName[0] : participant?.name[0]}
							</p>
							<span
								className={`absolute bottom-[3px] right-[3px] border-2 md:border border-white dark:border-[#1C2032] rounded-full inline-block w-[13px] h-[13px] md:w-[9px] md:h-[9px] ${
									participant?.status === "online"
										? "bg-green-500"
										: "bg-gray-500"
								}`}
							></span>
						</div>
						<div className="w-[calc(100%_-_75px)] md:w-[calc(100%_-_55px)] leading-5">
							<div
								className={`w-full flex items-center justify-between md:leading-4`}
							>
								<p
									className={`text-[16px] line-clamp-1 ${
										conversation.sender !== user?._id &&
										conversation.unseenMessages > 0
											? "font-bold"
											: ""
									}`}
								>
									{conversation.isGroup ? conversationName : participant?.name}
								</p>
								<small className="inline-block min-w-fit md:text-xs">
									{date}
								</small>
							</div>
							<div className={`flex items-center gap-3 font-light`}>
								<p
									className={`line-clamp-1 text-[14px] md:text-[13px] w-[calc(100%_-_40px)] opacity-80 ${
										conversation.sender !== user?._id &&
										conversation.unseenMessages > 0
											? "font-bold"
											: ""
									}`}
								>
									{conversation.img
										? conversation.sender === user?._id
											? "You send an image"
											: "You receive an image"
										: conversation.lastMessage
										? conversation.lastMessage
										: "You are connected to message each other"}
								</p>
								{conversation.sender !== user?._id &&
									conversation.unseenMessages > 0 && (
										<p className="w-[25px] h-[25px] bg-yellow-500 p-2 rounded-full text-sm font-bold flex justify-center items-center">
											{conversation.unseenMessages < 10
												? conversation.unseenMessages
												: "9+"}
										</p>
									)}
							</div>
						</div>
					</Link>
				</div>
			)}
		</>
	);
};

export default Conversation;
