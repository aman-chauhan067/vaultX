# Wallet Engine

The `@vaultx/wallet-engine` and `@vaultx/keyring` packages form the core of VaultX's identity management.

## HD Wallet Generation

VaultX uses the BIP39 standard for generating 12-word mnemonic phrases (seed phrases). This ensures compatibility with almost every major crypto wallet. The seed phrase serves as the root entropy from which all private keys are derived.

## Account Derivation

We utilize the BIP32 and BIP44 standards for Hierarchical Deterministic (HD) wallets.

- The default derivation path for Ethereum accounts is `m/44'/60'/0'/0/x`, where `x` is the account index (0, 1, 2, ...).
- This allows a single root seed phrase to generate an infinite number of deterministic accounts, all backed up by the same 12 words.

## Signing

All cryptographic operations (signing transactions, signing messages) happen in an isolated memory space.

- The React UI never sees the private key.
- The `AccountManager` asks the `Keyring` to sign a specific payload.
- The `Keyring` performs the elliptic curve cryptography (secp256k1) via `ethers.js` and returns only the resulting signature.

## Serialization

The `wallet-engine` provides the EIP-1193 standard Provider interface. It intercepts JSON-RPC requests from dApps, serializes them into internal VaultX structures, routes them for user approval, and then deserializes the cryptographic signatures back into standard JSON-RPC responses.
