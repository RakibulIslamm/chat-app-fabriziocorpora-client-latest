import { io } from "socket.io-client";
import { serverUrl } from "./serverUrl";
const connectionOptions = {
	forceNew: true,
	reconnectionAttempts: Infinity,
	timeout: 10000,
	transports: ["websocket"],
};
export const socket = io(`${serverUrl}/`, connectionOptions);
