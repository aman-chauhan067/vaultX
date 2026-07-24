```text

  //========================================================================\\
 ||                                                                          ||
 ||  V A U L T X  --  T H E   W E B 3   W A L L E T   F O U N D A T I O N    ||
 ||                                                                          ||
  \\========================================================================//

VAULTX(1)                       USER COMMANDS                      VAULTX(1)

NAME
       VaultX - A highly-secure, production-ready, multi-chain Web3 wallet

SYNOPSIS
       git clone https://github.com/aman-chauhan067/vaultX.git
       pnpm install
       pnpm dev

DESCRIPTION
       VaultX is a non-custodial cryptographic key management system and
       transaction signer designed for the modern Ethereum Virtual Machine
       (EVM) ecosystem.

+--------------------------------------------------------------------------+
|  T A B L E   O F   C O N T E N T S                                       |
+--------------------------------------------------------------------------+
  01. Project Philosophy
  02. About VaultX
  03. Features
  04. Architecture
  05. Technology Stack
  06. Repository Structure
  07. Installation
  08. Quick Start
  09. Development Workflow
  10. Environment Variables
  11. Configuration
  12. Building
  13. Running
  14. Testing
  15. Security
  16. Performance
  17. Accessibility
  18. UI Philosophy
  19. Contributing Guide
  20. Git Workflow
  21. Roadmap
  22. Troubleshooting
  23. FAQ
  24. Glossary
  25. Credits
  26. License
  27. Final Notes

+--------------------------------------------------------------------------+
|                                                                          |
|  01.  P R O J E C T   P H I L O S O P H Y                               |
|                                                                          |
+--------------------------------------------------------------------------+

WHY VAULTX EXISTS.
The digital realm requires absolute sovereignty over cryptographic keys.
VaultX was born out of a necessity for a minimal, uncompromising, and
highly aesthetic self-custody solution.

PROBLEM STATEMENT.
Modern wallets are bloated, heavily centralized in their RPC reliance,
and lack transparent architectural boundaries.

MISSION.
To build a wallet foundation that scales from a solo hacker's toolkit
to an enterprise-grade infrastructure.

VISION.
A world where cryptographic key management is as ubiquitous and reliable
as the TCP/IP stack.

DESIGN PRINCIPLES.
  * Do one thing and do it well.
  * Text is the universal interface.
  * Cryptography must be isolated.
  * Trust nothing; verify everything.

SECURITY PHILOSOPHY.
Assume the host environment is compromised. Limit blast radius.

PRIVACY PHILOSOPHY.
Zero telemetry. Zero tracking. Zero remote logging.

MINIMALISM PHILOSOPHY.
If a feature does not serve the core mission, it is discarded.

OPEN SOURCE PHILOSOPHY.
Code is public infrastructure. It belongs to the community.

+--------------------------------------------------------------------------+
|                                                                          |
|  02.  A B O U T   V A U L T X                                           |
|                                                                          |
+--------------------------------------------------------------------------+

LONG DETAILED EXPLANATION.
VaultX is a state-of-the-art Web3 wallet architecture. It serves as both
a standalone application and a modular framework. It abstracts away the
complexities of BIP39 mnemonic generation, BIP32 hierarchical deterministic
path derivations, and EIP-1559 gas fee estimations.

WHAT IT IS.
A deterministic key generator.
An AES-GCM encrypted local vault.
An EIP-1193 compatible provider.

WHAT IT ISN'T.
A custodial exchange.
A fiat on-ramp.
A closed-source black box.

WHO SHOULD USE IT.
Hackers, cryptographers, distributed systems engineers, and anyone who
demands absolute control over their digital identity.

WHO SHOULD NOT USE IT.
Users seeking custodial password resets or centralized customer support.

+--------------------------------------------------------------------------+
|                                                                          |
|  03.  F E A T U R E S                                                   |
|                                                                          |
+--------------------------------------------------------------------------+

WALLET
  - BIP39/BIP32 Hierarchical Deterministic (HD) key generation.
  - AES-GCM local storage encryption.
  - Multiple derivation paths (m/44'/60'/0'/0/x).

ACCOUNTS
  - Infinite account generation from a single entropy seed.
  - Custom account naming and local address book tagging.

NETWORKS
  - EVM-compatible routing.
  - Fallback RPC execution logic.
  - Custom chain ID integration.

TOKENS
  - ERC-20 auto-discovery.
  - Contract ABI resolution.
  - Decimal precision arithmetic.

NFTS
  - ERC-721 and ERC-1155 metadata parsing.
  - IPFS content routing and gateway fallbacks.

TRANSACTIONS
  - EIP-1559 Type 2 transaction building.
  - Nonce management and mempool queueing.

SECURITY
  - Sandboxed crypto boundary.
  - Strict Content Security Policy (CSP).

SETTINGS
  - Granular control over UI/UX.
  - Advanced RPC configurations.

PERFORMANCE
  - Tree-shaken dependencies.
  - Lazy-loaded UI components.

DEVELOPER EXPERIENCE
  - pnpm workspaces.
  - Strict TypeScript configurations.
  - Reproducible builds.

FUTURE FEATURES
  - Account Abstraction (ERC-4337).

+--------------------------------------------------------------------------+
|                                                                          |
|  04.  A R C H I T E C T U R E                                           |
|                                                                          |
+--------------------------------------------------------------------------+

LAYER DIAGRAMS.

    [ USER INTERFACE LAYER (React 19) ]
           |             |
           v             v
    [ WALLET ENGINE ] [ TRANSACTION ENGINE ]
           |             |
           +------+------+
                  |
                  v
          [ KEYRING CORE ]
          (AES-GCM Vault)

DATA FLOW.
  Action -> EIP-1193 Provider -> Transaction Builder -> Keyring Signer -> RPC

FOLDER RELATIONSHIPS.
  apps/web/        <-- Depends on --> packages/wallet-engine
  packages/keyring <-- Depends on --> [NO EXTERNAL DEPS]

CONTROLLER RELATIONSHIPS.
  KeyringController acts as the sole gatekeeper to private key buffers.

+--------------------------------------------------------------------------+
|                                                                          |
|  05.  T E C H N O L O G Y   S T A C K                                   |
|                                                                          |
+--------------------------------------------------------------------------+

LANGUAGES.
  - TypeScript (strict mode, noImplicitAny)
  - JavaScript (ES2022)
  - HTML/CSS (Vanilla)

FRAMEWORKS.
  - React 19

LIBRARIES.
  - Ethers.js v6
  - Framer Motion

BUILD TOOLS.
  - Vite
  - tsc

PACKAGE MANAGER.
  - pnpm (workspaces)

FORMATTING & LINTING.
  - Prettier
  - ESLint

TESTING.
  - Vitest (Unit)
  - Puppeteer (E2E)

+--------------------------------------------------------------------------+
|                                                                          |
|  06.  R E P O S I T O R Y   S T R U C T U R E                           |
|                                                                          |
+--------------------------------------------------------------------------+

HUGE FOLDER TREE.

  VaultX/
  |-- apps/
  |   |-- web/                   (React frontend)
  |   `-- extension/             (Chrome extension wrapper)
  |-- packages/
  |   |-- account-manager/       (Address book & labels)
  |   |-- blockchain-core/       (Shared ABIs & primitives)
  |   |-- config/                (ESLint/TS configurations)
  |   |-- contracts/             (Solidity smart contracts)
  |   |-- keyring/               (Cryptography & encryption)
  |   |-- network-engine/        (RPC & EVM routing)
  |   |-- transaction-engine/    (Gas & mempool logic)
  |   `-- wallet-engine/         (Provider interfaces)
  |-- docs/
  |-- scripts/
  |-- pnpm-workspace.yaml
  `-- package.json

+--------------------------------------------------------------------------+
|                                                                          |
|  07.  I N S T A L L A T I O N                                           |
|                                                                          |
+--------------------------------------------------------------------------+

WINDOWS
  Use Windows Subsystem for Linux (WSL2).
  $ git clone https://github.com/aman-chauhan067/vaultX.git
  $ pnpm install

LINUX / MACOS
  $ git clone https://github.com/aman-chauhan067/vaultX.git
  $ cd vaultX
  $ pnpm install

DOCKER
  $ docker build -t vaultx .
  $ docker run -p 5173:5173 vaultx

FROM SOURCE
  Ensure Node.js 20.18+ and Corepack are active.

+--------------------------------------------------------------------------+
|                                                                          |
|  08.  Q U I C K   S T A R T                                             |
|                                                                          |
+--------------------------------------------------------------------------+

  $ cp apps/web/.env.example apps/web/.env.local
  $ pnpm dev
  > Open http://localhost:5173

+--------------------------------------------------------------------------+
|                                                                          |
|  09.  D E V E L O P M E N T   W O R K F L O W                           |
|                                                                          |
+--------------------------------------------------------------------------+

  - Branch off 'main' using 'feature/your-feature'.
  - Commit using conventional commits format.
  - Run 'pnpm typecheck' before pushing.

+--------------------------------------------------------------------------+
|                                                                          |
|  10.  E N V I R O N M E N T   V A R I A B L E S                         |
|                                                                          |
+--------------------------------------------------------------------------+

  VITE_RPC_URL_MAINNET     - Fallback RPC for Ethereum Mainnet (default: public RPC)
  VITE_ENABLE_TESTNETS     - Toggle Sepolia/Goerli (default: true)
  VITE_DEBUG_LEVEL         - Logging verbosity (default: warn)

+--------------------------------------------------------------------------+
|                                                                          |
|  11.  C O N F I G U R A T I O N                                         |
|                                                                          |
+--------------------------------------------------------------------------+

  Configuration is handled via 'packages/config' for cross-workspace
  consistency. Modifying 'tsconfig.base.json' propagates to all modules.

+--------------------------------------------------------------------------+
|                                                                          |
|  12.  B U I L D I N G                                                   |
|                                                                          |
+--------------------------------------------------------------------------+

  $ pnpm build
  Produces production-ready artifacts in 'apps/web/dist'.

+--------------------------------------------------------------------------+
|                                                                          |
|  13.  R U N N I N G                                                     |
|                                                                          |
+--------------------------------------------------------------------------+

  $ pnpm preview
  Boots a local static server to serve the production build.

+--------------------------------------------------------------------------+
|                                                                          |
|  14.  T E S T I N G                                                     |
|                                                                          |
+--------------------------------------------------------------------------+

UNIT TESTING.
  $ pnpm test (Powered by Vitest)

INTEGRATION TESTING.
  Tests the boundary between Keyring and Wallet Engine.

MANUAL TESTING.
  Ensure Chrome Extension installs correctly via unpacked extensions.

REGRESSION TESTING.
  Puppeteer scripts located in root directory.

COVERAGE.
  $ pnpm coverage (Requires c8)

+--------------------------------------------------------------------------+
|                                                                          |
|  15.  S E C U R I T Y                                                   |
|                                                                          |
+--------------------------------------------------------------------------+

THREAT MODEL.
  Assume browser extensions can read DOM. Assume local storage can be accessed by malware.

ENCRYPTION.
  AES-GCM (256-bit).

SESSIONS.
  In-memory session keys. Cleared on tab close.

PRIVATE KEYS.
  Never serialized to disk unencrypted.

SIGNING.
  Ethers.js signing algorithms. ECDSA over secp256k1.

STORAGE.
  IndexedDB for encrypted vault ciphertexts.

SECRETS.
  PBKDF2 is used to derive a key-encryption-key from the user's master password.

+--------------------------------------------------------------------------+
|                                                                          |
|  16.  P E R F O R M A N C E                                             |
|                                                                          |
+--------------------------------------------------------------------------+

CACHING.
  RPC responses are heavily cached to prevent rate-limiting.

RENDERING.
  Strict React memoization prevents cascading DOM updates.

OPTIMIZATION.
  Topological builds ensure independent modules build concurrently.

MEMORY.
  Private key buffers are manually zeroed out (where GC allows).

BUNDLE SIZE.
  Vite chunk splitting keeps the initial payload under 200kb.

+--------------------------------------------------------------------------+
|                                                                          |
|  17.  A C C E S S I B I L I T Y                                         |
|                                                                          |
+--------------------------------------------------------------------------+

  All UI components adhere to WAI-ARIA standards.
  Keyboard navigation is strictly enforced.

+--------------------------------------------------------------------------+
|                                                                          |
|  18.  U I   P H I L O S O P H Y                                         |
|                                                                          |
+--------------------------------------------------------------------------+

WHY THE INTERFACE LOOKS THE WAY IT DOES.
  Brutalism. Form follows function. Minimal cognitive load.

TYPOGRAPHY.
  Helvetica / Monospace. Stark, readable, timeless.

SPACING.
  Massive whitespace to focus the user's attention.

MOTION.
  Subtle physics-based animations (Framer Motion) to indicate state.

COLOR.
  High contrast monochrome with strategic brand accenting.

+--------------------------------------------------------------------------+
|                                                                          |
|  19.  C O N T R I B U T I N G   G U I D E                               |
|                                                                          |
+--------------------------------------------------------------------------+

CODE STYLE.
  Prettier. No exceptions.

COMMIT STYLE.
  type(scope): subject

BRANCH STRATEGY.
  Feature branching off main. Rebase, do not merge.

REVIEW PROCESS.
  2 approvals required. CI must pass.

+--------------------------------------------------------------------------+
|                                                                          |
|  20.  G I T   W O R K F L O W                                           |
|                                                                          |
+--------------------------------------------------------------------------+

  1. git fetch --all
  2. git rebase origin/main
  3. git push -f origin HEAD

+--------------------------------------------------------------------------+
|                                                                          |
|  21.  R O A D M A P                                                     |
|                                                                          |
+--------------------------------------------------------------------------+

COMPLETED.
  [x] Core Keyring
  [x] Web UI
  [x] ASCII Art Updates

IN PROGRESS.
  [-] Network Engine Fallbacks
  [-] Chrome Extension bridging

FUTURE.
  [ ] Hardware Wallet Support

+--------------------------------------------------------------------------+
|                                                                          |
|  22.  T R O U B L E S H O O T I N G                                     |
|                                                                          |
+--------------------------------------------------------------------------+

ISSUE: Wallet won't load in extension.
FIX: Ensure Manifest V3 permissions for 'storage' and 'activeTab' are set.

ISSUE: RPC rate limits.
FIX: Provide a custom RPC URL in Network Settings.

+--------------------------------------------------------------------------+
|                                                                          |
|  23.  F A Q                                                             |
|                                                                          |
+--------------------------------------------------------------------------+

Q: What happens if I lose my local storage?
A: As a non-custodial system, losing local storage means your AES-GCM ciphertexts are lost. If you did not backup your BIP39 mnemonic seed phrase, your cryptographic keys and subsequent derived HD paths are irreversibly gone. Trust mathematics, but backup your entropy.




+--------------------------------------------------------------------------+
|                                                                          |
|  24.  G L O S S A R Y                                                   |
|                                                                          |
+--------------------------------------------------------------------------+

EVM
  Ethereum Virtual Machine. The global state machine.

RPC
  Remote Procedure Call. How we talk to the blockchain.

BIP39
  Mnemonic code for generating deterministic keys.

BIP32
  Hierarchical Deterministic Wallets.

NONCE
  Number used once. Prevents transaction replay attacks.

MEMPOOL
  Memory pool. Where transactions wait to be mined.

GAS
  The unit of computational effort required to execute operations.

+--------------------------------------------------------------------------+
|                                                                          |
|  25.  C R E D I T S                                                     |
|                                                                          |
+--------------------------------------------------------------------------+

  Created by Aman Chauhan.
  Built upon the shoulders of giants (Linux, Cypherpunks, Open Source).

+--------------------------------------------------------------------------+
|                                                                          |
|  26.  L I C E N S E                                                     |
|                                                                          |
+--------------------------------------------------------------------------+

  MIT License. See LICENSE file in repository root.

+--------------------------------------------------------------------------+
|                                                                          |
|  27.  F I N A L   N O T E S                                             |
|                                                                          |
+--------------------------------------------------------------------------+

  END OF MANUAL.

  SYSTEM HALTING...
  SYNCING DISKS...
  POWER DOWN.

      +===================================================+
      |                                                   |
      |   I T   I S   S A F E   T O   T U R N   O F F     |
      |             Y O U R   C O M P U T E R             |
      |                                                   |
      +===================================================+

```
