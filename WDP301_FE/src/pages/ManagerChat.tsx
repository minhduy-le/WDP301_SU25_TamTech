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

  // --- Hooks ---
  const { data: accounts, isLoading: isAccountsLoading } = useGetAccounts();
  const { user: authUser, token } = useAuthStore();
  const { mutate: createChat, isPending: isSending } = useCreateChat();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // --- Functions ---
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const handleSendMessage = () => {
    if (!selectedUser || !messageInput.trim() || !authUser) {
      message.error("Vui lòng chọn người nhận và nhập tin nhắn.");
      return;
    }
    if (!isConnected || !socket) {
      message.error("Chưa kết nối đến máy chủ chat. Vui lòng đợi hoặc kết nối lại.");
      return;
    }

    const messageData = {
      receiverId: selectedUser.id,
      content: messageInput.trim(),
    };

    // Gửi tin nhắn qua API để lưu vào DB
    createChat(messageData, {
      onSuccess: () => {
        setMessageInput("");
        // Sau khi API thành công, gửi tin nhắn qua socket để real-time
        socket.emit("sendMessage", messageData, (response: any) => {
          if (response?.error) {
            message.error(response.error || "Gửi tin nhắn qua socket thất bại");
          } else {
            message.success("Tin nhắn đã được gửi!");
          }
        });
      },
      onError: (error: any) => {
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

  // Hiệu ứng chính để quản lý kết nối socket
  useEffect(() => {
    if (!token || !authUser?.id) {
      return;
    }

    // Khởi tạo socket.io-client sẽ tự động quản lý việc kết nối lại.
    const newSocket = io("wss://wdp301-su25.space", {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    setSocket(newSocket);

    // Lắng nghe các sự kiện từ socket
    newSocket.on("connect", () => {
      console.log("✅ WebSocket Connected:", newSocket.id);
      setIsConnected(true);
      message.success(`Kết nối chat thành công!`);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ WebSocket Disconnected");
      setIsConnected(false);
      message.warning("Mất kết nối với máy chủ chat.");
    });

    newSocket.on("message", (receivedMessage: Chat) => {
      const isRelevant = receivedMessage.senderId === selectedUser?.id || receivedMessage.senderId === authUser.id;
      if (isRelevant) {
        setChats((prevChats) => {
          if (prevChats.some((chat) => chat.id === receivedMessage.id)) {
            return prevChats;
          }
          const updatedChats = [...prevChats, { ...receivedMessage, createdAt: new Date(receivedMessage.createdAt) }];
          return updatedChats.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        });
      }
    });

    // Hàm dọn dẹp: ngắt kết nối khi component unmount
    return () => {
      console.log("🧹 Cleaning up socket connection.");
      newSocket.disconnect();
    };
  }, [token, authUser?.id]);

  // Tải tin nhắn ban đầu khi chọn một người dùng mới
  useEffect(() => {
    if (!authUser || !selectedUser) {
      setChats([]);
      return;
    }

    const fetchInitialMessages = async () => {
      setIsLoadingChats(true);
      try {
        const response = await axiosInstance.get<Chat[]>("/chat/messages", { params: { limit: 100, offset: 0 } });
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
      } catch (error: any) {
        message.error("Không thể tải tin nhắn.");
      } finally {
        setIsLoadingChats(false);
      }
    };

    fetchInitialMessages();
  }, [selectedUser, authUser]);

  // Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  // --- Render Logic ---
  const filteredAccounts =
    accounts?.filter(
      (account) =>
        account.fullName.toLowerCase().includes(searchText.toLowerCase()) &&
        account.role !== "User" &&
        account.id !== authUser?.id
    ) || [];

  return (
    <div style={{ display: "flex", padding: "20px", height: "calc(100vh - 100px)" }}>
      <div style={{ position: "fixed", top: 80, right: 20, zIndex: 1000 }}>
        <div
          style={{
            padding: "5px 15px",
            backgroundColor: isConnected ? "#4caf50" : "#f44336",
            color: "white",
            borderRadius: "12px",
            fontSize: "12px",
          }}
        >
          {isConnected ? `🟢 Đã kết nối` : `🔴 Mất kết nối`}
        </div>
      </div>

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
                    disabled={!messageInput.trim()}
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
