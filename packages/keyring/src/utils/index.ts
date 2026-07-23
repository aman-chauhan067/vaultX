/**
 * @file utils/index.ts
 * @description Utilities for memory safety and buffering
 */

/**
 * Attempts to clear a TypedArray from memory by overwriting it with zeros.
 * While JavaScript's garbage collector is outside our control, clearing the
 * buffer before it gets GC'd reduces the window of exposure for sensitive data.
 *
 * @param array - The typed array to clear (e.g. Uint8Array)
 */
export function clearMemory(array: Uint8Array | null | undefined): void {
  if (array && typeof array.fill === 'function') {
    array.fill(0);
  }
}

/**
 * Converts a string to a Uint8Array.
 *
 * @param str - The string to convert.
 * @returns The resulting Uint8Array.
 */
export function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Converts a Uint8Array to a string.
 *
 * @param bytes - The bytes to convert.
 * @returns The resulting string.
 */
export function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

/**
 * Encodes a Uint8Array to a Base64 string.
 * Note: Uses Buffer for Node.js / Browser compatibility via Vite polyfills,
 * or btoa if Buffer is unavailable.
 */
export function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }

  // Fallback for strict browser env without Buffer polyfill
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i] ?? 0);
  }
  return btoa(binary);
}

/**
 * Decodes a Base64 string to a Uint8Array.
 */
export function base64ToBytes(base64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }

  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i) || 0;
  }
  return bytes;
}
