// WDP301_FE/src/pages/ManagerChat.tsx

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
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState<{ id: number; fullName: string } | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [isSending, setIsSending] = useState(false); // <-- THAY ĐỔI: State để quản lý trạng thái gửi
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const { data: accounts, isLoading: isAccountsLoading } = useGetAccounts();
  const { user: authUser, token } = useAuthStore(); // <-- THAY ĐỔI: Lấy token để xác thực socket
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { isConnected } = useSocketConnection(token);

  useEffect(() => {
    if (!token) {
      console.error("No token available for socket connection");
    } else if (!isConnected) {
      console.log("Socket is not connected, attempting to reconnect...");
    }
  }, [token, isConnected]);

  // --- THAY ĐỔI: Khởi tạo kết nối socket ---
  // Hook này nên được gọi ở component cha (App.tsx) để duy trì kết nối
  // Nhưng để ví dụ, ta sẽ gọi ở đây.
  useSocketConnection(token);

  const fetchMessages = async (userToFetchFor: { id: number; fullName: string } | null) => {
    if (!authUser || !userToFetchFor) return;
    setIsLoadingChats(true);
    try {
      // API GET để lấy lịch sử vẫn như cũ
      const response = await axiosInstance.get<Chat[]>("/chat/messages", {
        params: { limit: 100, offset: 0 },
      });
      const filteredChats = response.data.filter(
        (chat) =>
          (chat.senderId === authUser.id && chat.receiverId === userToFetchFor.id) ||
          (chat.senderId === userToFetchFor.id && chat.receiverId === authUser.id)
      );
      setChats(
        filteredChats
          .map((chat) => ({ ...chat, createdAt: new Date(chat.createdAt) }))
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      );
    } catch (error: string | any) {
      message.error("Không thể tải tin nhắn.", error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  // --- THAY ĐỔI: Lắng nghe sự kiện 'message' từ socket.io ---
  useSocketListener("message", (data: unknown) => {
    const newMessage = data as Chat;
    // Chỉ cập nhật UI nếu tin nhắn thuộc về cuộc hội thoại đang xem
    if (
      selectedUser &&
      ((newMessage.senderId === authUser?.id && newMessage.receiverId === selectedUser.id) ||
        (newMessage.senderId === selectedUser.id && newMessage.receiverId === authUser?.id))
    ) {
      console.log("Realtime message received:", newMessage);
      message.info("Có tin nhắn mới!", 1.5);
      setChats((prevChats) => [...prevChats, { ...newMessage, createdAt: new Date(newMessage.createdAt) }]);
    }
  });

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser);
    } else {
      setChats([]); // Xóa tin nhắn cũ khi không chọn user nào
    }
  }, [selectedUser]);

  // --- THAY ĐỔI: Logic gửi tin nhắn qua socket ---
  const handleSendMessage = () => {
    if (!selectedUser || !messageInput.trim() || !authUser) {
      message.error("Vui lòng chọn người nhận và nhập tin nhắn.");
      return;
    }

    setIsSending(true);

    const messageData = {
      receiverId: selectedUser.id,
      content: messageInput.trim(),
    };

    // Gửi sự kiện 'sendMessage' thay vì gọi API POST
    emitSocketEvent("sendMessage", messageData);

    // Giao diện người dùng có thể cập nhật ngay lập tức để tạo cảm giác "gửi tức thì"
    // Tin nhắn thực sự sẽ được đẩy xuống từ server qua sự kiện 'message'
    // nhưng ta có thể thêm tạm vào state để UI mượt hơn
    const tempMessage = {
      id: Date.now(), // ID tạm
      senderId: authUser.id,
      receiverId: selectedUser.id,
      content: messageInput.trim(),
      createdAt: new Date(),
      Sender: { id: authUser.id, fullName: authUser.fullName },
    };
    setChats((prevChats) => [...prevChats, tempMessage]);

    setMessageInput("");
    setIsSending(false);
    setTimeout(() => scrollToBottom(), 0); // Cuộn xuống dưới cùng
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  const formatChatTime = (createdAt: Date) => {
    return dayjs(createdAt).format("HH:mm");
  };

  const filteredAccounts =
    accounts?.filter(
      (account) =>
        account.fullName.toLowerCase().includes(searchText.toLowerCase()) &&
        account.role !== "User" &&
        account.id !== authUser?.id
    ) || [];

  return (
    <div style={{ display: "flex", padding: "20px", height: "calc(100vh - 100px)" }}>
      {/* Phần JSX giữ nguyên */}
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
                disabled={isSending}
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
