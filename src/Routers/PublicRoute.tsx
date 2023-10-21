import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { ReduxState, useSelector } from "../lib/redux/store";

type Props = {
	children: ReactNode;
};

const PublicRoute = ({ children }: Props) => {
	const { user } = useSelector((state: ReduxState) => state.user);
	return user?.username ? <Navigate to={"/"} /> : children;
};

export default PublicRoute;
