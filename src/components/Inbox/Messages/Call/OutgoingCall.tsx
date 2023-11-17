import {
	ReduxState,
	useDispatch,
	useSelector,
} from "../../../../lib/redux/store";
import useColorScheme from "../../../../Hooks/useColorScheme";
import { socket } from "../../../../utils/socket";
import { callEnd } from "../../../../lib/redux/slices/call/callSlice";
import { MdCallEnd } from "react-icons/md";
import { UserInterface } from "../../../../interfaces/user";
import { getRandomColor } from "../../../../utils/randomColor";

const OutgoingCall = () => {
	const {
		callInformation,
		lineBusy: busy,
		ringing: isRinging,
	} = useSelector((state: ReduxState) => state.call);
	const { user } = useSelector((state: ReduxState) => state.user);
	const receiver = callInformation?.participants?.find(
		(p: UserInterface) => p._id !== callInformation.caller._id
	);
	const { secondary, textColor } = useColorScheme();
	const dispatch = useDispatch();

	const handleCallEnd = () => {
		socket.emit("callEnd", user);
		// dispatch(callEnd());
	};

	return (
		<div className="absolute w-full h-full bg-black bg-opacity-50 backdrop-blur flex justify-center items-center z-50">
			<div
				style={{ background: secondary, color: textColor }}
				className="px-4 py-6 sm:py-8 shadow-xl rounded-lg w-[500px] h-[400px] sm:w-full sm:h-full flex flex-col justify-between items-center"
			>
				<div className="text-center space-y-2">
					<p className="text-xl space-x-1">
						Outgoing{" "}
						<span className="capitalize">
							{callInformation?.callInfo.callType}
						</span>{" "}
						Call
					</p>
					{!busy && <p>{!isRinging ? "Waiting.." : "Ringing..."}</p>}
					{busy && <p>Line busy</p>}
				</div>
				<div className="flex flex-col items-center gap-2">
					<div
						style={{
							background: `${
								callInformation?.callInfo.isGroupCall
									? getRandomColor()
									: receiver?.color || "pink"
							}`,
							color: textColor,
						}}
						className="w-[115px] h-[115px] rounded-full flex justify-center items-center relative"
					>
						<p className="text-[70px] font-bold text-white uppercase">
							{callInformation?.callInfo.isGroupCall
								? callInformation?.callInfo?.groupName?.[0]
								: receiver?.name[0]}
						</p>
					</div>
					<p className="text-xl font-semibold">
						{callInformation?.callInfo.isGroupCall
							? callInformation?.callInfo?.groupName
							: receiver?.name}
					</p>
				</div>
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
				{busy && (
					<div className="flex items-center gap-3">
						<button
							className="p-4 rounded-full bg-red-500 text-white text-2xl"
							onClick={() => dispatch(callEnd())}
						>
							<MdCallEnd />
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default OutgoingCall;
