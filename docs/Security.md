# Security Posture

VaultX is engineered with a strict "security-first" approach. This document outlines the key security mechanisms, the threat model, and current limitations.

## Private Key Handling

**VaultX never stores private keys or seed phrases in plaintext.**

- All sensitive cryptographic material resides strictly within the `@vaultx/keyring` package memory space when unlocked.
- The React frontend receives derived public addresses and requests signatures, but never touches the raw private key bytes.

## Encryption

When the vault is locked or the browser is closed, the state is persisted to `IndexedDB`.

- Before persisting, the seed phrase and private keys are encrypted using the native browser **Web Crypto API**.
- We use **AES-GCM** (Advanced Encryption Standard with Galois/Counter Mode) for authenticated encryption.
- The encryption key is derived from the user's password using **PBKDF2** with a high iteration count and a unique salt.

## Session Handling

- The application automatically locks after a period of inactivity.
- The in-memory decrypted state is wiped aggressively upon locking.
- Background service workers in the extension (Manifest V3) manage the "unlocked" state to ensure it doesn't leak to individual tabs.

## Threat Model

### Addressed Threats

- **Malicious dApps**: The EIP-1193 boundary prevents dApps from executing arbitrary code or accessing private keys. Every transaction and signature request requires explicit user consent via the UI.
- **Physical Device Access**: If an attacker gains physical access to the device when locked, they cannot extract the keys without the user's password due to AES-GCM encryption.
- **XSS (Cross-Site Scripting)**: Strict Content Security Policies (CSP) in the extension mitigate the risk of injected scripts exfiltrating data.

## Current Limitations

- **Browser Environment Restrictions**: Because VaultX runs in the browser, it is ultimately subject to the security of the host OS and the browser itself. Zero-day exploits in the browser engine or compromised OS-level processes (keyloggers, memory dumpers) can theoretically compromise the vault.
- **No Hardware Wallet Support Yet**: Currently, VaultX does not integrate with Ledger or Trezor devices. This is on the roadmap and will provide cold-storage security guarantees.
- **Phishing**: VaultX cannot completely prevent a user from being tricked into approving a malicious transaction or typing their seed phrase into a fake website. Always verify the domain and transaction details.

_If you discover a security vulnerability, please contact the maintainers privately rather than opening a public issue._
