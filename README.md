# StratoEscrow - Decentralized Bounty Escrow Platform

A decentralized bounty escrow platform built on Stellar/Soroban with Rust smart contracts and a Next.js frontend.

## Features

- **Sponsors** can create bounties with title, reward in SEP-41 tokens, and deadline
- **Contributors** can submit proof-of-work links against open bounties
- **Sponsors** can approve one submission, releasing funds to that contributor
- **Dispute window** before sponsors can reclaim unclaimed funds
- **Freighter wallet** integration for seamless user experience

## Tech Stack

### Smart Contract
- Rust
- Soroban SDK
- Stellar blockchain

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Freighter Wallet API
- Stellar SDK

## Project Structure

```
Bounty-Escrow-Contract/
├── contracts/
│   └── bounty_escrow/
│       ├── Cargo.toml
│       └── src/
│           └── lib.rs (Soroban contract)
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── next.config.js
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx
        │   └── globals.css
        ├── components/
        │   ├── WalletConnect.tsx
        │   ├── CreateBounty.tsx
        │   └── BountyList.tsx
        └── lib/
            ├── useWallet.ts
            └── contract.ts
```

## Contract Functions

- `create_bounty` - Create a new bounty with locked funds
- `submit_work` - Submit proof-of-work for a bounty
- `approve_submission` - Approve a submission and release funds
- `reclaim_expired` - Reclaim funds after dispute window
- `get_bounty` - Get bounty details
- `get_submissions` - Get submissions for a bounty
- `get_all_bounties` - Get all bounties

## Setup Instructions

### Prerequisites

- Rust and Cargo
- Node.js and npm
- Freighter browser extension
- Soroban CLI tools (optional for contract deployment)

### Smart Contract Development

```bash
cd contracts/bounty_escrow
cargo build --release
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Contract Deployment

1. Build the contract:
```bash
cd contracts/bounty_escrow
cargo build --release --target wasm32-unknown-unknown
soroban contract deploy
```

2. Update the contract address in `frontend/src/lib/contract.ts`:
```typescript
const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
```

## Build → Sign → Submit Flow

The frontend follows a build → sign → submit pattern for all on-chain operations:

1. **Build**: Construct the transaction with contract calls
2. **Sign**: Use Freighter wallet to sign the transaction
3. **Submit**: Submit the signed transaction to the Stellar network

## Testing

### Contract Tests

```bash
cd contracts/bounty_escrow
cargo test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Network Configuration

The contract is configured for the Stellar Testnet by default. For mainnet deployment:

1. Update `NETWORK_PASSPHRASE` in `frontend/src/lib/contract.ts`
2. Deploy to mainnet
3. Update contract address in frontend configuration

## Security Considerations

- All funds are locked in escrow upon bounty creation
- Dispute window (7 days) prevents premature fund reclamation
- Only sponsors can approve submissions
- Only sponsors can reclaim expired funds
- Address verification for all operations

## License

MIT
