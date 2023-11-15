/* eslint-disable no-mixed-spaces-and-tabs */
import { BiDotsVerticalRounded } from "react-icons/bi";
import { FiArrowLeft } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { conversationOptionsOn } from "../../../lib/redux/slices/common/commonSlice";
import { ReduxState, useSelector } from "../../../lib/redux/store";
import ConversationOptions from "../Conversations/ConversationOptions";
import { useGetSingleConversationQuery } from "../../../lib/redux/slices/conversation/conversationApi";
import moment from "moment";
import { UserInterface } from "../../../interfaces/user";
import useColorScheme from "../../../Hooks/useColorScheme";
import tinycolor from "tinycolor2";
import { PiVideoCamera } from "react-icons/pi";
import { MdOutlineCall } from "react-icons/md";
import {
	CallInfoType,
	IncomingCallInfoType,
} from "../../../interfaces/callInfo";
import {
	callEnd,
	incomingCall,
	lineBusy,
	outgoingCall,
	ringing,
	setCallAnswered,
} from "../../../lib/redux/slices/call/callSlice";
import { socket } from "../../../utils/socket";

const MessageHeader = () => {
	const navigate = useNavigate();
	const { conversationOptions } = useSelector(
		(state: ReduxState) => state.common
	);
	const {
		callInformation,
		callAnswered,
		incomingCall: incoming,
		outgoingCall: outgoing,
	} = useSelector((state: ReduxState) => state.call);
	const { user } = useSelector((state: ReduxState) => state.user);
	const { id } = useParams();
	const dispatch = useDispatch();
	const { textColor, primary, secondary } = useColorScheme();
	const bg = tinycolor(secondary).setAlpha(0.8).toRgbString();

	const { data, isLoading, isError } = useGetSingleConversationQuery(id);
	const conversation = data?.data;

	const participantColor = data?.data?.isGroup
		? data?.data?.groupColor
		: data?.data?.participants.find((p: UserInterface) => p._id !== user?._id)
				.color;
	const conversationName = conversation?.isGroup ? conversation.groupName : "";
	const participant = !conversation?.isGroup
		? conversation?.participants?.find(
				(p: UserInterface) => p._id !== user?._id
		  )
		: null;

	// const { call } = useCalling();

	const handleCall = (callType: string) => {
		if (conversation?.isGroup) {
			console.log("Group call will send from here");
		} else {
			const callInfo: CallInfoType = {
				callType: (callType as "audio") || "video",
				isGroupCall: false,
				room: conversation?._id,
			};
			dispatch(
				outgoingCall({
					caller: user,
					receiver: participant,
					callInfo: callInfo,
				})
			);
		}
	};

	useEffect(() => {
		const listener = ({ caller, receiver, callInfo }: IncomingCallInfoType) => {
			// console.log(incoming, outgoing, callAnswered);
			if (receiver?._id === user?._id && user?._id !== caller?._id) {
				if (incoming || outgoing || callAnswered) {
					console.log("Line busy sent");
					socket.emit("lineBusy", { receiver, caller: caller });
				} else if (
					!incoming &&
					!outgoing &&
					!callAnswered &&
					!callInformation?.receiver._id
				) {
					console.log("incoming call....");
					dispatch(incomingCall({ caller, receiver, callInfo }));
				}
			}
		};

		socket.on("callSignal", listener);

		return () => {
			socket.off("callSignal", listener);
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [callAnswered, incoming, outgoing, user]);

	useEffect(() => {
		let interval: ReturnType<typeof setInterval>;
		const listener = ({ receiver, caller }: Partial<IncomingCallInfoType>) => {
			if (
				receiver?._id === callInformation?.receiver._id &&
				callInformation?.caller?._id === caller?._id
			) {
				console.log("Line busy received....");
				dispatch(lineBusy());

				interval = setInterval(() => {
					dispatch(callEnd());
				}, 3000);
			}
		};

		socket.on("lineBusy", listener);

		return () => {
			socket.off("lineBusy", listener);
			clearInterval(interval);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [callInformation?.receiver]);

	useEffect(() => {
		const listener = (receiver: UserInterface) => {
			if (receiver._id === callInformation?.receiver._id) {
				console.log("Ringing....");
				dispatch(ringing());
			}
		};

		socket.on("receiveSignal", listener);

		return () => {
			socket.off("receiveSignal", listener);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [callInformation?.receiver]);

	useEffect(() => {
		const listener = ({ receiver, caller }: Partial<IncomingCallInfoType>) => {
			if (
				receiver?._id === callInformation?.receiver._id &&
				caller?._id === callInformation?.caller?._id
			) {
				console.log("Call Answered");
				dispatch(setCallAnswered());
			}
		};

		socket.on("callAnswered", listener);

		return () => {
			socket.off("callAnswered", listener);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [callInformation?.receiver, callInformation]);

	useEffect(() => {
		const listener = ({ receiver, caller }: Partial<IncomingCallInfoType>) => {
			if (
				receiver?._id === callInformation?.receiver._id &&
				caller?._id === callInformation?.caller?._id
			) {
				console.log("Call ended");
				dispatch(callEnd());
			}
		};

		socket.on("callEnd", listener);

		return () => {
			socket.off("callEnd", listener);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [callInformation?.receiver, callInformation]);

	let content;

	if (isLoading) {
		content = <div>Loading...</div>;
	} else if (!isLoading && isError) {
		content = <div>Something went wrong</div>;
	} else if (!isLoading && !isError && !data?.data) {
		content = <div className="dark:text-gray-500"></div>;
	} else if (!isLoading && !isError && data?.data) {
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
			<div className="flex items-center gap-4">
				<button onClick={() => handleCall("video")}>
					<PiVideoCamera className="text-[#4B4B4B] dark:text-white text-2xl" />
				</button>
				<button onClick={() => handleCall("audio")}>
					<MdOutlineCall className="text-[#4B4B4B] dark:text-white text-2xl" />
				</button>
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
		</div>
	);
};

export default MessageHeader;
