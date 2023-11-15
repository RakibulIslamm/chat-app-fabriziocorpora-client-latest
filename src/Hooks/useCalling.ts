import { useState, useEffect } from "react";
import { ReduxState, useSelector } from "../lib/redux/store";
import { socket } from "../utils/socket";
import { UserInterface } from "../interfaces/user";
import { CallInfoType, IncomingCallInfoType } from "../interfaces/callInfo";

const useCalling = () => {
	const [outgoingCall, setOutgoingCall] = useState<boolean>(false);
	const [incomingCall, setIncomingCall] = useState<boolean>(false);
	const [ringing, setRinging] = useState<boolean>(false);
	const [lineBusy, setLineBusy] = useState<boolean>(false);
	const [callAnswered, setCallAnswered] = useState<boolean>(false);
	const [minimize, setMinimize] = useState<boolean>(false);
	const [callInformation, setCallInformation] =
		useState<IncomingCallInfoType | null>(null);
	const { user } = useSelector((state: ReduxState) => state.user);

	const call = (callInfo: CallInfoType, receiver: UserInterface) => {
		socket.emit("sendSignal", { caller: user, receiver, callInfo });
		setCallInformation({ caller: user as UserInterface, receiver, callInfo });
		setOutgoingCall(true);
	};

	socket.on("callSignal", ({ caller, receiver, callInfo }) => {
		if (
			receiver._id === user?._id &&
			caller._id !== user?._id &&
			(incomingCall || outgoingCall || callAnswered)
		) {
			console.log("Line busy sent....");
			socket.emit("lineBusy", receiver);
		} else if (
			receiver._id === user?._id &&
			caller._id !== user?._id &&
			!callAnswered &&
			!incomingCall &&
			!outgoingCall
		) {
			console.log("incoming call....");
			setCallInformation({ caller, receiver, callInfo });
			setIncomingCall(true);
			socket.emit("receiveSignal", receiver);
		}
	});

	useEffect(() => {
		socket.on("receiveSignal", (receiver) => {
			if (receiver._id === callInformation?.receiver._id) {
				console.log("Ringing....");
				setRinging(true);
			}
		});
	}, [callInformation?.receiver._id]);

	useEffect(() => {
		socket.on("callAnswered", (receiver) => {
			if (receiver._id === callInformation?.receiver._id) {
				console.log("Answered....");
				setCallAnswered(true);
			}
		});
	}, [callInformation?.receiver._id]);

	useEffect(() => {
		socket.on("lineBusy", (receiver) => {
			if (receiver._id === callInformation?.receiver._id) {
				setLineBusy(true);
				console.log("Line busy received....");
				setTimeout(() => {
					setOutgoingCall(false);
					setRinging(false);
					setLineBusy(false);
					setCallInformation(null);
				}, 2000);
			}
		});
	}, [callInformation?.receiver._id]);

	return {
		outgoingCall,
		setOutgoingCall,
		incomingCall,
		setIncomingCall,
		lineBusy,
		setLineBusy,
		ringing,
		setRinging,
		callInformation,
		setCallInformation,
		callAnswered,
		setCallAnswered,
		minimize,
		setMinimize,
		call,
	};
};

export default useCalling;
