<div align="center">
  <img src="docs/assets/banner_placeholder.png" alt="VaultX Banner" width="100%">

  <img src="docs/assets/logo_placeholder.png" alt="VaultX Logo" width="120" height="120">

# VaultX Web3 Wallet

**A highly-secure, production-ready, multi-chain Web3 wallet foundation.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg)](https://reactjs.org/)
[![Ethers.js](https://img.shields.io/badge/Ethers.js-6.x-3c3c3d.svg)](https://docs.ethers.org/v6/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646cff.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

---

VaultX is a premium, open-source Web3 wallet built for maximum security, modularity, and aesthetic excellence. It provides a full set of wallet primitives—including a robust Keyring for encryption, a responsive React UI, a Chrome Extension wrapper, and strict EIP-1193 isolation boundaries.

Whether you're looking for a foundation to build the next major crypto wallet or a secure platform for integrating Web3 features, VaultX is engineered to scale.

<div align="center">
  <a href="#demo">Demo Video placeholder</a>
</div>

## ✨ Key Features

- 🔐 **Military-Grade Security**: Non-custodial by design. Private keys and seed phrases never leave the browser. The vault is encrypted using the native Web Crypto API (AES-GCM) with PBKDF2 key derivation.
- 🌐 **Multi-Chain Native**: Out-of-the-box support for Ethereum, Polygon, Arbitrum, Optimism, Base, and more. Robust fallback RPC systems.
- 🧩 **Modular Architecture**: Built as a `pnpm` monorepo. Clear separation of concerns between cryptography, networking, transaction building, and the UI layer.
- 🎨 **Premium Aesthetic**: Custom Vanilla CSS design system powered by Framer Motion, dynamic particle backgrounds, and rigorous accessibility standards (ARIA).
- 🔌 **Chrome Extension Ready**: Ships with a fully functional Manifest V3 browser extension wrapper for a native wallet experience.
- ⚡ **Zero-Compromise Performance**: topological builds, tree-shaken dependencies, and zero unnecessary React re-renders.

## 📸 Screenshots

<div align="center">
  <img src="docs/assets/screenshots/landing.png" width="45%" alt="Landing Page">
  <img src="docs/assets/screenshots/dashboard.png" width="45%" alt="Dashboard">
  <br/>
  <img src="docs/assets/screenshots/portfolio.png" width="45%" alt="Portfolio">
  <img src="docs/assets/screenshots/networks.png" width="45%" alt="Networks">
</div>

_See the [docs/assets/screenshots](docs/assets/screenshots) directory for more views including Send, Receive, Settings, and Extension popup._

## 🏗 Architecture & Monorepo Structure

VaultX utilizes a strict package boundary architecture, enforced via a `pnpm` workspace. This prevents the React UI from ever accessing sensitive cryptographic primitives directly.

```text
vaultx/
├── apps/
│   ├── web/                 # Main React wallet application and UI layer
│   └── extension/           # Chrome Extension wrapper (Manifest V3)
├── packages/
│   ├── keyring/             # Cryptographic vault, AES-GCM encryption, BIP39/BIP32 derivation
│   ├── network-engine/      # EVM chain configs, RPC health checks, failover logic
│   ├── wallet-engine/       # EIP-1193 Provider, transaction preparation
│   ├── transaction-engine/  # Gas estimation, nonces, and broadcast orchestration
│   ├── account-manager/     # Multi-account state derivation and address book
│   ├── blockchain-core/     # Shared types, ABIs, and essential Web3 utilities
│   ├── contracts/           # Smart contract templates and ABIs
│   └── config/              # Shared TypeScript, Vite, and ESLint configurations
└── docs/                    # Deep-dive architecture and design documentation
```

**For a detailed look at the internal data flows, read the [Architecture Documentation](docs/Architecture.md).**

## 💻 Tech Stack

- **Core**: Node.js, `pnpm` workspace, TypeScript (`strict`, `verbatimModuleSyntax`)
- **Frontend**: React 19, Vite, Vanilla CSS, Framer Motion, Lucide Icons
- **Web3**: `ethers.js` v6, BIP39, Web Crypto API
- **Testing & Tooling**: Vitest, ESLint, TypeScript Compiler (`tsc -b`)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) 20.18 or later
- Corepack (`corepack enable`)

### Installation & Development

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/vaultx.git
   cd vaultx
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Configure Environment:**
   VaultX requires a simple environment setup for the Web App.

   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

   _Only `VITE_` prefixed variables are exposed to the browser. Never put sensitive secrets in this file._

4. **Start the Development Server:**
   ```bash
   pnpm dev
   ```
   The application will be available at `http://localhost:5173`.

## 🛠 Building & Testing

VaultX enforces strict topological builds.

- **Build everything:**
  ```bash
  pnpm build
  ```
- **Run strict typechecking:**
  ```bash
  pnpm typecheck
  ```
- **Run the test suite:**
  ```bash
  pnpm test
  ```

## 🧩 Loading the Chrome Extension

VaultX is built to function as a powerful Chrome extension (Manifest V3).

1. Build the extension package:
   ```bash
   pnpm build
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** in the top right.
4. Click **Load unpacked**.
5. Select the `apps/extension/dist` directory.
6. Pin VaultX to your browser toolbar!

## 🔒 Security Notes

VaultX treats user security as its top priority:

- **No Plaintext Storage**: The browser application stores no secrets or private keys in plaintext. The vault is encrypted with a user-defined password via the native Web Crypto API (AES-GCM) before resting in IndexedDB.
- **Isolated Boundary**: Wallet integration is constrained behind a typed EIP-1193 adapter, preventing arbitrary payload execution.
- **Strict CSP**: The extension enforces rigorous Content Security Policies to mitigate XSS vectors.

_If you discover a security vulnerability, please do NOT open a public issue. See our [Security Policy](docs/Security.md) for disclosure steps._

## 🗺 Roadmap

- Hardware Wallet Integration (Ledger/Trezor)
- WalletConnect v2 Support
- Account Abstraction (ERC-4337)
- Multi-signature vault integrations
- In-wallet DEX aggregation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
