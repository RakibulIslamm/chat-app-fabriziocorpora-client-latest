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

const IncomingCall = () => {
	const { callInformation } = useSelector((state: ReduxState) => state.call);
	const { user } = useSelector((state: ReduxState) => state.user);
	const { secondary, textColor, main } = useColorScheme();
	const dispatch = useDispatch();

	const handleCallAnswered = () => {
		socket.emit("callAnswered", {
			caller: callInformation?.caller,
			receiver: user,
		});
		dispatch(setCallAnswered());
	};

	const handleCallEnd = () => {
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
			className="px-10 py-8 rounded-md shadow-xl"
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
					className="bg-green-500 text-white px-8 py-2 rounded flex items-center gap-2"
					onClick={handleCallAnswered}
				>
					<MdCall />
					Accept
				</button>
				<button
					className="bg-red-500 text-white px-8 py-2 rounded flex items-center gap-2"
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
