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

const IncomingCall = () => {
	const { callInformation, lineBusy: busy } = useSelector(
		(state: ReduxState) => state.call
	);
	const { user } = useSelector((state: ReduxState) => state.user);
	const { secondary, textColor } = useColorScheme();
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
		<div className="absolute w-full h-full bg-black bg-opacity-50 backdrop-blur flex justify-center items-center z-50">
			<div
				style={{ background: secondary, color: textColor }}
				className="px-4 py-6 sm:py-8 shadow-xl rounded-lg w-[500px] h-[400px] sm:w-full sm:h-full flex flex-col justify-between items-center"
			>
				<div className="text-center space-y-2">
					<p className="text-xl">
						Incoming{" "}
						<span className="capitalize">
							{callInformation?.callInfo.callType}
						</span>{" "}
						Call
					</p>
				</div>
				<div className="flex flex-col items-center gap-2">
					<div
						style={{
							background: callInformation?.caller?.color || "pink",
							color: textColor,
						}}
						className="w-[115px] h-[115px] rounded-full flex justify-center items-center relative"
					>
						<p className="text-[70px] font-bold text-white uppercase">
							{callInformation?.caller?.name[0]}
						</p>
					</div>
					<p className="text-xl font-semibold">
						{callInformation?.caller?.name}
					</p>
				</div>
				<div className="flex items-center gap-6">
					<button
						title="Accept"
						className="p-4 rounded-full bg-green-500 text-white text-2xl"
						onClick={handleCallAnswered}
					>
						<MdCall />
					</button>
					{!busy && (
						<div className="flex items-center gap-3">
							<button
								className="p-4 rounded-full bg-red-500 text-white text-2xl"
								onClick={handleCallEnd}
							>
								<MdCallEnd />
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default IncomingCall;
