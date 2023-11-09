import { useEffect, Dispatch, SetStateAction, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoCheckmarkDoneOutline, IoCheckmarkOutline } from "react-icons/io5";
import { RiReplyFill } from "react-icons/ri";
import useColorScheme from "../../../Hooks/useColorScheme";
import tinycolor from "tinycolor2";
import { useSelector } from "react-redux";
import { ReduxState } from "../../../lib/redux/store";
import { MessageInterface } from "../../../interfaces/message";
import { formateDate } from "../../../utils/formateDate";
import { useGetSingleConversationQuery } from "../../../lib/redux/slices/conversation/conversationApi";
import { Link, useParams } from "react-router-dom";
import { socket } from "../../../utils/socket";
import { useDeleteMessageMutation } from "../../../lib/redux/slices/message/messageApi";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { Captions } from "yet-another-react-lightbox/plugins";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { AiOutlineDownload, AiOutlineFile } from "react-icons/ai";
import { serverUrl } from "../../../utils/serverUrl";

type Props = {
	message: MessageInterface;
	setReply: Dispatch<SetStateAction<MessageInterface | null>>;
	setForwardMessage: Dispatch<SetStateAction<MessageInterface | null>>;
	setForwardOpen: Dispatch<SetStateAction<boolean>>;
};

const Message = ({
	message,
	setReply,
	setForwardMessage,
	setForwardOpen,
}: Props) => {
	const [option, setOption] = useState(false);
	const [downloading, setDownloading] = useState(false);
	const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);
	const [showMessage, setShowMessage] = useState(false);

	const { user } = useSelector((state: ReduxState) => state.user);
	const { fontSize } = useSelector((state: ReduxState) => state.theme);
	const { main, secondary, textColor } = useColorScheme();
	const replyBg = tinycolor(main).setAlpha(0.4).toRgbString();

	const me = message?.sender?.id === user?._id ? true : false;
	const date = formateDate(message?.timestamp);

	const { id } = useParams();
	const { data } = useGetSingleConversationQuery(id);
	const { isGroup } = data?.data || {};

	useEffect(() => {
		if (user?._id !== message?.sender?.id && message.status !== "seen") {
			socket.emit("seen-m", { id: message?._id, userId: user?._id });
			socket.emit("seen-c", { conversationId: id, userId: user?._id });
		}
	}, [user?._id, message?.sender?.id, message?._id, message?.status, id]);

	const messageOptionsColor = tinycolor(secondary).setAlpha(0.8).toRgbString();
	const border = tinycolor(main).setAlpha(0.2).toRgbString();

	const deletedMessageBg1 = tinycolor(main).setAlpha(0.4).toRgbString();
	const deletedMessageBg2 = tinycolor(secondary).setAlpha(0.2).toRgbString();

	useEffect(() => {
		document.body.addEventListener("click", (e) => {
			const target = e.target instanceof HTMLElement;
			if (target && e.target.id !== "msg-option") {
				setOption(false);
			}
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [deleteMessage] = useDeleteMessageMutation();
	const re = /(?:\.([^.]+))?$/;

	const downloadFile = async (fileUrl: string, fileName: string) => {
		try {
			setDownloading(true);
			const response = await fetch(fileUrl);
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = fileName;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Error downloading file:", error);
		} finally {
			setDownloading(false);
		}
	};

	useEffect(() => {
		// Trigger animation when the component is mounted
		setShowMessage(true);
	}, []);

	return !message.forGroup ? (
		<div
			className={`inline-block ${
				me ? "ml-auto" : "mr-auto"
			} chat-message transform ${
				showMessage
					? "visible opacity-100 transition-all ease-in-out duration-500 item"
					: "translate-y-[5px] invisible opacity-0"
			}`}
			// className={`w-full flex ${me ? "justify-end" : "justify-start"}`}
		>
			<div className="inline-block space-y-1 max-w-[600px] md:max-w-[400px] sm:max-w-[350px]">
				{message?.sender?.id !== user?._id && isGroup && (
					<p
						style={{
							color: tinycolor(textColor).setAlpha(0.5).toRgbString(),
						}}
						className="text-sm"
					>
						{message?.sender?.name}
					</p>
				)}
				<div
					className={`flex ${
						me && "flex-row-reverse"
					} items-center gap-5 relative group/message z-10`}
				>
					<div>
						{message?.deleted ? (
							<p
								style={{
									background: `${me ? deletedMessageBg1 : deletedMessageBg2}`,
									fontSize: fontSize,
								}}
								className={`px-5 py-3 rounded-lg ${
									me
										? " text-white rounded-br-none"
										: "rounded-bl-none dark:text-gray-100"
								} shadow-xl relative z-10`}
							>
								Message deleted
							</p>
						) : (
							<div>
								{message?.replyTo &&
									(message.replyTo.img ? (
										<p
											onClick={() => {
												document
													.getElementById(message?.replyTo?._id || "")
													?.scrollIntoView(true);
											}}
											style={{ background: `${me ? secondary : replyBg}` }}
											className="px-4 pt-2 pb-7 bg-slate-400 break-words message relative top-5 z-0 rounded-t-lg dark:text-white text-sm font-light shadow-xl"
										>
											<img
												src={message.replyTo.img}
												alt=""
												className=" w-20 object-cover object-center"
											/>
										</p>
									) : (
										<p
											onClick={() => {
												document
													.getElementById(message?.replyTo?._id || "")
													?.scrollIntoView(true);
											}}
											style={{ background: `${me ? secondary : replyBg}` }}
											className="px-4 pt-2 pb-7 bg-slate-400 break-words line-clamp-1 relative top-5 z-0 rounded-t-lg dark:text-white text-sm font-light shadow-xl"
										>
											{message.replyTo?.message}
										</p>
									))}
								{!message?.file?.name && message.img && message.message && (
									<>
										<>
											<img
												onClick={() => setIsLightBoxOpen(true)}
												id={message?._id || ""}
												src={`${serverUrl}${message?.img}`}
												alt="Image"
												className="w-[300px] rounded-t-lg sm:w-full cursor-pointer bg-black bg-opacity-50"
											/>
											<Lightbox
												plugins={[Captions, Zoom]}
												open={isLightBoxOpen}
												close={() => setIsLightBoxOpen(false)}
												render={{
													buttonPrev: () => null,
													buttonNext: () => null,
												}}
												slides={[
													{
														src: `${serverUrl}${message?.img}`,
														description: message.message || "",
													},
												]}
												captions={{
													descriptionTextAlign: "center",
													descriptionMaxLines: 2,
												}}
											/>
										</>
										<div
											onContextMenu={(e) => {
												e.preventDefault();
												setOption(true);
											}}
											style={{
												background: `${me ? main : secondary}`,
												fontSize: fontSize,
											}}
											className={`max-w-[300px] px-5 sm:px-3 py-3 sm:py-2 ${
												me
													? " text-white rounded-bl-lg sm:rounded-bl-md"
													: "rounded-br-lg sm:rounded-br-md dark:text-gray-100"
											} shadow-xl relative font-normal break-words message`}
										>
											{message.message
												.split("\n")
												.map((m, idx) => m && <p key={idx}>{m}</p>)}
										</div>
									</>
								)}
								{message?.file?.name && (
									<div>
										<div
											onContextMenu={(e) => {
												e.preventDefault();
												setOption(true);
											}}
											className={`text-gray-300 flex items-center gap-2 px-5 py-3 sm:px-3 sm:py-2 ${
												message.message
													? "rounded-t-lg sm:rounded-t-md"
													: "rounded-full"
											} bg-gray-700`}
										>
											<AiOutlineFile className="text-2xl sm:text-lg" />
											<Link
												to={`${serverUrl}${message?.file?.link}`}
												target="_blank"
												className="w-[calc(100%_-_50px)] flex items-center"
											>
												<span className="line-clamp-1 break-all">
													{message?.file.name.replace(/\.[^/.]+$/, "")}
												</span>
												.{re.exec(message?.file.name)?.[1]}
											</Link>
											<button
												disabled={downloading}
												onClick={() =>
													downloadFile(
														`${serverUrl}${message?.file?.link}` as string,
														message?.file?.name as string
													)
												}
												className="text-xl"
											>
												<AiOutlineDownload />
											</button>
										</div>
										{message.message && (
											<div
												onContextMenu={(e) => {
													e.preventDefault();
													setOption(true);
												}}
												style={{
													background: `${me ? main : secondary}`,
													fontSize: fontSize,
												}}
												className={`px-5 sm:px-3 py-3 sm:py-2 ${
													me
														? " text-white rounded-bl-lg sm:rounded-bl-md"
														: "rounded-br-lg sm:rounded-br-md dark:text-gray-100"
												} shadow-xl relative font-normal break-words message`}
											>
												{message.message
													.split("\n")
													.map((m, idx) => m && <p key={idx}>{m}</p>)}
											</div>
										)}
									</div>
								)}
								{!message?.file?.name && !message.img && message.message && (
									<div
										onContextMenu={(e) => {
											e.preventDefault();
											setOption(true);
										}}
										id={message?._id || ""}
										style={{
											background: `${me ? main : secondary}`,
											fontSize: fontSize,
										}}
										className={`px-5 sm:px-3 py-3 sm:py-2 rounded-lg sm:rounded-md ${
											me
												? " text-white rounded-br-none sm:rounded-br-none"
												: "rounded-bl-none sm:rounded-bl-none dark:text-gray-100"
										} shadow-xl relative font-normal break-words message`}
									>
										{message.message
											.split("\n")
											.map((m, idx) => m && <p key={idx}>{m}</p>)}
									</div>
								)}
								{!message?.file?.name && message.img && !message.message && (
									<>
										<img
											onClick={() => setIsLightBoxOpen(true)}
											src={`${serverUrl}${message?.img}`}
											alt="Image"
											className="w-[300px] rounded-lg sm:w-full cursor-pointer bg-black bg-opacity-50"
										/>
										<Lightbox
											plugins={[Zoom]}
											open={isLightBoxOpen}
											close={() => setIsLightBoxOpen(false)}
											slides={[
												{
													src: `${serverUrl}${message?.img}`,
												},
											]}
											render={{
												buttonPrev: () => null,
												buttonNext: () => null,
											}}
										/>
									</>
								)}
							</div>
						)}
					</div>
					<div
						style={{
							color: `${tinycolor(textColor).setAlpha(0.5).toHslString()}`,
						}}
						className={`group-hover/message:visible ${
							option ? "visible" : "invisible"
						}`}
					>
						{!message.deleted && (
							<div
								className={`flex items-center gap-3 ${
									me && "flex-row-reverse"
								}`}
							>
								<button onClick={() => setReply(message)}>
									<RiReplyFill
										className={`transform ${!me && "-scale-x-[1]"} text-2xl`}
									/>
								</button>
								<div className="flex items-center relative">
									<button onClick={() => setOption(!option)}>
										<BsThreeDotsVertical
											className={`transform ${!me && "-scale-x-[1]"} text-2xl`}
										/>
									</button>
									{
										<div
											id="msg-option"
											style={{
												background: messageOptionsColor,
												color: textColor,
												border: `1px solid ${border}`,
											}}
											className={`absolute bg-white flex justify-center items-center flex-col text-sm ${
												me
													? "-left-20 md:left-2 sm:left-2"
													: "-right-20 md:right-2 sm:right-2"
											} backdrop-blur-[3px] rounded-lg shadow z-50 ${
												option
													? "bottom-0 md:-bottom-5 sm:-bottom-5 visible opacity-100"
													: "bottom-4 md:bottom-0 sm:bottom-0 invisible opacity-0"
											} transition-all ease-in-out z-50`}
										>
											{!message.status ? (
												<div className="p-5">
													<div className="border-t-transparent border-solid animate-spin  rounded-full border-gray-700 border h-6 w-6"></div>
												</div>
											) : (
												<>
													<button
														onClick={() => {
															setForwardMessage(message);
															setForwardOpen(true);
														}}
														className="hover:bg-gray-200 px-3 py-2 block w-full rounded-lg text-gray-600"
														title="Forward"
													>
														Forward
													</button>
													{message?.sender?.id === user?._id && (
														<button
															onClick={() => deleteMessage(message?._id)}
															className="hover:bg-gray-200 px-3 py-2 block w-full rounded-lg text-gray-600"
															title="Delete this message"
														>
															Delete
														</button>
													)}
												</>
											)}
										</div>
									}
								</div>
							</div>
						)}
					</div>
				</div>
				{!message?.deleted && (
					<div
						className={`flex items-center gap-2 ${
							me ? "justify-end" : "justify-start"
						} dark:text-gray-500 z-0`}
					>
						<p className="text-[13px]">{date}</p>
						{message?.sender?.id === user?._id && (
							<>
								{message.status === "delivered" && (
									<IoCheckmarkDoneOutline className="text-[16px] text-gray-600" />
								)}
								{message.status === "sent" && (
									<IoCheckmarkOutline className="text-[16px] text-gray-600" />
								)}
								{message.status === "seen" && (
									<IoCheckmarkDoneOutline className="text-[16px] text-sky-500" />
								)}
							</>
						)}
					</div>
				)}
			</div>
		</div>
	) : (
		<div className="w-full flex justify-center item">
			<p
				style={{ color: tinycolor(textColor).setAlpha(0.6).toRgbString() }}
				className="text-base sm:text-sm font-light w-[70%] sm:w-[90%] text-center"
			>
				{message.message}
			</p>
		</div>
	);
};

export default Message;
