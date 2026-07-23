import { describe, it, expect } from 'vitest';
import { generateMnemonic, validateMnemonic } from '../mnemonic/index.js';
import { InvalidMnemonicError } from '../errors/index.js';

describe('Mnemonic', () => {
  it('should generate a 12-word mnemonic by default', () => {
    const mnemonic = generateMnemonic();
    expect(mnemonic.split(' ').length).toBe(12);
    expect(validateMnemonic(mnemonic)).toBe(true);
  });

  it('should generate a 24-word mnemonic when requested', () => {
    const mnemonic = generateMnemonic(24);
    expect(mnemonic.split(' ').length).toBe(24);
    expect(validateMnemonic(mnemonic)).toBe(true);
  });

  it('should throw an InvalidMnemonicError for an invalid mnemonic', () => {
    const invalidPhrase =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon'; // Checksum will fail
    expect(() => validateMnemonic(invalidPhrase)).toThrow(InvalidMnemonicError);
  });
});
