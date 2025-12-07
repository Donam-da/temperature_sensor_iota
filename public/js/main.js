// public/js/main.js

const socket = io(); // Kết nối đến server

const tempElement = document.getElementById('temp');
const timestampElement = document.getElementById('timestamp');
const historyLogElement = document.getElementById('history-log');

// Lắng nghe sự kiện 'connect'
socket.on('connect', () => {
    console.log('Đã kết nối thành công đến server!');
});

// Lắng nghe sự kiện 'sensor-data' từ server
socket.on('sensor-data', (data) => {
    console.log('Nhận được dữ liệu mới:', data);

    // Cập nhật phần dữ liệu trực tiếp
    tempElement.textContent = data.payload.temperature;
    timestampElement.textContent = `Cập nhật lúc: ${new Date(data.payload.timestamp).toLocaleTimeString()}`;

    // Tạo một mục mới trong lịch sử
    const logItem = document.createElement('li');
    logItem.innerHTML = `
        Nhiệt độ: <strong>${data.payload.temperature} &deg;C</strong> lúc ${new Date(data.payload.timestamp).toLocaleTimeString()}
        <br>
        <a href="https://explorer.shimmer.network/shimmer/block/${data.blockId}" target="_blank">Xem trên Explorer</a>
    `;

    // Xóa thông báo "Chưa có dữ liệu" nếu có
    if (historyLogElement.children.length === 1 && historyLogElement.children[0].textContent.includes('Chưa có dữ liệu')) {
        historyLogElement.innerHTML = '';
    }

    // Thêm mục mới vào đầu danh sách
    historyLogElement.prepend(logItem);
});
