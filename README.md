# Dự án Gửi Dữ liệu Cảm biến lên IOTA Tangle (IOTA Sensor Project)

Dự án này là một ví dụ đơn giản sử dụng Node.js và TypeScript để gửi dữ liệu (ví dụ: từ cảm biến IoT) lên mạng lưới IOTA Shimmer Testnet. Dữ liệu được đính kèm vào một giao dịch có giá trị.

## Tính năng

-   Kết nối đến một node public của mạng Shimmer Testnet.
-   Sử dụng `SecretManager` với Mnemonic (cụm từ khôi phục) để quản lý ví và ký giao dịch.
-   Tạo và gửi một khối (block) chứa giao dịch chuyển một lượng token SMR.
-   Đính kèm dữ liệu tùy chỉnh (payload) vào giao dịch dưới dạng `tag` (để đánh dấu) và `data`.
-   In ra liên kết đến trình khám phá (explorer) để xem giao dịch sau khi gửi thành công.

## Điều kiện tiên quyết

Trước khi bắt đầu, bạn cần chuẩn bị:

1.  **Node.js**: Phiên bản 18.x trở lên. Bạn có thể tải tại nodejs.org.
2.  **Ví IOTA/Shimmer**: Một ví trên mạng Shimmer Testnet.
    -   Bạn có thể tạo ví bằng Firefly Wallet (nhớ chuyển sang chế độ Testnet trong cài đặt).
    -   Lưu lại **cụm từ khôi phục (Mnemonic)** 24 từ của bạn.
3.  **Token SMR Testnet**: Giao dịch cần một ít phí. Bạn có thể nhận token SMR miễn phí cho mạng thử nghiệm từ vòi (faucet).
    -   Vào kênh `#faucet` trên Discord của IOTA.
    -   Gửi lệnh: `!faucet smr <địa-chỉ-ví-của-bạn>`

## Cài đặt

1.  **Clone hoặc tải dự án**

    Nếu dự án của bạn nằm trong một git repository:
    ```bash
    git clone <your-repository-url>
    cd IOTA_Sensor_Project
    ```

2.  **Tạo file `package.json`**

    Nếu bạn chưa có, hãy chạy lệnh sau để khởi tạo một dự án Node.js:
    ```bash
    npm init -y
    ```

3.  **Cài đặt các thư viện cần thiết**

    Dự án này cần `@iota/sdk` để tương tác với Tangle và `ts-node` để chạy file TypeScript trực tiếp.
    ```bash
    npm install @iota/sdk
    npm install -D typescript ts-node @types/node
    ```

4.  **Cấu hình ví của bạn**

    Mở file `iota_client.ts` và chỉnh sửa các hằng số sau:

    -   `IOTA_WALLET_MNEMONIC`: Thay thế chuỗi hiện tại bằng **cụm từ khôi phục 24 từ** của ví Shimmer Testnet của bạn.

        ```typescript
        // CẢNH BÁO: Chỉ sử dụng Mnemonic của ví thử nghiệm (testnet).
        const IOTA_WALLET_MNEMONIC = 'your twenty four testnet recovery words go here ...';
        ```

    -   `RECIPIENT_ADDRESS`: Thay thế bằng một địa chỉ nhận trên mạng Shimmer (có thể là một địa chỉ khác trong cùng ví của bạn, bắt đầu bằng `smr1...`).

        ```typescript
        const RECIPIENT_ADDRESS = 'smr1qq...'; // <== THAY THẾ BẰNG ĐỊA CHỈ NHẬN
        ```

## Cách chạy dự án

Để thực thi việc gửi dữ liệu, bạn cần tạo một file để gọi hàm `sendTransactionWithData`.

1.  **Tạo file `index.ts`**

    Tạo một file mới tên là `index.ts` trong cùng thư mục với nội dung sau:

    ```typescript
    // index.ts
    import { sendTransactionWithData } from './iota_client';

    async function main() {
        // Dữ liệu cảm biến mô phỏng
        const sensorData = {
            timestamp: new Date().toISOString(),
            temperature: 25.5,
            humidity: 60.1,
        };

        // Chuyển đối tượng JSON thành chuỗi
        const dataString = JSON.stringify(sensorData);
        const tag = 'SENSOR_DATA';

        await sendTransactionWithData(tag, dataString);
    }

    main().catch(console.error);
    ```

2.  **Chạy file `index.ts`**

    Sử dụng `ts-node` để chạy file TypeScript trực tiếp từ terminal:
    ```bash
    npx ts-node index.ts
    ```

3.  **Kiểm tra kết quả**

    Nếu thành công, bạn sẽ thấy một thông báo trong console cùng với một liên kết đến trình khám phá Shimmer. Nhấp vào liên kết đó để xem chi tiết giao dịch và dữ liệu bạn đã gửi trên Tangle.

    ```
    Đang chuẩn bị và gửi giao dịch...
    Gửi giao dịch thành công! Explorer: https://explorer.shimmer.network/shimmer/block/0x...
    ```