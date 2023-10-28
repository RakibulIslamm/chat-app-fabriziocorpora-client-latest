import { io } from "socket.io-client";
const connectionOptions = {
	forceNew: true,
	reconnectionAttempts: Infinity,
	timeout: 10000,
	transports: ["websocket"],
};

export const socket = io(
	"https://chat-app-fabriziocorpora.onrender.com/",
	connectionOptions
);
