# VaultX Roadmap

## Phase 1 — Foundation (complete in this repository)

- Workspace, quality gates, CI, containerization, and documentation
- React wallet shell with a typed injected-wallet adapter
- Chain registry and environment validation
- Hardened example Solidity protocol contract and unit tests

## Phase 2 — Wallet engine and connectivity

- Secure wallet-engine package with hardware-backed/mobile key storage strategy
- Account lifecycle, address book, watch-only accounts, and encrypted backups
- WalletConnect v2 adapter, connection permissions, and session lifecycle
- EIP-6963 multi-provider discovery and deterministic provider selection
- Transaction builder, simulation, fee policies, and signing confirmations

## Phase 3 — Portfolio and assets

- Indexed multi-chain balances, token discovery, NFT gallery, and spam filtering
- Price service with source provenance and cache policies
- Activity feed with confirmations, reorg handling, and export

## Phase 4 — DApp and swap platform

- Permissioned DApp connections and per-origin access controls
- Transaction decoding, approval risk analysis, and phishing defenses
- Aggregator-based swap quotes, allowance management, and intent simulation

## Phase 5 — Commercial hardening

- Native mobile clients using the same wallet-engine interfaces
- Independent security audits, bug bounty, observability, incident response, and disaster-recovery exercises
- Accessibility, localization, compliance review, and controlled releases
