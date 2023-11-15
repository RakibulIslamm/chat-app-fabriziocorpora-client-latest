import { UserInterface } from "./user";

export interface ConversationInterface {
	_id?: string;
	isGroup: true | false;
	isCall?: boolean;
	callInfo?: {
		isGroupCall: boolean;
		callType: string;
	};
	groupName?: string;
	groupCreator?: UserInterface;
	groupColor?: string;
	participants: [UserInterface];
	sender: string;
	lastMessage?: string;
	img?: boolean;
	file?: boolean;
	timestamp: number;
	deleted: boolean;
	unseenMessages: number;
}
