/**
 * @file accounts/index.ts
 * @description Account management, generation, and exporting
 */

import type { HDNodeWallet } from 'ethers';
import { getMasterNodeFromMnemonic, deriveBIP44EthereumAccount } from '../hd/index.js';
import type { ExportedWallet } from '../types/index.js';

/**
 * Creates and exports a specific account from a mnemonic.
 *
 * @param phrase - The 12 or 24-word BIP39 mnemonic phrase.
 * @param accountIndex - The account index to derive (default is 0).
 * @param walletName - An optional name for the wallet (default is "Account {index}").
 * @returns The ExportedWallet containing keys, address, and metadata.
 */
export function generateAccountFromMnemonic(
  phrase: string,
  accountIndex: number = 0,
  walletName?: string
): ExportedWallet {
  const masterNode = getMasterNodeFromMnemonic(phrase);
  const accountNode = deriveBIP44EthereumAccount(masterNode, accountIndex);

  return exportWalletNode(
    accountNode,
    accountIndex,
    walletName || `Account ${accountIndex}`,
    phrase
  );
}

/**
 * Exports an HDNodeWallet into the ExportedWallet format.
 *
 * @param node - The derived HDNodeWallet.
 * @param accountIndex - The index of this account.
 * @param walletName - The name of the wallet.
 * @param mnemonic - Optional mnemonic phrase if exporting from root.
 * @returns The structured ExportedWallet.
 */
export function exportWalletNode(
  node: HDNodeWallet,
  accountIndex: number,
  walletName: string,
  mnemonic?: string
): ExportedWallet {
  return {
    ...(mnemonic && { mnemonic }),
    privateKey: node.privateKey,
    publicKey: node.publicKey,
    address: node.address,
    metadata: {
      walletId: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      walletName,
      createdAt: new Date().toISOString(),
      accountIndex,
      walletType: 'HD',
      source: 'manual',
      favorite: false,
      hidden: false,
      archived: false,
      hdPath: `m/44'/60'/0'/0/${accountIndex}`,
      backupStatus: {
        verified: false
      }
    }
  };
}
