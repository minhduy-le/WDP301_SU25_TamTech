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
  setSocket?: (socket: Socket | null) => void; // Optional to avoid TypeError
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
  const { data: accounts, isLoading: isAccountsLoading } = useGetAccounts();
  const { user: authUser, token } = useAuthStore();
  const { mutate: createChat, isPending: isSending } = useCreateChat();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const context = useOutletContext<OutletContext>();
  const setParentSocket = context?.setSocket; // Safe access to setSocket

  // Scroll to the latest message
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
      console.log("🔄 Scrolled to bottom");
    }
  };

  // WebSocket connection
  const connectSocket = () => {
    if (!token || !authUser?.id) {
      console.error("❌ No token or user ID available", {
        token: !!token,
        userId: authUser?.id,
      });
      message.error("Vui lòng đăng nhập để chat");
      return;
    }

    console.log("🔌 Initializing socket connection for user:", authUser.id);
    const newSocket = io("https://wdp301-su25.space", {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    setSocket(newSocket);
    if (setParentSocket) {
      setParentSocket(newSocket);
      console.log("🔌 Registered socket with parent context");
    } else {
      console.warn(
        "⚠️ No setParentSocket available; socket not registered with parent"
      );
    }

    newSocket.on("connect", () => {
      console.log("✅ Connected to WebSocket server", {
        userId: authUser.id,
        socketId: newSocket.id,
      });
      setIsConnected(true);
      setConnectionAttempts(0);
      message.success(`Kết nối thành công với ID ${authUser.id}`);

      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = setInterval(() => {
        newSocket.emit("ping", (response: any) => {
          console.log("🏓 Ping response:", response);
        });
      }, 30000);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error.message);
      setIsConnected(false);
      setConnectionAttempts((prev) => prev + 1);

      if (connectionAttempts < 5) {
        message.warning(
          `Kết nối thất bại: ${error.message}. Đang thử lại... (${
            connectionAttempts + 1
          }/5)`
        );
        if (reconnectTimeoutRef.current)
          clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("🔄 Attempting to reconnect...");
          connectSocket();
        }, 2000 * (connectionAttempts + 1));
      } else {
        message.error("Không thể kết nối sau 5 lần thử");
      }
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Disconnected from WebSocket server");
      setIsConnected(false);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    });

    newSocket.on("error", (error) => {
      console.error("🚨 Socket error:", error.message);
      message.error(error.message || "Lỗi WebSocket");
    });

    newSocket.on("message", (receivedMessage: Chat) => {
      console.log("📨 Received message:", {
        id: receivedMessage.id,
        from: receivedMessage.senderId,
        to: receivedMessage.receiverId,
        content: receivedMessage.content,
        createdAt: receivedMessage.createdAt,
      });

      const isRelevant =
        receivedMessage.senderId === authUser?.id ||
        receivedMessage.receiverId === authUser?.id;
      if (!isRelevant) {
        console.log("📨 Message not for me, ignoring");
        return;
      }

      setChats((prevChats) => {
        if (prevChats.some((chat) => chat.id === receivedMessage.id)) {
          console.log("⚠️ Duplicate message, skipping");
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
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return updatedChats;
      });
    });

    return newSocket;
  };

  useEffect(() => {
    if (!authUser?.id || !token) {
      console.log(
        "❌ Skipping socket connection: missing authUser.id or token"
      );
      return;
    }

    const socketInstance = connectSocket();

    return () => {
      console.log("🔌 Cleaning up socket connection");
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (socketInstance) {
        socketInstance.disconnect();
        if (setParentSocket) {
          setParentSocket(null);
          console.log("🔌 Cleared socket in parent context");
        }
      }
      setIsConnected(false);
    };
  }, [authUser?.id, token, setParentSocket]);

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
            limit: 50,
            offset: 0,
          },
        });
        const filteredChats = response.data.filter(
          (chat) =>
            (chat.senderId === authUser.id &&
              chat.receiverId === selectedUser.id) ||
            (chat.senderId === selectedUser.id &&
              chat.receiverId === authUser.id)
        );
        setChats(
          filteredChats
            .map((chat) => ({
              ...chat,
              createdAt: new Date(chat.createdAt),
              Sender: chat.Sender,
              Receiver: chat.Receiver,
            }))
            .sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            )
        );
        setTimeout(scrollToBottom, 0);
      } catch (error: any) {
        console.error("❌ Failed to fetch messages:", error.message);
        message.error("Không thể tải tin nhắn");
      } finally {
        setIsLoadingChats(false);
      }
    };

    fetchInitialMessages();
  }, [selectedUser, authUser, accounts]);

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

  const userChats =
    authUser && selectedUser
      ? chats.filter(
          (chat) =>
            (chat.senderId === authUser.id &&
              chat.receiverId === selectedUser.id) ||
            (chat.senderId === selectedUser.id &&
              chat.receiverId === authUser.id)
        )
      : [];

  const handleSendMessage = () => {
    if (!selectedUser || !messageInput.trim() || !authUser || !isConnected) {
      console.log("❌ Cannot send message:", {
        hasSelectedUser: !!selectedUser,
        hasMessage: !!messageInput.trim(),
        hasAuthUser: !!authUser,
        isConnected,
      });
      message.error(
        !isConnected
          ? "Không kết nối được với server chat. Vui lòng thử lại."
          : "Vui lòng chọn người nhận và nhập tin nhắn."
      );
      return;
    }

    const messageData = {
      receiverId: selectedUser.id,
      content: messageInput.trim(),
    };

    createChat(messageData, {
      onSuccess: () => {
        console.log("✅ Message created via API");
        setMessageInput("");
        message.success("Tin nhắn đã được gửi!");
        socket?.emit("sendMessage", messageData, (response: any) => {
          console.log("📤 Socket emit response:", response);
          if (response?.error) {
            message.error(response.error || "Gửi tin nhắn qua socket thất bại");
          } else if (response?.success) {
            console.log("✅ Socket message sent");
          }
        });
      },
      onError: (error: any) => {
        console.error("❌ Failed to create message:", error.message);
        message.error(error.message || "Gửi tin nhắn thất bại!");
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
      return `Hôm qua ${messageDate.format("HH:mm")}`;
    }
    return messageDate.format("HH:mm DD/MM/YYYY");
  };

  const handleReconnect = () => {
    console.log("🔄 Manual reconnect initiated");
    setConnectionAttempts(0);
    if (socket) socket.disconnect();
    connectSocket();
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
            backgroundColor: isConnected ? "#4caf50" : "#f44336",
            color: "white",
            borderRadius: "12px",
            fontSize: "12px",
          }}
        >
          {isConnected ? `🟢 Kết nối (ID ${authUser?.id})` : "🔴 Ngắt kết nối"}
        </div>
        {!isConnected && (
          <Button size="small" onClick={handleReconnect}>
            Kết nối lại
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
          placeholder="Tìm kiếm tên người dùng..."
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
              onClick={() =>
                setSelectedUser({ id: account.id, fullName: account.fullName })
              }
              style={{ cursor: "pointer", padding: "8px", borderRadius: "8px" }}
              className={selectedUser?.id === account.id ? "active-user" : ""}
            >
              <List.Item.Meta
                avatar={
                  <Avatar style={{ backgroundColor: "#1890ff" }}>
                    {account.fullName[0]}
                  </Avatar>
                }
                title={
                  <span
                    style={{
                      fontWeight:
                        selectedUser?.id === account.id ? "bold" : "normal",
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
              Chat với: {selectedUser.fullName}
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
                <p
                  style={{ textAlign: "center", color: "#888", margin: "auto" }}
                >
                  Đang tải tin nhắn...
                </p>
              ) : userChats.length ? (
                userChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`message-bubble ${
                      chat.senderId === authUser?.id ? "sent" : "received"
                    }`}
                    style={{
                      backgroundColor:
                        chat.senderId === authUser?.id ? "#2196f3" : "#fff",
                      color: chat.senderId === authUser?.id ? "#fff" : "#000",
                      margin:
                        chat.senderId === authUser?.id
                          ? "5px 10px 5px auto"
                          : "5px auto 5px 10px",
                      padding: "10px 15px",
                      maxWidth: "70%",
                      borderRadius: "10px",
                    }}
                  >
                    <div>{chat.content}</div>
                    <div
                      style={{
                        marginTop: "5px",
                        textAlign:
                          chat.senderId === authUser?.id ? "right" : "left",
                      }}
                    >
                      <small
                        style={{
                          color:
                            chat.senderId === authUser?.id ? "#e6f0ff" : "#888",
                          fontSize: "12px",
                        }}
                      >
                        {formatChatTime(chat.createdAt)}
                      </small>
                    </div>
                  </div>
                ))
              ) : (
                <p
                  style={{ textAlign: "center", color: "#888", margin: "auto" }}
                >
                  Chưa có tin nhắn với người này.
                </p>
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
                placeholder="Nhập tin nhắn..."
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
            Chọn một người dùng để bắt đầu chat.
          </div>
        )}
      </Card>
    </div>
  );
};

export default ManagerChat;
