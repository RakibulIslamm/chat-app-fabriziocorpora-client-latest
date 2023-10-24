import { useState, FormEvent, useMemo } from "react";
import { Link } from "react-router-dom";
import useColorScheme from "../Hooks/useColorScheme";
import { setCurrentUser } from "../lib/redux/slices/user/userSlice";
import { useDispatch } from "../lib/redux/store";
import { getRandomColor } from "../utils/randomColor";
import { socket } from "../utils/socket";

const Register = () => {
	const [name, setName] = useState("");
	const [username, setUsername] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const dispatch = useDispatch();

	const color = useMemo(() => {
		return getRandomColor();
	}, []);

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		setError("");
		const uName = username.split(" ").join("").toLowerCase();
		if (!name) {
			setError("Name is required");
			return;
		}
		if (!uName) {
			setError("Username is required");
			return;
		}
		const data = {
			name: name,
			username: username,
			email: "",
			img: "",
			bio: "",
			color: color,
			lastActive: null,
		};

		try {
			setLoading(true);
			const res = await fetch(
				"https://chat-app-fabriziocorpora.onrender.com/api/users/register",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				}
			);

			const res_data = await res.json();
			if (!res_data.success) {
				setError(res_data.message);
			} else {
				sessionStorage.setItem("auth", JSON.stringify(res_data.data));
				dispatch(setCurrentUser(res_data.data));
				socket.emit("new_user", res_data.data._id);
			}
		} catch (err) {
			console.log(err);
		} finally {
			setLoading(false);
		}
	};

	const { primary, textColor, main } = useColorScheme();

	return (
		<div
			style={{ background: primary, color: textColor }}
			className="w-full h-full flex justify-center items-center flex-col"
		>
			{error && (
				<p className="mb-10 w-1/2 bg-red-300 text-red-800 text-center text-xl font-bold italic py-4 rounded">
					{error}
				</p>
			)}
			<h1 className="text-3xl font-bold text-center py-5">
				Register an account
			</h1>
			<div>
				<form onSubmit={handleSubmit} className="space-y-3 w-full px-[25px]">
					<input
						className="w-full px-4 py-2 rounded bg-white dark:bg-opacity-10 border border-gray-300 dark:border-gray-500"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Name"
						name="name"
						required
					/>
					<input
						className="w-full px-4 py-2 rounded bg-white dark:bg-opacity-10 border border-gray-300 dark:border-gray-500"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						placeholder="username"
						name="username"
						required
					/>
					<button
						style={{ background: main }}
						className="w-full px-4 py-2 rounded text-white"
						type="submit"
					>
						{loading ? "Loading..." : "Register"}
					</button>
				</form>
				<div className="px-[25px]">
					<p>
						Already registered?{" "}
						<Link className=" underline font-semibold" to={"/a/login"}>
							Login
						</Link>{" "}
					</p>
				</div>
			</div>
		</div>
	);
};

export default Register;
