import { UserInterface } from "./user";

export interface MessageInterface {
	_id?: string;
	sender: { name: string; id: string };
	receiver: UserInterface;
	conversationId: string;
	message: string;
	img: string;
	timestamp: number;
	replyTo?: Partial<MessageInterface>;
	status?: string;
	seen?: [UserInterface];
	deleted?: boolean;
}
