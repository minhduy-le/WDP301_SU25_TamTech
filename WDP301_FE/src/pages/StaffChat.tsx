import { useState } from "react";
import { Input, Button, List, Card, Avatar, message } from "antd";
import { SearchOutlined, SendOutlined } from "@ant-design/icons";
import { useGetAccounts } from "../hooks/accountApi";
import { useGetChats, useCreateChat } from "../hooks/chatsApi";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useAuthStore } from "../hooks/usersApi";
import "../style/StaffChat.css";
import { useQueryClient } from "@tanstack/react-query";

dayjs.extend(customParseFormat);

const StaffChat = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState<{
    id: number;
    fullName: string;
  } | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const { data: accounts, isLoading: isAccountsLoading } = useGetAccounts();
  const { data: chats, isLoading: isChatsLoading } = useGetChats();
  const createChatMutation = useCreateChat();
  const queryClient = useQueryClient();
  const { user: authUser } = useAuthStore();

  const filteredAccounts =
    accounts?.filter(
      (account) =>
        account.fullName.toLowerCase().includes(searchText.toLowerCase()) &&
        account.role !== "User" &&
        account.id !== authUser?.id
    ) || [];

  const existingChat =
    authUser && selectedUser
      ? chats?.find(
          (chat) =>
            (chat.senderId === authUser.id &&
              chat.receiverId === selectedUser.id) ||
            (chat.senderId === selectedUser.id &&
              chat.receiverId === authUser.id)
        )
      : null;

  const userChats =
    authUser && selectedUser
      ? chats?.filter(
          (chat) =>
            (chat.senderId === authUser.id &&
              chat.receiverId === selectedUser.id) ||
            (chat.senderId === selectedUser.id &&
              chat.receiverId === authUser.id)
        )
      : [];

  const handleSendMessage = () => {
    if (selectedUser && messageInput.trim() && authUser) {
      if (existingChat) {
        createChatMutation.mutate(
          {
            chatRoomId: existingChat.ChatRoom?.id,
            receiverId: selectedUser.id,
            content: messageInput,
          },
          {
            onSuccess: () => {
              setMessageInput("");
              message.success("Tin nhắn đã được gửi!");
              queryClient.refetchQueries({ queryKey: ["chat"] });
            },
            onError: (error) =>
              message.error(error.message || "Gửi tin nhắn thất bại!"),
          }
        );
      } else {
        createChatMutation.mutate(
          {
            receiverId: selectedUser.id,
            content: messageInput,
          },
          {
            onSuccess: () => {
              setMessageInput("");
              message.success("Tin nhắn đã được gửi!");
            },
            onError: (error) =>
              message.error(error.message || "Gửi tin nhắn thất bại!"),
          }
        );
      }
    }
  };

  const formatChatTime = (createdAt: Date) => {
    const messageDate = dayjs(createdAt);
    const today = dayjs();
    const yesterday = dayjs().subtract(1, "day");
    const twoDaysAgo = dayjs().subtract(2, "day");

    if (messageDate.isSame(today, "day")) {
      return messageDate.format("HH:mm");
    } else if (messageDate.isSame(yesterday, "day")) {
      return `Hôm qua ${messageDate.format("HH:mm")}`;
    } else if (messageDate.isBefore(twoDaysAgo)) {
      return messageDate.format("HH:mm DD/MM/YYYY");
    }
    return messageDate.format("HH:mm DD/MM/YYYY");
  };

  return (
    <div style={{ display: "flex", padding: "20px" }}>
      <Card
        style={{
          width: 300,
          marginRight: 20,
          overflowY: "auto",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          flexGrow: 0,
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
          flexGrow: 1,
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
              className="chat-container-user"
              style={{
                flexGrow: 1,
                overflowY: "auto",
                padding: "20px",
                background: "#f0f2f5",
              }}
            >
              {isChatsLoading ? (
                <p style={{ textAlign: "center", color: "#888" }}>
                  Đang tải tin nhắn...
                </p>
              ) : userChats?.length ? (
                userChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`message-bubble ${
                      chat.senderId === authUser?.id ? "sent" : "received"
                    }`}
                  >
                    {chat.content}
                    <div style={{ marginBottom: "5px", textAlign: "right" }}>
                      <small style={{ color: "white", fontSize: "12px" }}>
                        {formatChatTime(chat.createdAt)}
                      </small>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: "center", color: "#888" }}>
                  Chưa có tin nhắn với người này.
                </p>
              )}
            </div>
            <div
              style={{
                padding: "15px 0",
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
                suffix={
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    style={{
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  />
                }
                style={{ padding: "5px 12px" }}
              />
            </div>
          </>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              color: "#888",
              height: "100%",
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

export default StaffChat;
