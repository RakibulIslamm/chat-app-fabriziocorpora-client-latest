import { UserInterface } from "../../../interfaces/user";

type Props = {
	user: UserInterface;
};

const SelectedItem = ({ user }: Props) => {
	return (
		<div className="text-sm font-medium flex items-center gap-2">
			<div
				style={{ background: user.color }}
				className="w-[35px] h-[35px] rounded-full flex justify-center items-center relative"
			>
				<p className="text-2xl font-semibold text-white">
					{user?.name?.[0] || ""}
				</p>
			</div>
			<div className="group-hover/menu:text-white leading-4">
				<p className="text-[14px] line-clamp-1">{user?.name}</p>
				{/* <small className="inline-block min-w-fit text-[10px] font-light">
					1 hour ago
				</small> */}
			</div>
		</div>
	);
};

export default SelectedItem;
