#!/bin/bash

# StratoEscrow Deployment Script
# This script helps deploy the Soroban contract to Stellar testnet

echo "StratoEscrow Deployment Script"
echo "==============================="

# Navigate to contract directory
cd contracts/bounty_escrow

# Build the contract for WASM target
echo "Building contract..."
cargo build --release --target wasm32-unknown-unknown

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

echo "Build successful!"

# Optimize the WASM file
echo "Optimizing WASM..."
wasm-opt target/wasm32-unknown-unknown/release/bounty_escrow.wasm -O3 -o bounty_escrow_optimized.wasm

# Deploy the contract (requires soroban-cli)
echo "Deploying contract to testnet..."
# soroban contract deploy --wasm bounty_escrow_optimized.wasm --source-account YOUR_SECRET_KEY --network testnet

echo "Deployment complete!"
echo "Please update CONTRACT_ADDRESS in frontend/src/lib/contract.ts with the deployed contract address"
