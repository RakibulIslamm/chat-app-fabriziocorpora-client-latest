import { ChangeEvent } from "react";
import { IoIosSend } from "react-icons/io";
import { BsEmojiSmile } from "react-icons/bs";
import { RiAttachment2 } from "react-icons/ri";
import { RxCrossCircled } from "react-icons/rx";
import { useState, FormEvent, Dispatch, SetStateAction } from "react";
import EmojiPicker from "emoji-picker-react";
import { ReduxState, useSelector } from "../../../lib/redux/store";
import { Theme } from "emoji-picker-react/dist";
import { useParams } from "react-router-dom";
import { useUpdateConversationMutation } from "../../../lib/redux/slices/conversation/conversationApi";
import { useSendMessageMutation } from "../../../lib/redux/slices/message/messageApi";
import useGetCompressedImage from "../../../Hooks/useGetCompressedImage";
import { MessageInterface } from "../../../interfaces/message";

type Props = {
	reply: MessageInterface | null;
	setReply: Dispatch<SetStateAction<MessageInterface | null>>;
};

const MessageFooter = ({ reply, setReply }: Props) => {
	const { theme } = useSelector((state: ReduxState) => state.theme);
	const { user } = useSelector((state: ReduxState) => state.user);
	const [showEmojis, setShowEmojis] = useState(false);
	const [input, setInput] = useState("");
	const { id } = useParams();

	const [sendMessage, { isLoading: sending }] = useSendMessageMutation();
	const [updateConversation] = useUpdateConversationMutation();

	const {
		base64Img,
		handleCompressedUpload,
		imgLink,
		setBase64Img,
		setImgLink,
		setUploading,
		uploading,
	} = useGetCompressedImage();

	const handleSendImage = async (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target?.files?.[0];
		if (!file) {
			console.log("Image not found");
			return;
		}
		setUploading(true);
		handleCompressedUpload(file);
	};

	const handleMessageSend = async (e: FormEvent) => {
		e.preventDefault();
		if (!input && !imgLink) return;

		const data = {
			sender: { name: user?.name, id: user?._id },
			conversationId: id,
			message: input,
			img: imgLink || "",
			timestamp: Date.now(),
			replyTo: reply,
			status: "sent",
		};
		const conversationData = {
			sender: user?._id,
			lastMessage: input,
			img: imgLink ? true : false,
			timestamp: Date.now(),
			sent: { timestamp: Date.now(), messageSent: true },
		};

		try {
			setInput("");
			setReply(null);
			setBase64Img("");
			setImgLink("");
			await sendMessage(data);
			await updateConversation({ messageData: conversationData, id: id });
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<form
			onSubmit={handleMessageSend}
			className="flex justify-between items-center gap-3 px-[55px] md:px-[20px] sm:px-[15px] w-full relative"
		>
			{base64Img && (
				<div className=" absolute inline-block w-24 h-24 bottom-16 left-16">
					<button
						type="button"
						onClick={() => {
							setBase64Img("");
							setImgLink("");
						}}
						className="text-xl text-primary hover:text-red-500 absolute right-1 top-1"
					>
						<RxCrossCircled className="" />
					</button>
					<img
						className="w-full h-full object-cover rounded"
						src={base64Img}
						alt=""
					/>
					{uploading && (
						<div className="w-full h-full bg-primary bg-opacity-70 absolute top-0">
							<p
								className={`text-xs absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white`}
							>
								Uploading...
							</p>
						</div>
					)}
				</div>
			)}
			<div className="w-full relative">
				<input
					className={`w-full py-3 rounded-xl rounded-br-none px-[50px] border border-[#b4b4b4] dark:border-[#b4b4b44b] outline-none bg-white dark:bg-opacity-10 dark:text-white`}
					type="text"
					placeholder="Message...."
					value={input}
					onChange={(e) => setInput(e.target.value)}
				/>
				<button
					type="button"
					onClick={() => setShowEmojis(!showEmojis)}
					className=" absolute top-1/2 transform -translate-y-1/2 left-4 text-2xl text-[#7e7e7e]"
				>
					<BsEmojiSmile />
				</button>
				<label className="absolute top-1/2 transform -translate-y-1/2 right-4 text-2xl text-[#7e7e7e] cursor-pointer">
					<RiAttachment2 />
					<input
						onChange={handleSendImage}
						className="w-0 h-0 absolute"
						type="file"
						accept="image/*"
					/>
				</label>
				{showEmojis && (
					<div className=" absolute bottom-[60px] left-0 sm:-left-2">
						<EmojiPicker
							height={300}
							width="100%"
							searchDisabled={true}
							previewConfig={{ showPreview: false }}
							theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
							onEmojiClick={(emojiData) => {
								setInput((prevInput) => prevInput + emojiData.emoji);
							}}
						/>
					</div>
				)}
			</div>
			<button
				disabled={sending}
				type="submit"
				className="p-3 rounded-full bg-white border border-[#B4B4B4]"
			>
				<IoIosSend className="text-[#4B4B4B] text-3xl" />
			</button>
		</form>
	);
};

export default MessageFooter;
