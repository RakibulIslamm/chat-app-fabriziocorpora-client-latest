import useColorScheme from "../../../Hooks/useColorScheme";
import { ConversationInterface } from "../../../interfaces/conversation";
import {
	addMembersOn,
	groupMembersOn,
} from "../../../lib/redux/slices/common/commonSlice";
import { useDispatch } from "../../../lib/redux/store";
import { FiArrowRight } from "react-icons/fi";
import SelectedItem from "../../NewChatOptions/NewGroup/SelectedItem";
import { AiOutlineUsergroupAdd } from "react-icons/ai";

type Props = {
	conversation: ConversationInterface;
};

const GroupMembers = ({ conversation }: Props) => {
	const dispatch = useDispatch();
	const { textColor } = useColorScheme();

	return (
		<div style={{ color: textColor }} className="w-full h-full">
			<div className="pb-4 space-y-3 h-[90px]">
				<div className="flex items-center gap-3">
					<p className="text-lg font-semibold">Group Members</p>
					<button
						onClick={() => {
							dispatch(groupMembersOn(false));
							dispatch(addMembersOn(false));
						}}
					>
						<FiArrowRight className="text-[25px]" />
					</button>
				</div>
				<button
					className="px-4 py-1 border rounded-full text-sm flex items-center gap-2"
					onClick={() => dispatch(addMembersOn(true))}
				>
					<AiOutlineUsergroupAdd /> Add Members
				</button>
			</div>
			<div className="overflow-y-auto h-[calc(100%_-_90px)] space-y-3">
				{conversation?.participants?.map((user) => (
					<SelectedItem key={user._id} user={user} />
				))}
			</div>
		</div>
	);
};

export default GroupMembers;
