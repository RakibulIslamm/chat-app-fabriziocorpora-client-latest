import { ReduxState, useDispatch, useSelector } from "../lib/redux/store";
import Conversations from "../components/Inbox/Conversations/Conversations";
import { Outlet, useMatch } from "react-router-dom";
import NewGroup from "../components/NewChatOptions/NewGroup/NewGroup";
import NewChat from "../components/NewChatOptions/NewChat/NewChat";
import SettingsContainer from "../components/Settings/SettingsContainer";
import useColorScheme from "../Hooks/useColorScheme";
import tinycolor from "tinycolor2";
import { socket } from "../utils/socket";
import { useEffect } from "react";
import { IncomingCallInfoType } from "../interfaces/callInfo";
import { UserInterface } from "../interfaces/user";
import {
	callEnd,
	incomingCall,
	lineBusy,
	ringing,
	setCallAnswered,
} from "../lib/redux/slices/call/callSlice";
import OutgoingCall from "../components/Inbox/Messages/Call/OutgoingCall";
import IncomingCall from "../components/Inbox/Messages/Call/IncomingCall";
import MeetPage from "../components/Inbox/Messages/Call/jitsi/MeetPage";
import dialTone from "../audio/dial_tone.mp3";
import waiting from "../audio/waiting.mp3";
import incomingCallRing from "../audio/ringing.mp3";
import lineBusyTone from "../audio/line_busy.mp3";

// type Props = {};

const Index = () => {
	const { conversations, newChat, newGroup, settings } = useSelector(
		(state: ReduxState) => state.common
	);
	const { user } = useSelector((state: ReduxState) => state.user);
	// const { user } = useSelector((state: ReduxState) => state.user);
	const match = useMatch("/messages/:id");
	const { primary, secondary } = useColorScheme();
	const bg = tinycolor(secondary).setAlpha(0.8).toRgbString();
	const dispatch = useDispatch();
	const {
		callInformation,
		callAnswered,
		incomingCall: incoming,
		outgoingCall: outgoing,
		ringing: isRinging,
		lineBusy: busy,
		currentGroupCall,
	} = useSelector((state: ReduxState) => state.call);

	useEffect(() => {
		const interval = setInterval(() => {
			socket.connect();
			socket.emit("new_user", user?._id);
		}, 5000);
		return () => clearInterval(interval);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	//* Checking user online or busy with another call
	useEffect(() => {
		const listener = ({
			caller,
			participants,
			callInfo,
		}: IncomingCallInfoType) => {
			// console.log(incoming, outgoing, callAnswered);
			const receiver = participants?.find(
				(p: UserInterface) => p._id === user?._id
			);
			if (receiver) {
				if (incoming || outgoing || callAnswered) {
					if (!callInfo.isGroupCall) {
						// console.log("Line busy sent");
						socket.emit("lineBusy", { receiver, caller });
					}
				} else if (!incoming && !outgoing && !callAnswered) {
					// console.log("incoming call....");
					dispatch(incomingCall({ caller, participants, callInfo }));
					socket.emit("receiveSignal", receiver);
				}
			}
		};

		socket.on("callSignal", listener);

		return () => {
			socket.off("callSignal", listener);
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [callAnswered, incoming, outgoing, user]);

	//* Receive call signal and deliver to user (Ringing...)
	useEffect(() => {
		const listener = (receiver: UserInterface) => {
			// console.log(receiver);
			const hasReceiver = callInformation?.participants?.find(
				(p: UserInterface) => p._id === receiver?._id
			);
			// console.log(callInformation);
			if (hasReceiver && callInformation?.caller?._id === user?._id) {
				// console.log("Ringing....");
				dispatch(ringing());
			}
		};

		socket.on("receiveSignal", listener);

		return () => {
			socket.off("receiveSignal", listener);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [callInformation]);

	//* Line busy receiving
	useEffect(() => {
		let interval: ReturnType<typeof setInterval>;
		const listener = ({ receiver, caller }: Partial<IncomingCallInfoType>) => {
			const busyReceiver = callInformation?.participants?.find(
				(p: UserInterface) => p._id === receiver?._id
			);
			if (busyReceiver && callInformation?.caller?._id === caller?._id) {
				// console.log("Line busy received....");
				dispatch(lineBusy());

				interval = setInterval(() => {
					dispatch(callEnd());
				}, 4000);
			}
		};

		socket.on("lineBusy", listener);

		return () => {
			socket.off("lineBusy", listener);
			clearInterval(interval);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [callInformation]);

	//* Receive Call Answered
	useEffect(() => {
		const listener = ({ caller, receiver }: Partial<IncomingCallInfoType>) => {
			const hasReceiver = callInformation?.participants?.find(
				(p: UserInterface) => p._id === receiver?._id
			);
			if (hasReceiver && caller?._id === user?._id) {
				// console.log("Call Answered");
				dispatch(setCallAnswered());
			}
		};

		socket.on("callAnswered", listener);

		return () => {
			socket.off("callAnswered", listener);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [callInformation]);

	//* Call end receive
	useEffect(() => {
		const listener = (hangupUser: UserInterface) => {
			const endedUser = callInformation?.participants?.find(
				(p: UserInterface) => p._id === hangupUser?._id
			);
			if (endedUser) {
				if (
					callInformation?.callInfo.isGroupCall ||
					currentGroupCall?.callInfo?.isGroupCall
				) {
					if (callInformation?.caller?._id === endedUser?._id) {
						// console.log("Call ended");
						dispatch(callEnd());
					}
				} else {
					// console.log("Call ended");
					dispatch(callEnd());
				}
			}
		};

		socket.on("callEnd", listener);

		return () => {
			socket.off("callEnd", listener);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [callInformation]);

	return (
		// theme color here below
		<div
			style={{ background: `${primary}` }}
			className={`w-full h-full flex overflow-hidden`}
		>
			{/* Theme color change here below */}
			<div
				style={{ backgroundColor: bg }}
				className={`lg:w-[390px] md:w-[290px] sm:w-full ${
					match?.params ? "sm:hidden" : "sm:block"
				} relative z-10`}
			>
				{conversations && !newChat && !newGroup && !settings && (
					<Conversations />
				)}
				{!conversations && !newChat && !settings && newGroup && <NewGroup />}
				{!conversations && !newGroup && !settings && newChat && <NewChat />}
				{settings && <SettingsContainer />}
			</div>
			<div
				className={`lg:w-[calc(100%_-_390px)] md:w-[calc(100%_-_290px)] ${
					match?.params ? "sm:block w-full" : "sm:hidden"
				} relative`}
			>
				{outgoing && !callAnswered && <OutgoingCall />}
				{outgoing && !isRinging && !callAnswered && !busy && (
					<audio autoPlay src={waiting} loop></audio>
				)}
				{outgoing && isRinging && !callAnswered && (
					<audio autoPlay src={dialTone} loop></audio>
				)}

				{incoming && !callAnswered && (
					<audio autoPlay src={incomingCallRing} loop></audio>
				)}

				{outgoing && busy && !callAnswered && (
					<audio autoPlay src={lineBusyTone} loop></audio>
				)}

				<div
					className={`absolute z-50 left-1/2 transform -translate-x-1/2 ${
						incoming && !callAnswered
							? "visible top-2 opacity-100 transition-all ease-in-out"
							: "invisible -top-10 opacity-0"
					}`}
				>
					<IncomingCall />
				</div>
				{outgoing ? <MeetPage /> : incoming && callAnswered && <MeetPage />}
				<Outlet />
			</div>
		</div>
	);
};

export default Index;
