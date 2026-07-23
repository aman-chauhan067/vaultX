import { describe, it, expect } from 'vitest';
import { TransactionBuilder, TransactionSerializer } from '../index.js';

describe('Transaction Serialization', () => {
  it('should serialize and deserialize a simple transfer', () => {
    const txReq = TransactionBuilder.create(1)
      .setTo('0x1234567890123456789012345678901234567890')
      .setNonce(5)
      .setValue('100000000')
      .build();

    const serialized = TransactionSerializer.serialize(txReq);
    expect(typeof serialized).toBe('string');
    expect(serialized.startsWith('0x')).toBe(true);

    const deserialized = TransactionSerializer.deserialize(serialized);
    expect(deserialized.nonce).toBe(5);
    expect(deserialized.chainId).toBe(1);
    expect(deserialized.to?.toLowerCase()).toBe(
      '0x1234567890123456789012345678901234567890'.toLowerCase()
    );
  });
});
