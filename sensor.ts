// sensor.ts

/**
 * Giả lập việc đọc dữ liệu từ một cảm biến nhiệt độ.
 * @returns {number} Nhiệt độ hiện tại (ví dụ: từ 15.0 đến 30.0).
 */
export function readTemperature(): number {
    const temp = Math.random() * (30 - 15) + 15;
    return parseFloat(temp.toFixed(2)); // Làm tròn đến 2 chữ số thập phân
}