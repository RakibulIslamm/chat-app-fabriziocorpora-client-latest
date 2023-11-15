import { UserInterface } from "./user";

export type CallInfoType = {
	room: string;
	isGroupCall: boolean;
	groupName?: string;
	callType: "audio" | "video";
};

export type IncomingCallInfoType = {
	callInfo: CallInfoType;
	caller: UserInterface;
	receiver: UserInterface | [UserInterface];
};
