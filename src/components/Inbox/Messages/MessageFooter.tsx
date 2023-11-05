/* eslint-disable no-mixed-spaces-and-tabs */
import { ChangeEvent, RefObject, useEffect, useRef } from "react";
import { IoIosSend } from "react-icons/io";
import { BsEmojiSmile } from "react-icons/bs";
import { RiAttachment2 } from "react-icons/ri";
import { RxCrossCircled } from "react-icons/rx";
import { useState, Dispatch, SetStateAction, KeyboardEvent } from "react";
import EmojiPicker from "emoji-picker-react";
import { ReduxState, useSelector } from "../../../lib/redux/store";
import { Theme } from "emoji-picker-react/dist";
import { useParams } from "react-router-dom";
import { useUpdateConversationMutation } from "../../../lib/redux/slices/conversation/conversationApi";
import { useSendMessageMutation } from "../../../lib/redux/slices/message/messageApi";
import useGetCompressedImage from "../../../Hooks/useGetCompressedImage";
import { MessageInterface } from "../../../interfaces/message";
import {
	AiOutlineArrowDown,
	AiOutlineFile,
	AiOutlineFileImage,
} from "react-icons/ai";
import { v4 as uuid } from "uuid";
import useColorScheme from "../../../Hooks/useColorScheme";

type Props = {
	reply: MessageInterface | null;
	setReply: Dispatch<SetStateAction<MessageInterface | null>>;
	lastMessageRef: RefObject<HTMLDivElement>;
	containerRef: RefObject<HTMLDivElement>;
	handleClick: () => void;
};

const MessageFooter = ({
	reply,
	setReply,
	containerRef,
	handleClick,
}: Props) => {
	const { theme } = useSelector((state: ReduxState) => state.theme);
	const { user } = useSelector((state: ReduxState) => state.user);
	const [showEmojis, setShowEmojis] = useState(false);
	const [showFile, setShowFile] = useState(false);
	const [scrollPosition, setScrollPosition] = useState(0);
	const [input, setInput] = useState("");
	const [file, setFile] = useState<File | null>(null);

	const { id } = useParams();

	const emojiPickerRef = useRef<HTMLDivElement | null>(null);
	const imgRef = useRef<HTMLInputElement | null>(null);
	const fileRef = useRef<HTMLInputElement | null>(null);
	const fileListRef = useRef<HTMLDivElement | null>(null);
	const fileIconRef = useRef<HTMLDivElement | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const mobileInputRef = useRef<HTMLInputElement | null>(null);
	const { secondary } = useColorScheme();

	const [sendMessage, { isLoading: sending, isSuccess }] =
		useSendMessageMutation();
	const [updateConversation] = useUpdateConversationMutation();

	const {
		base64Img,
		handleCompressedUploadImage,
		imgLink,
		setBase64Img,
		setImgLink,
		setUploading,
		uploading,
		fileLink,
		setFileLink,
		handleFileUploadServer,
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

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				fileListRef.current &&
				!fileListRef.current.contains(event.target as Node) &&
				fileIconRef.current &&
				!fileIconRef.current.contains(event.target as Node)
			) {
				setShowFile(false);
			}
		};

		window.addEventListener("click", handleClickOutside);

		return () => {
			window.removeEventListener("click", handleClickOutside);
		};
	}, []);

	const handleSendImage = async (e: ChangeEvent<HTMLInputElement>) => {
		const image = e.target?.files?.[0];
		if (!image) {
			console.log("Image not found");
			return;
		}
		setFile(null);
		setShowFile(false);
		setUploading(true);
		handleCompressedUploadImage(image);
	};

	const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
		const getFile = e.target?.files?.[0];
		if (!getFile) {
			console.log("File not found");
			return;
		}
		setFile(getFile);
		setShowFile(false);
		setUploading(true);
		setBase64Img("");
		handleFileUploadServer(getFile);
	};

	const handleMessageSend = async () => {
		// e.preventDefault();
		const s = input.replace(/[\s\r\n]+/g, "");
		if (!s && !imgLink && !fileLink) {
			inputRef!.current!.focus();
			return;
		}

		const data = {
			sender: { name: user?.name, id: user?._id },
			messageId: uuid(),
			conversationId: id,
			message: input,
			img: imgLink || "",
			file: fileLink
				? {
						name: file?.name,
						type: re.exec(file!.name)?.[1] || "",
						link: fileLink,
				  }
				: {},
			timestamp: Date.now(),
			replyTo: reply,
		};
		const conversationData = {
			sender: user?._id,
			lastMessage: input,
			img: imgLink ? true : false,
			file: fileLink ? true : false,
			timestamp: Date.now(),
		};

		try {
			if (s) {
				inputRef!.current!.focus();
				mobileInputRef!.current!.focus();
			}
			setInput("");
			setReply(null);
			setBase64Img("");
			setImgLink("");
			setFileLink("");
			setFile(null);
			inputRef!.current!.innerText = "";
			mobileInputRef!.current!.innerText = "";
			setShowEmojis(false);
			if (containerRef.current) {
				// lastMessageRef!.current!.scrollIntoView(true);
				containerRef!.current!.scrollTop = containerRef!.current!.scrollHeight;
			}
			await sendMessage(data);
			await updateConversation({ messageData: conversationData, id: id });
		} catch (err) {
			console.log(err);
		}
	};

	const handleContentChange = (e: ChangeEvent<HTMLParagraphElement>) => {
		const newContent = e.target.innerText;
		setInput(newContent);
	};

	useEffect(() => {
		if (isSuccess) {
			if (containerRef.current) {
				// lastMessageRef!.current!.scrollIntoView(true);
				containerRef!.current!.scrollTop = containerRef!.current!.scrollHeight;
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isSuccess]);

	const handleEnterKey = (e: KeyboardEvent<HTMLParagraphElement>) => {
		if (e.key === "Enter" || e.key === "Return" || e.keyCode === 13) {
			if (e.shiftKey) {
				// If Shift key is held, create a new line
				// You can add your code to create a new line here.
				// console.log("Shift key");
			} else {
				e.preventDefault();
				handleMessageSend();
			}
		}
	};

	useEffect(() => {
		const handleScroll = () => {
			if (containerRef.current) {
				// Calculate the scroll position and count of messages
				const container = containerRef.current;
				const scrollTop = container.scrollTop;
				// const scrollHeight = container.scrollHeight;
				// const clientHeight = container.clientHeight;
				// const messagesCount = container.children.length;

				setScrollPosition(scrollTop);
			}
		};

		if (containerRef.current) {
			containerRef!.current!.addEventListener("scroll", handleScroll);
		}

		return () => {
			if (containerRef!.current) {
				containerRef!.current!.removeEventListener("scroll", handleScroll);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleScrollBottom = () => {
		containerRef!.current!.scrollTop = 0;
	};
	const re = /(?:\.([^.]+))?$/;
	// .replace(/\.[^/.]+$/, "")

	return (
		<div
			className="max-h-[140px] flex justify-end mb-3 relative"
			onClick={handleClick}
		>
			<div className="flex justify-between items-end gap-3 px-[55px] md:px-[20px] sm:px-[15px] w-full relative">
				{!file && base64Img && (
					<div className="absolute w-full -top-[135px] left-0 bg-black bg-opacity-50 sm:p-4 px-16 py-4 backdrop-blur-sm">
						<span
							onClick={() => {
								setBase64Img("");
								setImgLink("");
								setFile(null);
								if (fileRef.current) fileRef.current.value = "";
							}}
							className="text-2xl text-white text-primary hover:text-red-500 absolute right-4 top-2 cursor-pointer z-50"
						>
							<RxCrossCircled />
						</span>
						<div className="flex sm:flex-col items-center sm:items-start gap-5 sm:gap-2">
							<img
								className="w-28 h-20 object-cover rounded my-2"
								src={base64Img}
								alt=""
							/>
							{uploading && (
								<div className="w-full h-full absolute top-0 left-0 bg-primary text-gray-300 sm:pl-3 bg-black bg-opacity-50 flex justify-center items-center">
									Uploading...
								</div>
							)}
						</div>
					</div>
				)}

				{file && (
					<div className="absolute w-full -top-[80px] sm:-top-[105px] left-0 bg-black bg-opacity-50 sm:p-4 px-16 py-4 backdrop-blur-sm">
						<span
							onClick={() => {
								setBase64Img("");
								setImgLink("");
								setFile(null);
								if (fileRef.current) fileRef.current.value = "";
							}}
							className="text-2xl text-white text-primary hover:text-red-500 absolute right-4 top-2 cursor-pointer z-50"
						>
							<RxCrossCircled />
						</span>
						<div className="flex sm:flex-col items-center sm:items-start gap-5 sm:gap-2 relative">
							<div className="text-gray-300 w-1/3 sm:w-10/12 flex items-center gap-2 px-5 py-2 sm:px-3 sm:py-1 border border-gray-300 rounded-full bg-gray-700">
								<AiOutlineFile className="text-2xl sm:text-lg" />
								<p className="w-[calc(100%_-_50px)] flex items-center">
									<span className="line-clamp-1 break-words">
										{file.name.replace(/\.[^/.]+$/, "")}
									</span>
									.{re.exec(file.name)?.[1]}
								</p>
							</div>
							{uploading && (
								<div className="w-full h-full absolute top-0 left-0 text-gray-300 sm:pl-3 bg-black bg-opacity-50 flex justify-center items-center">
									Uploading...
								</div>
							)}
						</div>
					</div>
				)}

				{/* message Input start */}
				<div
					className="w-[calc(100%_-_60px)] relative rounded-xl sm:rounded-lg rounded-br-none sm:rounded-br-none px-[55px] border border-[#b4b4b4] dark:border-[#b4b4b44b] outline-none bg-white dark:bg-opacity-10 backdrop-blur-sm dark:text-white"
					ref={emojiPickerRef}
				>
					<p
						onKeyDown={handleEnterKey}
						contentEditable={true}
						className={`w-full my-3 max-h-[80px] outline-none overflow-auto relative z-10 scrollbar-none sm:hidden`}
						ref={inputRef}
						onInput={handleContentChange}
						onClick={() => setShowEmojis(false)}
					></p>
					<p
						contentEditable={true}
						className={`w-full my-3 max-h-[80px] outline-none overflow-auto relative z-10 scrollbar-none hidden sm:block`}
						ref={mobileInputRef}
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
						className=" absolute bottom-3 left-4 text-2xl text-[#7e7e7e] cursor-pointer z-20"
					>
						<BsEmojiSmile />
					</span>
					<div
						ref={fileIconRef}
						className="absolute bottom-3 right-4 text-2xl text-[#7e7e7e] cursor-pointer z-20"
						onClick={() => setShowFile(!showFile)}
					>
						<RiAttachment2 />
						{/* <input
							ref={imgRef}
							onChange={handleSendImage}
							className="w-0 h-0 absolute invisible"
							type="file"
							accept="image/*"
						/> */}
					</div>
					{showEmojis && (
						<div className="absolute bottom-[60px] left-0 sm:-left-2 z-50">
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
					{showFile && (
						<div
							style={{ background: secondary }}
							ref={fileListRef}
							className="absolute right-0 -top-[90px] dark:text-white text-gray-900 backdrop-blur p-2 space-y-1 rounded-xl overflow-hidden"
						>
							<label className="cursor-pointer z-20 flex items-center justify-start gap-2 px-3 py-1 hover:bg-black hover:bg-opacity-20 rounded text-base">
								<AiOutlineFileImage className="text-xl" />
								<input
									ref={imgRef}
									onChange={handleSendImage}
									className="w-0 h-0 absolute invisible"
									type="file"
									accept="image/*"
								/>
								Image
							</label>
							<label className="cursor-pointer z-20 flex items-center justify-start gap-2 px-3 py-1 hover:bg-black hover:bg-opacity-20 rounded text-base">
								<AiOutlineFile className="text-xl" />
								<input
									ref={fileRef}
									onChange={handleFileUpload}
									className="w-0 h-0 absolute invisible"
									type="file"
									accept="*"
								/>
								File
							</label>
						</div>
					)}
				</div>
				{/* message Input end */}
				<button
					onClick={handleMessageSend}
					type="button"
					className="w-[50px] h-[50px] rounded-full bg-white border border-[#B4B4B4] flex justify-center items-center"
					disabled={sending || uploading}
				>
					<IoIosSend className="text-[#4B4B4B] text-3xl sm:text-2xl" />
				</button>
			</div>

			{Math.abs(scrollPosition) > 300 ? (
				<button
					onClick={handleScrollBottom}
					className="absolute text-2xl bottom-20 left-1/2 transform -translate-x-1/2 p-4 rounded-full bg-black bg-opacity-10 text-gray-500 backdrop-blur"
				>
					<AiOutlineArrowDown />
				</button>
			) : null}
		</div>
	);
};

export default MessageFooter;
