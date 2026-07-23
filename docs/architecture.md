# VaultX Architecture

VaultX is built using a strict modular architecture leveraging a `pnpm` workspace. This structure ensures that critical modules are completely decoupled from the presentation layer, creating robust security boundaries and simplifying testing.

## Monorepo Layout

- `apps/web`: The React frontend, responsible for user interactions and rendering state.
- `apps/extension`: The Chrome extension background scripts and content scripts (Manifest V3).
- `packages/*`: The core logic layers (network, transaction, wallet, account, cryptography).

## Core Package Relationships

1. **`@vaultx/keyring`**: The absolute lowest level. It holds the seed phrase and private keys. Nothing else holds keys. It exposes methods to encrypt/decrypt using the Web Crypto API, and to sign hashes.
2. **`@vaultx/account-manager`**: Sits on top of the keyring. Derives child accounts (BIP44), stores public addresses, and manages the locked/unlocked session state.
3. **`@vaultx/network-engine`**: Manages the list of EVM networks (Chain ID, RPC URLs) and provides a pooled, healthy `ethers.js` provider.
4. **`@vaultx/transaction-engine`**: Orchestrates transaction building, gas estimation, and signing by passing the payload to the Account Manager, then broadcasting via the Network Engine.
5. **`@vaultx/wallet-engine`**: Ties it all together into an EIP-1193 compatible provider interface. This is what decentralized applications (dApps) interact with.

## Data Flow (Signing a Transaction)

1. A dApp sends an `eth_sendTransaction` request via the EIP-1193 provider (`wallet-engine`).
2. The request is intercepted by the Extension Background Script (or the Web App UI).
3. The UI prompts the user to approve the transaction.
4. Upon approval, the payload is sent to `transaction-engine`.
5. `transaction-engine` estimates gas and nonces via `network-engine`.
6. `transaction-engine` requests a signature from `account-manager` for the specific address.
7. `account-manager` asks `keyring` to sign the transaction hash.
8. `keyring` signs and returns the signature.
9. `transaction-engine` broadcasts the signed transaction via `network-engine`.
10. The resulting transaction hash is returned to the dApp.

## React Architecture

The UI is built with React 19, utilizing React Contexts for global state management (e.g., `VaultProvider`, `NetworkProvider`, `TransactionProvider`).
We strictly adhere to custom Vanilla CSS and avoid unnecessary re-renders through memoization and targeted context subscriptions.

## Extension Architecture (MV3)

The VaultX extension is a Manifest V3 compliant wrapper around the core packages.

- **Background Service Worker**: Houses the `BackgroundController`, maintaining the single source of truth for the unlocked vault state.
- **Content Script**: Injected into web pages to provide the `window.ethereum` object and bridge messages to the background script.
- **Popup UI**: A lightweight React app that communicates with the background script via Chrome message passing.
