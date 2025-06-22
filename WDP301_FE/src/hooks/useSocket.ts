import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

// URL của backend server
const SOCKET_URL = "https://wdp301-su25.space/";

// Tạo một thể hiện socket duy nhất để tái sử dụng
let socketInstance: Socket | null = null;

/**
 * Hook để quản lý kết nối Socket.IO.
 * Chỉ nên dùng một lần ở component cấp cao nhất (ví dụ: App.tsx).
 */
export const useSocketConnection = (token: string | null) => {
  const [isConnected, setIsConnected] = useState(socketInstance?.connected || false);

  useEffect(() => {
    // Chỉ tạo kết nối mới nếu chưa có hoặc token thay đổi
    if (token && !socketInstance) {
      console.log("Socket: Initializing connection...");
      socketInstance = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
      });

      socketInstance.on("connect", () => {
        console.log("Socket: Connected with ID", socketInstance?.id);
        setIsConnected(true);
      });

      socketInstance.on("disconnect", (reason) => {
        console.log("Socket: Disconnected.", reason);
        setIsConnected(false);
        socketInstance = null; // Hủy instance để có thể kết nối lại
      });

      socketInstance.on("connect_error", (err) => {
        console.error("Socket: Connection error:", err.message);
        setIsConnected(false);
      });
    }

    // Cleanup khi component unmount
    return () => {
      if (socketInstance) {
        console.log("Socket: Disconnecting on cleanup.");
        socketInstance.disconnect();
        socketInstance = null;
      }
    };
  }, [token]);

  return { isConnected, socket: socketInstance };
};

/**
 * Hàm để phát một sự kiện qua socket.
 * @param eventName Tên sự kiện.
 * @param data Dữ liệu cần gửi.
 */
export const emitSocketEvent = (eventName: string, data: unknown) => {
  if (socketInstance && socketInstance.connected) {
    socketInstance.emit(eventName, data);
  } else {
    console.error(`Socket: Cannot emit event "${eventName}". Not connected.`);
  }
};

/**
 * Hook để lắng nghe một sự kiện từ socket.
 * @param eventName Tên sự kiện cần lắng nghe.
 * @param callback Hàm sẽ được gọi khi nhận được sự kiện.
 */
export const useSocketListener = (eventName: string, callback: (data: unknown) => void) => {
  useEffect(() => {
    if (socketInstance) {
      console.log(`Socket: Subscribing to event "${eventName}"`);
      socketInstance.on(eventName, callback);

      // Cleanup: Hủy đăng ký lắng nghe
      return () => {
        console.log(`Socket: Unsubscribing from event "${eventName}"`);
        socketInstance?.off(eventName, callback);
      };
    }
  }, [eventName, callback]);
};
