import { useState, useEffect, useRef } from "react";
import { Button, Input, message } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import "../../style/ChatWidget.css";

interface ChatMessage {
  text: string;
  sender: "user" | "ai";
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null); // Ref cho khung chat
  const chatIconRef = useRef<HTMLDivElement>(null); // Ref cho icon chat

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Tự động đóng khung chat khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        chatContainerRef.current &&
        chatIconRef.current &&
        !chatContainerRef.current.contains(event.target as Node) &&
        !chatIconRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Tin nhắn chào mừng khi mở khung chat lần đầu
  useEffect(() => {
    if (isOpen && !hasOpenedOnce) {
      setMessages([
        {
          text: "Xin chào! Tôi là Grok 3, tôi có thể giúp gì cho bạn hôm nay?",
          sender: "ai",
        },
      ]);
      setHasOpenedOnce(true);
    }
  }, [isOpen, hasOpenedOnce]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) {
      message.warning("Vui lòng nhập tin nhắn trước khi gửi!");
      return;
    }

    const newMessages: ChatMessage[] = [
      ...messages,
      { text: inputMessage, sender: "user" },
      {
        text: "Tôi là Grok 3, tôi đang hỗ trợ bạn! Hãy cho tôi biết bạn cần gì.",
        sender: "ai",
      },
    ];
    setMessages(newMessages);
    setInputMessage("");
  };

  return (
    <>
      <div className="chat-icon-container" ref={chatIconRef}>
        <Button
          type="primary"
          shape="circle"
          icon={<MessageOutlined />}
          size="large"
          onClick={handleToggleChat}
          className="chat-icon"
        />
      </div>

      {isOpen && (
        <div className="chat-container slide-up" ref={chatContainerRef}>
          <div className="chat-header">Thực đơn từ AI</div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`}>
                <span className={`chat-message-text ${msg.sender}`}>
                  {msg.text}
                </span>
              </div>
            ))}
          </div>

          <div className="chat-input-container">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              onPressEnter={handleSendMessage}
              className="chat-input"
            />
            <Button
              type="primary"
              onClick={handleSendMessage}
              className="btn-send-ai"
            >
              Gửi
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
