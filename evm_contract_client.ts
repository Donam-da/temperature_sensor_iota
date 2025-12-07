// evm_contract_client.ts

import { ethers } from 'ethers';

// --- CẤU HÌNH CẦN THAY ĐỔI ---
// URL RPC của ShimmerEVM Testnet
const EVM_RPC_URL = 'https://json-rpc.evm.testnet.shimmer.network';

// Địa chỉ của Smart Contract bạn đã triển khai ở Bước 1
const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS_HERE'; // <== THAY ĐỔI ĐỊA CHỈ NÀY

// Private Key của ví bạn dùng để triển khai hợp đồng.
// Lấy từ MetaMask (Account Details -> Export Private Key).
const WALLET_PRIVATE_KEY = 'YOUR_WALLET_PRIVATE_KEY_HERE'; // <== THAY ĐỔI PRIVATE KEY NÀY

// ABI (Application Binary Interface) của hợp đồng.
// Bạn có thể lấy ABI này từ Remix sau khi biên dịch hợp đồng.
const CONTRACT_ABI = [
    "function updateReading(string memory _sensorId, uint256 _temperatureX100, string memory _unit, uint256 _timestamp) public",
    "function latestReading() public view returns (string, uint256, string, uint256)",
    "event DataUpdated(tuple(string sensorId, uint256 temperatureX100, string unit, uint256 timestamp) newReading)"
];

/**
 * Gửi dữ liệu cảm biến lên Smart Contract trên ShimmerEVM.
 * @param sensorData Dữ liệu cảm biến để gửi.
 * @returns {Promise<string>} Transaction hash của giao dịch.
 */
export async function storeDataInContract(sensorData: {
    sensorId: string;
    temperature: number;
    unit: string;
    timestamp: string;
}): Promise<string> {
    // --- CẢNH BÁO BẢO MẬT ---
    // Việc lưu trữ private key trực tiếp trong code rất nguy hiểm và chỉ nên dùng cho mục đích thử nghiệm.
    // Trong môi trường production, hãy sử dụng các giải pháp an toàn hơn như biến môi trường (environment variables)
    // hoặc các dịch vụ quản lý khóa (key management services).
    if (WALLET_PRIVATE_KEY === 'YOUR_WALLET_PRIVATE_KEY_HERE' || CONTRACT_ADDRESS === 'YOUR_CONTRACT_ADDRESS_HERE') {
        throw new Error("Vui lòng cập nhật CONTRACT_ADDRESS và WALLET_PRIVATE_KEY trong file evm_contract_client.ts");
    }

    try {
        console.log('Đang kết nối tới ShimmerEVM và gửi giao dịch...');

        const provider = new ethers.JsonRpcProvider(EVM_RPC_URL);
        const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

        // Chuyển đổi dữ liệu để phù hợp với smart contract
        const tempX100 = Math.round(sensorData.temperature * 100);
        const timestampUnix = Math.floor(new Date(sensorData.timestamp).getTime() / 1000);

        // Gọi hàm `updateReading` của smart contract
        const tx = await contract.updateReading(sensorData.sensorId, tempX100, sensorData.unit, timestampUnix);
        await tx.wait(); // Chờ giao dịch được xác nhận

        console.log(`Gửi giao dịch thành công! Transaction Hash: ${tx.hash}`);
        return tx.hash;
    } catch (error) {
        console.error('Lỗi khi gửi dữ liệu lên Smart Contract:', error);
        throw error;
    }
}