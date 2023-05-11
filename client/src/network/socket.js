import socket from "socket.io-client";

export default class Socker {
  constructor(baseURL, getAcessToken) {
    this.io = socket(baseURL, {
      auth: (cb) => cb({ token: getAcessToken() }),
    });

    this.io.on("connection_error", (error) => {
      console.log("socket error", error.message);
    });
  }

  onSync(event, callback) {
    if (!this.io.connected) {
      this.io.connect();
    }

    this.io.on(event, (message) => callback(message));
    return () => this.io.off(event);
  }
}
