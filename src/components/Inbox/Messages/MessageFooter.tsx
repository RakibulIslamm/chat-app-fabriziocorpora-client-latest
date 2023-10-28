import { ChangeEvent, RefObject, useEffect, useRef } from "react";
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
	lastMessageRef: RefObject<HTMLDivElement>;
	containerRef: RefObject<HTMLDivElement>;
};

const MessageFooter = ({ reply, setReply, lastMessageRef }: Props) => {
	const { theme } = useSelector((state: ReduxState) => state.theme);
	const { user } = useSelector((state: ReduxState) => state.user);
	const [showEmojis, setShowEmojis] = useState(false);
	const [input, setInput] = useState("");
	const emojiPickerRef = useRef<HTMLDivElement | null>(null);
	const { id } = useParams();
	const imgRef = useRef<HTMLInputElement | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);

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

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				emojiPickerRef.current &&
				!emojiPickerRef.current.contains(event.target as Node)
			) {
				setShowEmojis(false);
			}
		};

		window.addEventListener("click", handleClickOutside);

		return () => {
			window.removeEventListener("click", handleClickOutside);
		};
	}, []);

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
		const s = input.replace(/[\s\r\n]+/g, "");
		if (!s && !imgLink) {
			inputRef!.current!.focus();
			return;
		}

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
		};

		try {
			if (s) {
				inputRef!.current!.focus();
			}
			setInput("");
			setReply(null);
			setBase64Img("");
			setImgLink("");
			inputRef!.current!.innerText = "";
			setShowEmojis(false);
			await sendMessage(data);
			if (lastMessageRef?.current) {
				// lastMessageRef!.current!.scrollIntoView();
				lastMessageRef.current.scrollTop = lastMessageRef.current?.scrollHeight;
				// containerRef!.current!.scrollIntoView();
			}
			await updateConversation({ messageData: conversationData, id: id });
		} catch (err) {
			console.log(err);
		}
	};

	const handleContentChange = (e: ChangeEvent<HTMLParagraphElement>) => {
		const newContent = e.target.innerText;
		setInput(newContent);
	};

	return (
		<form
			onSubmit={handleMessageSend}
			className="flex justify-between items-center gap-3 px-[55px] md:px-[20px] sm:px-[15px] w-full relative"
		>
			{base64Img && (
				<div className="absolute w-full bottom-16 bg-black bg-opacity-50 left-0 sm:p-4 px-16 py-4 backdrop-blur-sm">
					<span
						onClick={() => {
							setBase64Img("");
							setImgLink("");
							imgRef!.current!.value = "";
						}}
						className="text-xl text-white text-primary hover:text-red-500 absolute right-4 top-2 cursor-pointer"
					>
						<RxCrossCircled className="" />
					</span>
					<img
						className="w-24 h-24 object-cover rounded my-2"
						src={base64Img}
						alt=""
					/>
					{uploading && (
						<div className="w-full h-full bg-primary bg-opacity-80 absolute top-0">
							<p
								className={`text-md absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white`}
							>
								Uploading...
							</p>
						</div>
					)}
				</div>
			)}
			<div
				className="w-[calc(100%_-_60px)] relative rounded-xl sm:rounded-lg rounded-br-none sm:rounded-br-none px-[55px] border border-[#b4b4b4] dark:border-[#b4b4b44b] outline-none bg-white dark:bg-opacity-10 dark:text-white"
				ref={emojiPickerRef}
			>
				<p
					contentEditable={true}
					className={`w-full my-3 max-h-[80px] outline-none overflow-auto relative z-10 scrollbar-none`}
					ref={inputRef}
					onInput={handleContentChange}
					onClick={() => setShowEmojis(false)}
				></p>
				{!input && (
					<span
						className="absolute top-1/2 transform -translate-y-1/2 left-14 select-none z-0 text-gray-500"
						contentEditable={false}
					>
						Message....
					</span>
				)}
				<span
					onClick={() => setShowEmojis(!showEmojis)}
					className=" absolute top-1/2 transform -translate-y-1/2 left-4 text-2xl text-[#7e7e7e] cursor-pointer z-20"
				>
					<BsEmojiSmile />
				</span>
				<label className="absolute top-1/2 transform -translate-y-1/2 right-4 text-2xl text-[#7e7e7e] cursor-pointer z-20">
					<RiAttachment2 />
					<input
						ref={imgRef}
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
								inputRef!.current!.innerText += emojiData.emoji;
							}}
						/>
					</div>
				)}
			</div>
			<button
				type="submit"
				className="w-[50px] h-[50px] rounded-full bg-white border border-[#B4B4B4] flex justify-center items-center"
				disabled={sending}
			>
				<IoIosSend className="text-[#4B4B4B] text-3xl sm:text-2xl" />
			</button>
		</form>
	);
};

export default MessageFooter;
