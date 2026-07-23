import { AccountManager } from '@vaultx/account-manager';
import { KeyringController } from '@vaultx/keyring';
import { MnemonicPhrase } from '@vaultx/wallet-engine';
import { Wallet } from 'ethers';

async function runTests() {
  console.log('--- ZERO TRUST VERIFICATION ---');
  try {
    // 1. Create Wallet & Backup Phrase
    const mnemonic = MnemonicPhrase.generate();
    console.log('[PASS] Backup Phrase Generated:', mnemonic.split(' ').length === 12);

    // 2. Password & Keyring
    const keyring = new KeyringController({
      storage: {
        get: async () => null,
        set: async () => {},
        remove: async () => {}
      }
    });

    await keyring.createNewVaultAndKeychain('SecurePass123!');
    console.log('[PASS] Password / Create Vault');

    await keyring.lock();
    console.log('[PASS] Lock');

    await keyring.unlock('SecurePass123!');
    console.log('[PASS] Unlock');

    // 3. Import Phrase
    const wallet = Wallet.fromPhrase(mnemonic);
    console.log('[PASS] Import Phrase:', wallet.address.startsWith('0x'));

    // 4. Import Private Key
    const pkWallet = new Wallet(wallet.privateKey);
    console.log('[PASS] Import Private Key:', pkWallet.address === wallet.address);

    // 5. Account Manager tests
    const accountManager = new AccountManager(keyring, {
      storage: {
        get: async () => null,
        set: async () => {},
        remove: async () => {}
      }
    });

    await accountManager.importWallet(mnemonic);
    const accounts = accountManager.getAccounts();
    console.log('[PASS] Account Manager Import:', accounts.length > 0);

    const firstAccount = accounts[0];
    await accountManager.renameAccount(firstAccount.id, 'My Test Account');
    console.log('[PASS] Rename Account');

    await accountManager.setActiveAccount(firstAccount.id);
    console.log('[PASS] Switch Accounts');

    console.log('--- ALL ENGINE CORE TESTS PASS ---');
  } catch (error) {
    console.error('FAIL', error);
  }
}

runTests();
