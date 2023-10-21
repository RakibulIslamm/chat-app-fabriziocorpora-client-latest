import moment from "moment";
import { UserInterface } from "../../../interfaces/user";

type Props = {
	item: UserInterface;
	handleSelectedUsers: (user: UserInterface) => void;
};

const Item = ({ handleSelectedUsers, item }: Props) => {
	return (
		<div className="flex items-center w-full">
			<input
				id={item._id}
				type="checkbox"
				className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
				onChange={() => handleSelectedUsers(item)}
			/>
			<label
				htmlFor={item._id}
				className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300 flex items-center gap-2"
			>
				<div
					style={{ background: item.color }}
					className="w-[45px] h-[45px] rounded-full flex justify-center items-center relative"
				>
					<p className="text-3xl font-bold text-white">{item?.name[0]}</p>
				</div>
				<div className="group-hover/menu:text-white">
					<p className="text-[17px] font-semibold line-clamp-1">{item?.name}</p>
					{item?.lastActive && (
						<small className="inline-block min-w-fit">
							{moment(item?.lastActive).fromNow()}
						</small>
					)}
				</div>
			</label>
		</div>
	);
};

export default Item;
