import { createSlice } from "@reduxjs/toolkit";
import { IncomingCallInfoType } from "../../../../interfaces/callInfo";
import { socket } from "../../../../utils/socket";

/* 
const [outgoingCall, setOutgoingCall] = useState<boolean>(false);
	const [incomingCall, setIncomingCall] = useState<boolean>(false);
	const [ringing, setRinging] = useState<boolean>(false);
	const [lineBusy, setLineBusy] = useState<boolean>(false);
	const [callAnswered, setCallAnswered] = useState<boolean>(false);
	const [minimize, setMinimize] = useState<boolean>(false);
	const [callInformation, setCallInformation] =
		useState<IncomingCallInfoType | null>(null);
	const { user } = useSelector((state: ReduxState) => state.user);

*/

type callSliceType = {
	outgoingCall: boolean;
	incomingCall: boolean;
	ringing: boolean;
	lineBusy: boolean;
	callAnswered: boolean;
	minimize: boolean;
	callInformation: IncomingCallInfoType | null;
};

const initialState: callSliceType = {
	outgoingCall: false,
	incomingCall: false,
	ringing: false,
	lineBusy: false,
	callAnswered: false,
	minimize: false,
	callInformation: null,
};

const callSlice = createSlice({
	name: "call-slice",
	initialState,
	reducers: {
		outgoingCall: (state, action) => {
			state.outgoingCall = true;
			state.callInformation = action.payload;
			socket.emit("sendSignal", {
				caller: action.payload.caller,
				participants: action.payload.participants,
				callInfo: action.payload.callInfo,
			});
		},
		incomingCall: (state, action) => {
			state.incomingCall = true;
			state.callInformation = action.payload;
		},
		setCallInfo: (state, action) => {
			state.callInformation = action.payload;
		},
		ringing: (state) => {
			state.ringing = true;
		},

		setCallAnswered: (state) => {
			state.callAnswered = true;
		},

		lineBusy: (state) => {
			state.lineBusy = true;
		},
		callEnd: (state) => {
			state.lineBusy = false;
			state.ringing = false;
			state.callAnswered = false;
			state.callInformation = null;
			state.minimize = false;
			state.outgoingCall = false;
			state.incomingCall = false;
		},
	},
});

export default callSlice.reducer;
export const {
	outgoingCall,
	callEnd,
	incomingCall,
	lineBusy,
	ringing,
	setCallInfo,
	setCallAnswered,
} = callSlice.actions;
