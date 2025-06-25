// stomp-server.js
const http = require('http');
const express = require('express');
const sockjs = require('sockjs');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' })); // Cho phép tất cả các origin trong môi trường dev
app.use(express.json());

const server = http.createServer(app);

// 1. Tạo SockJS server
const sockjsServer = sockjs.createServer({ prefix: '/websocket' });

let connections = []; // Lưu danh sách các client đang kết nối

sockjsServer.on('connection', conn => {
    console.log(`[+] SockJS connection open: ${conn.id}`);
    connections.push(conn);

    conn.on('data', message => {
        // Mặc dù StompJS xử lý frame, chúng ta không cần phân tích nó ở đây
        // vì server này chỉ đơn giản là broadcast
        console.log(`[->] Received data (likely STOMP frame): ${message.trim()}`);
    });

    conn.on('close', () => {
        connections = connections.filter(c => c.id !== conn.id);
        console.log(`[-] SockJS connection closed: ${conn.id}`);
    });
});

// 2. Endpoint để kích hoạt gửi tin nhắn real-time
// Tương đương với messagingTemplate.convertAndSend trong ví dụ Java của bạn
app.post('/api/trigger-chat-update', (req, res) => {
    console.log("[!] Triggering chat update...");

    // STOMP message frame
    const payload = "Create New Chat";
    const frame = `MESSAGE\ndestination:/topic/chat\ncontent-type:text/plain\n\n${payload}\0`;

    // Gửi (broadcast) frame này tới tất cả các client đã kết nối
    console.log(`[<-] Broadcasting payload: "${payload}" to ${connections.length} clients.`);
    connections.forEach(conn => {
        conn.write(frame);
    });

    res.status(200).send({ message: 'Update signal sent to all clients.' });
});

sockjsServer.installHandlers(server);

const PORT = 8080; // Bạn có thể đổi port nếu cần
server.listen(PORT, '0.0.0.0', () => {
    console.log(`[*] STOMP/SockJS Server is listening on port ${PORT}`);
    console.log(`[*] WebSocket endpoint: http://localhost:${PORT}/websocket`);
    console.log(`[*] Trigger endpoint: POST http://localhost:${PORT}/api/trigger-chat-update`);
});