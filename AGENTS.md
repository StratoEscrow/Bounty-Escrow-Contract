# StratoEscrow - Project Information

## Build Commands

### Smart Contract
```bash
cd contracts/bounty_escrow
cargo build --release
cargo test
```

### Frontend
```bash
cd frontend
npm install
npm run dev
npm run build
npm run lint
```

## Project Structure

- `contracts/bounty_escrow/` - Soroban smart contract written in Rust
- `frontend/` - Next.js 14 frontend with TypeScript and Tailwind CSS

## Key Features

1. **Bounty Creation**: Sponsors can create bounties with locked funds
2. **Work Submission**: Contributors submit proof-of-work links
3. **Approval System**: Sponsors approve submissions to release funds
4. **Dispute Window**: 7-day window before funds can be reclaimed
5. **Freighter Integration**: Seamless wallet connection for users

## Contract Functions

- `create_bounty` - Create new bounty with escrowed funds
- `submit_work` - Submit work for a bounty
- `approve_submission` - Approve work and release payment
- `reclaim_expired` - Reclaim funds after dispute window
- `get_bounty` - Get bounty details
- `get_submissions` - Get submissions for a bounty
- `get_all_bounties` - Get all bounties

## Deployment

1. Build contract: `cargo build --release --target wasm32-unknown-unknown`
2. Deploy using Soroban CLI
3. Update contract address in `frontend/src/lib/contract.ts`
4. Deploy frontend: `npm run build`

## Network Configuration

Default: Stellar Testnet
For mainnet: Update `NETWORK_PASSPHRASE` in contract.ts

## Testing

Contract tests included in `contracts/bounty_escrow/src/test.rs`
Run with: `cargo test`
