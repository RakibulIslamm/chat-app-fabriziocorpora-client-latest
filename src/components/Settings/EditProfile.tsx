import { FiArrowLeft } from "react-icons/fi";
import { FaUserPen } from "react-icons/fa6";

// type Props = {}

import { useDispatch, useSelector } from "react-redux";
import { editProfileOn } from "../../lib/redux/slices/settings/settingsSlice";
import useColorScheme from "../../Hooks/useColorScheme";
import { ReduxState } from "../../lib/redux/store";
import { useState, FormEvent } from "react";
import { useEditUserMutation } from "../../lib/redux/slices/user/userApi";
import { setCurrentUser } from "../../lib/redux/slices/user/userSlice";

const EditProfile = () => {
	const [isEdit, setIsEdit] = useState(false);
	const { user } = useSelector((state: ReduxState) => state.user);
	const [name, setName] = useState<string>(user?.name || "");
	const [bio, setBio] = useState<string>(user?.bio || "");
	const dispatch = useDispatch();
	const { textColor, main } = useColorScheme();
	const [editUser, { isLoading }] = useEditUserMutation();

	const isValid =
		(name || bio) && (name !== user?.name || bio !== user?.bio) ? true : false;

	const handleEditProfile = async (e: FormEvent) => {
		e.preventDefault();
		if (!isValid) {
			console.log("not valid");
			return;
		}
		try {
			const result = await editUser({
				data: { name, bio },
				id: user?._id,
			}).unwrap();
			dispatch(setCurrentUser(result.data));
			setIsEdit(false);
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<div style={{ color: textColor }} className="px-[20px]">
			<div className="w-full flex items-center gap-4 h-[75px]">
				<button onClick={() => dispatch(editProfileOn(false))}>
					<FiArrowLeft className="text-[25px]" />
				</button>

				<h2 className="text-[20px] font-medium">Edit Profile</h2>
			</div>

			<div className="mt-4 px-4 space-y-4 flex flex-col items-center">
				<div>
					<FaUserPen className="text-[150px]" />
				</div>
				<form onSubmit={handleEditProfile} className="space-y-3">
					<input
						className="border border-[#B4B4B4] rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow text-[17px] text-base"
						type="text"
						onChange={(e) => setName(e.target.value)}
						value={name}
						disabled={!isEdit}
						placeholder="Enter your name"
					/>
					<textarea
						className="border border-[#B4B4B4] rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow text-[17px] text-base"
						value={bio}
						onChange={(e) => setBio(e.target.value)}
						disabled={!isEdit}
						placeholder="Bio"
					/>
					<div className="flex items-center gap-4">
						<button
							style={{
								background: `${isEdit && isValid ? main : "lightgray"}`,
								color: `${isEdit && isValid ? "white" : "black"}`,
							}}
							className="px-5 py-2 rounded-lg"
							type="submit"
							disabled={!isEdit || isLoading || !isValid}
						>
							{isLoading ? "Loading..." : "Update Profile"}
						</button>
						{!isEdit && (
							<button
								onClick={() => setIsEdit(!isEdit)}
								className="rounded-lg underline"
								type="submit"
							>
								Edit info
							</button>
						)}
						{isEdit && (
							<button
								onClick={() => setIsEdit(!isEdit)}
								className="px-5 py-2 border border-gray-600 rounded-lg hover:bg-primary"
								type="submit"
							>
								Cancel
							</button>
						)}
					</div>
				</form>
			</div>
		</div>
	);
};

export default EditProfile;
