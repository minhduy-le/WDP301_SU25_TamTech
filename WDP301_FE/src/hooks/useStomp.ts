// WDP301_FE/src/hooks/useStomp.ts
import { useEffect, useRef } from "react";
import Stomp from "stompjs";
import SockJS from "sockjs-client";

const SOCKET_URL = "http://localhost:8080/websocket"; // Trỏ tới server backend mới

export const useStomp = (topic: string, callback: (body: string) => void) => {
  const stompClientRef = useRef<Stomp.Client | null>(null);
  const subscriptionRef = useRef<Stomp.Subscription | null>(null);

  useEffect(() => {
    // 1. Tạo kết nối SockJS và STOMP client
    const socket = new SockJS(SOCKET_URL);
    const stompClient = Stomp.over(socket);
    stompClientRef.current = stompClient;

    // Tắt log debug của StompJS trong console
    stompClient.debug = () => {};

    const onConnected = () => {
      console.log("STOMP: Connected successfully!");
      // 2. Đăng ký (subscribe) vào topic khi đã kết nối
      if (stompClientRef.current) {
        subscriptionRef.current = stompClientRef.current.subscribe(topic, (message) => {
          console.log(`STOMP: Received message from topic "${topic}":`, message.body);
          // 3. Gọi callback với nội dung tin nhắn
          callback(message.body);
        });
      }
    };

    const onError = (error: any) => {
      console.error("STOMP: Connection error", error);
    };

    // 4. Thực hiện kết nối
    stompClient.connect({}, onConnected, onError);

    // 5. Cleanup function: Ngắt kết nối khi component unmount
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        console.log(`STOMP: Unsubscribed from topic "${topic}"`);
      }
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.disconnect(() => {
          console.log("STOMP: Disconnected.");
        });
      }
    };
  }, [topic, callback]); // Hook sẽ chạy lại nếu topic hoặc callback thay đổi
};
