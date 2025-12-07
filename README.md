# IOTA Sensor Project

**Smart Contract on Shimmer Testnet:**\
[`0xf81ac401...c5740c`](https://explorer.iota.org/address/0xf81ac4012c01ffcd6f0a79e829fae1b1374266e8059d943f197c2d7d54c5740c?network=testnet)

This project is a complete example illustrating how to build an IoT
application on the IOTA platform. It consists of two main components:

1.  **Smart Contract (Layer 2):**\
    A smart contract written in **Rust**, running on an IOTA Smart
    Contract (ISCP) chain. It handles receiving, storing, and querying
    sensor data.

2.  **Client (Layer 1):**\
    A client application written in **TypeScript** and Node.js,
    simulating an IoT device sending data to the IOTA network.

------------------------------------------------------------------------

## Features

### Smart Contract (Rust)

-   Written in Rust and compiled to WebAssembly (WASM).
-   Provides a `submitData` function for devices to send sensor data
    (device ID, value, timestamp).
-   Provides a `getData` function to query the latest data for a
    specific device.
-   Deployed and interacted with using `wasp-cli` on the Shimmer
    Testnet.

### Client (TypeScript)

-   Connects to a public Shimmer Testnet node (Layer 1).
-   Uses `@iota/sdk` to create and send transactions.
-   Attaches sensor data as payload in a Layer 1 transaction.
-   Manages wallet access via mnemonic (recommended to use environment
    variables).

------------------------------------------------------------------------

## Directory Structure

    IOTA_Sensor_Project/
    ├── contract/
    │   ├── src/
    │   │   └── lib.rs
    │   └── Cargo.toml
    ├── node_modules/
    ├── iota_client.ts
    ├── index.ts
    ├── package.json
    ├── readme.md
    └── tsconfig.json

------------------------------------------------------------------------

## Prerequisites

### 1. Node.js (18+)

https://nodejs.org/

### 2. Rust Toolchain

``` bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

### 3. Rust WASM Target

``` bash
rustup target add wasm32-unknown-unknown
```

### 4. wasp-cli

``` bash
cargo install wasp-cli
```

### 5. Shimmer Testnet Wallet

Use Firefly in testnet mode + Shimmer faucet.

------------------------------------------------------------------------

# Part 1: Smart Contract (Rust)

## 1. Build the Smart Contract

``` bash
cd contract
cargo build --release --target wasm32-unknown-unknown
```

------------------------------------------------------------------------

## 2. Configure wasp-cli

``` bash
wasp-cli set l1.apiaddress https://api.testnet.shimmer.network
wasp-cli set wasp.0.api https://api.wasp.sc.testnet.shimmer.network
```

------------------------------------------------------------------------

## 3. Import Wallet into wasp-cli

``` bash
echo "your 24-word mnemonic" > my-wallet-seed.txt
wasp-cli wallet import my-wallet --seed-file=my-wallet-seed.txt
```

------------------------------------------------------------------------

## 4. Deploy the Smart Contract

### Deploy chain

``` bash
wasp-cli chain deploy --chain=my-sensor-chain --alias=my-wallet
```

### Deploy contract

``` bash
wasp-cli chain deploy-contract wasmtime sensor_data "Sensor Data SC" target/wasm32-unknown-unknown/release/sensor_data.wasm --chain=my-sensor-chain --alias=my-wallet
```

------------------------------------------------------------------------

## 5. Interact with the Contract

### Submit data

``` bash
wasp-cli chain post-request sensor_data submitData string deviceId string "temp-sensor-01" int value int64 25 --chain=my-sensor-chain --alias=my-wallet --allowance=1000000
```

### Query data

``` bash
wasp-cli chain call-view sensor_data getData string deviceId string "temp-sensor-01" --chain=my-sensor-chain
```

------------------------------------------------------------------------

# Part 2: Client Application (TypeScript)

## Install Dependencies

``` bash
npm install @iota/sdk
npm install -D typescript ts-node @types/node
```

## Configure Wallet in iota_client.ts

``` ts
const IOTA_WALLET_MNEMONIC = "your 24-word mnemonic";
const RECIPIENT_ADDRESS = "smr1...";
```

## index.ts

``` ts
import { sendTransactionWithData } from './iota_client';

async function main() {
    const sensorData = {
        timestamp: new Date().toISOString(),
        temperature: 27.1,
        humidity: 65.3,
    };

    const dataString = JSON.stringify(sensorData);
    const tag = 'SENSOR_DATA';

    console.log('Sending sensor data to the Tangle...');
    await sendTransactionWithData(tag, dataString);
}

main().catch(console.error);
```

## Run

``` bash
npx ts-node index.ts
```

------------------------------------------------------------------------

# References

-   https://docs.iota.org
-   https://wiki.iota.org/smart-contracts/overview
-   https://wiki.iota.org/iota-sdk/welcome
-   https://doc.rust-lang.org/book/
-   https://faucet.testnet.shimmer.network/
