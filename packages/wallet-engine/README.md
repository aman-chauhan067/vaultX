# VaultX Wallet Engine

The VaultX Wallet Engine is a secure, typed, and isolated cryptographic foundation for Web3 wallet interactions.

## Architecture

This package is strictly independent of UI (React, Vite, etc.) and blockchain network interaction (no RPC calls). It is purely a deterministic cryptographic wallet manager.

### Key Standards

1. **Why HD Wallets (Hierarchical Deterministic)?**
   HD wallets allow the creation of thousands of unique accounts from a single backup (seed). This prevents the user from needing to back up a new private key every time they create an account.

2. **Why BIP39 (Mnemonic Phrases)?**
   BIP39 standardizes the encoding of a highly secure 128-bit or 256-bit entropy seed into a human-readable 12 or 24-word phrase. This dramatically improves user experience and backup safety.

3. **Why BIP32 (HD Keys)?**
   BIP32 defines the algorithm to derive an infinite tree of child keys from a parent seed. By using elliptic curve mathematics and HMAC-SHA512, it ensures a mathematically sound deterministic path.

4. **Why BIP44 (Derivation Paths)?**
   BIP44 provides a logical hierarchy for BIP32 paths. The standard path `m/44'/coin_type'/account'/change/address_index` ensures interoperability. For Ethereum, the coin type is `60`, leading to the standard path: `m/44'/60'/0'/0/x`.

5. **Why Account Derivation Works?**
   Because of the deterministic nature of HMAC-SHA512 acting on a master seed, incrementing the `address_index` at the end of the derivation path produces a completely new, cryptographically secure private key that can always be recovered as long as the master seed is known.

## Modules

- `crypto`: Raw cryptographic generation (non-HD keypairs).
- `hd`: Master node and child node derivation algorithms (BIP32, BIP44).
- `mnemonic`: Entropy generation and BIP39 checksum validation.
- `accounts`: Wallet metadata and high-level account factory wrappers.
- `types`: TypeScript primitives and export structures.
- `utils`: Fast cryptographic validators.
