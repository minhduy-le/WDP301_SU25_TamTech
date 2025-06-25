import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "https://wdp301-su25.space/";

let socketInstance: Socket | null = null;

export const useSocketConnection = (token: string | null) => {
  const [isConnected, setIsConnected] = useState(socketInstance?.connected || false);

  useEffect(() => {
    if (token && !socketInstance) {
      console.log("Socket: Initializing connection with token:", token.substring(0, 10) + "...");
      socketInstance = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true, // Bật tính năng tái kết nối
        reconnectionAttempts: 5, // Số lần thử lại
        reconnectionDelay: 2000, // Độ trễ giữa các lần thử (2 giây)
      });

      socketInstance.on("connect", () => {
        console.log(
          "Socket: Connected with ID",
          socketInstance?.id,
          "Transport:",
          socketInstance?.io.engine.transport.name
        );
        setIsConnected(true);
      });

      socketInstance.on("connect_error", (err) => {
        console.error("Socket: Connect error:", err.message, "Context:", err.context);
        setIsConnected(false);
      });

      socketInstance.on("disconnect", (reason) => {
        console.log("Socket: Disconnected due to", reason);
        setIsConnected(false);
        socketInstance = null;
      });
    }

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
      }
    };
  }, [token]);

  return { isConnected, socket: socketInstance };
};

export const emitSocketEvent = (eventName: string, data: unknown) => {
  if (socketInstance && socketInstance.connected) {
    socketInstance.emit(eventName, data);
  } else {
    console.error(`Socket: Cannot emit event "${eventName}". Not connected.`);
  }
};

export const useSocketListener = (eventName: string, callback: (data: unknown) => void) => {
  useEffect(() => {
    if (socketInstance) {
      console.log(`Socket: Subscribing to event "${eventName}"`);
      socketInstance.on(eventName, callback);
      return () => {
        console.log(`Socket: Unsubscribing from event "${eventName}"`);
        socketInstance?.off(eventName, callback);
      };
    }
  }, [eventName, callback, socketInstance]);
};
