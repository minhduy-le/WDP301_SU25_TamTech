/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { Input, Button, List, Card, Avatar, message } from "antd";
import { SearchOutlined, SendOutlined } from "@ant-design/icons";
import { useGetAccounts } from "../hooks/accountApi";
import axiosInstance from "../config/axios";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useAuthStore } from "../hooks/usersApi";
import "../style/StaffChat.css";
import { useSocketConnection, useSocketListener, emitSocketEvent } from "../hooks/useSocket";

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

const StaffChat = () => {
  // --- State ---
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState<{
    id: number;
    fullName: string;
  } | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // --- Hooks ---
  const { data: accounts, isLoading: isAccountsLoading } = useGetAccounts();
  const { user: authUser, token } = useAuthStore();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // --- THAY ĐỔI: Sử dụng hook để quản lý kết nối, không cần state cho socket và isConnected nữa ---
  const { isConnected } = useSocketConnection(token);

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
    if (!isConnected) {
      message.error("Chưa kết nối đến máy chủ chat. Vui lòng đợi hoặc tải lại trang.");
      return;
    }

    setIsSending(true);
    const messageData = {
      receiverId: selectedUser.id,
      content: messageInput.trim(),
    };

    // Chỉ cần phát sự kiện 'sendMessage'. Server sẽ xử lý việc lưu và gửi lại.
    emitSocketEvent("sendMessage", messageData);

    // Thêm tin nhắn tạm thời vào UI để có cảm giác tức thì
    const tempMessage: Chat = {
      id: Date.now(),
      senderId: authUser.id,
      receiverId: selectedUser.id,
      content: messageInput.trim(),
      createdAt: new Date(),
      Sender: { id: authUser.id, fullName: authUser.fullName },
    };
    setChats((prevChats) => [...prevChats, tempMessage]);

    setMessageInput("");
    setIsSending(false);
    setTimeout(() => scrollToBottom(), 0);
  };

  const formatChatTime = (createdAt: Date) => {
    const messageDate = dayjs(createdAt);
    return messageDate.format("HH:mm");
  };

  // --- Effects ---

  // --- THAY ĐỔI: Sử dụng hook để lắng nghe tin nhắn mới ---
  useSocketListener("message", (data: unknown) => {
    const receivedMessage = data as Chat;
    // Chỉ cập nhật UI nếu tin nhắn thuộc về cuộc hội thoại đang xem
    if (
      selectedUser &&
      ((receivedMessage.senderId === authUser?.id && receivedMessage.receiverId === selectedUser.id) ||
        (receivedMessage.senderId === selectedUser.id && receivedMessage.receiverId === authUser?.id))
    ) {
      // Thêm tin nhắn thật từ server
      setChats((prev) => [...prev, { ...receivedMessage, createdAt: new Date(receivedMessage.createdAt) }]);
    }
  });

  // Tải tin nhắn ban đầu (logic này giữ nguyên)
  useEffect(() => {
    if (!authUser || !selectedUser) {
      setChats([]);
      return;
    }

    const fetchInitialMessages = async () => {
      setIsLoadingChats(true);
      try {
        const response = await axiosInstance.get<Chat[]>("/chat/messages", {
          params: { limit: 100 },
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
      } catch {
        message.error("Không thể tải tin nhắn.");
      } finally {
        setIsLoadingChats(false);
      }
    };
    fetchInitialMessages();
  }, [selectedUser, authUser]);

  // Tự động cuộn
  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  // --- Render Logic ---
  const filteredAccounts =
    accounts?.filter(
      (account) =>
        account.fullName.toLowerCase().includes(searchText.toLowerCase()) &&
        (account.role === "Manager" || account.role === "Admin") &&
        account.id !== authUser?.id
    ) || [];

  return (
    <div style={{ display: "flex", padding: "20px", height: "calc(100vh - 100px)" }}>
      <div
        style={{
          position: "fixed",
          top: 80,
          right: 20,
          zIndex: 1000,
          padding: "5px 15px",
          backgroundColor: isConnected ? "#4caf50" : "#f44336",
          color: "white",
          borderRadius: "12px",
          fontSize: "12px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        }}
      >
        {isConnected ? `🟢 Đã kết nối` : `🔴 Mất kết nối`}
      </div>

      <Card
        style={{ width: 300, marginRight: 20, display: "flex", flexDirection: "column", borderRadius: "12px" }}
        bodyStyle={{ overflowY: "auto", flex: 1 }}
      >
        <Input
          placeholder="Tìm quản lý..."
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
            <div style={{ padding: 15, borderBottom: "1px solid #f0f0f0", fontWeight: "bold", fontSize: 16 }}>
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
          <div style={{ textAlign: "center", margin: "auto", color: "#888" }}>Chọn một quản lý để bắt đầu chat.</div>
        )}
      </Card>
    </div>
  );
};

export default StaffChat;
