import { useState, useEffect, useRef } from "react";
import { Input, Button, List, Card, Avatar, message, Typography } from "antd";
import {
  SearchOutlined,
  SendOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useGetAccounts } from "../hooks/accountApi";
import axiosInstance from "../config/axios";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useAuthStore } from "../hooks/usersApi";
import {
  useSocketConnection,
  useSocketListener,
  emitSocketEvent,
} from "../hooks/useSocket";

const { Title } = Typography;

dayjs.extend(customParseFormat);

const headerColor = "#A05A2C";
const evenRowBgColor = "#FFFDF5";
const cellTextColor = "#5D4037";
const borderColor = "#F5EAD9";
const COLOR_TEXT = "#333";

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
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState<{
    id: number;
    fullName: string;
  } | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [initialChats, setInitialChats] = useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [tempMessageId, setTempMessageId] = useState<number | null>(null);

  const { data: accounts, isLoading: isAccountsLoading } = useGetAccounts();
  const { user: authUser, token } = useAuthStore();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { isConnected } = useSocketConnection(token);

  useSocketListener("message", (data: unknown) => {
    const receivedMessage = data as Chat;
    if (
      selectedUser &&
      receivedMessage.senderId !== authUser?.id &&
      receivedMessage.receiverId === authUser?.id &&
      receivedMessage.senderId === selectedUser.id
    ) {
      setChats((prev) => [
        ...prev,
        { ...receivedMessage, createdAt: new Date(receivedMessage.createdAt) },
      ]);
    }
  });

  useSocketListener("messageAck", (data: unknown) => {
    const ackMessage = data as Chat;
    if (tempMessageId) {
      console.log("Received messageAck:", ackMessage);
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === tempMessageId
            ? { ...ackMessage, createdAt: new Date(ackMessage.createdAt) }
            : chat
        )
      );
      setInitialChats((prevInitialChats) =>
        [
          ...prevInitialChats,
          { ...ackMessage, createdAt: new Date(ackMessage.createdAt) },
        ].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
      setIsSending(false);
      setTempMessageId(null);
    }
  });

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  const handleSendMessage = () => {
    if (!selectedUser || !messageInput.trim() || !authUser) {
      message.error("Vui lòng chọn người nhận và nhập tin nhắn.");
      return;
    }
    if (!isConnected) {
      message.error(
        "Chưa kết nối đến máy chủ chat. Vui lòng đợi hoặc tải lại trang."
      );
      return;
    }

    setIsSending(true);
    const newTempMessageId = Date.now();
    setTempMessageId(newTempMessageId);

    const messageData = {
      receiverId: selectedUser.id,
      content: messageInput.trim(),
    };

    try {
      emitSocketEvent("sendMessage", messageData);
      console.log("Sent message with temp ID:", newTempMessageId);
    } catch (error) {
      console.error("Socket emit error:", error);
      setIsSending(false);
      setTempMessageId(null);
      message.error("Lỗi kết nối. Vui lòng thử lại.");
      return;
    }

    // Thêm tin nhắn tạm thời ngay lập tức
    const tempMessage: Chat = {
      id: newTempMessageId,
      senderId: authUser.id,
      receiverId: selectedUser.id,
      content: messageInput.trim(),
      createdAt: new Date(),
      Sender: { id: authUser.id, fullName: authUser.fullName },
    };
    setChats((prevChats) => [...prevChats, tempMessage]);

    setMessageInput("");
    setTimeout(() => scrollToBottom(), 0);

    setLastSendTime(Date.now());
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

  const getLastMessage = (userId: number) => {
    const lastChat = initialChats
      .filter(
        (chat) =>
          (chat.senderId === authUser?.id && chat.receiverId === userId) ||
          (chat.senderId === userId && chat.receiverId === authUser?.id)
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
    if (!lastChat) return null;
    const messageDate = dayjs(lastChat.createdAt);
    const today = dayjs();
    const yesterday = dayjs().subtract(1, "day");
    const thisYear = today.year();

    let timeText;
    if (messageDate.isSame(today, "day")) {
      timeText = messageDate.format("HH:mm");
    } else if (
      messageDate.isSame(yesterday, "day") ||
      messageDate.year() === thisYear
    ) {
      timeText = `${messageDate.format("DD")} th${messageDate.format("MM")}`;
    } else {
      timeText = `${messageDate.format("DD")} th${messageDate.format(
        "MM"
      )} ${messageDate.format("YYYY")}`;
    }

    const prefix = lastChat.senderId === authUser?.id ? "Bạn: " : "";

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <span
          style={{
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {prefix}
          {lastChat.content}
        </span>
        <span style={{ color: "#888", marginLeft: 8 }}>{timeText}</span>
      </div>
    );
  };

  const [lastSendTime, setLastSendTime] = useState<number | null>(null);

  // Effect để xử lý timeout độc lập
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isSending && lastSendTime) {
      timeoutId = setTimeout(() => {
        if (isSending && Date.now() - lastSendTime >= 1000) {
          console.log(
            "Timeout triggered, resetting isSending for temp ID:",
            tempMessageId
          );
          setIsSending(false);
          setTempMessageId(null);
          if (tempMessageId) {
            const tempMessage = chats.find((chat) => chat.id === tempMessageId);
            if (tempMessage) {
              setInitialChats((prevInitialChats) =>
                [...prevInitialChats, tempMessage].sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
              );
            }
          }
        }
      }, 1000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isSending, lastSendTime, tempMessageId, chats]);

  useEffect(() => {
    if (!authUser) {
      setChats([]);
      setInitialChats([]);
      return;
    }

    const fetchInitialMessages = async () => {
      setIsLoadingChats(true);
      try {
        const response = await axiosInstance.get<Chat[]>("/chat/messages", {
          params: { limit: 100 },
        });
        const allChats = response.data.map((chat) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
        }));
        setInitialChats(allChats);
        setChats(allChats);
      } catch {
        message.error("Không thể tải tin nhắn.");
      } finally {
        setIsLoadingChats(false);
      }
    };
    fetchInitialMessages();
  }, [authUser]);

  useEffect(() => {
    if (!authUser || !selectedUser) {
      setChats([]);
      return;
    }

    const fetchUserMessages = async () => {
      setIsLoadingChats(true);
      try {
        const response = await axiosInstance.get<Chat[]>("/chat/messages", {
          params: { limit: 100 },
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
            .map((chat) => ({ ...chat, createdAt: new Date(chat.createdAt) }))
            .sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            )
        );
      } catch {
        message.error("Không thể tải tin nhắn.");
      } finally {
        setIsLoadingChats(false);
      }
    };
    fetchUserMessages();
  }, [selectedUser, authUser]);

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  const filteredAccounts =
    accounts
      ?.filter(
        (account) =>
          account.fullName.toLowerCase().includes(searchText.toLowerCase()) &&
          (account.role === "Manager" ||
            account.role === "Admin" ||
            account.role === "Shipper" ||
            account.role === "Staff") &&
          account.id !== authUser?.id
      )
      ?.filter((account) =>
        searchText.trim() === ""
          ? initialChats.some(
              (chat) =>
                (chat.senderId === authUser?.id &&
                  chat.receiverId === account.id) ||
                (chat.senderId === account.id &&
                  chat.receiverId === authUser?.id)
            )
          : true
      ) || [];

  return (
    <div style={{ background: "#FFF9F0", minHeight: "90vh", padding: 24 }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div
          style={{
            position: "fixed",
            top: 80,
            right: 20,
            zIndex: 1000,
            padding: "5px 15px",
            backgroundColor: isConnected ? "#D97B41" : "#8c8c8c",
            color: "white",
            borderRadius: "12px",
            fontSize: "12px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          }}
        >
          {isConnected ? `🟢 Đã kết nối` : `🔴 Mất kết nối`}
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {/* Chat List */}
          <Card
            style={{
              width: 300,
              borderRadius: 16,
              boxShadow: "0 2px 12px #0001",
              display: "flex",
              flexDirection: "column",
              background: "#fff",
              padding: 0,
            }}
            bodyStyle={{
              padding: 0,
              height: "80vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ padding: 24, paddingBottom: 12 }}>
              <Input
                placeholder="Tìm người dùng..."
                prefix={<SearchOutlined style={{ color: headerColor }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  marginBottom: 8,
                  borderRadius: 8,
                  background: "#FAFAFA",
                  border: `2px solid ${borderColor}`,
                  color: cellTextColor,
                }}
                allowClear
              />
            </div>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "0 8px 16px 8px",
                marginRight: 8,
              }}
            >
              <List
                loading={isAccountsLoading}
                dataSource={filteredAccounts}
                renderItem={(account) => (
                  <List.Item
                    onClick={() =>
                      setSelectedUser({
                        id: account.id,
                        fullName: account.fullName,
                      })
                    }
                    style={{
                      cursor: "pointer",
                      background:
                        selectedUser?.id === account.id
                          ? evenRowBgColor
                          : "inherit",
                      borderRadius: 8,
                      margin: "0 8px 8px 8px",
                      boxShadow:
                        selectedUser?.id === account.id
                          ? `0 4px 12px ${headerColor}33`
                          : "none",
                      transition: "all 0.2s",
                      padding: "12px",
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar style={{ backgroundColor: "#D97B41" }}>
                          {account.fullName[0]}
                        </Avatar>
                      }
                      title={
                        <span
                          style={{
                            fontWeight: "bold",
                            color: cellTextColor,
                            marginLeft: 14,
                          }}
                        >
                          {account.fullName}
                        </span>
                      }
                      description={
                        <span
                          style={{
                            color: "#888",
                            fontSize: 14,
                            marginLeft: 14,
                            display: "block",
                            width: "-webkit-fill-available",
                          }}
                        >
                          {getLastMessage(account.id) || "Chưa có tin nhắn"}
                        </span>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          </Card>

          {/* Chat Details */}
          <Card
            style={{
              flex: 1,
              borderRadius: 16,
              boxShadow: "0 2px 12px #0001",
              display: "flex",
              flexDirection: "column",
              background: "#fff",
              padding: 0,
              height: "80vh",
            }}
            bodyStyle={{
              padding: 0,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {selectedUser ? (
              <>
                <div
                  style={{
                    padding: 24,
                    paddingBottom: 12,
                    borderBottom: "1px solid #F4F4F4",
                    minHeight: 60,
                  }}
                >
                  <Title
                    level={4}
                    style={{
                      color: COLOR_TEXT,
                      fontWeight: 700,
                      marginBottom: 0,
                      marginTop: 0,
                    }}
                  >
                    {selectedUser.fullName}
                  </Title>
                </div>
                <div
                  ref={chatContainerRef}
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "16px 24px",
                    background: "transparent",
                  }}
                >
                  {isLoadingChats ? (
                    <p style={{ textAlign: "center", color: "#888" }}>
                      Đang tải tin nhắn...
                    </p>
                  ) : chats.length ? (
                    chats.map((chat) => (
                      <div
                        key={chat.id}
                        style={{
                          display: "flex",
                          justifyContent:
                            chat.senderId === authUser?.id
                              ? "flex-end"
                              : "flex-start",
                          marginBottom: 16,
                        }}
                      >
                        <div
                          style={{
                            background:
                              chat.senderId === authUser?.id
                                ? "#D97B41"
                                : "#F5EAD9",
                            color:
                              chat.senderId === authUser?.id
                                ? "#fff"
                                : cellTextColor,
                            padding: "12px 20px",
                            borderRadius: 12,
                            boxShadow: "0 2px 8px #0001",
                            maxWidth: "70%",
                            minWidth: 80,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: 500,
                              wordBreak: "break-word",
                            }}
                          >
                            {chat.content}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color:
                                chat.senderId === authUser?.id
                                  ? "#e0e0e0"
                                  : "#888",
                              marginTop: 4,
                            }}
                          >
                            {formatChatTime(chat.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ textAlign: "center", color: "#888" }}>
                      Chưa có tin nhắn nào.
                    </p>
                  )}
                </div>
                <div
                  style={{
                    padding: 16,
                    borderTop: `1px solid ${borderColor}`,
                    display: "flex",
                    gap: 8,
                  }}
                >
                  <Input
                    placeholder="Nhập tin nhắn..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onPressEnter={handleSendMessage}
                    disabled={!isConnected || isSending}
                    style={{
                      borderRadius: 8,
                      background: "#fff",
                      height: 47,
                      marginRight: 8,
                      border: `2px solid ${borderColor}`,
                    }}
                  />
                  <Button
                    type="primary"
                    icon={
                      <>
                        {isSending ? (
                          <LoadingOutlined
                            style={{ fontSize: 20, marginTop: 2 }}
                            spin
                          />
                        ) : (
                          <SendOutlined
                            style={{
                              color: "#fff",
                              fontSize: 20,
                              marginTop: 2,
                            }}
                          />
                        )}
                      </>
                    }
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || !isConnected}
                    style={{
                      background: "#D97B41",
                      borderColor: "#D97B41",
                      borderRadius: 8,
                      boxShadow: "0 2px 8px #4CAF5033",
                      height: 47,
                      width: 70,
                      outline: "none",
                    }}
                  />
                </div>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <h5 style={{ color: "#888", margin: 0 }}>
                  Chọn một nhân viên để bắt đầu chat.
                </h5>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaffChat;
