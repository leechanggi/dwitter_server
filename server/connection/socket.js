import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

const HOST_CLIENT = config.host.client;
const JWT_SECRETKEY = config.jwt.secretKey;
const CORS_ORIGIN = config.cors.origin;

const msgAuthError = "Authentication Error";

class Socket {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        // origin: [`http://localhost:${HOST_CLIENT}`],
        origin: CORS_ORIGIN,
      },
    });

    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error(msgAuthError));
      }
      jwt.verify(token, JWT_SECRETKEY, (error, decoded) => {
        if (error) {
          return next(new Error(msgAuthError));
        }
        next();
      });
    });

    this.io.on("connection", (socket) => {
      console.log("Socket client connected");
    });
  }
}

let socket;
export function initSocket(server) {
  if (!socket) {
    socket = new Socket(server);
  }
}

export function getSocketIO() {
  if (!socket) {
    throw new Error("Please call init first");
  }
  return socket.io;
}
