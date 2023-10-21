import { IoTrashBinSharp } from "react-icons/io5";
import { conversationOptionsOn } from "../../../lib/redux/slices/common/commonSlice";
import { useDispatch } from "../../../lib/redux/store";
import { useEffect } from "react";
import tinycolor from "tinycolor2";
import useColorScheme from "../../../Hooks/useColorScheme";
import { useNavigate, useParams } from "react-router-dom";
import { useDeleteConversationMutation } from "../../../lib/redux/slices/conversation/conversationApi";
import { ConversationInterface } from "../../../interfaces/conversation";

const ConversationOptions = ({
	conversation,
}: {
	conversation: ConversationInterface;
}) => {
	const dispatch = useDispatch();

	useEffect(() => {
		document.body.addEventListener("click", (e) => {
			const target = e.target instanceof HTMLElement;
			if (
				target &&
				e.target.id !== "conversation-options" &&
				!e.target.classList.contains("menu")
			) {
				dispatch(conversationOptionsOn(false));
			}
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const { secondary, textColor, main } = useColorScheme();
	const bg = tinycolor(secondary).setAlpha(0.8).toRgbString();
	const border = tinycolor(main).setAlpha(0.2).toRgbString();

	const { id } = useParams();
	const navigate = useNavigate();
	const [deleteConversation] = useDeleteConversationMutation();

	return (
		// Theme color change here below
		<>
			{!conversation?.deleted && (
				<div
					style={{
						background: bg,
						color: textColor,
						border: `1px solid ${border}`,
					}}
					className={`p-2 backdrop-blur-[3px] md:w-full sm:w-full space-y-3 rounded-lg shadow font-semibold`}
					id="conversation-options"
				>
					<button
						onClick={() => {
							deleteConversation(id);
							navigate("/");
						}}
						className="w-full px-3 py-1 hover:bg-white dark:hover:bg-[#00000033] rounded flex items-center gap-2 menu"
					>
						<IoTrashBinSharp className="text-xl menu" />
						Delete Conversation
					</button>
				</div>
			)}
		</>
	);
};

export default ConversationOptions;
