import { RouterProvider } from "react-router-dom";
import { router } from "../Routers/Routers";
import { ToastContainer } from "react-toastify";

const Layout = () => {
	return (
		<div>
			<ToastContainer
				position="top-right"
				autoClose={5000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="light"
			/>
			<RouterProvider router={router} />
		</div>
	);
};

export default Layout;
