import { io } from "socket.io-client";
const connectionOptions = {
	"force new connection": true,
	reconnectionAttempts: Infinity,
	timeout: 10000,
	transports: ["websocket"],
};

export const socket = io(
	"https://chat-app-fabriziocorpora.onrender.com/",
	connectionOptions
);
