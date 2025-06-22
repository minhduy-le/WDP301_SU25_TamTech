/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback } from "react";
import { Input, Button, List, Card, Avatar, message } from "antd";
import { SearchOutlined, SendOutlined } from "@ant-design/icons";
import { useGetAccounts } from "../hooks/accountApi";
import { useCreateChat } from "../hooks/chatsApi";
import io, { Socket } from "socket.io-client";
import axiosInstance from "../config/axios";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useAuthStore } from "../hooks/usersApi";
import "../style/StaffChat.css";

dayjs.extend(customParseFormat);

// --- Interfaces ---
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

const ManagerChat = () => {
  // --- State ---
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState<{ id: number; fullName: string } | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>("Đang kết nối...");
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // --- Hooks ---
  const { data: accounts, isLoading: isAccountsLoading } = useGetAccounts();
  const { user: authUser, token } = useAuthStore();
  const { mutate: createChat, isPending: isSending } = useCreateChat();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Debug function
  const addDebugInfo = useCallback((info: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo((prev) => [...prev.slice(-4), `[${timestamp}] ${info}`]);
    console.log(`[DEBUG] ${info}`);
  }, []);

  // --- Functions ---
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const initializeSocket = useCallback(() => {
    if (!token || !authUser?.id) {
      setConnectionStatus("Chưa xác thực");
      addDebugInfo("No token or user ID");
      return null;
    }

    setConnectionStatus("Đang kết nối...");
    addDebugInfo("Initializing socket connection...");

    // Force polling only để test
    const newSocket = io("https://wdp301-su25.space", {
      auth: { token },
      query: { token },
      // XÓA DÒNG NÀY: transports: ["polling"],
      // XÓA DÒNG NÀY: pollingTimeout: 30000,
      // SỬA DÒNG NÀY: upgrade: false,
      // THAY BẰNG CÁC TÙY CHỌN DƯỚI ĐÂY (hoặc để trống để dùng mặc định)
      transports: ["polling", "websocket"], // Cho phép cả hai, client sẽ cố gắng nâng cấp lên websocket
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    // Connection events
    newSocket.on("connect", () => {
      addDebugInfo(`Connected with ID: ${newSocket.id}`);
      setIsConnected(true);
      setConnectionStatus("Đã kết nối (Polling)");
      message.success("Kết nối chat thành công!");
    });

    newSocket.on("connect_error", (error) => {
      addDebugInfo(`Connection error: ${error.message}`);
      setIsConnected(false);
      setConnectionStatus("Lỗi kết nối");
      console.error("Connection Error:", error);
    });

    newSocket.on("disconnect", (reason) => {
      addDebugInfo(`Disconnected: ${reason}`);
      setIsConnected(false);
      setConnectionStatus("Mất kết nối");

      if (reason === "io server disconnect") {
        addDebugInfo("Server initiated disconnect, will reconnect...");
      }
    });

    // Reconnection events
    newSocket.on("reconnect_attempt", (attemptNumber) => {
      addDebugInfo(`Reconnection attempt #${attemptNumber}`);
      setConnectionStatus(`Đang kết nối lại (${attemptNumber})...`);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      addDebugInfo(`Reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      setConnectionStatus("Đã kết nối lại");
      message.success("Đã kết nối lại thành công!");
    });

    newSocket.on("reconnect_failed", () => {
      addDebugInfo("Reconnection failed");
      setIsConnected(false);
      setConnectionStatus("Kết nối thất bại");
      message.error("Không thể kết nối lại.");
    });

    // Message handling
    newSocket.on("message", (receivedMessage: Chat) => {
      addDebugInfo(`Received message from user ${receivedMessage.senderId}`);
      const isRelevant =
        (receivedMessage.senderId === selectedUser?.id && receivedMessage.receiverId === authUser.id) ||
        (receivedMessage.senderId === authUser.id && receivedMessage.receiverId === selectedUser?.id);

      if (isRelevant) {
        setChats((prevChats) => {
          if (prevChats.some((chat) => chat.id === receivedMessage.id)) {
            return prevChats;
          }
          const updatedChats = [
            ...prevChats,
            {
              ...receivedMessage,
              createdAt: new Date(receivedMessage.createdAt),
            },
          ];
          return updatedChats.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        });
      }
    });

    // Custom ping-pong to test connection
    const pingInterval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit("ping", (response: any) => {
          if (response?.success) {
            addDebugInfo("Ping successful");
          }
        });
      }
    }, 30000);

    // Cleanup ping interval on disconnect
    newSocket.on("disconnect", () => {
      clearInterval(pingInterval);
    });

    return newSocket;
  }, [token, authUser?.id, selectedUser?.id, addDebugInfo]);

  const handleSendMessage = () => {
    if (!selectedUser || !messageInput.trim() || !authUser) {
      message.error("Vui lòng chọn người nhận và nhập tin nhắn.");
      return;
    }
    if (!isConnected || !socket) {
      message.error("Chưa kết nối đến máy chủ chat.");
      return;
    }

    const messageData = {
      receiverId: selectedUser.id,
      content: messageInput.trim(),
    };

    addDebugInfo(`Sending message to user ${selectedUser.id}`);

    // Gửi tin nhắn qua API trước
    createChat(messageData, {
      onSuccess: () => {
        setMessageInput("");
        addDebugInfo("API call successful, sending via socket...");

        // Sau đó gửi qua socket để real-time
        socket.emit("sendMessage", messageData, (response: any) => {
          if (response?.error) {
            addDebugInfo(`Socket error: ${response.error}`);
            message.error(response.error);
          } else {
            addDebugInfo("Socket message sent successfully");
          }
        });
      },
      onError: (error: any) => {
        addDebugInfo(`API error: ${error.message}`);
        message.error(error.message || "Gửi tin nhắn thất bại!");
      },
    });
  };

  const formatChatTime = (createdAt: Date) => {
    const messageDate = dayjs(createdAt);
    const today = dayjs();
    const yesterday = dayjs().subtract(1, "day");

    if (messageDate.isSame(today, "day")) return messageDate.format("HH:mm");
    if (messageDate.isSame(yesterday, "day")) return `Hôm qua ${messageDate.format("HH:mm")}`;
    return messageDate.format("HH:mm DD/MM/YYYY");
  };

  // --- Effects ---

  // Initialize socket connection
  useEffect(() => {
    const newSocket = initializeSocket();
    if (newSocket) {
      setSocket(newSocket);
    }

    return () => {
      if (newSocket) {
        addDebugInfo("Cleaning up socket connection");
        newSocket.disconnect();
      }
    };
  }, [initializeSocket]);

  // Load initial messages
  useEffect(() => {
    if (!authUser || !selectedUser) {
      setChats([]);
      return;
    }

    const fetchInitialMessages = async () => {
      setIsLoadingChats(true);
      addDebugInfo(`Loading messages for user ${selectedUser.id}`);

      try {
        const response = await axiosInstance.get<Chat[]>("/chat/messages", {
          params: { limit: 100, offset: 0 },
        });

        const filteredChats = response.data.filter(
          (chat) =>
            (chat.senderId === authUser.id && chat.receiverId === selectedUser.id) ||
            (chat.senderId === selectedUser.id && chat.receiverId === authUser.id)
        );

        setChats(
          filteredChats
            .map((chat) => ({ ...chat, createdAt: new Date(chat.createdAt) }))
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        );

        addDebugInfo(`Loaded ${filteredChats.length} messages`);
      } catch (error: any) {
        addDebugInfo(`Error loading messages: ${error.message}`);
        message.error("Không thể tải tin nhắn.");
      } finally {
        setIsLoadingChats(false);
      }
    };

    fetchInitialMessages();
  }, [selectedUser, authUser, addDebugInfo]);

  // Auto scroll
  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [chats]);

  // --- Render ---
  const filteredAccounts =
    accounts?.filter(
      (account) =>
        account.fullName.toLowerCase().includes(searchText.toLowerCase()) &&
        account.role !== "User" &&
        account.id !== authUser?.id
    ) || [];

  return (
    <div style={{ display: "flex", padding: "20px", height: "calc(100vh - 100px)" }}>
      {/* Debug Panel - Temporary */}
      <div
        style={{
          position: "fixed",
          top: 120,
          right: 20,
          zIndex: 1000,
          background: "rgba(0,0,0,0.8)",
          color: "white",
          padding: "10px",
          borderRadius: "8px",
          fontSize: "10px",
          maxWidth: "300px",
          maxHeight: "200px",
          overflowY: "auto",
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>Debug Info:</div>
        {debugInfo.map((info, index) => (
          <div key={index}>{info}</div>
        ))}
      </div>

      {/* Connection Status */}
      <div style={{ position: "fixed", top: 80, right: 20, zIndex: 1000 }}>
        <div
          style={{
            padding: "5px 15px",
            backgroundColor: isConnected ? "#4caf50" : "#f44336",
            color: "white",
            borderRadius: "12px",
            fontSize: "12px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          {isConnected ? `🟢 ${connectionStatus}` : `🔴 ${connectionStatus}`}
        </div>
      </div>

      {/* User List */}
      <Card
        style={{ width: 300, marginRight: 20, display: "flex", flexDirection: "column", borderRadius: "12px" }}
        bodyStyle={{ overflowY: "auto", flex: 1 }}
      >
        <Input
          placeholder="Tìm kiếm..."
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
              style={{ cursor: "pointer", padding: "12px", borderRadius: "8px" }}
              className={selectedUser?.id === account.id ? "active-user" : ""}
            >
              <List.Item.Meta
                avatar={<Avatar style={{ backgroundColor: "#1890ff" }}>{account.fullName[0]}</Avatar>}
                title={
                  <span style={{ fontWeight: selectedUser?.id === account.id ? "bold" : "normal" }}>
                    {account.fullName}
                  </span>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Chat Area */}
      <Card style={{ flex: 1, display: "flex", flexDirection: "column", borderRadius: "12px" }}>
        {selectedUser ? (
          <>
            <div style={{ padding: "15px", borderBottom: "1px solid #f0f0f0", fontWeight: "bold", fontSize: 16 }}>
              Chat với: {selectedUser.fullName}
            </div>
            <div
              ref={chatContainerRef}
              className="chat-container-user"
              style={{ flex: 1, overflowY: "auto", padding: "20px", background: "#f5f5f5" }}
            >
              {isLoadingChats ? (
                <p style={{ textAlign: "center", color: "#888" }}>Đang tải tin nhắn...</p>
              ) : chats.length ? (
                chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`message-bubble ${chat.senderId === authUser?.id ? "sent" : "received"}`}
                  >
                    <div>{chat.content}</div>
                    <small className="message-time">{formatChatTime(chat.createdAt)}</small>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: "center", color: "#888" }}>Chưa có tin nhắn nào.</p>
              )}
            </div>
            <div style={{ padding: "15px", borderTop: "1px solid #f0f0f0" }}>
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onPressEnter={handleSendMessage}
                placeholder="Nhập tin nhắn..."
                disabled={!isConnected || isSending}
                suffix={
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || !isConnected}
                    loading={isSending}
                  />
                }
              />
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", margin: "auto", color: "#888" }}>Chọn một người dùng để bắt đầu chat.</div>
        )}
      </Card>
    </div>
  );
};

export default ManagerChat;
