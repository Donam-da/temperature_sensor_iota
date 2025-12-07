// index.ts

import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';

import { readTemperature } from './sensor';
import { sendTransactionWithData } from './iota_client';

const SEND_INTERVAL_MS = 15000; // Gửi dữ liệu mỗi 15 giây (giao dịch cần nhiều thời gian hơn)
const SENSOR_DATA_TAG = 'IOTA_SENSOR_PROJECT'; // Tag để nhận diện dữ liệu

// --- Thiết lập Web Server ---
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);
const PORT = 8080;

// Phục vụ các file tĩnh từ thư mục 'public'
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('Một client đã kết nối!');
    socket.on('disconnect', () => {
        console.log('Client đã ngắt kết nối.');
    });
});

/**
 * Hàm chính của chương trình
 */
async function main() {
    // Sử dụng một vòng lặp đệ quy với setTimeout để đảm bảo các lần chạy không bị chồng chéo.
    const sendDataLoop = async () => {
        try {
            // 1. Đọc dữ liệu từ cảm biến
            const currentTemp = readTemperature();
            const timestamp = new Date().toISOString();

            // 2. Chuẩn bị dữ liệu dưới dạng đối tượng JSON
            const dataPayload = {
                sensorId: 'Sensor-Alpha-001',
                temperature: currentTemp,
                unit: 'Celsius',
                timestamp: timestamp,
            };

            console.log(`\n[${timestamp}] Chuẩn bị gửi:`, dataPayload);

            // 3. Gửi giao dịch chứa dữ liệu lên Tangle (Layer 1)
            const blockId = await sendTransactionWithData(SENSOR_DATA_TAG, JSON.stringify(dataPayload));

            // 4. Gửi dữ liệu đến tất cả các client đang kết nối qua WebSocket
            io.emit('sensor-data', {
                payload: dataPayload,
                blockId: blockId,
            });

        } catch (error) {
            console.error('Đã xảy ra lỗi trong vòng lặp gửi dữ liệu:', error);
            console.error('Sẽ thử lại sau ' + (SEND_INTERVAL_MS / 1000) + ' giây.');
        } finally {
            // Lên lịch cho lần chạy tiếp theo sau khi lần này hoàn tất.
            setTimeout(sendDataLoop, SEND_INTERVAL_MS);
        }
    };

    // Bắt đầu vòng lặp gửi dữ liệu
    sendDataLoop();

    server.listen(PORT, () => {
        console.log(`Server đang chạy tại http://localhost:${PORT}`);
    });
}

// Chạy hàm main và bắt lỗi nếu có
main().catch(console.error);