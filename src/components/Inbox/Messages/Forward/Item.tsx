import { ConversationInterface } from "../../../../interfaces/conversation";
import { UserInterface } from "../../../../interfaces/user";
import { ReduxState, useSelector } from "../../../../lib/redux/store";
import { MessageInterface } from "../../../../interfaces/message";
import { Dispatch, FormEvent, SetStateAction } from "react";
import { useUpdateConversationMutation } from "../../../../lib/redux/slices/conversation/conversationApi";
import { useSendMessageMutation } from "../../../../lib/redux/slices/message/messageApi";
import useColorScheme from "../../../../Hooks/useColorScheme";

type Props = {
	item: ConversationInterface;
	message: MessageInterface | null;
	setForwardOpen: Dispatch<SetStateAction<boolean>>;
};

const Item = ({ item, message }: Props) => {
	const { user } = useSelector((state: ReduxState) => state.user);
	const participant: UserInterface | undefined = item?.participants?.find(
		(p) => p._id !== user?._id
	);

	const { main } = useColorScheme();

	const [updateConversation] = useUpdateConversationMutation();
	const [sendMessage, { isLoading, isSuccess }] = useSendMessageMutation();

	const sendForwardMessage = async (e: FormEvent) => {
		e.preventDefault();
		if (!message) return;

		const data = {
			messageId: message.messageId,
			sender: { name: user?.name, id: user?._id },
			conversationId: item?._id,
			message: message?.message || "",
			img: message.img || "",
			file: message.file || "",
			timestamp: Date.now(),
			status: "sent",
		};
		const conversationData = {
			sender: user?._id,
			lastMessage: message.message,
			img: message?.img ? true : false,
			file: message?.file ? true : false,
			timestamp: Date.now(),
		};

		try {
			await sendMessage(data);
			await updateConversation({
				messageData: conversationData,
				id: item?._id,
			});
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<div className="flex justify-between items-center gap-10">
			<div className="flex items-center gap-2">
				<div
					style={{
						background: `${participant?.color}`,
					}}
					className="w-[35px] h-[35px] rounded-full flex justify-center items-center relative"
				>
					<p className="text-xl font-semibold text-white uppercase">
						{participant?.name[0]}
					</p>
				</div>
				<p className="line-clamp-1">{participant?.name}</p>
			</div>
			{!isLoading && !isSuccess && (
				<button
					style={{ background: main }}
					onClick={sendForwardMessage}
					className="px-3 py-1 rounded text-white"
				>
					Send
				</button>
			)}
			{isLoading && !isSuccess && (
				<button
					style={{ background: main }}
					className="px-3 py-1 rounded text-white"
					disabled
				>
					Sending
				</button>
			)}
			{!isLoading && isSuccess && (
				<button className="px-3 py-1 rounded bg-gray-500 text-white" disabled>
					Sent
				</button>
			)}
		</div>
	);
};

export default Item;
