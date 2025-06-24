import React, { useState } from 'react';
import { Row, Col, Card, Typography, List, Input, Button } from 'antd';
import { SendOutlined, SearchOutlined } from '@ant-design/icons';

const BG_MAIN = '#F0F7F0';
const BG_CARD = '#fff';
const COLOR_ACCENT_DARK = '#2E7D32'; // green dark
const COLOR_USER = '#388E3C'; // green for user
const COLOR_ADMIN = '#F4F4F4'; // light gray for admin
const COLOR_TEXT = '#333';
const COLOR_TEXT_SECONDARY = '#2E7D32';

const { Title } = Typography;

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  avatar: string;
}

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
}

const ChatAdmin: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [input, setInput] = useState('');

  // Mock data - replace with actual data from your backend
  const chats: Chat[] = [
    {
      id: '1',
      name: 'John Doe',
      lastMessage: 'Hello, how can I help you?',
      timestamp: '10:30 AM',
      avatar: 'JD',
    },
    {
      id: '2',
      name: 'Jane Smith',
      lastMessage: 'Thank you for your support!',
      timestamp: '9:45 AM',
      avatar: 'JS',
    },
  ];

  const messages: Message[] = [
    {
      id: '1',
      content: 'Hello, how can I help you?',
      sender: 'admin',
      timestamp: '10:30 AM',
    },
    {
      id: '2',
      content: 'I have a question about my order',
      sender: 'user',
      timestamp: '10:31 AM',
    },
  ];

  return (
    <div style={{ background: BG_MAIN, minHeight: '90vh', padding: 24 }}>
      <style>
        {`
          input[placeholder="Search chats..."],
    input[placeholder="Type a message..."] {
      /* Đổi màu chữ placeholder sang xanh lá */
      color: #4CAF50 !important;
    }
    input[placeholder="Search chats..."]::placeholder,
    input[placeholder="Type a message..."]::placeholder {
      color: #4CAF50 !important;
      opacity: 1;
    }
        `}
      </style>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <Row gutter={24}>
          {/* Chat List */}
          <Col xs={24} md={8}>
            <Card
              style={{
                height: '80vh',
                borderRadius: 16,
                boxShadow: '0 2px 12px #0001',
                display: 'flex',
                flexDirection: 'column',
                background: BG_CARD,
                padding: 0,
              }}
              bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ padding: 24, paddingBottom: 12 }}>
                <Title level={4} style={{ color: COLOR_TEXT_SECONDARY, fontWeight: 700, marginBottom: 10, marginTop: 0 }}>
                  Conversations
                </Title>
                <Input
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  prefix={<SearchOutlined style={{ color: COLOR_ACCENT_DARK }} />}
                  style={{
                    marginBottom: 8,
                    borderRadius: 8,
                    background: '#FAFAFA',
                    border: '2px solid #388e3c',
                  }}
                  allowClear
                />
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 16px 8px', marginRight: 8 }}>
                <List
                  itemLayout="horizontal"
                  dataSource={chats}
                  renderItem={chat => (
                    <List.Item
                      key={chat.id}
                      style={{
                        cursor: 'pointer',
                        background: selectedChat === chat.id ? '#E8F5E9' : 'inherit',
                        borderRadius: 8,
                        margin: '0 8px 8px 8px',
                        boxShadow: selectedChat === chat.id ? '0 2px 8px #4CAF5033' : 'none',
                        transition: 'all 0.2s',
                      }}
                      onClick={() => setSelectedChat(chat.id)}
                    >
                      <List.Item.Meta
                        title={<span style={{ fontWeight: 700, color: COLOR_TEXT, marginLeft: 14 }}>{chat.name}</span>}
                        description={<span style={{ color: '#888', fontSize: 14,marginLeft: 14 }}>{chat.lastMessage}</span>}
                      />
                      <div style={{ minWidth: 60, textAlign: 'right', marginRight: 16, color: '#B0B0B0', fontSize: 12 }}>
                        {chat.timestamp}
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            </Card>
          </Col>

          {/* Chat Details */}
          <Col xs={24} md={16}>
            <Card
              style={{
                height: '80vh',
                borderRadius: 16,
                boxShadow: '0 2px 12px #0001',
                display: 'flex',
                flexDirection: 'column',
                background: BG_CARD,
                padding: 0,
              }}
              bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              {/* Header */}
              <div style={{ padding: 24, paddingBottom: 12, borderBottom: '1px solid #F4F4F4', minHeight: 60 }}>
                <Title level={4} style={{ color: COLOR_TEXT, fontWeight: 700, marginBottom: 0, marginTop: 0 }}>
                  {selectedChat ? chats.find(c => c.id === selectedChat)?.name : 'Select a conversation'}
                </Title>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', background: 'transparent' }}>
                {selectedChat ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      style={{
                        display: 'flex',
                        justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          background: message.sender === 'user' ? COLOR_USER : COLOR_ADMIN,
                          color: message.sender === 'user' ? '#fff' : COLOR_TEXT,
                          padding: '12px 20px',
                          borderRadius: 12,
                          boxShadow: '0 2px 8px #0001',
                          maxWidth: '70%',
                          minWidth: 80,
                        }}
                      >
                        <div style={{ fontSize: 16, fontWeight: 500, wordBreak: 'break-word' }}>
                          {message.content}
                        </div>
                        <div style={{ fontSize: 12, color: message.sender === 'user' ? '#e0e0e0' : '#888', marginTop: 4 }}>
                          {message.timestamp}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Title level={5} style={{ color: '#B0B0B0', margin: 0 }}>
                      Select a conversation to start chatting
                    </Title>
                  </div>
                )}
              </div>

              {/* Input */}
              <div style={{ padding: 16, borderTop: '1px solid #F4F4F4', display: 'flex', gap: 8 }}>
                <Input
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                  onPressEnter={() => {/* handle send */}}
                  style={{
                    borderRadius: 8,
                    background: '#fff',
                    height: 47,
                    marginRight: 8,
                    border: '2px solid #388e3c',
                  }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined style={{ color: '#fff', fontSize: 20, marginTop: 2 }} />}
                  style={{
                    background: COLOR_ACCENT_DARK,
                    borderColor: COLOR_ACCENT_DARK,
                    borderRadius: 8,
                    boxShadow: '0 2px 8px #4CAF5033',
                    height: 47,
                    width: 70,
                    outline: 'none',
                  }}
                  onClick={() => {/* handle send */}}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ChatAdmin;