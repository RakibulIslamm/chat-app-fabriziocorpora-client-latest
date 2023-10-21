import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { ReduxState } from "../lib/redux/store";

type Props = {
	children: ReactNode;
};

const PrivateRoute = ({ children }: Props) => {
	const { user } = useSelector((state: ReduxState) => state.user);
	return !user?.username ? <Navigate to={"/a/login"} /> : children;
};

export default PrivateRoute;
