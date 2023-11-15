/* eslint-disable @typescript-eslint/no-explicit-any */
import { JitsiMeeting } from "@jitsi/react-sdk";
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IJitsiMeetExternalApi } from "@jitsi/react-sdk/lib/types";
import {
	ReduxState,
	useDispatch,
	useSelector,
} from "../../../../../lib/redux/store";
import {
	interfaceConfigOverwrite,
	overwriteOptionForCall,
} from "./optionsAndApi";
import { callEnd } from "../../../../../lib/redux/slices/call/callSlice";
import { meetUrl } from "../../../../../utils/serverUrl";
import useColorScheme from "../../../../../Hooks/useColorScheme";
import { v4 as uuid } from "uuid";
import { useSendMessageMutation } from "../../../../../lib/redux/slices/message/messageApi";
import { useUpdateConversationMutation } from "../../../../../lib/redux/slices/conversation/conversationApi";

const MeetPage: React.FC = () => {
	const [callTime, setCallTime] = useState<{ h: number; m: number; s: number }>(
		{ h: 0, m: 0, s: 0 }
	);
	const apiRef = useRef<any>(null);
	const navigate = useNavigate();
	// const { id } = useParams();
	const { user } = useSelector((state: ReduxState) => state.user);
	const { callInformation, callAnswered } = useSelector(
		(state: ReduxState) => state.call
	);
	const dispatch = useDispatch();
	const { secondary } = useColorScheme();
	const [sendMessage] = useSendMessageMutation();
	const [updateConversation] = useUpdateConversationMutation();
	const IntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
		undefined
	);

	useEffect(() => {
		let interval;
		let totalSeconds = 0;
		if (callAnswered) {
			interval = setInterval(() => {
				++totalSeconds;
				const h = Math.floor(totalSeconds / 3600);
				const m = Math.floor((totalSeconds - h * 3600) / 60);
				const s = Math.floor(totalSeconds - (h * 3600 + m * 60));
				setCallTime({ h, m, s });
			}, 1000);
		}
		IntervalRef.current = interval;
	}, [callAnswered]);

	const handleJitsiIFrameRef1 = (iframeRef: HTMLElement) => {
		if (iframeRef) {
			iframeRef.style.height = "100%";
			iframeRef.style.width = "100%";
			iframeRef.style.overflow = "hidden";
		}
	};

	const handleVideoConferenceLeft = () => {
		console.log("handleVideoConferenceLeft");
		// apiRef.current.executeCommand("hangup");
		// apiRef.current.executeCommand("endConference");
		// navigate(`/messages/${callInformation?.callInfo.room}`);
	};

	const handleReadyToClose = () => {
		console.log("Ready to close");
		// apiRef.current.executeCommand("hangup");
		// apiRef.current.executeCommand("endConference");
		// navigate(`/messages/${callInformation?.callInfo.room}`);
	};

	const handleParticipantLeft = () => {
		if (callInformation?.callInfo.isGroupCall) {
			console.log("Group call");
		} else {
			apiRef.current.executeCommand("hangup");
			apiRef.current.executeCommand("endConference");
			navigate(`/messages/${callInformation?.callInfo.room}`);
			if (callInformation?.caller._id === user?._id) {
				console.log("Call time count", callTime);
				const data = {
					isCall: true,
					callInfo: {
						callTime: callTime,
						isGroupCall: callInformation?.callInfo.isGroupCall ? true : false,
						callType: callInformation?.callInfo.callType,
					},
					sender: {
						name: callInformation?.caller?.name,
						id: callInformation?.caller?._id,
					},
					messageId: uuid(),
					conversationId: callInformation?.callInfo.room,
					message: "",
					img: "",
					file: {},
					timestamp: Date.now(),
				};
				const conversationData = {
					isCall: true,
					callInfo: {
						isGroupCall: callInformation?.callInfo.isGroupCall ? true : false,
						callType: callInformation?.callInfo.callType,
					},
					sender: callInformation?.caller._id,
					lastMessage: "Call",
					img: false,
					file: false,
					timestamp: Date.now(),
				};
				console.log("Send message from here");
				sendMessage(data);
				updateConversation({
					messageData: conversationData,
					id: callInformation?.callInfo.room,
				});
				clearInterval(IntervalRef.current);
				IntervalRef.current = undefined;
				dispatch(callEnd());
				setCallTime({ h: 0, m: 0, s: 0 });
			} else {
				console.log("Receive message from here");
				dispatch(callEnd());
				clearInterval(IntervalRef.current);
				IntervalRef.current = undefined;
				setCallTime({ h: 0, m: 0, s: 0 });
			}
		}
	};

	const handleApiReady = (apiObj: IJitsiMeetExternalApi) => {
		apiRef.current = apiObj;
		apiRef.current.on("participantLeft", handleParticipantLeft);
		apiRef.current.on("videoConferenceLeft", handleVideoConferenceLeft);
	};

	const renderSpinner = () => (
		<div
			style={{ background: secondary }}
			className="w-full h-screen flex justify-center items-center"
		>
			<div className="border-t-transparent border-solid animate-spin  rounded-full border-gray-700 border h-10 w-10"></div>
		</div>
	);

	return (
		<div className="absolute w-full h-full bg-black bg-opacity-50 backdrop-blur flex justify-center items-center z-50">
			<div className="w-full h-screen">
				<JitsiMeeting
					domain={meetUrl}
					roomName={callInformation?.callInfo.room as string}
					spinner={renderSpinner}
					configOverwrite={{
						...overwriteOptionForCall,
						startWithVideoMuted:
							callInformation?.callInfo.callType === "video" ? false : true,
						startWithAudioMuted: false,
					}}
					interfaceConfigOverwrite={interfaceConfigOverwrite}
					lang="en"
					onApiReady={(externalApi) => handleApiReady(externalApi)}
					onReadyToClose={handleReadyToClose}
					getIFrameRef={handleJitsiIFrameRef1}
					userInfo={{
						displayName: user?.name as string,
						email: "example@gmail.com",
					}}
				/>
			</div>
		</div>
	);
};

export default MeetPage;
