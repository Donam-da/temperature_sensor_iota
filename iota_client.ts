// iota_client.ts

import { Client, utf8ToHex, SecretManagerType } from '@iota/sdk';

// URL của một Node IOTA công khai trên mạng thử nghiệm Shimmer.
// Bạn có thể tìm các node khác tại: https://api.shimmer.network/health
const API_ENDPOINT = 'https://api.shimmer.network';

const client = new Client({
    nodes: [API_ENDPOINT],
});

// --- CẤU HÌNH VÍ IOTA (CẦN THAY ĐỔI) ---
// CẢNH BÁO: Chỉ sử dụng Mnemonic của ví thử nghiệm (testnet).
// Không bao giờ đưa Mnemonic của ví thật vào code.
const IOTA_WALLET_MNEMONIC = 'thing clinic tail start key once bamboo service dinner gravity eyebrow nephew'; // <== THAY THẾ BẰNG CỤM TỪ BÍ MẬT CỦA BẠN

// Địa chỉ ví để nhận giao dịch. Có thể là một địa chỉ khác trong cùng ví của bạn.
const RECIPIENT_ADDRESS = 'smr1qq2qm93flf790tuc9e9aqv6jsr0mysfy96hp95nd97dsn8a0wkk7z429dv6'; // <== THAY THẾ BẰNG ĐỊA CHỈ NHẬN

// Số lượng token SMR gửi đi (đơn vị nhỏ nhất: glow). 1 SMR = 1,000,000 glow.
const AMOUNT_TO_SEND = '1000000'; // Gửi 1 SMR

/**
 * Gửi một giao dịch có giá trị và đính kèm dữ liệu lên IOTA Tangle.
 * @param tag - Một thẻ để đánh dấu và tìm kiếm dữ liệu sau này.
 * @param data - Dữ liệu dạng chuỗi JSON cần gửi.
 * @returns {Promise<string>} Block ID của khối vừa được gửi.
 */
export async function sendTransactionWithData(tag: string, data: string): Promise<string> {
    try {
        console.log('Đang chuẩn bị và gửi giao dịch...');

        // 1. Tạo SecretManager từ Mnemonic để quản lý private key
        const secretManager: SecretManagerType = {
            mnemonic: IOTA_WALLET_MNEMONIC,
        };

        // 2. Xây dựng và gửi giao dịch
        // SDK sẽ tự động tìm các UTXO (tiền) trong ví của bạn để tạo giao dịch.
        const blockIdAndBlock = await client.buildAndPostBlock(secretManager, {
            outputs: [
                {
                    type: 3, // BasicOutput
                    amount: AMOUNT_TO_SEND,
                    address: RECIPIENT_ADDRESS,
                },
            ],
            // Đính kèm dữ liệu cảm biến vào giao dịch
            payload: {
                tag: utf8ToHex(tag),
                data: utf8ToHex(data),
            },
        });

        const blockId = blockIdAndBlock[0];
        console.log(`Gửi giao dịch thành công! Explorer: https://explorer.shimmer.network/shimmer/block/${blockId}`);
        return blockId;

    } catch (error) {
        console.error('Lỗi khi gửi dữ liệu:', error);
        throw error;
    }
}