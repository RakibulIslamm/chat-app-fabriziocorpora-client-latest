/* 
    name: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
    img: { type: String || null },
    coverImg: { type: String || null },
    bio: { type: String }

*/

export interface UserInterface {
	_id?: string;
	name: string;
	username: string;
	email?: string;
	img?: string;
	bio?: string;
	color?: string;
	status: "online" | "offline";
	lastActive?: number | null;
}
