import { createBrowserRouter } from "react-router-dom";
// import PublicRoute from "./PublicRoute";
import PrivateRoute from "./PrivateRoute";
import PrivateLayout from "../Layout/Private/PrivateLayout";
import Messages from "../components/Inbox/Messages/Messages";
import Login from "../Pages/Login";
import PublicLayout from "../Layout/Public/PublicLayout";
import PublicRoute from "./PublicRoute";
import Register from "../Pages/Register";

export const router = createBrowserRouter([
	{
		path: "/",
		element: (
			<PrivateRoute>
				<PrivateLayout />
			</PrivateRoute>
		),
		children: [
			{
				path: "",
				element: (
					<div className="w-full h-full flex justify-center items-center text-[#949494]">
						<p className="text-2xl font-bold">Open a Conversation</p>
					</div>
				),
			},
			{
				path: "messages/:id",
				element: <Messages />,
			},
		],
	},
	{
		path: "/a",
		element: (
			<PublicRoute>
				<PublicLayout />
			</PublicRoute>
		),
		children: [
			{
				path: "",
				element: <Login />,
			},
			{
				path: "login",
				element: <Login />,
			},
			{
				path: "register",
				element: <Register />,
			},
		],
	},
]);
