import { describe, it, expect } from 'vitest';
import { TransactionBuilder, TransactionType, TransactionValidationError } from '../index.js';

describe('TransactionBuilder & Validator', () => {
  it('should build a valid EIP-1559 transaction', () => {
    const builder = TransactionBuilder.create(1)
      .setTo('0x1234567890123456789012345678901234567890')
      .setFrom('0x0987654321098765432109876543210987654321')
      .setValue('0x1000')
      .setNonce(0)
      .setMaxFeePerGas('0x2000')
      .setMaxPriorityFeePerGas('0x1000');

    const tx = builder.build();
    expect(tx.type).toBe(TransactionType.EIP1559);
    expect(tx.chainId).toBe(1);
    expect(tx.to).toBe('0x1234567890123456789012345678901234567890');
    expect(tx.maxFeePerGas).toBe('0x2000');
  });

  it('should automatically convert to legacy if gasPrice is set', () => {
    const builder = TransactionBuilder.create(1).setGasPrice('0x5000');
    const tx = builder.build();
    expect(tx.type).toBe(TransactionType.LEGACY);
    expect(tx.gasPrice).toBe('0x5000');
  });

  it('should strip 1559 fields if forced to legacy', () => {
    const builder = TransactionBuilder.create(1)
      .setMaxFeePerGas('0x2000')
      .setType(TransactionType.LEGACY);

    const tx = builder.build();
    expect(tx.maxFeePerGas).toBeUndefined();
  });

  it('should throw on negative nonce', () => {
    const builder = TransactionBuilder.create(1).setNonce(-1);
    expect(() => builder.build()).toThrow(TransactionValidationError);
    expect(() => builder.build()).toThrow('Nonce cannot be negative');
  });

  it('should throw on invalid addresses', () => {
    const builder = TransactionBuilder.create(1).setTo('invalid_address');
    expect(() => builder.build()).toThrow('Invalid "to" address');
  });

  it('should throw if maxPriorityFeePerGas > maxFeePerGas', () => {
    const builder = TransactionBuilder.create(1)
      .setMaxFeePerGas('1000')
      .setMaxPriorityFeePerGas('2000');
    expect(() => builder.build()).toThrow('maxPriorityFeePerGas cannot exceed maxFeePerGas');
  });
});
