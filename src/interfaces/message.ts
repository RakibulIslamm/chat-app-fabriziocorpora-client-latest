import { UserInterface } from "./user";

export interface MessageInterface {
	_id?: string;
	messageId: string;
	sender: { name: string; id: string };
	isCall?: boolean;
	callInfo?: {
		callTime: { h: number; m: number; s: number };
		isGroupCall: boolean;
		callType: string;
	};
	conversationId: string;
	message: string;
	img?: string;
	forGroup: boolean;
	newGroup?: {
		groupCreator: UserInterface;
		addedMembers: UserInterface[];
	};
	addMembers?: {
		addedBy: UserInterface | string;
		addedMembers: UserInterface[] | string[];
	};
	joinGroup?: UserInterface | string;
	file?: {
		type: string;
		name: string;
		link: string;
	};
	timestamp: number;
	replyTo?: Partial<MessageInterface>;
	status?: string;
	seen?: [UserInterface];
	deleted?: boolean;
}
