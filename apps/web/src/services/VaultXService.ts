import { AccountManager, AddressBookController } from '@vaultx/account-manager';
import {
  ProviderManager,
  AssetManager,
  WalletConnectService,
  LocalStoragePortfolio,
  PriceEngine,
  PortfolioAnalyzer,
  CoinGeckoProvider,
  MockProvider,
  IdentityEngine,
  ENSResolver,
  DiscoveryEngine,
  LocalDiscoveryStorage
} from '@vaultx/network-engine';
import { LocalStorageAdapter } from './StorageAdapter.js';
import { EncryptedWcStorage } from './EncryptedWcStorage.js';

import { KeyringController } from '@vaultx/keyring';
import { TransactionCoordinator } from '@vaultx/transaction-engine';

declare let chrome: any;

export class VaultXService {
  private static instance: VaultXService;

  public readonly networkEngine: ProviderManager;
  public readonly accountManager: AccountManager;
  public readonly assetManager: AssetManager;
  public readonly walletConnect: WalletConnectService;
  public readonly keyringController: KeyringController;
  public readonly transactionEngine: TransactionCoordinator;

  public readonly priceEngine: PriceEngine;
  public readonly portfolioAnalyzer: PortfolioAnalyzer;

  public readonly identityEngine: IdentityEngine;
  public readonly discoveryEngine: DiscoveryEngine;
  public readonly addressBook: AddressBookController;

  private constructor() {
    this.networkEngine = new ProviderManager();
    this.injectAlchemyProvider();
    this.accountManager = new AccountManager(new LocalStorageAdapter());
    this.assetManager = new AssetManager(this.networkEngine);
    this.walletConnect = new WalletConnectService();
    this.keyringController = this.accountManager.getKeyringController();
    this.transactionEngine = new TransactionCoordinator();

    // Phase 4: Portfolio Intelligence Engine
    const cgProvider = new CoinGeckoProvider();
    const mockProvider = new MockProvider();
    this.priceEngine = new PriceEngine(cgProvider, [mockProvider]);
    this.portfolioAnalyzer = new PortfolioAnalyzer(new LocalStoragePortfolio());

    // Phase 5: Asset Discovery & Identity
    this.identityEngine = new IdentityEngine(this.networkEngine);
    this.identityEngine.registerResolver(new ENSResolver());

    const discoveryStorage = new LocalDiscoveryStorage();
    this.discoveryEngine = new DiscoveryEngine(
      this.networkEngine,
      this.assetManager,
      discoveryStorage
    );

    this.addressBook = new AddressBookController(new LocalStorageAdapter());
    this.addressBook.load().catch(console.error);
  }

  private injectAlchemyProvider() {
    const alchemyKey = import.meta.env.VITE_ALCHEMY_KEY;
    if (alchemyKey) {
      const alchemyNetworks: Record<number, string> = {
        1: 'eth-mainnet',
        11155111: 'eth-sepolia',
        137: 'polygon-mainnet',
        80002: 'polygon-amoy',
        8453: 'base-mainnet',
        84532: 'base-sepolia',
        42161: 'arb-mainnet',
        421614: 'arb-sepolia',
        10: 'opt-mainnet',
        11155420: 'opt-sepolia'
      };

      for (const [chainIdStr, networkPrefix] of Object.entries(alchemyNetworks)) {
        const chainId = parseInt(chainIdStr, 10);
        try {
          const config = this.networkEngine.getChainConfig(chainId);
          const customConfig = {
            ...config,
            rpcUrls: [`https://${networkPrefix}.g.alchemy.com/v2/${alchemyKey}`, ...config.rpcUrls]
          };
          this.networkEngine.registerCustomChain(customConfig);
        } catch (e) {
          console.warn(`Failed to inject Alchemy for chain ${chainId}`, e);
        }
      }
    }
  }

  public async initWalletConnect(projectId: string) {
    const storage = new EncryptedWcStorage();
    await this.walletConnect.init(projectId, storage);
  }

  public setupSessionSync() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.session) {
      // Secure session storage from content scripts (MV3 requirement for passwords/keys in session)
      if (chrome.storage.session.setAccessLevel) {
        chrome.storage.session
          .setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' })
          .catch(console.error);
      }

      // Push unlock to session storage
      const originalUnlock = this.accountManager.unlock.bind(this.accountManager);
      this.accountManager.unlock = async (password: string) => {
        console.log('[SessionSync] unlocking with password');
        await originalUnlock(password);
        await chrome.storage.session.set({ vaultx_password: password });
        console.log('[SessionSync] password saved to storage');
      };

      const originalCreateVault = this.accountManager.createVault.bind(this.accountManager);
      this.accountManager.createVault = async (password: string) => {
        console.log('[SessionSync] creating vault with password');
        await originalCreateVault(password);
        await chrome.storage.session.set({ vaultx_password: password });
        console.log('[SessionSync] password saved to storage (createVault)');
      };

      const originalLock = this.accountManager.lock.bind(this.accountManager);
      this.accountManager.lock = () => {
        console.log('[SessionSync] locking');
        originalLock();
        chrome.storage.session.remove('vaultx_password');
      };

      // Poll or initialize from session storage
      chrome.storage.session.get(['vaultx_password'], async (result: any) => {
        console.log('[SessionSync] init read', !!result.vaultx_password);
        if (result.vaultx_password && this.accountManager.getSessionState().isLocked) {
          try {
            await originalUnlock(result.vaultx_password);
          } catch (e) {
            console.error('Failed to sync unlock state', e);
          }
        }
      });

      chrome.storage.session.onChanged.addListener(async (changes: any) => {
        if (changes.vaultx_password) {
          if (changes.vaultx_password.newValue) {
            if (this.accountManager.getSessionState().isLocked) {
              await originalUnlock(changes.vaultx_password.newValue).catch(console.error);
            }
          } else {
            if (!this.accountManager.getSessionState().isLocked) {
              originalLock();
            }
          }
        }
      });
    } else {
      console.log(
        '[SessionSync] chrome.storage.session is NOT available!',
        typeof chrome,
        !!chrome?.storage,
        !!chrome?.storage?.session
      );
    }
  }

  public static getInstance(): VaultXService {
    if (!VaultXService.instance) {
      VaultXService.instance = new VaultXService();
      VaultXService.instance.setupSessionSync();
    }
    return VaultXService.instance;
  }
}
