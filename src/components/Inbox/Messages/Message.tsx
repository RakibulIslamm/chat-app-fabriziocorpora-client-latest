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
import { useParams } from "react-router-dom";
import { socket } from "../../../utils/socket";
import { useDeleteMessageMutation } from "../../../lib/redux/slices/message/messageApi";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { Captions } from "yet-another-react-lightbox/plugins";

type Props = {
	message: MessageInterface;
	setReply: Dispatch<SetStateAction<MessageInterface | null>>;
};

const Message = ({ message, setReply }: Props) => {
	const [option, setOption] = useState(false);
	const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);

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

	return (
		// Theme color
		<div
			className={`w-full flex ${me ? "justify-end" : "justify-start"}`}
			id={message?._id || ""}
		>
			<div className="inline-block space-y-1 max-w-[600px] md:max-w-[400px] sm:max-w-[350px]">
				<div
					className={`flex ${
						me && "flex-row-reverse"
					} items-center gap-5 group/message relative`}
				>
					<div>
						{message?.sender?.id !== user?._id && isGroup && (
							<p style={{ color: textColor }} className="text-sm">
								{message?.sender?.name}
							</p>
						)}
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
													?.scrollIntoView();
											}}
											style={{ background: `${me ? secondary : replyBg}` }}
											className="px-4 pt-2 pb-7 bg-slate-400 break-words relative top-5 z-0 rounded-t-lg dark:text-white text-sm font-light shadow-xl"
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
													?.scrollIntoView();
											}}
											style={{ background: `${me ? secondary : replyBg}` }}
											className="px-4 pt-2 pb-7 bg-slate-400 break-words relative top-5 z-0 rounded-t-lg dark:text-white text-sm font-light shadow-xl"
										>
											{message.replyTo?.message}
										</p>
									))}
								{message.img && message.message && (
									<>
										<>
											<img
												onClick={() => setIsLightBoxOpen(true)}
												id={message?._id || ""}
												src={message.img}
												alt=""
												className="w-[300px] rounded-t-lg sm:w-full cursor-pointer"
											/>
											<Lightbox
												plugins={[Captions]}
												open={isLightBoxOpen}
												close={() => setIsLightBoxOpen(false)}
												slides={[
													{
														src: message.img,
														description: message.message || "",
													},
												]}
												captions={{
													descriptionTextAlign: "center",
													descriptionMaxLines: 2,
												}}
											/>
										</>
										<p
											style={{
												background: `${me ? main : secondary}`,
												fontSize: fontSize,
											}}
											className={`px-5 py-3 rounded-bl-lg ${
												me
													? " text-white rounded-br-none"
													: "rounded-bl-none dark:text-gray-100"
											} shadow-xl relative z-10`}
										>
											{message.message}
										</p>
									</>
								)}
								{!message.img && message.message && (
									<p
										id={message?._id || ""}
										style={{
											background: `${me ? main : secondary}`,
											fontSize: fontSize,
										}}
										className={`px-5 py-3 rounded-lg ${
											me
												? " text-white rounded-br-none"
												: "rounded-bl-none dark:text-gray-100"
										} shadow-xl relative z-10`}
									>
										{message.message}
									</p>
								)}
								{message.img && !message.message && (
									<>
										<img
											onClick={() => setIsLightBoxOpen(true)}
											src={message.img}
											alt=""
											className="w-[300px] rounded-lg sm:w-full cursor-pointer"
										/>
										<Lightbox
											open={isLightBoxOpen}
											close={() => setIsLightBoxOpen(false)}
											slides={[{ src: message.img }]}
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
								<div className="relative flex items-center">
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
												me ? "-left-20 sm:left-2" : "-right-20 sm:right-2"
											} backdrop-blur-[3px] rounded-lg shadow z-50 overflow-hidden ${
												option
													? "bottom-2 sm:bottom-10 visible opacity-100"
													: "bottom-4 sm:bottom-14 invisible opacity-0"
											} transition-all ease-in-out`}
										>
											<button
												className="hover:bg-gray-200 px-3 py-2 block w-full rounded-lg text-gray-600"
												title="Forward this message to others"
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
	);
};

export default Message;
