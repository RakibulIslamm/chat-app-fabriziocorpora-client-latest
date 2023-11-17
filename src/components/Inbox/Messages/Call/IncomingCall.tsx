import { MdCall, MdCallEnd } from "react-icons/md";
import useColorScheme from "../../../../Hooks/useColorScheme";
import {
	ReduxState,
	useDispatch,
	useSelector,
} from "../../../../lib/redux/store";
import { socket } from "../../../../utils/socket";
import {
	callEnd,
	setCallAnswered,
} from "../../../../lib/redux/slices/call/callSlice";
import tinycolor from "tinycolor2";
import { useNavigate } from "react-router-dom";

const IncomingCall = () => {
	const { callInformation, incomingCall } = useSelector(
		(state: ReduxState) => state.call
	);
	const { user } = useSelector((state: ReduxState) => state.user);
	const { secondary, textColor, main } = useColorScheme();
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const handleCallAnswered = () => {
		if (!incomingCall) return;

		socket.emit("callAnswered", {
			caller: callInformation?.caller,
			receiver: user,
		});
		dispatch(setCallAnswered());
		navigate(`messages/${callInformation?.callInfo.room}`);
	};

	const handleCallEnd = () => {
		if (!callInformation) return;
		socket.emit("callEnd", user);
		dispatch(callEnd());
	};

	return (
		<div
			style={{
				background: secondary,
				color: textColor,
				border: `1px solid ${tinycolor(main).setAlpha(0.2).toRgbString()}`,
			}}
			className="px-10 sm:px-5 py-8 sm:py-4 rounded-md shadow-xl"
		>
			<div>
				<p className="font-light text-xs">
					Incoming{" "}
					<span className="capitalize">
						{callInformation?.callInfo.callType}
					</span>{" "}
					Call
				</p>
				<p className="text-lg">
					{callInformation?.callInfo.isGroupCall
						? callInformation?.callInfo?.groupName
						: callInformation?.caller?.name || "Anonymous"}
				</p>
			</div>

			<div className="flex items-center gap-3 mt-3">
				<button
					title="Accept"
					className="bg-green-500 text-white px-8 sm:px-4 py-2 rounded flex items-center gap-2"
					onClick={handleCallAnswered}
				>
					<MdCall />
					Accept
				</button>
				<button
					className="bg-red-500 text-white px-8 sm:px-4 py-2 rounded flex items-center gap-2"
					onClick={handleCallEnd}
				>
					<MdCallEnd />
					Decline
				</button>
			</div>
		</div>
	);
};

export default IncomingCall;
