import { RouterProvider } from "react-router-dom";
import { router } from "../Routers/Routers";

const Layout = () => {
	return (
		<div>
			<RouterProvider router={router} />
		</div>
	);
};

export default Layout;
