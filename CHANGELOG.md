# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-22

### Added

- **Core Wallet Primitives**: Seed phrase generation (BIP39), account derivation (BIP32/BIP44), and transaction signing capabilities.
- **Web App UI**: Complete, responsive, and highly polished React 19 interface with dynamic Framer Motion animations and a fireflies background.
- **Chrome Extension Support**: Manifest V3 compliant background and popup scripts.
- **Network Engine**: Support for Ethereum, Polygon, Arbitrum, Optimism, Base, and dynamic RPC management.
- **Asset Manager**: ERC-20 token support and CoinGecko/Chainlink price feeds.
- **Topological Builds**: Fully integrated `pnpm` workspace with strict `tsc -b` typechecking and `vitest` unit tests.

### Changed

- Refactored UI from standard DOM bindings to full React state management.
- Transitioned global `ethers.js` singletons into a strict EIP-1193 provider architecture (`@vaultx/wallet-engine`).
- Moved cryptographic operations into a completely isolated package boundary (`@vaultx/keyring`) for enhanced security.
- Replaced basic CSS with a comprehensive Vanilla CSS design system.

### Security

- Implemented **AES-GCM** encryption for the local vault using the Web Crypto API.
- Implemented robust locking mechanisms that aggressively zero-out decrypted state from memory.
- Added strict Content Security Policies (CSP) to the Chrome Extension to mitigate XSS vectors.
- Established strict EIP-1193 payload validation to prevent malformed dApp requests from interacting with private keys.

### Known Limitations

- Hardware wallets (Ledger, Trezor) are not yet supported.
- Does not currently support WalletConnect v2 for connecting the browser extension to external mobile wallets.
- Limited to EVM-compatible chains (No Bitcoin or Solana support).

### Future Roadmap

- Hardware Wallet Integration.
- Account Abstraction (ERC-4337) with sponsored gas via paymasters.
- Native in-wallet token swaps and bridging via 1inch/Socket protocols.
- Multi-signature vault integrations (Safe).
