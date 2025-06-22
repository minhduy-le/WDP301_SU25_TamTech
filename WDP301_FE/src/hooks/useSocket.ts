// WDP301_FE/src/hooks/useSocket.ts
import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { useAuthStore } from "./usersApi";

const SOCKET_URL = "https://wdp301-su25.space";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token } = useAuthStore();

  useEffect(() => {
    if (!token) {
      console.log("Socket.IO: No token available, connection aborted.");
      return;
    }

    // Khởi tạo socket với token để xác thực
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"], // Cho phép cả 2 transport
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket.IO: Connected successfully with id", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket.IO: Disconnected, reason:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket.IO Connection Error:", error);
      setIsConnected(false);
    });

    // Cleanup function khi component unmount
    return () => {
      console.log("Socket.IO: Disconnecting...");
      newSocket.disconnect();
    };
  }, [token]);

  return { socket, isConnected };
};
