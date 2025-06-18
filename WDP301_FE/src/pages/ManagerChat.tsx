/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { Input, Button, List, Card, Avatar, message } from "antd";
import { SearchOutlined, SendOutlined } from "@ant-design/icons";
import { useGetAccounts } from "../hooks/accountApi";
import { useCreateChat } from "../hooks/chatsApi";
import io, { Socket } from "socket.io-client";
import axiosInstance from "../config/axios";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useAuthStore } from "../hooks/usersApi";
import { useOutletContext } from "react-router-dom";
import "../style/StaffChat.css";

dayjs.extend(customParseFormat);

interface Chat {
  id: number;
  chatRoomId?: number;
  senderId: number;
  receiverId?: number;
  content: string;
  createdAt: Date;
  Sender?: { id: number; fullName: string };
  Receiver?: { id: number; fullName: string };
}

interface OutletContext {
  setSocket?: (socket: Socket | null) => void;
}

const ManagerChat = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState<{
    id: number;
    fullName: string;
  } | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const { data: accounts, isLoading: isAccountsLoading } = useGetAccounts();
  const { user: authUser, token } = useAuthStore();
  const { mutate: createChat, isPending: isSending } = useCreateChat();

  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isConnectingRef = useRef(false);

  const context = useOutletContext<OutletContext>();
  const setParentSocket = context?.setSocket || (() => {});

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      console.log("🔄 Scrolled to bottom");
    }
  };

  const cleanupSocket = () => {
    console.log("🧹 Cleaning up socket and timers");

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
    }

    setSocket(null);
    setIsConnected(false);
    setIsReconnecting(false);
    isConnectingRef.current = false;

    if (setParentSocket) {
      setParentSocket(null);
    }
  };

  const connectSocket = () => {
    if (isConnectingRef.current) return;

    if (!token || !authUser?.id) {
      console.error("Missing token or user ID:", { token, authUser });
      return;
    }

    isConnectingRef.current = true;
    setIsReconnecting(true);

    if (socket) {
      socket.disconnect();
    }

    const socketUrl = "https://wdp301-su25.space";
    const newSocket = io(socketUrl, {
      transports: ["websocket", "polling"],
      upgrade: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 10000,
      auth: { token },
    });

    setSocket(newSocket);

    if (setParentSocket) {
      setParentSocket(newSocket);
      console.log("🔌 Registered socket with parent context");
    }

    newSocket.on("connect", () => {
      console.log("✅ Connected to WebSocket server", {
        userId: authUser.id,
        socketId: newSocket.id,
        transport: newSocket.io.engine.transport.name,
      });
      setIsConnected(true);
      setConnectionAttempts(0);
      setIsReconnecting(false);
      isConnectingRef.current = false;
      message.success(`Connected successfully with ID ${authUser.id}`);

      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = setInterval(() => {
        if (newSocket.connected) {
          newSocket.emit("ping", (response: any) => {
            console.log("🏓 Ping response:", response);
          });
        }
      }, 30000);
    });

    newSocket.on("connect_error", (error: any) => {
      console.error("Connection failed:", {
        message: error.message,
        description: error.description,
        code: error.code,
        context: error.context,
        stack: error.stack,
      });
      message.error(`Connection failed: ${error.message || "Unknown error"}`);
      setIsConnected(false);
      setIsReconnecting(false);
      isConnectingRef.current = false;

      const currentAttempts = connectionAttempts + 1;
      setConnectionAttempts(currentAttempts);

      if (currentAttempts < 5) {
        const delay = Math.min(1000 * Math.pow(2, currentAttempts - 1), 10000);
        message.warning(`Connection failed: ${error.message}. Retrying in ${delay / 1000}s... (${currentAttempts}/5)`);
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(`🔄 Attempting to reconnect... (attempt ${currentAttempts + 1})`);
          connectSocket();
        }, delay);
      } else {
        message.error("Failed to connect after 5 attempts. Please check your network.");
        cleanupSocket();
      }
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from WebSocket server. Reason:", reason);
      setIsConnected(false);
      isConnectingRef.current = false;

      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }

      if (reason === "io server disconnect" || reason === "transport close") {
        if (connectionAttempts < 5) {
          console.log("🔄 Server disconnected, attempting to reconnect...");
          setTimeout(() => connectSocket(), 2000);
        }
      }
    });

    newSocket.on("message", (receivedMessage: Chat) => {
      console.log("📨 Received message:", {
        id: receivedMessage.id,
        from: receivedMessage.senderId,
        to: receivedMessage.receiverId,
        content: receivedMessage.content,
        createdAt: receivedMessage.createdAt,
      });

      setChats((prevChats) => {
        if (prevChats.some((chat) => chat.id === receivedMessage.id)) {
          console.log("⚠️ Duplicate message detected, skipping");
          return prevChats;
        }

        console.log("✅ Adding new message to chat");
        const newMessage = {
          ...receivedMessage,
          createdAt: new Date(receivedMessage.createdAt),
          Sender: receivedMessage.Sender,
          Receiver: receivedMessage.Receiver,
        };

        const updatedChats = [...prevChats, newMessage].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        return updatedChats;
      });
    });

    return newSocket;
  };

  useEffect(() => {
    if (!authUser?.id || !token) {
      console.log("❌ Skipping socket connection: missing authUser.id or token", { authUser, token });
      return;
    }

    connectSocket();

    return () => {
      console.log("🔌 Component unmounting, cleaning up socket connection");
      cleanupSocket();
    };
  }, [authUser?.id, token]);

  useEffect(() => {
    if (!authUser || !selectedUser) {
      setChats([]);
      return;
    }

    const fetchInitialMessages = async () => {
      setIsLoadingChats(true);
      try {
        const response = await axiosInstance.get<Chat[]>("/chat/messages", {
          params: {
            receiverId: selectedUser.id,
            limit: 50,
            offset: 0,
          },
        });

        setChats(
          response.data
            .map((chat) => ({
              ...chat,
              createdAt: new Date(chat.createdAt),
              Sender: chat.Sender,
              Receiver: chat.Receiver,
            }))
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        );

        setTimeout(scrollToBottom, 100);
      } catch (error: any) {
        console.error("❌ Failed to fetch messages:", error.message);
        message.error("Failed to load messages");
      } finally {
        setIsLoadingChats(false);
      }
    };

    fetchInitialMessages();
  }, [selectedUser, authUser]);

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  const filteredAccounts =
    accounts?.filter(
      (account) =>
        account.fullName.toLowerCase().includes(searchText.toLowerCase()) &&
        account.role !== "User" &&
        account.id !== authUser?.id
    ) || [];

  const handleSendMessage = () => {
    if (!selectedUser || !messageInput.trim() || !authUser) {
      message.error("Please select a recipient and enter a message.");
      return;
    }

    if (!isConnected) {
      message.error("Not connected to chat server. Please try again.");
      return;
    }

    const messageData = {
      receiverId: selectedUser.id,
      content: messageInput.trim(),
    };

    createChat(messageData, {
      onSuccess: (data) => {
        console.log("✅ Message created via API:", data);
        setMessageInput("");

        if (socket?.connected) {
          socket.emit("sendMessage", messageData, (response: any) => {
            console.log("📤 Socket emit response:", response);
            if (response?.error) {
              message.error(response.error || "Failed to send message via socket");
            } else if (response?.success) {
              console.log("✅ Socket message sent successfully");
              message.success("Message sent successfully!");
            }
          });
        } else {
          console.warn("⚠️ Socket not connected, message sent via API only");
          message.success("Message sent successfully!");
        }
      },
      onError: (error: any) => {
        console.error("❌ Failed to create message:", error.message);
        message.error(error.message || "Failed to send message!");
      },
    });
  };

  const formatChatTime = (createdAt: Date) => {
    const messageDate = dayjs(createdAt);
    const today = dayjs();
    const yesterday = dayjs().subtract(1, "day");

    if (messageDate.isSame(today, "day")) {
      return messageDate.format("HH:mm");
    } else if (messageDate.isSame(yesterday, "day")) {
      return `Yesterday ${messageDate.format("HH:mm")}`;
    }
    return messageDate.format("HH:mm DD/MM/YYYY");
  };

  const handleReconnect = () => {
    console.log("🔄 Manual reconnect initiated");
    setConnectionAttempts(0);
    cleanupSocket();
    setTimeout(() => {
      connectSocket();
    }, 1000);
  };

  return (
    <div style={{ display: "flex", padding: "20px" }}>
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 10,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            padding: "5px 15px",
            backgroundColor: isConnected ? "#4caf50" : isReconnecting ? "#ff9800" : "#f44336",
            color: "white",
            borderRadius: "12px",
            fontSize: "12px",
          }}
        >
          {isConnected ? `🟢 Connected (ID ${authUser?.id})` : isReconnecting ? "🟡 Connecting..." : "🔴 Disconnected"}
        </div>
        {!isConnected && !isReconnecting && (
          <Button size="small" onClick={handleReconnect}>
            Reconnect
          </Button>
        )}
      </div>

      <Card
        style={{
          width: 300,
          marginRight: 20,
          overflowY: "auto",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Input
          placeholder="Search user name..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 16, borderRadius: "8px" }}
        />
        <List
          loading={isAccountsLoading}
          dataSource={filteredAccounts}
          renderItem={(account) => (
            <List.Item
              onClick={() => setSelectedUser({ id: account.id, fullName: account.fullName })}
              style={{ cursor: "pointer", padding: "8px", borderRadius: "8px" }}
              className={selectedUser?.id === account.id ? "active-user" : ""}
            >
              <List.Item.Meta
                avatar={<Avatar style={{ backgroundColor: "#1890ff" }}>{account.fullName[0]}</Avatar>}
                title={
                  <span
                    style={{
                      fontWeight: selectedUser?.id === account.id ? "bold" : "normal",
                      fontSize: 16,
                    }}
                  >
                    {account.fullName}
                  </span>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Card
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        {selectedUser ? (
          <>
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                padding: "15px",
                borderBottom: "1px solid #e8e8e8",
                background: "#fafafa",
                borderTopLeftRadius: "12px",
                borderTopRightRadius: "12px",
              }}
            >
              Chat with: {selectedUser.fullName}
            </div>

            <div
              ref={chatContainerRef}
              className="chat-container-user"
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                background: "#f0f2f5",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                minHeight: "400px",
              }}
            >
              {isLoadingChats ? (
                <p style={{ textAlign: "center", color: "#888", margin: "auto" }}>Loading messages...</p>
              ) : chats.length ? (
                chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`message-bubble ${chat.senderId === authUser?.id ? "sent" : "received"}`}
                    style={{
                      backgroundColor: chat.senderId === authUser?.id ? "#2196f3" : "#fff",
                      color: chat.senderId === authUser?.id ? "#fff" : "#000",
                      margin: chat.senderId === authUser?.id ? "5px 10px 5px auto" : "5px auto 5px 10px",
                      padding: "10px 15px",
                      maxWidth: "70%",
                      borderRadius: "10px",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div>{chat.content}</div>
                    <div
                      style={{
                        marginTop: "5px",
                        textAlign: chat.senderId === authUser?.id ? "right" : "left",
                      }}
                    >
                      <small
                        style={{
                          color: chat.senderId === authUser?.id ? "#e6f0ff" : "#888",
                          fontSize: "12px",
                        }}
                      >
                        {formatChatTime(chat.createdAt)}
                      </small>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: "center", color: "#888", margin: "auto" }}>No messages with this user yet.</p>
              )}
            </div>

            <div
              style={{
                padding: "15px",
                borderTop: "1px solid #e8e8e8",
                background: "#fff",
                borderBottomLeftRadius: "12px",
                borderBottomRightRadius: "12px",
              }}
            >
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onPressEnter={handleSendMessage}
                placeholder="Type a message..."
                disabled={!isConnected || isSending}
                suffix={
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || !isConnected || isSending}
                    loading={isSending}
                    style={{
                      borderRadius: "50%",
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  />
                }
                style={{ padding: "10px 12px" }}
              />
            </div>
          </>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              color: "#888",
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Select a user to start chatting.
          </div>
        )}
      </Card>
    </div>
  );
};

export default ManagerChat;
