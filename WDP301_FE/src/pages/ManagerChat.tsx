/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { Input, Button, List, Card, Avatar, message } from "antd";
import { SearchOutlined, SendOutlined } from "@ant-design/icons";
import { useGetAccounts } from "../hooks/accountApi";
import { useCreateChat } from "../hooks/chatsApi";
import axiosInstance from "../config/axios";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useAuthStore } from "../hooks/usersApi";
import "../style/StaffChat.css";
// --- IMPORT HOOK STOMP MỚI ---
import { useStomp } from "../hooks/useStomp";
import axios from "axios";

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
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState<{ id: number; fullName: string } | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const { data: accounts, isLoading: isAccountsLoading } = useGetAccounts();
  const { user: authUser } = useAuthStore();
  const { mutate: createChat, isPending: isSending } = useCreateChat();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // --- HÀM FETCH LẠI DỮ LIỆU ---
  const fetchMessages = async () => {
    if (!authUser || !selectedUser) return;
    setIsLoadingChats(true);
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
    } catch (error: string | any) {
      message.error("Không thể tải tin nhắn.", error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  // --- SỬ DỤNG HOOK useStomp ---
  // Khi nhận được payload "Create New Chat", sẽ gọi hàm fetchMessages
  useStomp("/topic/chat", (body) => {
    if (body === "Create New Chat") {
      console.log("Realtime signal received: Create New Chat. Refetching messages...");
      message.info("Có tin nhắn mới!", 1.5);
      fetchMessages();
    }
  });

  // Load tin nhắn ban đầu khi chọn user
  useEffect(() => {
    fetchMessages();
  }, [selectedUser, authUser]);

  const handleSendMessage = () => {
    if (!selectedUser || !messageInput.trim() || !authUser) {
      message.error("Vui lòng chọn người nhận và nhập tin nhắn.");
      return;
    }

    const messageData = {
      receiverId: selectedUser.id,
      content: messageInput.trim(),
    };

    createChat(messageData, {
      onSuccess: () => {
        setMessageInput("");
        // Sau khi gửi thành công, gọi API để trigger update real-time cho các client khác
        axios.post("https://wdp301-su25.space/api/trigger-chat-update");
        // Fetch lại tin nhắn cho chính mình
        fetchMessages();
      },
      onError: (error: any) => {
        message.error(error.message || "Gửi tin nhắn thất bại!");
      },
    });
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
    const messageDate = dayjs(createdAt);
    const today = dayjs();
    const yesterday = dayjs().subtract(1, "day");

    if (messageDate.isSame(today, "day")) return messageDate.format("HH:mm");
    if (messageDate.isSame(yesterday, "day")) return `Hôm qua ${messageDate.format("HH:mm")}`;
    return messageDate.format("HH:mm DD/MM/YYYY");
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
