# IOTA Sensor Project

**Smart Contract trên Shimmer Testnet:** [0xf81ac401...c5740c](https://explorer.iota.org/address/0xf81ac4012c01ffcd6f0a79e829fae1b1374266e8059d943f197c2d7d54c5740c?network=testnet)

Dự án này là một ví dụ hoàn chỉnh minh họa cách xây dựng một ứng dụng IoT trên nền tảng IOTA, bao gồm hai thành phần chính:

1.  **Smart Contract (Layer 2):** Một smart contract được viết bằng **Rust**, chạy trên chuỗi IOTA Smart Contract (ISCP). Nó có chức năng nhận, lưu trữ và truy vấn dữ liệu từ các cảm biến.
2.  **Client (Layer 1):** Một client được viết bằng **TypeScript** và Node.js, dùng để mô phỏng một thiết bị IoT gửi dữ liệu lên mạng lưới IOTA.

## Tính năng

### Smart Contract (Rust)
-   Viết bằng Rust và biên dịch sang WebAssembly (WASM).
-   Cung cấp hàm `submitData` để các thiết bị gửi dữ liệu (ID thiết bị, giá trị, timestamp).
-   Cung cấp hàm `getData` để truy vấn dữ liệu mới nhất của một thiết bị.
-   Triển khai và tương tác thông qua `wasp-cli` trên Shimmer Testnet.

### Client (TypeScript)
-   Kết nối đến một node public của mạng Shimmer Testnet (Layer 1).
-   Sử dụng `@iota/sdk` để tạo và gửi giao dịch.
-   Đính kèm dữ liệu cảm biến (payload) vào một giao dịch Layer 1.
-   Quản lý ví an toàn thông qua Mnemonic (khuyến khích sử dụng biến môi trường).

## Cấu trúc thư mục

```
IOTA_Sensor_Project/
├── contract/                 # Chứa mã nguồn của Smart Contract
│   ├── src/
│   │   └── lib.rs          # Logic của Smart Contract (Rust)
│   └── Cargo.toml          # Cấu hình project Rust
├── node_modules/
├── iota_client.ts            # Logic client để gửi giao dịch L1
├── index.ts                  # Điểm khởi chạy client TypeScript
├── package.json
├── readme.md                 # Tài liệu hướng dẫn (file này)
└── tsconfig.json             # Cấu hình TypeScript (tùy chọn)
```

## Điều kiện tiên quyết

Trước khi bắt đầu, bạn cần chuẩn bị:

1.  **Node.js**: Phiên bản 18.x trở lên. Bạn có thể tải tại nodejs.org.
2.  **Rust Toolchain**:
    ```bash
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    source "$HOME/.cargo/env"
    ```
3.  **WASM Target cho Rust**:
    ```bash
    rustup target add wasm32-unknown-unknown
    ```
4.  **Wasp-cli**: Công cụ dòng lệnh của IOTA Smart Contracts.
    ```bash
    cargo install wasp-cli
    ```
5.  **Ví Shimmer Testnet**:
    -   Tạo ví bằng Firefly Wallet và chuyển sang chế độ Testnet.
    -   Nhận token SMR Testnet từ Shimmer Faucet.

## Cài đặt và Chạy

Dự án có hai phần, bạn có thể thiết lập và chạy chúng độc lập.

### Phần 1: Smart Contract (Rust)

1.  **Biên dịch Smart Contract:**
    Di chuyển vào thư mục `contract` và chạy lệnh build.
    ```bash
    cd contract
    cargo build --release --target wasm32-unknown-unknown
    ```
    File smart contract sẽ được tạo tại `target/wasm32-unknown-unknown/release/sensor_data.wasm`.

2.  **Cấu hình `wasp-cli`:**
    Trỏ `wasp-cli` đến các node của Shimmer Testnet.
    ```bash
    wasp-cli set l1.apiaddress https://api.testnet.shimmer.network
    wasp-cli set wasp.0.api https://api.wasp.sc.testnet.shimmer.network
    ```

3.  **Thiết lập ví cho `wasp-cli`:**
    Tạo một file `seed.txt` chứa 24 từ khôi phục của ví bạn và import vào `wasp-cli`.
    ```bash
    # CẢNH BÁO: Lệnh này tạo file chứa key, chỉ dùng cho testnet.
    echo "your 24-word mnemonic seed phrase here" > my-wallet-seed.txt
    wasp-cli wallet import my-wallet --seed-file=my-wallet-seed.txt
    ```

4.  **Deploy Smart Contract:**
    a. Deploy một chuỗi mới:
    ```bash
    wasp-cli chain deploy --chain=my-sensor-chain --alias=my-wallet
    ```
    *Lưu lại `ChainID` được trả về.*

    b. Deploy contract lên chuỗi:
    ```bash
    # Đảm bảo bạn đang ở trong thư mục 'contract'
    wasp-cli chain deploy-contract wasmtime sensor_data "Sensor Data SC" target/wasm32-unknown-unknown/release/sensor_data.wasm --chain=my-sensor-chain --alias=my-wallet
    ```

5.  **Tương tác với Smart Contract:**
    a. Gửi dữ liệu:
    ```bash
    wasp-cli chain post-request sensor_data submitData string deviceId string "temp-sensor-01" int value int64 25 --chain=my-sensor-chain --alias=my-wallet --allowance=1000000
    ```
    b. Đọc dữ liệu:
    ```bash
    wasp-cli chain call-view sensor_data getData string deviceId string "temp-sensor-01" --chain=my-sensor-chain
    ```

---

### Phần 2: Client Gửi Dữ liệu (TypeScript)

Phần này mô phỏng một thiết bị gửi dữ liệu lên Layer 1 của IOTA.

1.  **Cài đặt dependencies:**
    Tại thư mục gốc của project, chạy lệnh:
    ```bash
    npm install @iota/sdk
    npm install -D typescript ts-node @types/node
    ```

2.  **Cấu hình ví:**
    Mở file `iota_client.ts` và chỉnh sửa các hằng số sau:
    -   `IOTA_WALLET_MNEMONIC`: Thay bằng **cụm từ khôi phục 24 từ** của ví Shimmer Testnet.
    -   `RECIPIENT_ADDRESS`: Thay bằng địa chỉ nhận (bắt đầu bằng `smr1...`).

    **Khuyến nghị:** Để bảo mật, hãy sử dụng biến môi trường (ví dụ: dùng thư viện `dotenv`) thay vì hardcode vào file.

3.  **Chạy Client:**
    a. Tạo file `index.ts` ở thư mục gốc để gọi hàm gửi dữ liệu:
    ```typescript
    // index.ts
    import { sendTransactionWithData } from './iota_client';

    async function main() {
        // Dữ liệu cảm biến mô phỏng
        const sensorData = {
            timestamp: new Date().toISOString(),
            temperature: 27.1,
            humidity: 65.3,
        };

        // Chuyển đối tượng JSON thành chuỗi
        const dataString = JSON.stringify(sensorData);
        const tag = 'SENSOR_DATA';

        console.log('Đang gửi dữ liệu cảm biến lên Tangle...');
        await sendTransactionWithData(tag, dataString);
    }

    main().catch(console.error);
    ```

    b. Thực thi file `index.ts` bằng `ts-node`:
    ```bash
    npx ts-node index.ts
    ```

    Nếu thành công, bạn sẽ thấy một liên kết đến trình khám phá (explorer) trong console. Bạn có thể nhấp vào đó để xem giao dịch và dữ liệu đã được đính kèm trên Tangle.