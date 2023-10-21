import { AiOutlineArrowLeft } from "react-icons/ai";
import { Link } from "react-router-dom";

const DevProgress = () => {
	const tasksClient = [
		"Layout",
		"Search bar",
		"Main Menu",
		"Conversation Layout",
		"Conversation Items",
		"New Chat Options",
		"New Group (Add members)",
		"New Group (Group name)",
		"New Chat",
		"Search items",
		"Settings",
		"General Settings",
		"Chat Settings",
		"Edit Profile",
		"Messages Layout",
		"Messages Header, Messages Footer",
		"Messages body",
		"mobile responsive 40%",
		"Theming (dark mode, light mode) 20%",
		"Theming (dark mode, light mode, custom color) 80% done",
		"Theming system almost done",
		"RTK query added",
	];
	const tasksServer = ["Server setup", "Progress 50%"];

	return (
		<div className="w-full h-screen px-[80px] overflow-hidden py-10">
			<div className="flex items-center gap-4">
				<Link to={"/"}>
					<AiOutlineArrowLeft className="text-[25px] text-[#000000]" />
				</Link>
				<h2 className="py-4 text-3xl font-bold">Development Progress</h2>
			</div>
			<div className="w-full h-[calc(100%_-_120px)] flex justify-start items-center gap-6">
				<div className="w-full h-full">
					<h2 className="py-4 text-2xl font-bold text-gray-600">Frontend</h2>
					<ul className="text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg w-full h-full overflow-y-auto">
						{tasksClient.map((item, index) => (
							<li
								key={item}
								className="w-full px-4 py-2 border-b border-gray-200 rounded-t-lg dark:border-gray-600"
							>
								{index + 1}. {item}
							</li>
						))}
					</ul>
				</div>
				<div className="w-full h-full">
					<h2 className="py-4 text-2xl font-bold text-gray-600">Backend</h2>
					<ul className="text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg w-full h-full overflow-y-auto">
						{tasksServer.map((item, index) => (
							<li
								key={item}
								className="w-full px-4 py-2 border-b border-gray-200 rounded-t-lg dark:border-gray-600"
							>
								{index + 1}. {item}
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
};

export default DevProgress;
