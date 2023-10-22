import { useEffect, useState } from "react";
import { useDispatch } from "../lib/redux/store";
import { setCurrentUser } from "../lib/redux/slices/user/userSlice";
import { socket } from "../utils/socket";

const useListenAuth = () => {
	const dispatch = useDispatch();
	const [authChecked, setAuthChecked] = useState(false);
	const sessionAuth = sessionStorage.getItem("auth");
	const auth = sessionAuth ? JSON.parse(sessionAuth) : null;
	useEffect(() => {
		const getUser = async () => {
			try {
				if (auth) {
					const res = await fetch(
						`http://localhost:5000/api/users/user?username=${auth.username}`
					);
					const data = await res.json();
					socket.emit("new_user", data.data._id);
					dispatch(setCurrentUser(data.data));
				}
			} catch (err) {
				console.log(err);
			} finally {
				setAuthChecked(true);
			}
		};
		getUser();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [auth]);
	return authChecked;
};

export default useListenAuth;
