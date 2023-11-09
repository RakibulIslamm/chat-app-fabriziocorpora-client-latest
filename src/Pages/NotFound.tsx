import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
	const navigate = useNavigate();
	useEffect(() => {
		navigate("/");
	}, [navigate]);

	return (
		<div className="w-full h-screen flex justify-center items-center">
			404 not found
		</div>
	);
};

export default NotFound;
