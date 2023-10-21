import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import useColorScheme from "../Hooks/useColorScheme";
import { useDispatch } from "../lib/redux/store";
import { setCurrentUser } from "../lib/redux/slices/user/userSlice";
import { socket } from "../utils/socket";

const Login = () => {
	const [value, setValue] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const dispatch = useDispatch();

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		setError("");
		const username = value.split(" ").join("");
		if (!username) {
			setError("Username is required");
			return;
		}

		try {
			setLoading(true);
			const res = await fetch(
				"https://chat-app-fabriziocorpora.onrender.com/api/users/login",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ username: username }),
				}
			);

			const res_data = await res.json();
			if (!res_data.success) {
				setError(res_data.message);
			} else {
				socket.emit("new_user", res_data.data._id);
				sessionStorage.setItem("auth", JSON.stringify(res_data.data));
				dispatch(setCurrentUser(res_data.data));
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
			<h1 className="text-3xl font-bold text-center py-5">Login</h1>
			{error && (
				<p className="mb-10 w-1/2 bg-red-300 text-red-800 text-center text-xl font-bold italic py-4 rounded">
					{error}
				</p>
			)}
			<div className="w-1/3 sm:w-full px-[25px]">
				<form onSubmit={handleSubmit} className="space-y-3">
					<input
						className="w-full px-4 py-2 rounded bg-white dark:bg-opacity-10 border border-gray-300 dark:border-gray-500"
						value={value}
						onChange={(e) => setValue(e.target.value)}
						placeholder="username"
						name="username"
						required
					/>
					<div className="flex items-center sm:flex-col gap-5">
						<button
							style={{ background: main }}
							className="px-4 py-2 rounded sm:w-full text-white"
							type="submit"
						>
							{loading ? "Loading..." : "Login"}
						</button>
						<p>
							Don&apos;t have an account?{" "}
							<Link className=" underline font-semibold" to={"/a/register"}>
								Register
							</Link>{" "}
						</p>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Login;
