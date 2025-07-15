// WDP301_FE/src/hooks/useStomp.ts
import { useEffect, useRef } from "react";
import Stomp from "stompjs";
import SockJS from "sockjs-client";

// SỬA ĐỔI TẠI ĐÂY: Trỏ đến endpoint an toàn trên server production
const SOCKET_URL = "https://wdp301-su25.space/websocket";

export const useStomp = (topic: string, callback: (body: string) => void) => {
  const stompClientRef = useRef<Stomp.Client | null>(null);
  const subscriptionRef = useRef<Stomp.Subscription | null>(null);

  useEffect(() => {
    // SockJS sẽ tự động biết cách kết nối qua WSS (WebSocket Secure) khi URL là https
    const socket = new SockJS(SOCKET_URL);
    const stompClient = Stomp.over(socket);
    stompClientRef.current = stompClient;

    stompClient.debug = () => {};

    const onConnected = () => {
      console.log("STOMP: Connected successfully!");
      if (stompClientRef.current) {
        subscriptionRef.current = stompClientRef.current.subscribe(topic, (message) => {
          console.log(`STOMP: Received message from topic "${topic}":`, message.body);
          callback(message.body);
        });
      }
    };

    const onError = (error: any) => {
      console.error("STOMP: Connection error", error);
    };

    stompClient.connect({}, onConnected, onError);

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
  }, [topic, callback]);
};
