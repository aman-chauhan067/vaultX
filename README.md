<div align="center" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #000; color: #fff; padding: 40px 0;">

<pre style="font-family: monospace; font-size: 14px; line-height: 1.1; font-weight: 900; letter-spacing: -1px; text-align: center; display: inline-block;">
██    ██  █████  ██    ██ ██      ████████ ██   ██ 
██    ██ ██   ██ ██    ██ ██         ██     ██ ██  
██    ██ ███████ ██    ██ ██         ██      ███   
 ██  ██  ██   ██ ██    ██ ██         ██     ██ ██  
  ████   ██   ██  ██████  ███████    ██    ██   ██ 
</pre>

<br/><br/>

<h1 style="font-size: 4em; font-weight: 900; text-transform: uppercase; letter-spacing: -2px; margin: 0; line-height: 0.9;">VAULTX<br/>WALLET</h1>
<p style="font-size: 1.5em; font-weight: 800; letter-spacing: -1px; text-transform: uppercase; margin-top: 20px;">A highly-secure, production-ready, multi-chain Web3 wallet.</p>

<br/>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-black.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-black.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Ethers.js](https://img.shields.io/badge/Ethers.js-6.x-black.svg?style=for-the-badge)](https://docs.ethers.org/v6/)
[![Vite](https://img.shields.io/badge/Vite-6.x-black.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)

</div>

<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin-top: 40px;">

<h2 style="font-size: 3em; font-weight: 900; text-transform: uppercase; letter-spacing: -2px; border-bottom: 8px solid #000; padding-bottom: 10px; margin-bottom: 20px;">[ OVERVIEW ]</h2>

<p style="font-size: 1.2em; font-weight: 500; line-height: 1.5;">
VaultX is a premium, open-source Web3 wallet built for maximum security, modularity, and aesthetic excellence. It provides a full set of wallet primitives—including a robust Keyring for encryption, a responsive React UI, a Chrome Extension wrapper, and strict EIP-1193 isolation boundaries.
<br/><br/>
Whether you're looking for a foundation to build the next major crypto wallet or a secure platform for integrating Web3 features, VaultX is engineered to scale.
</p>

<br/><br/>

<h2 style="font-size: 3em; font-weight: 900; text-transform: uppercase; letter-spacing: -2px; border-bottom: 8px solid #000; padding-bottom: 10px; margin-bottom: 20px;">[ KEY FEATURES ]</h2>

<p style="font-size: 1.2em; font-weight: 800; margin-bottom: 5px;">[+] MILITARY-GRADE SECURITY</p>
<p style="font-size: 1.1em; font-weight: 500; margin-top: 0; margin-bottom: 20px;">Non-custodial by design. Private keys and seed phrases never leave the browser. The vault is encrypted using the native Web Crypto API (AES-GCM) with PBKDF2 key derivation.</p>

<p style="font-size: 1.2em; font-weight: 800; margin-bottom: 5px;">[+] MULTI-CHAIN NATIVE</p>
<p style="font-size: 1.1em; font-weight: 500; margin-top: 0; margin-bottom: 20px;">Out-of-the-box support for Ethereum, Polygon, Arbitrum, Optimism, Base, and more. Robust fallback RPC systems.</p>

<p style="font-size: 1.2em; font-weight: 800; margin-bottom: 5px;">[+] MODULAR ARCHITECTURE</p>
<p style="font-size: 1.1em; font-weight: 500; margin-top: 0; margin-bottom: 20px;">Built as a `pnpm` monorepo. Clear separation of concerns between cryptography, networking, transaction building, and the UI layer.</p>

<p style="font-size: 1.2em; font-weight: 800; margin-bottom: 5px;">[+] PREMIUM AESTHETIC</p>
<p style="font-size: 1.1em; font-weight: 500; margin-top: 0; margin-bottom: 20px;">Custom Vanilla CSS design system powered by Framer Motion, dynamic particle backgrounds, and rigorous accessibility standards (ARIA).</p>

<p style="font-size: 1.2em; font-weight: 800; margin-bottom: 5px;">[+] CHROME EXTENSION READY</p>
<p style="font-size: 1.1em; font-weight: 500; margin-top: 0; margin-bottom: 20px;">Ships with a fully functional Manifest V3 browser extension wrapper for a native wallet experience.</p>

<br/><br/>

<h2 style="font-size: 3em; font-weight: 900; text-transform: uppercase; letter-spacing: -2px; border-bottom: 8px solid #000; padding-bottom: 10px; margin-bottom: 20px;">[ SCREENSHOTS ]</h2>

<div align="center">
  <img src="docs/assets/screenshots/landing.png" width="48%" style="border: 4px solid #000; margin-bottom: 10px;" alt="Landing Page">
  <img src="docs/assets/screenshots/dashboard.png" width="48%" style="border: 4px solid #000; margin-bottom: 10px;" alt="Dashboard">
  <br/>
  <img src="docs/assets/screenshots/portfolio.png" width="48%" style="border: 4px solid #000;" alt="Portfolio">
  <img src="docs/assets/screenshots/networks.png" width="48%" style="border: 4px solid #000;" alt="Networks">
</div>
<p style="font-weight: 800; text-transform: uppercase; text-align: center; margin-top: 10px;">> See docs/assets/screenshots for more views.</p>

<br/><br/>

<h2 style="font-size: 3em; font-weight: 900; text-transform: uppercase; letter-spacing: -2px; border-bottom: 8px solid #000; padding-bottom: 10px; margin-bottom: 20px;">[ ARCHITECTURE ]</h2>

<p style="font-size: 1.1em; font-weight: 500;">VaultX utilizes a strict package boundary architecture, enforced via a `pnpm` workspace. This prevents the React UI from ever accessing sensitive cryptographic primitives directly.</p>

```text
vaultx/
├── apps/
│   ├── web/                 [ Main React wallet application and UI layer ]
│   └── extension/           [ Chrome Extension wrapper (Manifest V3) ]
├── packages/
│   ├── keyring/             [ Cryptographic vault, AES-GCM encryption, BIP39/BIP32 ]
│   ├── network-engine/      [ EVM chain configs, RPC health checks, failover logic ]
│   ├── wallet-engine/       [ EIP-1193 Provider, transaction preparation ]
│   ├── transaction-engine/  [ Gas estimation, nonces, and broadcast orchestration ]
│   ├── account-manager/     [ Multi-account state derivation and address book ]
│   ├── blockchain-core/     [ Shared types, ABIs, and essential Web3 utilities ]
│   ├── contracts/           [ Smart contract templates and ABIs ]
│   └── config/              [ Shared TypeScript, Vite, and ESLint configurations ]
└── docs/                    [ Deep-dive architecture and design documentation ]
```

<br/><br/>

<h2 style="font-size: 3em; font-weight: 900; text-transform: uppercase; letter-spacing: -2px; border-bottom: 8px solid #000; padding-bottom: 10px; margin-bottom: 20px;">[ GETTING STARTED ]</h2>

<p style="font-size: 1.2em; font-weight: 800; margin-bottom: 5px;">[ 1 ] PREREQUISITES</p>
<p style="font-size: 1.1em; font-weight: 500; margin-top: 0; margin-bottom: 15px;">Node.js 20.18+ / Corepack enabled</p>

<p style="font-size: 1.2em; font-weight: 800; margin-bottom: 5px;">[ 2 ] CLONE</p>
```bash
git clone https://github.com/aman-chauhan067/vaultX.git
cd vaultx
```

<p style="font-size: 1.2em; font-weight: 800; margin-bottom: 5px; margin-top: 15px;">[ 3 ] INSTALL</p>
```bash
pnpm install
```

<p style="font-size: 1.2em; font-weight: 800; margin-bottom: 5px; margin-top: 15px;">[ 4 ] ENVIRONMENT</p>
```bash
cp apps/web/.env.example apps/web/.env.local
```

<p style="font-size: 1.2em; font-weight: 800; margin-bottom: 5px; margin-top: 15px;">[ 5 ] RUN SERVER</p>
```bash
pnpm dev
```
<p style="font-size: 1.1em; font-weight: 800; margin-top: 0;">> AVAILABLE AT HTTP://LOCALHOST:5173</p>

<br/><br/>

<h2 style="font-size: 3em; font-weight: 900; text-transform: uppercase; letter-spacing: -2px; border-bottom: 8px solid #000; padding-bottom: 10px; margin-bottom: 20px;">[ SECURITY ]</h2>

<p style="font-size: 1.2em; font-weight: 800; margin-bottom: 5px; color: #ff0000;">[!] NO PLAINTEXT STORAGE</p>
<p style="font-size: 1.1em; font-weight: 500; margin-top: 0; margin-bottom: 20px;">The browser application stores no secrets or private keys in plaintext. The vault is encrypted with a user-defined password via the native Web Crypto API (AES-GCM) before resting in IndexedDB.</p>

<p style="font-size: 1.2em; font-weight: 800; margin-bottom: 5px; color: #ff0000;">[!] ISOLATED BOUNDARY</p>
<p style="font-size: 1.1em; font-weight: 500; margin-top: 0; margin-bottom: 20px;">Wallet integration is constrained behind a typed EIP-1193 adapter, preventing arbitrary payload execution.</p>

<p style="font-size: 1.2em; font-weight: 800; margin-bottom: 5px; color: #ff0000;">[!] STRICT CSP</p>
<p style="font-size: 1.1em; font-weight: 500; margin-top: 0; margin-bottom: 20px;">The extension enforces rigorous Content Security Policies to mitigate XSS vectors.</p>

<br/><br/>

<h2 style="font-size: 3em; font-weight: 900; text-transform: uppercase; letter-spacing: -2px; border-bottom: 8px solid #000; padding-bottom: 10px; margin-bottom: 20px;">[ ROADMAP ]</h2>

<p style="font-size: 1.2em; font-weight: 800; line-height: 1.6;">
[ ] HARDWARE WALLET INTEGRATION<br/>
[ ] WALLETCONNECT V2 SUPPORT<br/>
[ ] ACCOUNT ABSTRACTION (ERC-4337)<br/>
[ ] MULTI-SIGNATURE VAULT INTEGRATIONS<br/>
[ ] IN-WALLET DEX AGGREGATION
</p>

</div>
