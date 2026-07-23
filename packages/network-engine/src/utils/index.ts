/**
 * @file utils/index.ts
 * @description Network utilities.
 */

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

import { formatEther, formatUnits, parseEther, parseUnits, isAddress } from 'ethers';
export { formatEther, formatUnits, parseEther, parseUnits, isAddress };
